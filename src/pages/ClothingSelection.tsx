import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ImageUpload } from '@/components/ImageUpload';

export default function ClothingSelection() {
  const navigate = useNavigate();
  const { config, setCurrentStep, totalSteps } = useModelConfig();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [referenceImage, setReferenceImage] = useState<{ file: File | null; preview: string | null }>({
    file: null,
    preview: null,
  });

  setCurrentStep(totalSteps);

  const handleImageSelect = (file: File | null, preview: string | null) => {
    setReferenceImage({ file, preview });
  };

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: 'Not authenticated',
        description: 'Please sign in to generate models.',
        variant: 'destructive',
      });
      navigate('/auth');
      return;
    }

    setLoading(true);

    try {
      // Save to database
      const { data, error } = await supabase
        .from('model_generations')
        .insert({
          user_id: user.id,
          gender: config.gender,
          ethnicity: config.ethnicity,
          skin_tone: config.skinTone,
          hair_color: config.hairColor,
          eye_color: config.eyeColor,
          body_type: config.bodyType,
          hair_type: config.hairType,
          beard_type: config.beardType || null,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      navigate(`/result/${data.id}`);
    } catch (error) {
      console.error('Error saving generation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start generation. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => config.gender === 'Male' ? navigate('/filter/beard-type') : navigate('/filter/hair-type')}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="font-medium text-foreground">Final Step</span>
        </div>
        
        <div className="w-10" />
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Reference Image</h1>
          <p className="text-muted-foreground">Upload a clothing or style reference for your model</p>
        </div>

        <div className="w-full max-w-md space-y-8">
          {/* Reference Image Upload */}
          <ImageUpload
            onImageSelect={handleImageSelect}
            label="Upload Reference Image"
            sublabel="Drag & drop or click to upload clothing inspiration"
            className="min-h-[280px]"
          />

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={loading}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-medium"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Starting Generation...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Model Image
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}
