import { useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getJewelryPresetById, JEWELRY_CREDIT_COSTS } from "@/data/jewelryPresets";
import { ArrowLeft, Upload, Download, CheckCircle, Loader2, Zap, Crown, Gem, Sparkles, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { BrandLogoMark } from "@/components/BrandLogo";
import { AIDisclaimer } from "@/components/AIDisclaimer";

interface JewelryImage {
  preview: string | null;
  file: File | null;
}

export default function JewelryGenerate() {
  const navigate = useNavigate();
  const { presetId } = useParams<{ presetId: string }>();
  const { t, language } = useLanguage();
  const { user, session } = useAuth();
  
  const [jewelryImage, setJewelryImage] = useState<JewelryImage>({ preview: null, file: null });
  const [usePro, setUsePro] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [customName, setCustomName] = useState('');
  const [nameSaved, setNameSaved] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const preset = presetId ? getJewelryPresetById(presetId) : null;
  
  const handleFile = useCallback((file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setJewelryImage({ preview: e.target?.result as string, file });
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
  
  const handleGenerate = async () => {
    if (!preset || !session || !jewelryImage.preview) {
      toast.error(t('jewelry.uploadRequired'));
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-jewelry', {
        body: {
          presetId: preset.id,
          jewelryImageBase64: jewelryImage.preview,
          usePro,
        }
      });
      
      if (error) {
        console.error('Jewelry generation error:', error);
        // Extract actual error message from FunctionsHttpError context
        let errorMessage = t('jewelry.generationFailed');
        try {
          if (error.context && typeof error.context.json === 'function') {
            const errorBody = await error.context.json();
            errorMessage = errorBody?.error || errorMessage;
          } else if (error.message && !error.message.includes('non-2xx')) {
            errorMessage = error.message;
          }
        } catch {
          // fallback to default error message
        }
        toast.error(errorMessage);
        return;
      }
      
      if (data?.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        const defaultName = `${t('naming.default')} ${new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US')}`;
        setCustomName(defaultName);
        setNameSaved(false);
        if (data?.generationId) setGenerationId(data.generationId);
        toast.success(t('jewelry.generationSuccess'));
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(t('jewelry.generationFailed'));
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleDownload = async () => {
    if (!generatedImageUrl) return;
    
    try {
      const response = await fetch(generatedImageUrl, { mode: 'cors', credentials: 'omit' });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${customName ? customName.replace(/\s+/g, '-').toLowerCase() : `utsuri-jewelry-${preset?.id}`}-${Date.now()}.png`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      toast.success(t('jewelry.downloadStarted'));
    } catch {
      window.open(generatedImageUrl, '_blank');
      toast.info(t('jewelry.openedInTab'));
    }
  };
  
  if (!preset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">{t('jewelry.presetNotFound')}</p>
          <Button onClick={() => navigate('/jewelry')}>
            {t('jewelry.backToPresets')}
          </Button>
        </div>
      </div>
    );
  }
  
  const creditCost = usePro ? JEWELRY_CREDIT_COSTS.pro : JEWELRY_CREDIT_COSTS.standard;
  
  return (
    <div className="min-h-screen bg-background overflow-x-hidden max-w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border/40 w-full">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-full">
          <button
            onClick={() => navigate('/jewelry')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t('jewelry.backToPresets')}</span>
          </button>
          
          <div className="flex items-center gap-2">
            <Gem className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">
              {t(preset.nameKey)}
            </h1>
          </div>
          
          <div className="w-20" />
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Preset info */}
        <div className="mb-8 p-4 rounded-xl bg-card border border-border/50">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Gem className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">{t(preset.nameKey)}</h2>
              <p className="text-sm text-muted-foreground mt-1">{t(preset.descriptionKey)}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">
                {t(preset.useForKey)}
              </p>
            </div>
          </div>
        </div>
        
        {/* Step 1: Upload Jewelry Image */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {t('jewelry.uploadTitle')}
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            {t('jewelry.uploadDesc')}
          </p>
          
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer",
              isDragOver 
                ? "border-primary bg-primary/5" 
                : "border-border/50 hover:border-primary/50",
              jewelryImage.preview && "border-solid border-primary/50 bg-primary/5"
            )}
            onClick={() => !jewelryImage.preview && document.getElementById('jewelry-input')?.click()}
          >
            <input
              id="jewelry-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            
            {jewelryImage.preview ? (
              <div className="flex items-center gap-4">
                <img 
                  src={jewelryImage.preview} 
                  alt="Jewelry" 
                  className="w-28 h-28 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="truncate">{t('jewelry.imageUploaded')}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {jewelryImage.file?.name}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setJewelryImage({ preview: null, file: null });
                    }}
                  >
                    {t('jewelry.changeImage')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-14 h-14 rounded-full bg-primary/10 mx-auto mb-3 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-primary" />
                </div>
                <p className="font-medium text-foreground">{t('jewelry.dragOrClick')}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('jewelry.supportedFormats')}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Step 2: Select Mode */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-foreground mb-2">
            {t('jewelry.selectMode')}
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
                <span className="font-semibold">{t('jewelry.standard')}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('jewelry.standardDesc')}
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
                <span className="font-semibold">{t('jewelry.pro')}</span>
                <Badge variant="secondary" className="text-xs">PRO</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('jewelry.proDesc')}
              </p>
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground mt-3 text-center">
            {t('jewelry.creditInfo')}: <span className="font-medium text-foreground">{creditCost} {language === 'tr' ? 'kredi' : 'credits'}</span>
          </p>
        </div>
        
        {/* Generate Button */}
        <div className="mb-8">
          <Button
            onClick={handleGenerate}
            disabled={!jewelryImage.preview || isGenerating || !session}
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                {t('jewelry.generating')}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {t('jewelry.generateButton')}
              </>
            )}
          </Button>
          
          {!session && (
            <p className="text-sm text-muted-foreground text-center mt-2">
              <button 
                onClick={() => navigate('/auth')} 
                className="text-primary underline"
              >
                {t('jewelry.signInRequired')}
              </button>
            </p>
          )}
        </div>
        
        {/* Result */}
        {(isGenerating || generatedImageUrl) && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4">
              {t('jewelry.result')}
            </h2>
            
            <div className="relative aspect-square bg-card rounded-2xl border overflow-hidden shadow-lg max-w-md mx-auto">
              {usePro && (
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold shadow-lg">
                  <Crown className="h-3 w-3" />
                  Pro
                </div>
              )}
              
              {isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground text-sm">{t('jewelry.generating')}</p>
                </div>
              ) : generatedImageUrl ? (
                <img 
                  src={generatedImageUrl} 
                  alt="Generated jewelry" 
                  className="w-full h-full object-contain bg-muted/10"
                />
              ) : null}
            </div>
            
            {generatedImageUrl && (
              <div className="max-w-md mx-auto mt-4 space-y-4">
                {/* Naming input */}
                <div className="p-3 bg-card border border-border rounded-xl">
                  <label className="text-sm font-medium text-foreground mb-2 block flex items-center gap-2">
                    <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                    {t('naming.title')}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={customName}
                      onChange={(e) => {
                        setCustomName(e.target.value);
                        setNameSaved(false);
                      }}
                      placeholder={t('naming.placeholder')}
                      maxLength={100}
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      variant={nameSaved ? "outline" : "default"}
                      disabled={nameSaved}
                      onClick={() => {
                        setNameSaved(true);
                        toast.success(t('naming.saved'));
                      }}
                    >
                      {nameSaved ? '✓' : language === 'tr' ? 'Kaydet' : 'Save'}
                    </Button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={handleDownload}
                    className="flex-1"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t('jewelry.download')}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex-1"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('jewelry.regenerate')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        <AIDisclaimer className="mt-4" />
      </main>
    </div>
  );
}
