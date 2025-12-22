import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useModelConfig } from '@/context/ModelConfigContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Download, RefreshCw, Sparkles, Loader2, ImageIcon } from 'lucide-react';

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
}

export default function Result() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resetConfig } = useModelConfig();
  const { toast } = useToast();
  
  const [generation, setGeneration] = useState<GenerationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

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

      // If pending, trigger generation
      if (data.status === 'pending') {
        generateImage(data);
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

  const generateImage = async (data: GenerationData) => {
    setGenerating(true);

    try {
      // Call edge function to generate image
      const { data: result, error } = await supabase.functions.invoke('generate-model', {
        body: {
          generationId: data.id,
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
        },
      });

      if (error) throw error;

      // Update local state
      setGeneration(prev => prev ? { ...prev, status: 'completed', image_url: result.imageUrl } : null);

      toast({
        title: 'Success!',
        description: 'Your fashion model has been generated.',
      });
    } catch (error) {
      console.error('Error generating image:', error);
      setGeneration(prev => prev ? { ...prev, status: 'failed' } : null);
      toast({
        title: 'Generation failed',
        description: 'AI image generation is not yet configured. Please check back later.',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (generation) {
      generateImage(generation);
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
      <header className="flex items-center justify-between p-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleCreateNew}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">Your Model</span>
        </div>
        
        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="w-full max-w-2xl animate-fade-in">
          {/* Image Display */}
          <div className="aspect-[3/4] bg-card rounded-2xl border overflow-hidden mb-8 shadow-lg">
            {generating ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Generating your model...</p>
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
                <p>Image generation pending</p>
                <p className="text-sm text-center px-8">
                  The AI integration is prepared but not yet active. 
                  Your configuration has been saved.
                </p>
              </div>
            )}
          </div>

          {/* Model Details */}
          {generation && (
            <div className="bg-card rounded-xl border p-6 mb-8">
              <h3 className="font-semibold text-foreground mb-4">Model Configuration</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Gender:</span> {generation.gender}</div>
                <div><span className="text-muted-foreground">Ethnicity:</span> {generation.ethnicity}</div>
                <div><span className="text-muted-foreground">Skin Tone:</span> {generation.skin_tone}</div>
                <div><span className="text-muted-foreground">Hair:</span> {generation.hair_color} {generation.hair_type}</div>
                <div><span className="text-muted-foreground">Eyes:</span> {generation.eye_color}</div>
                <div><span className="text-muted-foreground">Body:</span> {generation.body_type}</div>
                {generation.beard_type && (
                  <div><span className="text-muted-foreground">Beard:</span> {generation.beard_type}</div>
                )}
                <div><span className="text-muted-foreground">Outfit:</span> {generation.clothing_top}, {generation.clothing_bottom}</div>
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
              Regenerate
            </Button>
            
            <Button
              onClick={handleDownload}
              disabled={!generation?.image_url || generating}
              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={handleCreateNew}
            className="w-full mt-4 text-muted-foreground"
          >
            Create Another Model
          </Button>
        </div>
      </main>
    </div>
  );
}
