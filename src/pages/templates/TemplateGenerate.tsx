import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getTemplateById, TEMPLATE_CREDIT_COSTS } from "@/data/templates";
import { templateTranslations } from "@/data/templateTranslations";
import { ArrowLeft, Upload, Download, CheckCircle, Loader2, Zap, Crown, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BrandLogoMark } from "@/components/BrandLogo";
import { AIDisclaimer } from "@/components/AIDisclaimer";
import { downloadImage } from "@/lib/downloadImage";

interface GeneratedImage {
  poseIndex: number;
  imageUrl: string;
  status: 'pending' | 'generating' | 'complete' | 'error';
}

interface ProductImage {
  preview: string | null;
  file: File | null;
}

export default function TemplateGenerate() {
  const navigate = useNavigate();
  const { templateId } = useParams<{ templateId: string }>();
  const { language } = useLanguage();
  const { user, session } = useAuth();
  
  // Front view image (always required)
  const [frontImage, setFrontImage] = useState<ProductImage>({ preview: null, file: null });
  // Back view image (required only for templates with requiresBackView)
  const [backImage, setBackImage] = useState<ProductImage>({ preview: null, file: null });
  // Optional second image (e.g., bottom wear for shoes template)
  const [optionalImage, setOptionalImage] = useState<ProductImage>({ preview: null, file: null });
  
  const [usePro, setUsePro] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isDragOverFront, setIsDragOverFront] = useState(false);
  const [isDragOverBack, setIsDragOverBack] = useState(false);
  const [isDragOverOptional, setIsDragOverOptional] = useState(false);
  
  const t = (key: string) => {
    const translations = templateTranslations[language as 'en' | 'tr'] || templateTranslations.en;
    return translations[key as keyof typeof translations] || key;
  };
  
  const template = templateId ? getTemplateById(templateId) : null;
  const requiresBackView = template?.requiresBackView ?? false;
  const hasOptionalSecondImage = template?.optionalSecondImage ?? false;
  const optionalSecondImageKey = template?.optionalSecondImageKey ?? '';
  
  
  const handleFile = useCallback((file: File, type: 'front' | 'back' | 'optional') => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (type === 'front') {
          setFrontImage({ preview: result, file });
        } else if (type === 'back') {
          setBackImage({ preview: result, file });
        } else {
          setOptionalImage({ preview: result, file });
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'front' | 'back' | 'optional') => {
    e.preventDefault();
    if (type === 'front') setIsDragOverFront(false);
    else if (type === 'back') setIsDragOverBack(false);
    else setIsDragOverOptional(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file, type);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent, type: 'front' | 'back' | 'optional') => {
    e.preventDefault();
    if (type === 'front') setIsDragOverFront(true);
    else if (type === 'back') setIsDragOverBack(true);
    else setIsDragOverOptional(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, type: 'front' | 'back' | 'optional') => {
    e.preventDefault();
    if (type === 'front') setIsDragOverFront(false);
    else if (type === 'back') setIsDragOverBack(false);
    else setIsDragOverOptional(false);
  }, []);
  
  // Check if all required images are uploaded
  const hasAllRequiredImages = () => {
    if (!frontImage.preview) return false;
    if (requiresBackView && !backImage.preview) return false;
    return true;
  };
  
  // Helper function to fetch image and convert to base64
  const fetchImageAsBase64 = async (imageUrl: string): Promise<string> => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status}`);
      }
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error fetching image as base64:', error);
      throw error;
    }
  };
  
  const handleGenerate = async () => {
    if (!template || !session) {
      toast.error("Please sign in to generate images");
      return;
    }
    
    if (!hasAllRequiredImages()) {
      toast.error(t('templates.uploadBothImages'));
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
        
        // Fetch pose image and convert to base64 (CRITICAL: same method as Generate page)
        const poseImageUrl = window.location.origin + pose.imagePath;
        console.log(`Fetching pose image ${i + 1} from:`, poseImageUrl);
        const poseImageBase64 = await fetchImageAsBase64(poseImageUrl);
        console.log(`Pose image ${i + 1} converted to base64, length:`, poseImageBase64.length);
        
        // Determine which product image to use based on pose
        const productImageBase64 = pose.useBackView && backImage.preview 
          ? backImage.preview 
          : frontImage.preview;
        
        const { data, error } = await supabase.functions.invoke('generate-template', {
          body: {
            templateId: template.id,
            poseIndex: i,
            poseImageBase64, // Send base64 instead of URL
            productImageBase64,
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
    
    if (completedImages.length === 0) {
      toast.error(t('templates.noImagesToDownload') || 'No images to download');
      return;
    }
    
    let downloadedCount = 0;
    
    for (const img of completedImages) {
      const fileName = `${template?.id}-pose-${img.poseIndex + 1}.png`;
      const success = await downloadImage(img.imageUrl, fileName);
      if (success) downloadedCount++;
      // Small delay between downloads to prevent browser blocking
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    if (downloadedCount > 0) {
      toast.success(language === 'tr' ? `${downloadedCount} görsel indiriliyor` : `Downloading ${downloadedCount} images`);
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
  
  // Render image upload box
  const renderUploadBox = (
    type: 'front' | 'back' | 'optional',
    image: ProductImage,
    isDragOver: boolean,
    title: string,
    description: string,
    isOptional: boolean = false
  ) => (
    <div
      onDrop={(e) => handleDrop(e, type)}
      onDragOver={(e) => handleDragOver(e, type)}
      onDragLeave={(e) => handleDragLeave(e, type)}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer flex-1",
        isDragOver 
          ? "border-primary bg-primary/5" 
          : "border-border/50 hover:border-primary/50",
        image.preview && "border-solid border-primary/50 bg-primary/5"
      )}
      onClick={() => !image.preview && document.getElementById(`${type}-input`)?.click()}
    >
      <input
        id={`${type}-input`}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file, type);
        }}
      />
      
      {image.preview ? (
        <div className="flex items-center gap-4">
          <img 
            src={image.preview} 
            alt={title} 
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="truncate">
                {type === 'front' ? t('templates.frontImageUploaded') : type === 'back' ? t('templates.backImageUploaded') : title}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1 truncate">
              {image.file?.name}
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={(e) => {
                e.stopPropagation();
                if (type === 'front') {
                  setFrontImage({ preview: null, file: null });
                } else if (type === 'back') {
                  setBackImage({ preview: null, file: null });
                } else {
                  setOptionalImage({ preview: null, file: null });
                }
              }}
            >
              {t('templates.changeImage')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
            <Upload className="w-6 h-6 text-primary" />
          </div>
          <p className="font-medium text-foreground text-sm">{title}</p>
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40 w-full">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-full">
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
        {/* Step 1: Upload Product Images */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {t('templates.uploadProduct')}
          </h2>
          <p className="text-muted-foreground mb-4">
            {t('templates.uploadProductDesc')}
          </p>
          
          {/* Back view requirement notice */}
          {requiresBackView && (
            <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {t('templates.backViewRequired')}
              </p>
            </div>
          )}
          
          {/* Image upload boxes */}
          <div className={cn(
            "flex gap-4",
            requiresBackView ? "flex-col sm:flex-row" : ""
          )}>
            {/* Front view upload */}
            {renderUploadBox(
              'front',
              frontImage,
              isDragOverFront,
              t('templates.uploadFrontView'),
              t('templates.uploadFrontViewDesc')
            )}
            
            {/* Back view upload (only if required) */}
            {requiresBackView && renderUploadBox(
              'back',
              backImage,
              isDragOverBack,
              t('templates.uploadBackView'),
              t('templates.uploadBackViewDesc')
            )}
          </div>
          
          {/* Optional second image (e.g., bottom wear for shoes) */}
          {hasOptionalSecondImage && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">
                {t('templates.optionalBottomWearDesc')}
              </p>
              {renderUploadBox(
                'optional',
                optionalImage,
                isDragOverOptional,
                t(optionalSecondImageKey),
                t('templates.optionalBottomWearDesc'),
                true
              )}
            </div>
          )}
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
                  
                  {/* Back view indicator */}
                  {pose.useBackView && (
                    <div className="absolute bottom-2 left-2">
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                        {language === 'tr' ? 'Arka' : 'Back'}
                      </Badge>
                    </div>
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
              disabled={!hasAllRequiredImages() || !user}
              className="gap-2 px-8"
            >
              <BrandLogoMark size="sm" />
              {t('templates.generate')} ({creditCost} {language === 'tr' ? 'kredi' : 'credits'})
            </Button>
          )}
          
          {!user && (
            <p className="text-sm text-muted-foreground">
              Please <button onClick={() => navigate('/auth')} className="text-primary underline">sign in</button> to generate images
            </p>
          )}

          <AIDisclaimer text={t('templates.aiDisclaimerShort')} className="w-full max-w-xl" />
        </div>
      </main>
    </div>
  );
}
