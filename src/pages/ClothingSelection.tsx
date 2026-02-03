import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, CheckCircle, LayoutDashboard, Crown, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MultiImageUpload, UploadedImage } from '@/components/MultiImageUpload';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { useSubscription } from '@/hooks/useSubscription';
import { SaveModelDialog } from '@/components/SaveModelDialog';
import { useFilterFlowGuard, endFilterFlow } from '@/hooks/useFilterFlowGuard';
import { BrandLogoMark } from '@/components/BrandLogo';
import { AIDisclaimer } from '@/components/AIDisclaimer';

// Backend-ready data structure for API communication
interface GenerationPayload {
  filters: {
    gender: string;
    age: number;
    ethnicity: string;
    skin_tone: string;
    hair_color: string;
    eye_color: string;
    body_type: string;
    hair_type: string;
    beard_type?: string;
    pose?: string;
    background?: string;
    facial_expression?: string;
    face_type?: string;
    hair_style?: string;
    modest_option?: string;
  };
  reference_images?: {
    type: string;
    data: string;
  }[];
}

export default function ClothingSelection() {
  const navigate = useNavigate();
  const { config, setCurrentStep, totalSteps } = useModelConfig();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { 
    subscription, 
    isTrial, 
    isPaid,
    trialStandardRemaining,
    trialProRemaining,
    creditsRemaining,
    canGenerate,
    canUseProGeneration,
    hasCreatorFeatureAccess,
    loading: subscriptionLoading,
    refetch: refetchSubscription
  } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [proLoading, setProLoading] = useState(false);

  // Guard: redirect to gender selection on page refresh
  useFilterFlowGuard();
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false); // Prevent duplicate calls

  setCurrentStep(totalSteps);

  const handleImagesChange = (images: UploadedImage[]) => {
    setUploadedImages(images);
  };

  // Build the payload structure for backend API
  const buildPayload = (): GenerationPayload => {
    return {
      filters: {
        gender: config.gender,
        age: config.age,
        ethnicity: config.ethnicity,
        skin_tone: config.skinTone,
        hair_color: config.hairColor,
        eye_color: config.eyeColor,
        body_type: config.bodyType,
        hair_type: config.hairType,
        ...(config.beardType && { beard_type: config.beardType }),
        ...(config.pose && { pose: config.pose }),
        ...(config.background && { background: config.background }),
        ...(config.facialExpression && { facial_expression: config.facialExpression }),
        ...(config.faceType && { face_type: config.faceType }),
        ...(config.modestOption && { modest_option: config.modestOption }),
      },
      reference_images: uploadedImages.length > 0 
        ? uploadedImages.map(img => ({ type: img.type, data: img.preview }))
        : undefined,
    };
  };

  // Validate all required filters are selected
  const validateFilters = (): boolean => {
    // Base required fields
    let requiredFields = ['gender', 'ethnicity', 'skinTone', 'eyeColor', 'bodyType'];
    
    // Hair Color and Hair Type are NOT required when Hijab is selected
    if (config.modestOption !== 'Hijab') {
      requiredFields = [...requiredFields, 'hairColor', 'hairType'];
    }
    
    const missingFields = requiredFields.filter(field => !config[field as keyof typeof config]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Eksik seçimler',
        description: 'Lütfen oluşturmadan önce tüm filtre adımlarını tamamlayın.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleGenerate = async (usePro: boolean = false) => {
    // Prevent duplicate generation calls
    if (isGenerating || loading || proLoading) {
      console.log('Generation already in progress, blocking duplicate call');
      return;
    }

    if (!user) {
      toast({
        title: 'Oturum açılmadı',
        description: 'Lütfen model oluşturmak için giriş yapın.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    // CRITICAL: Validate at least 1 clothing image is uploaded (Image-to-Image only)
    if (uploadedImages.length === 0) {
      toast({
        title: 'Kıyafet görseli gerekli',
        description: 'Lütfen model oluşturmak için en az 1 kıyafet görseli yükleyin.',
        variant: 'destructive',
      });
      return;
    }

    if (!validateFilters()) {
      return;
    }

    // ==========================================
    // FRONTEND VALIDATION (Double-check before API call)
    // Backend is the source of truth, but we prevent wasted calls
    // ==========================================
    if (isTrial) {
      if (usePro && trialProRemaining <= 0) {
        toast({
          title: 'Pro üretim limiti doldu',
          description: 'Tüm deneme Pro üretimlerinizi kullandınız.',
          variant: 'destructive',
        });
        return;
      }
      if (!usePro && trialStandardRemaining <= 0) {
        toast({
          title: 'Üretim limiti doldu',
          description: 'Tüm deneme üretimlerinizi kullandınız.',
          variant: 'destructive',
        });
        return;
      }
    }

    if (isPaid) {
      const requiredCredits = usePro ? 4 : 1;
      if (creditsRemaining < requiredCredits) {
        toast({
          title: 'Yetersiz kredi',
          description: usePro ? 'Pro üretim için 4 kredi gerekli.' : 'Yeterli krediniz yok.',
          variant: 'destructive',
        });
        return;
      }
    }

    // Set all loading states to prevent duplicate calls
    setIsGenerating(true);
    if (usePro) {
      setProLoading(true);
    } else {
      setLoading(true);
    }

    try {
      const payload = buildPayload();
      console.log('Generation payload:', payload, 'Pro mode:', usePro);

      // Serialize reference images to JSON string for storage
      const referenceImageData = payload.reference_images 
        ? JSON.stringify(payload.reference_images) 
        : null;

      const { data, error } = await supabase
        .from('model_generations')
        .insert({
          user_id: user.id,
          gender: payload.filters.gender,
          ethnicity: payload.filters.ethnicity,
          skin_tone: payload.filters.skin_tone,
          hair_color: payload.filters.hair_color,
          eye_color: payload.filters.eye_color,
          body_type: payload.filters.body_type,
          hair_type: payload.filters.hair_type,
          beard_type: payload.filters.beard_type || null,
          pose: payload.filters.pose || null,
          background: payload.filters.background || null,
          face_type: payload.filters.face_type || null,
          facial_expression: payload.filters.facial_expression || null,
          modest_option: payload.filters.modest_option || null,
          reference_image: referenceImageData,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // End the filter flow on successful generation
      endFilterFlow();

      // Navigate with Pro mode flag
      navigate(`/result/${data.id}${usePro ? '?pro=true' : ''}`);
    } catch (error) {
      console.error('Error saving generation:', error);
      toast({
        title: 'Oluşturma başarısız',
        description: 'Bir şeyler yanlış gitti. Lütfen tekrar deneyin.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setProLoading(false);
      setIsGenerating(false);
    }
  };

  // Hide Hair Color and Hair Type from summary when Hijab is selected
  const isHijab = config.modestOption === 'Hijab';
  
  const filterSummary = [
    { label: 'Cinsiyet', value: config.gender },
    { label: 'Yaş', value: config.age?.toString() },
    { label: 'Etnik Köken', value: config.ethnicity },
    { label: 'Ten Rengi', value: config.skinTone },
    ...(!isHijab ? [{ label: 'Saç Rengi', value: config.hairColor }] : []),
    { label: 'Göz Rengi', value: config.eyeColor },
    { label: 'Vücut Tipi', value: config.bodyType },
    ...(!isHijab ? [{ label: 'Saç Tipi', value: config.hairType }] : []),
    ...(config.beardType ? [{ label: 'Sakal Tipi', value: config.beardType }] : []),
    { label: 'Kaplama', value: config.modestOption },
    { label: 'Poz', value: config.pose },
    { label: 'Arka Plan', value: config.background },
    { label: 'Yüz Tipi', value: config.faceType },
    { label: 'İfade', value: config.facialExpression },
  ].filter(item => item.value);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden max-w-full">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6 w-full">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/filter/expression')}
          className="relative text-white hover:text-white hover:bg-violet-500/30 border-2 border-white/50 backdrop-blur-xl rounded-xl transition-all duration-300 hover:border-violet-400 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] bg-black/30 w-11 h-11 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <ProgressIndicator currentStep={totalSteps} totalSteps={totalSteps} />
        
        <div className="flex items-center gap-2">
          {/* Save Model Button in Header - Creator Only */}
          {hasCreatorFeatureAccess && (
            <SaveModelDialog
              config={config}
              trigger={
                <Button variant="outline" size="sm" className="gap-2 border-primary/50 hover:border-primary">
                  <Save className="h-4 w-4" />
                  <span className="hidden sm:inline">Modeli Kaydet</span>
                </Button>
              }
            />
          )}
          <LanguageSwitcher />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-start px-6 pb-12 pt-4">
        <div className="text-center mb-6 animate-fade-in">
          <h1 className="text-3xl font-semibold text-foreground mb-2">{t('clothing.title')}</h1>
          <p className="text-muted-foreground">{t('clothing.subtitle')}</p>
        </div>

        <div className="w-full max-w-lg space-y-6">
          {/* Filter Summary */}
          <div className="bg-card border border-border rounded-xl p-4 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                Seçilen Özellikler
              </h3>
              {/* Save Model Button - Creator Only */}
              {hasCreatorFeatureAccess && (
                <SaveModelDialog
                  config={config}
                  trigger={
                    <Button variant="outline" size="sm" className="gap-2 text-xs">
                      <Save className="h-3.5 w-3.5" />
                      Modeli Kaydet
                    </Button>
                  }
                />
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {filterSummary.map((item, index) => (
                <div key={index} className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Multi Image Upload */}
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <MultiImageUpload
              images={uploadedImages}
              onImagesChange={handleImagesChange}
              maxImages={5}
              className="min-h-[220px]"
            />
          </div>

          {/* Generate Buttons */}
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* Credit/Generation Status Display */}
            {subscription && (
              <div className="bg-card/50 border border-border rounded-lg p-3 text-sm">
                {isTrial ? (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Deneme Hakkı:</span>
                    <div className="flex gap-4">
                      <span className="text-foreground">
                        Standart: <strong className={trialStandardRemaining > 0 ? 'text-green-500' : 'text-destructive'}>{trialStandardRemaining}/5</strong>
                      </span>
                      <span className="text-foreground">
                        Pro: <strong className={trialProRemaining > 0 ? 'text-amber-500' : 'text-destructive'}>{trialProRemaining}/2</strong>
                      </span>
                    </div>
                  </div>
                ) : isPaid ? (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Krediler:</span>
                    <span className="text-foreground">
                      <strong className={creditsRemaining >= 1 ? 'text-green-500' : 'text-destructive'}>{creditsRemaining}</strong> kredi
                      <span className="text-xs text-muted-foreground ml-2">(Std: 1, Pro: 4)</span>
                    </span>
                  </div>
                ) : null}
              </div>
            )}
            
            {/* Standard Generate Button */}
            <Button
              onClick={() => handleGenerate(false)}
              disabled={loading || proLoading || !canGenerate || subscriptionLoading}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('common.loading')}
                </>
              ) : !canGenerate ? (
                <>
                  <BrandLogoMark size="sm" className="mr-2" />
                  {isTrial ? 'Deneme limiti doldu' : 'Yetersiz kredi'}
                </>
              ) : (
                <>
                  <BrandLogoMark size="sm" className="mr-2" />
                  {t('clothing.generate')}
                  {isTrial && (
                    <span className="ml-2 text-sm opacity-80">
                      ({trialStandardRemaining} kaldı)
                    </span>
                  )}
                  {isPaid && (
                    <span className="ml-2 text-sm opacity-80">
                      (1 kredi)
                    </span>
                  )}
                </>
              )}
            </Button>

            {/* Pro Generate Button */}
            <Button
              onClick={() => handleGenerate(true)}
              disabled={loading || proLoading || !canUseProGeneration || subscriptionLoading}
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-500/90 hover:to-orange-500/90 text-white py-6 text-lg font-medium shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
            >
              {proLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('common.loading')}
                </>
              ) : !canUseProGeneration ? (
                <>
                  <Crown className="mr-2 h-5 w-5" />
                  {isTrial ? 'Deneme Pro limiti doldu' : 'Yetersiz kredi (4 gerekli)'}
                </>
              ) : (
                <>
                  <Crown className="mr-2 h-5 w-5" />
                  Utsuri Pro ile Model Oluştur
                  {isTrial && (
                    <span className="ml-2 text-sm opacity-80">
                      ({trialProRemaining} kaldı)
                    </span>
                  )}
                  {isPaid && (
                    <span className="ml-2 text-sm opacity-80">
                      (4 kredi)
                    </span>
                  )}
                </>
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground animate-fade-in" style={{ animationDelay: '300ms' }}>
            Farklı açılar, aksesuarlar ve takılar ekleyin - yapay zeka modelinizi buna göre giydirecek
          </p>

          <AIDisclaimer className="animate-fade-in" />

          {/* Go to Dashboard Button */}
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="lg"
            className="w-full border-white/20 hover:border-violet-400/50 text-foreground hover:text-primary py-5 animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Panele Git
          </Button>
        </div>
      </main>
    </div>
  );
}
