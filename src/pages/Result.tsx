import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Download, RefreshCw, Sparkles, Loader2, ImageIcon, LayoutDashboard, Crown, User, Palette, Eye, Shirt, Camera, MapPin } from 'lucide-react';
import { ProfileDropdown } from '@/components/ProfileDropdown';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
}

// Reusable config item component for displaying filter values
function ConfigItem({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5 p-2 rounded-lg bg-background/50">
      <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  );
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
      const response = await fetch(generation.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fashion-model-${generation.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Download failed',
        description: 'Could not download the image.',
        variant: 'destructive',
      });
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center justify-between px-6 py-4">
          <Button 
            variant="ghost" 
            onClick={handleCreateNew}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {t('result.newModel')}
          </Button>
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-xl font-semibold text-foreground italic">Utsuri</span>
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
          <div className="relative aspect-[3/4] bg-card rounded-2xl border overflow-hidden mb-8 shadow-lg">
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
                className="w-full h-full object-cover"
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

          {/* Model Configuration Section - Premium Card-Based Layout */}
          {generation && (
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">{t('result.modelConfig')}</h3>
                {isProMode && (
                  <span className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 text-xs font-medium border border-amber-500/30">
                    <Crown className="h-3 w-3" />
                    Pro Quality
                  </span>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                This image was generated using these exact selections:
              </p>
              
              {/* Model Identity Card */}
              <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-primary">
                    <User className="h-4 w-4" />
                    Model Identity
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <ConfigItem label="Gender" value={generation.gender} />
                  <ConfigItem label="Ethnicity" value={generation.ethnicity} />
                  <ConfigItem label="Body Type" value={generation.body_type} />
                  {generation.beard_type && <ConfigItem label="Beard Type" value={generation.beard_type} />}
                </CardContent>
              </Card>
              
              {/* Appearance Card */}
              <Card className="border-violet-500/20 bg-gradient-to-br from-card to-violet-500/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2 text-violet-400">
                    <Palette className="h-4 w-4" />
                    Appearance
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <ConfigItem label="Skin Tone" value={generation.skin_tone} />
                  <ConfigItem label="Hair Color" value={generation.hair_color} />
                  <ConfigItem label="Hair Type" value={generation.hair_type} />
                  <ConfigItem label="Eye Color" value={generation.eye_color} />
                </CardContent>
              </Card>
              
              {/* Scene & Pose Card */}
              {(generation.pose || generation.background) && (
                <Card className="border-emerald-500/20 bg-gradient-to-br from-card to-emerald-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-400">
                      <Camera className="h-4 w-4" />
                      Scene & Pose
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3">
                    {generation.pose && <ConfigItem label="Pose" value={generation.pose} />}
                    {generation.background && <ConfigItem label="Background" value={generation.background} />}
                  </CardContent>
                </Card>
              )}
              
              {/* Outfit Card */}
              {(generation.clothing_top || generation.clothing_bottom || generation.shoes) && (
                <Card className="border-rose-500/20 bg-gradient-to-br from-card to-rose-500/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2 text-rose-400">
                      <Shirt className="h-4 w-4" />
                      Outfit
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-3">
                    {generation.clothing_top && <ConfigItem label="Top" value={generation.clothing_top} />}
                    {generation.clothing_bottom && <ConfigItem label="Bottom" value={generation.clothing_bottom} />}
                    {generation.shoes && <ConfigItem label="Shoes" value={generation.shoes} />}
                  </CardContent>
                </Card>
              )}
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
