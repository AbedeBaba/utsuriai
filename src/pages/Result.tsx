import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Download, RefreshCw, Loader2, ImageIcon, LayoutDashboard, Crown } from 'lucide-react';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { BrandLogo, BrandLogoMark } from '@/components/BrandLogo';

interface GenerationData {
  id: string;
  status: string;
  image_url: string | null;
  gender: string;
  ethnicity: string;
  skin_tone: string;
  hair_color: string;
  eye_color: string;
  body_type: string;
  hair_type: string;
  beard_type: string | null;
  clothing_top: string | null;
  clothing_bottom: string | null;
  shoes: string | null;
  pose: string | null;
  background: string | null;
  reference_image: string | null;
  face_type: string | null;
  facial_expression: string | null;
  modest_option: string | null;
}


export default function Result() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isProMode = searchParams.get('pro') === 'true';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resetConfig } = useModelConfig();
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [generation, setGeneration] = useState<GenerationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const generationInProgressRef = useRef(false); // Prevent duplicate API calls

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchGeneration();
  }, [id, user]);

  const fetchGeneration = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('model_generations')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setGeneration(data);

      // If pending, trigger generation (only once)
      if (data.status === 'pending' && !generationInProgressRef.current) {
        generationInProgressRef.current = true;
        generateImage(data, isProMode);
      }
    } catch (error) {
      console.error('Error fetching generation:', error);
      toast({
        title: 'Error',
        description: 'Failed to load generation data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateImage = async (data: GenerationData, usePro: boolean = false) => {
    // Prevent duplicate calls
    if (generating) {
      console.log('Generation already in progress, blocking duplicate call');
      return;
    }
    
    setGenerating(true);

    try {
      // Call edge function to generate image
      const { data: result, error } = await supabase.functions.invoke('generate-model', {
        body: {
          generationId: data.id,
          userId: user?.id, // Pass user ID for trial pro generation tracking
          config: {
            gender: data.gender,
            ethnicity: data.ethnicity,
            skinTone: data.skin_tone,
            hairColor: data.hair_color,
            eyeColor: data.eye_color,
            bodyType: data.body_type,
            hairType: data.hair_type,
            beardType: data.beard_type,
            clothingTop: data.clothing_top,
            clothingBottom: data.clothing_bottom,
            shoes: data.shoes,
            pose: data.pose,
            background: data.background,
            faceType: data.face_type,
            facialExpression: data.facial_expression,
            modestOption: data.modest_option,
          },
          referenceImage: data.reference_image,
          usePro: usePro, // Pass Pro mode flag
        },
      });

      if (error) throw error;

      // Update local state
      setGeneration(prev => prev ? { ...prev, status: 'completed', image_url: result.imageUrl } : null);

      toast({
        title: 'Success!',
        description: usePro 
          ? 'Your Utsuri Pro fashion model has been generated.' 
          : 'Your fashion model has been generated.',
      });
    } catch (error) {
      console.error('Error generating image:', error);
      setGeneration(prev => prev ? { ...prev, status: 'failed' } : null);
      toast({
        title: 'Generation failed',
        description: error instanceof Error ? error.message : 'AI image generation failed. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
      generationInProgressRef.current = false;
    }
  };

  const handleRegenerate = () => {
    if (generation && !generating && !generationInProgressRef.current) {
      generationInProgressRef.current = true;
      generateImage(generation, isProMode);
    }
  };

  const handleDownload = async () => {
    if (!generation?.image_url) return;

    try {
      // Fetch with no-cors mode for external images
      const response = await fetch(generation.image_url, {
        mode: 'cors',
        credentials: 'omit',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fashion-model-${generation.id}.png`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: 'Download started',
        description: 'Your image is being downloaded.',
      });
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab for manual download
      try {
        window.open(generation.image_url, '_blank');
        toast({
          title: 'Opening image',
          description: 'The image opened in a new tab. Right-click to save it.',
        });
      } catch {
        toast({
          title: 'Download failed',
          description: 'Could not download the image. Please try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const handleCreateNew = () => {
    resetConfig();
    navigate('/filter/gender');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-x-hidden max-w-full">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 w-full">
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 xl:py-6">
          <Button 
            variant="ghost" 
            onClick={handleCreateNew}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('result.newModel')}
          </Button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="hidden xl:block">
              <BrandLogo size="xl" withText text="Utsuri" />
            </div>
            <div className="xl:hidden">
              <BrandLogo size="lg" withText text="Utsuri" />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="hidden sm:flex items-center gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              {t('common.dashboard')}
            </Button>
            <LanguageSwitcher />
            <ProfileDropdown />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-2xl animate-fade-in">
          {/* Image Display */}
          <div className="relative aspect-[9/16] bg-card rounded-2xl border overflow-hidden mb-8 shadow-lg">
            {/* Pro Badge */}
            {isProMode && (
              <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold shadow-lg">
                <Crown className="h-4 w-4" />
                Utsuri Pro
              </div>
            )}
            {generating ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">
                  {isProMode ? 'Generating with Utsuri Pro...' : t('result.generating')}
                </p>
              </div>
            ) : generation?.image_url ? (
              <img 
                src={generation.image_url} 
                alt="Generated fashion model" 
                className="w-full h-full object-contain bg-muted/10"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <ImageIcon className="h-16 w-16" />
                <p>{t('result.pending')}</p>
                <p className="text-sm text-center px-8">
                  The AI integration is prepared but not yet active. 
                  Your configuration has been saved.
                </p>
              </div>
            )}
          </div>

          {/* Selected Filters - Matching ClothingSelection design */}
          {generation && (
            <div className="bg-card border border-border rounded-xl p-4 mb-8">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <BrandLogoMark size="sm" />
                Selected Filters
                {isProMode && (
                  <span className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 text-xs font-medium border border-amber-500/30">
                    <Crown className="h-3 w-3" />
                    Pro Quality
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {generation.gender && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Gender</span>
                    <span className="font-medium text-foreground">{generation.gender}</span>
                  </div>
                )}
                {generation.ethnicity && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Ethnicity</span>
                    <span className="font-medium text-foreground">{generation.ethnicity}</span>
                  </div>
                )}
                {generation.skin_tone && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Skin Tone</span>
                    <span className="font-medium text-foreground">{generation.skin_tone}</span>
                  </div>
                )}
                {generation.hair_color && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Hair Color</span>
                    <span className="font-medium text-foreground">{generation.hair_color}</span>
                  </div>
                )}
                {generation.eye_color && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Eye Color</span>
                    <span className="font-medium text-foreground">{generation.eye_color}</span>
                  </div>
                )}
                {generation.body_type && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Body Type</span>
                    <span className="font-medium text-foreground">{generation.body_type}</span>
                  </div>
                )}
                {generation.hair_type && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Hair Type</span>
                    <span className="font-medium text-foreground">{generation.hair_type}</span>
                  </div>
                )}
                {generation.beard_type && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Beard Type</span>
                    <span className="font-medium text-foreground">{generation.beard_type}</span>
                  </div>
                )}
                {generation.pose && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Pose</span>
                    <span className="font-medium text-foreground">{generation.pose}</span>
                  </div>
                )}
                {generation.background && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Background</span>
                    <span className="font-medium text-foreground">{generation.background}</span>
                  </div>
                )}
                {generation.face_type && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Face Type</span>
                    <span className="font-medium text-foreground">{generation.face_type}</span>
                  </div>
                )}
                {generation.facial_expression && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Expression</span>
                    <span className="font-medium text-foreground">{generation.facial_expression}</span>
                  </div>
                )}
                {generation.modest_option && (
                  <div className="flex justify-between text-sm py-1.5 px-2 rounded-lg bg-secondary/50">
                    <span className="text-muted-foreground">Coverage</span>
                    <span className="font-medium text-foreground">{generation.modest_option}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={generating}
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t('result.regenerate')}
            </Button>
            
            <Button
              onClick={handleDownload}
              disabled={!generation?.image_url || generating}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="mr-2 h-4 w-4" />
              {t('result.download')}
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={handleCreateNew}
            className="w-full mt-4 text-muted-foreground"
          >
            {t('result.createAnother')}
          </Button>
        </div>
      </main>
    </div>
  );
}
