import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Loader2, CheckCircle, LayoutDashboard, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MultiImageUpload, UploadedImage } from '@/components/MultiImageUpload';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { useSubscription } from '@/hooks/useSubscription';

// Backend-ready data structure for API communication
interface GenerationPayload {
  filters: {
    gender: string;
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
  const { subscription, hasProAccess, canUseProGeneration, loading: subscriptionLoading } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [proLoading, setProLoading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  setCurrentStep(totalSteps);

  const handleImagesChange = (images: UploadedImage[]) => {
    setUploadedImages(images);
  };

  // Build the payload structure for backend API
  const buildPayload = (): GenerationPayload => {
    return {
      filters: {
        gender: config.gender,
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
        ...(config.modestOption && { modest_option: config.modestOption }),
      },
      reference_images: uploadedImages.length > 0 
        ? uploadedImages.map(img => ({ type: img.type, data: img.preview }))
        : undefined,
    };
  };

  // Validate all required filters are selected
  const validateFilters = (): boolean => {
    const requiredFields = ['gender', 'ethnicity', 'skinTone', 'hairColor', 'eyeColor', 'bodyType', 'hairType'];
    const missingFields = requiredFields.filter(field => !config[field as keyof typeof config]);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing selections',
        description: 'Please complete all filter steps before generating.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleGenerate = async (usePro: boolean = false) => {
    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please sign in to generate models.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    if (!validateFilters()) {
      return;
    }

    // Check subscription for Pro access
    if (usePro && !canUseProGeneration) {
      toast({
        title: 'Pro generations exhausted',
        description: 'You have used all your Pro generations. Upgrade your plan for unlimited Pro access.',
        variant: 'destructive',
      });
      return;
    }

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
          reference_image: referenceImageData,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Navigate with Pro mode flag
      navigate(`/result/${data.id}${usePro ? '?pro=true' : ''}`);
    } catch (error) {
      console.error('Error saving generation:', error);
      toast({
        title: 'Generation failed',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setProLoading(false);
    }
  };

  const filterSummary = [
    { label: 'Gender', value: config.gender },
    { label: 'Ethnicity', value: config.ethnicity },
    { label: 'Skin Tone', value: config.skinTone },
    { label: 'Hair Color', value: config.hairColor },
    { label: 'Eye Color', value: config.eyeColor },
    { label: 'Body Type', value: config.bodyType },
    { label: 'Hair Type', value: config.hairType },
    ...(config.beardType ? [{ label: 'Beard Type', value: config.beardType }] : []),
    { label: 'Coverage', value: config.modestOption },
    { label: 'Pose', value: config.pose },
    { label: 'Background', value: config.background },
    { label: 'Face Type', value: config.faceType },
    { label: 'Expression', value: config.facialExpression },
  ].filter(item => item.value);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:p-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/filter/expression')}
          className="relative text-white hover:text-white hover:bg-violet-500/30 border-2 border-white/50 backdrop-blur-xl rounded-xl transition-all duration-300 hover:border-violet-400 hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] bg-black/30 w-11 h-11 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <ProgressIndicator currentStep={totalSteps} totalSteps={totalSteps} />
        
        <LanguageSwitcher />
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
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Selected Attributes
            </h3>
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
              maxImages={10}
              className="min-h-[220px]"
            />
          </div>

          {/* Generate Buttons */}
          <div className="space-y-3 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* Standard Generate Button */}
            <Button
              onClick={() => handleGenerate(false)}
              disabled={loading || proLoading}
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  {t('clothing.generate')}
                </>
              )}
            </Button>

            {/* Pro Generate Button - Show for paid plans and Trial users with remaining pro generations */}
            {canUseProGeneration && (
              <Button
                onClick={() => handleGenerate(true)}
                disabled={loading || proLoading}
                size="lg"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-500/90 hover:to-orange-500/90 text-white py-6 text-lg font-medium shadow-lg shadow-amber-500/25"
              >
                {proLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('common.loading')}
                  </>
                ) : (
                  <>
                    <Crown className="mr-2 h-5 w-5" />
                    Generate Model With Utsuri Pro
                    {subscription?.plan === 'trial' && (
                      <span className="ml-2 text-sm opacity-80">
                        ({subscription.pro_generations_remaining} left)
                      </span>
                    )}
                  </>
                )}
              </Button>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground animate-fade-in" style={{ animationDelay: '300ms' }}>
            Add different angles, accessories, and jewelry - the AI will dress your model accordingly
          </p>

          {/* Go to Dashboard Button */}
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            size="lg"
            className="w-full border-white/20 hover:border-violet-400/50 text-foreground hover:text-primary py-5 animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            <LayoutDashboard className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
}
