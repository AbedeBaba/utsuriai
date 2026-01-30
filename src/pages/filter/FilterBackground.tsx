import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';
import { useFilterFlowGuard } from '@/hooks/useFilterFlowGuard';

// Background images
import cityBg from '@/assets/backgrounds/city.jpg';
import fashionWhiteBg from '@/assets/backgrounds/fashion-white.jpg';
import beachBg from '@/assets/backgrounds/beach.jpg';
import mountainBg from '@/assets/backgrounds/mountain.jpg';
import forestBg from '@/assets/backgrounds/forest.jpg';
import snowyBg from '@/assets/backgrounds/snowy.jpg';
import cafeBg from '@/assets/backgrounds/cafe.jpg';
import underwaterBg from '@/assets/backgrounds/underwater.png';
import homeBg from '@/assets/backgrounds/home.jpg';

const backgroundOptions = [
  { id: 'City', label: 'City', subtitle: 'Urban backdrop', image: cityBg },
  { id: 'Fashion White', label: 'Fashion White', subtitle: 'Studio clean', image: fashionWhiteBg },
  { id: 'Beach', label: 'Beach', subtitle: 'Coastal vibes', image: beachBg },
  { id: 'Mountain', label: 'Mountain', subtitle: 'Scenic peaks', image: mountainBg },
  { id: 'Forest', label: 'Forest', subtitle: 'Natural green', image: forestBg },
  { id: 'Snowy', label: 'Snowy', subtitle: 'Winter scene', image: snowyBg },
  { id: 'Cafe', label: 'Cafe', subtitle: 'Cozy interior', image: cafeBg },
  { id: 'Underwater', label: 'Underwater', subtitle: 'Aquatic theme', image: underwaterBg },
  { id: 'Home', label: 'Home', subtitle: 'Cozy home', image: homeBg },
];

const faceTypeOptions = ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond'];
const expressionOptions = ['Neutral', 'Smile', 'Serious', 'Confident'];

export default function FilterBackground() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const { hasProFeatureAccess, hasCreatorFeatureAccess, loading } = useSubscription();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverDisabled, setHoverDisabled] = useState(false);

  // Guard: redirect to gender selection on page refresh
  useFilterFlowGuard();

  // Redirect Trial and Starter users (no Pro feature access)
  useEffect(() => {
    if (!loading && !hasProFeatureAccess) {
      navigate('/clothing');
    }
  }, [hasProFeatureAccess, loading, navigate]);

  useEffect(() => {
    setCurrentStep(10);
  }, [setCurrentStep]);

  const handleSelect = useCallback((background: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(background);
    setHoverDisabled(true);
    updateConfig('background', background);

    setTimeout(() => {
      navigate('/filter/face-type');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  const handleRandomSingle = useCallback(() => {
    if (isAnimating) return;
    
    const randomBackground = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];
    setIsAnimating(true);
    setSelectedId(randomBackground.id);
    setHoverDisabled(true);
    updateConfig('background', randomBackground.id);
    
    setTimeout(() => {
      navigate('/filter/face-type');
    }, 600);
  }, [isAnimating, updateConfig, navigate]);

  const handleRandomAll = useCallback(() => {
    // Select random for this filter
    const randomBackground = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];
    updateConfig('background', randomBackground.id);
    
    // Only set Creator features (Face Type, Expression) if user has Creator access
    if (hasCreatorFeatureAccess) {
      const randomFaceType = faceTypeOptions[Math.floor(Math.random() * faceTypeOptions.length)];
      const randomExpression = expressionOptions[Math.floor(Math.random() * expressionOptions.length)];
      updateConfig('faceType', randomFaceType);
      updateConfig('facialExpression', randomExpression);
    }
    
    // Navigate to clothing (final step before generation)
    navigate('/clothing');
  }, [updateConfig, navigate, hasCreatorFeatureAccess]);

  const infoText = "Images shown in the cards are for example purposes only. UtsuriAI does not recreate the exact same models; it generates random and unique models based on the selected filters.";

  return (
    <FilterStepLayout 
      title="Select Background"
      subtitle="Choose the background scene for your image"
      onBack={() => navigate('/filter/pose')}
      onRandom={handleRandomAll}
      onRandomSingle={handleRandomSingle}
      infoText={infoText}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 relative w-full max-w-[95vw] mx-auto px-4">
        {backgroundOptions.map((option, index) => (
          <div
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "group relative flex flex-col items-center justify-end rounded-2xl cursor-pointer overflow-hidden",
              "w-full h-[180px] sm:h-[200px] md:h-[220px] lg:h-[260px]",
              "transition-all duration-500 ease-out",
              "bg-gradient-to-b from-white/[0.08] to-white/[0.04] backdrop-blur-xl",
              "border-2 border-white/20",
              !hoverDisabled && "hover:border-violet-400/60 hover:shadow-[0_20px_60px_rgba(139,92,246,0.35)] hover:scale-[1.03] hover:-translate-y-2",
              "shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
              "outline-none ring-0",
              config.background === option.id && "border-violet-400 ring-4 ring-violet-400/40 shadow-[0_0_40px_rgba(139,92,246,0.4)]",
              selectedId === option.id && isAnimating && "scale-110 z-10",
              isAnimating && selectedId !== option.id && "opacity-20 scale-90 blur-[1px]"
            )}
            style={{ 
              animationDelay: `${index * 30}ms`,
            }}
            tabIndex={-1}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={option.image} 
                alt={option.label}
                className={cn(
                  "w-full h-full object-cover object-center transition-transform duration-700",
                  !hoverDisabled && "group-hover:scale-110"
                )}
              />
              {/* Premium gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              {/* Hover glow effect */}
              <div className={cn(
                "absolute inset-0 transition-colors duration-500",
                !hoverDisabled ? "bg-violet-500/0 group-hover:bg-violet-500/10" : "bg-transparent"
              )} />
            </div>
            
            {/* Label with enhanced styling */}
            <div className="relative z-10 text-center pb-4 px-3 w-full">
              <p className="font-bold text-base md:text-lg tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {option.label}
              </p>
              <p className="text-xs md:text-sm text-white/70 mt-1">
                {option.subtitle}
              </p>
            </div>

            {/* Selection indicator */}
            {config.background === option.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </FilterStepLayout>
  );
}