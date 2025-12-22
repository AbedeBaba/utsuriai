import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const topOptions = ['T-Shirt', 'Blouse', 'Blazer', 'Sweater', 'Tank Top', 'Dress Shirt', 'Hoodie', 'Crop Top', 'Jacket'];
const bottomOptions = ['Jeans', 'Dress Pants', 'Shorts', 'Skirt', 'Leggings', 'Chinos', 'Joggers', 'Maxi Skirt', 'Culottes'];
const shoesOptions = ['Sneakers', 'Heels', 'Boots', 'Loafers', 'Sandals', 'Flats', 'Oxfords', 'Platforms', 'Athletic'];
const poseOptions = ['Standing', 'Walking', 'Sitting', 'Leaning', 'Dynamic', 'Casual', 'Professional', 'Artistic', 'Editorial'];
const backgroundOptions = ['Studio White', 'Studio Gray', 'Outdoor Urban', 'Beach', 'Nature', 'Gradient', 'Minimalist', 'Luxury Interior', 'Street'];

export default function ClothingSelection() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep, totalSteps } = useModelConfig();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  setCurrentStep(totalSteps);

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
          clothing_top: config.clothingTop || null,
          clothing_bottom: config.clothingBottom || null,
          shoes: config.shoes || null,
          pose: config.pose || null,
          background: config.background || null,
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
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-3xl font-semibold text-foreground mb-2">Clothing & Style</h1>
          <p className="text-muted-foreground">Customize the outfit and pose for your model</p>
        </div>

        <div className="w-full max-w-lg space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Top</Label>
              <Select value={config.clothingTop} onValueChange={(v) => updateConfig('clothingTop', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select top" />
                </SelectTrigger>
                <SelectContent>
                  {topOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bottom</Label>
              <Select value={config.clothingBottom} onValueChange={(v) => updateConfig('clothingBottom', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bottom" />
                </SelectTrigger>
                <SelectContent>
                  {bottomOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Shoes</Label>
            <Select value={config.shoes} onValueChange={(v) => updateConfig('shoes', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select shoes" />
              </SelectTrigger>
              <SelectContent>
                {shoesOptions.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Pose (Optional)</Label>
              <Select value={config.pose} onValueChange={(v) => updateConfig('pose', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select pose" />
                </SelectTrigger>
                <SelectContent>
                  {poseOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Background (Optional)</Label>
              <Select value={config.background} onValueChange={(v) => updateConfig('background', v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select background" />
                </SelectTrigger>
                <SelectContent>
                  {backgroundOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={loading || !config.clothingTop || !config.clothingBottom || !config.shoes}
            className="w-full btn-gold mt-8"
          >
            {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
            <Sparkles className="mr-2 h-5 w-5" />
            Generate Model Image
          </Button>
        </div>
      </main>
    </div>
  );
}
