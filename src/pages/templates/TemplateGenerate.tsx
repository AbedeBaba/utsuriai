import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getTemplateById, TEMPLATE_CREDIT_COSTS } from "@/data/templates";
import { templateTranslations } from "@/data/templateTranslations";
import { ArrowLeft, Upload, Sparkles, Download, CheckCircle, Loader2, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedImage {
  poseIndex: number;
  imageUrl: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
}

export default function TemplateGenerate() {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const { language } = useLanguage();
  const { user, session } = useAuth();
  
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productFile, setProductFile] = useState<File | null>(null);
  const [usePro, setUsePro] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const t = (key: string) => {
    const translations = templateTranslations[language as 'en' | 'tr'] || templateTranslations.en;
    return translations[key as keyof typeof translations] || key;
  };
  
  const template = templateId ? getTemplateById(templateId) : null;
  
  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setProductImage(result);
        setProductFile(file);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);
  
  const handleGenerate = async () => {
    if (!template || !productImage || !session) {
      toast.error("Please upload a product image first");
      return;
    }
    
    setIsGenerating(true);
    setGeneratedImages(template.poses.map((_, index) => ({
      poseIndex: index,
      imageUrl: '',
      status: 'pending'
    })));
    
    try {
      // Generate each pose sequentially
      for (let i = 0; i < template.poses.length; i++) {
        setCurrentPoseIndex(i);
        setGeneratedImages(prev => prev.map((img, idx) => 
          idx === i ? { ...img, status: 'generating' } : img
        ));
        
        const pose = template.poses[i];
        
        // Build full URL for pose image
        const poseImageUrl = window.location.origin + pose.imagePath;
        
        const { data, error } = await supabase.functions.invoke('generate-template', {
          body: {
            templateId: template.id,
            poseIndex: i,
            poseImageUrl,
            productImageBase64: productImage,
            prompt: template.prompt,
            usePro
          }
        });
        
        if (error) {
          console.error(`Pose ${i + 1} generation error:`, error);
          setGeneratedImages(prev => prev.map((img, idx) => 
            idx === i ? { ...img, status: 'error' } : img
          ));
          toast.error(`Failed to generate pose ${i + 1}`);
          continue;
        }
        
        if (data?.imageUrl) {
          setGeneratedImages(prev => prev.map((img, idx) => 
            idx === i ? { ...img, imageUrl: data.imageUrl, status: 'complete' } : img
          ));
        }
        
        // Small delay between generations to avoid rate limits
        if (i < template.poses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      toast.success(t('templates.complete'));
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownloadAll = async () => {
    const completedImages = generatedImages.filter(img => img.status === 'complete');
    
    for (const img of completedImages) {
      try {
        const response = await fetch(img.imageUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${template?.id}-pose-${img.poseIndex + 1}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed for pose', img.poseIndex + 1);
      }
    }
  };
  
  if (!template) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Template not found</p>
          <Button onClick={() => navigate('/templates')}>
            {t('templates.backToCategories')}
          </Button>
        </div>
      </div>
    );
  }
  
  const creditCost = usePro ? TEMPLATE_CREDIT_COSTS.pro : TEMPLATE_CREDIT_COSTS.standard;
  const completedCount = generatedImages.filter(img => img.status === 'complete').length;
  const allComplete = completedCount === template.poses.length && completedCount > 0;
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate(`/templates/${template.categoryId}`)}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">
              {t('templates.backToTemplate')}
            </span>
          </button>
          
          <h1 className="text-lg font-semibold text-foreground">
            {t(template.nameKey)}
          </h1>
          
          <div className="w-20" />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Step 1: Upload Product */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {t('templates.uploadProduct')}
          </h2>
          <p className="text-muted-foreground mb-4">
            {t('templates.uploadProductDesc')}
          </p>
          
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer",
              isDragOver 
                ? "border-primary bg-primary/5" 
                : "border-border/50 hover:border-primary/50",
              productImage && "border-solid border-primary/50 bg-primary/5"
            )}
            onClick={() => !productImage && document.getElementById('product-input')?.click()}
          >
            <input
              id="product-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            
            {productImage ? (
              <div className="flex items-center gap-6">
                <img 
                  src={productImage} 
                  alt="Product" 
                  className="w-32 h-32 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Product image uploaded
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {productFile?.name}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProductImage(null);
                      setProductFile(null);
                    }}
                  >
                    Change image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <p className="font-medium text-foreground">
                  Click or drag & drop your product image
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PNG, JPG up to 10MB
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Step 2: Select Mode */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {t('templates.selectMode')}
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setUsePro(false)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                !usePro 
                  ? "border-primary bg-primary/5" 
                  : "border-border/50 hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-primary" />
                <span className="font-semibold">{t('templates.standard')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('templates.standardDesc')}
              </p>
            </button>
            
            <button
              onClick={() => setUsePro(true)}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                usePro 
                  ? "border-primary bg-primary/5" 
                  : "border-border/50 hover:border-primary/30"
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <span className="font-semibold">{t('templates.pro')}</span>
                <Badge variant="secondary" className="text-xs">PRO</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('templates.proDesc')}
              </p>
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-3 text-center">
            {t('templates.creditInfo')}: <span className="font-medium text-foreground">{creditCost} {language === 'tr' ? 'kredi' : 'credits'}</span> {t('templates.perTemplate')}
          </p>
        </div>
        
        {/* Template Preview */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {t('templates.poses')}: {template.poses.length}
          </h2>
          
          <div className="grid grid-cols-4 gap-3">
            {template.poses.map((pose, index) => {
              const generated = generatedImages.find(img => img.poseIndex === index);
              
              return (
                <div 
                  key={pose.id}
                  className={cn(
                    "aspect-[9/16] rounded-lg border overflow-hidden relative",
                    generated?.status === 'generating' && "ring-2 ring-primary ring-offset-2",
                    generated?.status === 'complete' && "ring-2 ring-green-500 ring-offset-2"
                  )}
                >
                  {generated?.status === 'complete' && generated.imageUrl ? (
                    <img 
                      src={generated.imageUrl} 
                      alt={`Generated pose ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img 
                      src={pose.imagePath} 
                      alt={t(pose.nameKey)}
                      className={cn(
                        "w-full h-full object-cover",
                        generated?.status === 'generating' && "opacity-50"
                      )}
                    />
                  )}
                  
                  {generated?.status === 'generating' && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    </div>
                  )}
                  
                  {generated?.status === 'complete' && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-6 h-6 text-green-500 bg-background rounded-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Generate Button */}
        <div className="flex flex-col items-center gap-4">
          {isGenerating ? (
            <div className="text-center">
              <div className="flex items-center gap-3 mb-2">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                <span className="text-lg font-medium">
                  {t('templates.generatingPose')} {currentPoseIndex + 1} {t('templates.of')} {template.poses.length}
                </span>
              </div>
              <div className="w-64 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${((currentPoseIndex + 1) / template.poses.length) * 100}%` }}
                />
              </div>
            </div>
          ) : allComplete ? (
            <>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-6 h-6" />
                <span className="text-lg font-medium">{t('templates.complete')}</span>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleDownloadAll} className="gap-2">
                  <Download className="w-4 h-4" />
                  {t('templates.downloadAll')}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/templates')}
                >
                  {t('templates.tryAnother')}
                </Button>
              </div>
            </>
          ) : (
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={!productImage || !user}
              className="gap-2 px-8"
            >
              <Sparkles className="w-5 h-5" />
              {t('templates.generate')} ({creditCost} {language === 'tr' ? 'kredi' : 'credits'})
            </Button>
          )}
          
          {!user && (
            <p className="text-sm text-muted-foreground">
              Please <button onClick={() => navigate('/auth')} className="text-primary underline">sign in</button> to generate images
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
