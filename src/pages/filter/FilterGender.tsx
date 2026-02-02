import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import maleModel from '@/assets/gender-male.jpeg';
import femaleModel from '@/assets/gender-female.jpeg';
import { useSubscription } from '@/hooks/useSubscription';
import { LoadSavedModelDialog } from '@/components/LoadSavedModelDialog';
import { useSavedModels, SavedModel } from '@/hooks/useSavedModels';
import { ArrowLeft } from 'lucide-react';
import { SelectionCard } from '@/components/SelectionCard';
import { startFilterFlow } from '@/hooks/useFilterFlowGuard';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useImagePrefetch } from '@/hooks/useImagePrefetch';
import { FILTER_IMAGES } from '@/data/filterImages';
import { Slider } from '@/components/ui/slider';
export default function FilterGender() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep, loadSavedModel } = useModelConfig();
  const { hasCreatorFeatureAccess } = useSubscription();
  const { convertToModelConfig } = useSavedModels();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(1);
    // Mark filter flow as active when entering gender selection
    startFilterFlow();
  }, [setCurrentStep]);

  // Prefetch next step images (modest option for females, ethnicity for males)
  // Prefetch both since we don't know which gender will be selected
  useImagePrefetch([
    ...FILTER_IMAGES.modestOption.all,
    ...FILTER_IMAGES.ethnicity.male,
    ...FILTER_IMAGES.ethnicity.female,
  ]);

  // Handle loading a saved model
  const handleLoadSavedModel = useCallback((savedModel: SavedModel) => {
    const modelConfig = convertToModelConfig(savedModel);
    loadSavedModel(modelConfig);
    navigate('/clothing');
  }, [convertToModelConfig, loadSavedModel, navigate]);

  const handleSelect = useCallback((gender: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(gender);
    updateConfig('gender', gender);
    
    if (gender === 'Female') {
      updateConfig('beardType', '');
    }

    setTimeout(() => {
      if (gender === 'Female') {
        navigate('/filter/modest-option');
      } else {
        navigate('/filter/ethnicity');
      }
    }, 800);
  }, [isAnimating, navigate, updateConfig]);

  const genderOptions = [
    { id: 'Male', label: 'Male', image: maleModel },
    { id: 'Female', label: 'Female', image: femaleModel },
  ];

  return (
    <>
      {/* Mobile Layout - Image-based split view */}
      <div className="md:hidden min-h-screen h-screen w-full overflow-hidden relative">
        {/* Back Button - Fixed top left */}
        <button
          onClick={() => navigate('/')}
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        {/* Load Saved Model Button - Creator Only - Fixed top right */}
        {hasCreatorFeatureAccess && (
          <div className="fixed top-4 right-4 z-50">
            <LoadSavedModelDialog onSelect={handleLoadSavedModel} />
          </div>
        )}

        {/* Split Screen Container */}
        <div className="flex flex-row h-full w-full">
          {/* Male Section - Left Half */}
          <div
            onClick={() => handleSelect('Male')}
            className={cn(
              "relative w-1/2 h-full cursor-pointer group overflow-hidden",
              "transition-all duration-500 ease-out",
              isAnimating && selectedId === 'Male' && "w-full",
              isAnimating && selectedId === 'Female' && "w-0 opacity-0"
            )}
          >
            <OptimizedImage 
              src={maleModel} 
              alt="Male model"
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
                "transition-transform duration-500 ease-out",
                "group-hover:scale-105",
                isAnimating && selectedId !== 'Male' && "scale-95 opacity-50"
              )}
              objectPosition="center 15%"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className={cn(
              "absolute bottom-8 left-0 right-0 flex justify-center",
              "transition-all duration-300",
              isAnimating && selectedId !== 'Male' && "opacity-0"
            )}>
              <span className="text-white text-2xl font-bold tracking-wider px-6 py-2 rounded-lg bg-black/20 backdrop-blur-sm">
                Male
              </span>
            </div>
            <div className={cn(
              "absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
              config.gender === 'Male' && "opacity-100 bg-primary/20"
            )} />
          </div>

          {/* Female Section - Right Half */}
          <div
            onClick={() => handleSelect('Female')}
            className={cn(
              "relative w-1/2 h-full cursor-pointer group overflow-hidden",
              "transition-all duration-500 ease-out",
              isAnimating && selectedId === 'Female' && "w-full",
              isAnimating && selectedId === 'Male' && "w-0 opacity-0"
            )}
          >
            <OptimizedImage 
              src={femaleModel} 
              alt="Female model"
              className={cn(
                "absolute inset-0 w-full h-full object-cover",
                "transition-transform duration-500 ease-out",
                "group-hover:scale-105",
                isAnimating && selectedId !== 'Female' && "scale-95 opacity-50"
              )}
              objectPosition="center 15%"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className={cn(
              "absolute bottom-8 left-0 right-0 flex justify-center",
              "transition-all duration-300",
              isAnimating && selectedId !== 'Female' && "opacity-0"
            )}>
              <span className="text-white text-2xl font-bold tracking-wider px-6 py-2 rounded-lg bg-black/20 backdrop-blur-sm">
                Female
              </span>
            </div>
            <div className={cn(
              "absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
              config.gender === 'Female' && "opacity-100 bg-primary/20"
            )} />
          </div>
        </div>

        {/* Center Divider Line */}
        <div className={cn(
          "absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[2px] bg-white/30 z-10 pointer-events-none",
          "transition-opacity duration-300",
          isAnimating && "opacity-0"
        )} />

        {/* Title Overlay */}
        <div className={cn(
          "absolute top-8 left-0 right-0 flex flex-col items-center z-20 pointer-events-none",
          "transition-opacity duration-300",
          isAnimating && "opacity-0"
        )}>
          <h1 className="text-white text-xl font-semibold tracking-wide px-6 py-2 rounded-lg bg-black/30 backdrop-blur-sm">
            Select Gender
          </h1>
        </div>

        {/* Age Slider - Mobile */}
        <div className={cn(
          "absolute bottom-24 left-4 right-4 z-20",
          "transition-opacity duration-300",
          isAnimating && "opacity-0"
        )}>
          <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 pointer-events-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white text-sm font-medium">Age</span>
              <span className="text-white text-lg font-bold">{config.age}</span>
            </div>
            <Slider
              value={[config.age]}
              onValueChange={(value) => updateConfig('age', value[0])}
              min={18}
              max={60}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between mt-1">
              <span className="text-white/60 text-xs">18</span>
              <span className="text-white/60 text-xs">60</span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Layout - Card-based selection */}
      <div className="hidden md:block min-h-screen bg-background overflow-x-hidden max-w-full">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full bg-black/10 hover:bg-black/20 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            {hasCreatorFeatureAccess && (
              <LoadSavedModelDialog onSelect={handleLoadSavedModel} />
            )}
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Select Gender
            </h1>
            <p className="text-muted-foreground">
              Choose the gender for your model
            </p>
          </div>

          {/* Age Slider - Desktop */}
          <div className="max-w-md mx-auto mb-12">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-foreground font-medium">Model Age</span>
                <span className="text-2xl font-bold text-primary">{config.age}</span>
              </div>
              <Slider
                value={[config.age]}
                onValueChange={(value) => updateConfig('age', value[0])}
                min={18}
                max={60}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between mt-2">
                <span className="text-muted-foreground text-sm">18</span>
                <span className="text-muted-foreground text-sm">60</span>
              </div>
            </div>
          </div>

          {/* Gender Cards */}
          <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
            {genderOptions.map((option) => (
              <SelectionCard
                key={option.id}
                title={option.label}
                image={option.image}
                selected={config.gender === option.id}
                onClick={() => handleSelect(option.id)}
                className="aspect-[3/4]"
                imagePosition="center 15%"
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
