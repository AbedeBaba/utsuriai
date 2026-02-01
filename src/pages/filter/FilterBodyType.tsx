import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useFilterFlowGuard } from '@/hooks/useFilterFlowGuard';
import { OptimizedImage } from '@/components/OptimizedImage';

// Female body type images
import femaleSlim from '@/assets/body-types/female-slim.png';
import femaleAthletic from '@/assets/body-types/female-athletic.jpg';
import femaleAverage from '@/assets/body-types/female-average.png';
import femaleMuscular from '@/assets/body-types/female-muscular.png';
import femaleCurvy from '@/assets/body-types/female-curvy.png';
import femalePlusSize from '@/assets/body-types/female-plus-size.png';
import femalePetite from '@/assets/body-types/female-petite.png';
import femaleTall from '@/assets/body-types/female-tall.png';
import femaleHourglass from '@/assets/body-types/female-hourglass.png';

// Male body type images
import maleSlim from '@/assets/body-types/male-slim.png';
import maleAthletic from '@/assets/body-types/male-athletic.png';
import maleAverage from '@/assets/body-types/male-average.png';
import maleMuscular from '@/assets/body-types/male-muscular.png';
import maleCurvy from '@/assets/body-types/male-curvy.png';
import malePlusSize from '@/assets/body-types/male-plus-size.png';
import malePetite from '@/assets/body-types/male-petite.png';
import maleTall from '@/assets/body-types/male-tall.png';

const allBodyTypeOptions = [
  { id: 'Slim', label: 'Slim', subtitle: 'Lean and slender', femaleImage: femaleSlim, maleImage: maleSlim },
  { id: 'Athletic', label: 'Athletic', subtitle: 'Toned and fit', femaleImage: femaleAthletic, maleImage: maleAthletic },
  { id: 'Average', label: 'Average', subtitle: 'Balanced build', femaleImage: femaleAverage, maleImage: maleAverage },
  { id: 'Muscular', label: 'Muscular', subtitle: 'Strong and defined', femaleImage: femaleMuscular, maleImage: maleMuscular },
  { id: 'Curvy', label: 'Curvy', subtitle: 'Full figured', femaleImage: femaleCurvy, maleImage: maleCurvy },
  { id: 'Plus Size', label: 'Plus Size', subtitle: 'Full bodied', femaleImage: femalePlusSize, maleImage: malePlusSize },
  { id: 'Petite', label: 'Petite', subtitle: 'Small and delicate', femaleImage: femalePetite, maleImage: malePetite },
  { id: 'Tall', label: 'Tall', subtitle: 'Long and lean', femaleImage: femaleTall, maleImage: maleTall },
  { id: 'Hourglass', label: 'Hourglass', subtitle: 'Balanced proportions', femaleImage: femaleHourglass, maleImage: null, femaleOnly: true },
];

const hairTypeOptions = ['Straight', 'Wavy', 'Curly', 'Coily', 'Bald', 'Short', 'Long'];
const poseOptions = ['Face Close-up', 'Standing', 'Sitting', 'Leaning', 'Arms Crossed', 'Back View', 'Low-angle', 'Hands on Hips'];
const backgroundOptions = ['City', 'Fashion White', 'Beach', 'Mountain', 'Forest', 'Snowy', 'Cafe', 'Underwater'];
const faceTypeOptions = ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond'];
const expressionOptions = ['Neutral', 'Smile', 'Serious', 'Confident'];
const beardTypeOptions = ['Clean Shaven', 'Stubble', 'Short Beard', 'Full Beard', 'Goatee', 'Mustache', 'Van Dyke', 'Circle Beard', 'Mutton Chops'];

export default function FilterBodyType() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const { hasProFeatureAccess, hasCreatorFeatureAccess } = useSubscription();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Guard: redirect to gender selection on page refresh
  useFilterFlowGuard();
  
  const isFemale = config.gender === 'Female';

  // Filter options based on gender - exclude Hourglass for males
  const bodyTypeOptions = useMemo(() => {
    if (isFemale) {
      return allBodyTypeOptions;
    }
    return allBodyTypeOptions.filter(option => !option.femaleOnly);
  }, [isFemale]);

  useEffect(() => {
    setCurrentStep(config.gender === 'Female' ? 7 : 6);
  }, [setCurrentStep, config.gender]);

  // Handle scroll/swipe
  const scrollToIndex = useCallback((index: number) => {
    if (isTransitioning) return;
    
    // Clamp index to valid range
    const newIndex = Math.max(0, Math.min(bodyTypeOptions.length - 1, index));
    
    if (newIndex !== activeIndex) {
      setIsTransitioning(true);
      setActiveIndex(newIndex);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    }
  }, [activeIndex, isTransitioning, bodyTypeOptions.length]);

  const handlePrev = useCallback(() => {
    scrollToIndex(activeIndex - 1);
  }, [activeIndex, scrollToIndex]);

  const handleNext = useCallback(() => {
    scrollToIndex(activeIndex + 1);
  }, [activeIndex, scrollToIndex]);

  const handleSelect = useCallback(() => {
    const selectedOption = bodyTypeOptions[activeIndex];
    updateConfig('bodyType', selectedOption.id);
    
    setTimeout(() => {
      navigate('/filter/hair-type');
    }, 300);
  }, [activeIndex, navigate, updateConfig, bodyTypeOptions]);

  const handleRandomSingle = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * bodyTypeOptions.length);
    const randomBodyType = bodyTypeOptions[randomIndex];
    updateConfig('bodyType', randomBodyType.id);
    
    setTimeout(() => {
      navigate('/filter/hair-type');
    }, 300);
  }, [bodyTypeOptions, updateConfig, navigate]);

  const handleRandomAll = useCallback(() => {
    const isHijab = config.modestOption === 'Hijab';
    
    // Select random for this filter and all remaining ones
    const randomBodyType = bodyTypeOptions[Math.floor(Math.random() * bodyTypeOptions.length)];
    
    updateConfig('bodyType', randomBodyType.id);
    
    // Only set hair type if NOT Hijab (hair is hidden under hijab)
    if (!isHijab) {
      const randomHairType = hairTypeOptions[Math.floor(Math.random() * hairTypeOptions.length)];
      updateConfig('hairType', randomHairType);
    }
    
    // Only set Pro features if user has Pro feature access (Pro/Creator plans)
    if (hasProFeatureAccess) {
      const randomPose = poseOptions[Math.floor(Math.random() * poseOptions.length)];
      const randomBackground = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];
      updateConfig('pose', randomPose);
      updateConfig('background', randomBackground);
    }
    
    // Only set Creator features if user has Creator feature access (Creator plan only)
    if (hasCreatorFeatureAccess) {
      const randomFaceType = faceTypeOptions[Math.floor(Math.random() * faceTypeOptions.length)];
      const randomExpression = expressionOptions[Math.floor(Math.random() * expressionOptions.length)];
      updateConfig('faceType', randomFaceType);
      updateConfig('facialExpression', randomExpression);
    }
    
    // For males, also set beard type
    if (!isFemale) {
      const randomBeardType = beardTypeOptions[Math.floor(Math.random() * beardTypeOptions.length)];
      updateConfig('beardType', randomBeardType);
    }
    
    // Navigate to clothing (final step before generation)
    navigate('/clothing');
  }, [bodyTypeOptions, isFemale, config.modestOption, updateConfig, navigate, hasProFeatureAccess, hasCreatorFeatureAccess]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'Enter') {
        handleSelect();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext, handleSelect]);

  // Touch/swipe handling
  const touchStartX = useRef<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    
    touchStartX.current = null;
  };

  // Calculate position and style for each card - mobile-responsive
  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const absDiff = Math.abs(diff);
    
    // Use smaller offsets on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const baseOffset = isMobile ? 140 : 280;
    const outerOffset = isMobile ? 130 : 260;
    
    // Base values for center card
    let scale = 1;
    let opacity = 1;
    let zIndex = 10;
    let translateX = 0;
    
    if (absDiff === 0) {
      // Center (active) card
      scale = 1;
      opacity = 1;
      zIndex = 10;
      translateX = 0;
    } else if (absDiff === 1) {
      // Adjacent cards
      scale = 0.7;
      opacity = 0.6;
      zIndex = 8;
      translateX = diff * baseOffset;
    } else if (absDiff === 2) {
      // Outer cards
      scale = 0.5;
      opacity = 0.3;
      zIndex = 6;
      translateX = diff * outerOffset;
    } else {
      // Hidden cards
      scale = 0.4;
      opacity = 0;
      zIndex = 1;
      translateX = diff * outerOffset;
    }
    
    return {
      transform: `translateX(${translateX}px) scale(${scale})`,
      opacity,
      zIndex,
    };
  };

  const infoText = "Images shown in the cards are for example purposes only. UtsuriAI does not recreate the exact same models; it generates random and unique models based on the selected filters.";

  return (
    <FilterStepLayout 
      title="Select Body Type"
      subtitle="Scroll left or right to choose the body type"
      onBack={() => navigate('/filter/eye-color')}
      onRandom={handleRandomAll}
      onRandomSingle={handleRandomSingle}
      infoText={infoText}
    >
      {/* Carousel Container */}
      <div 
        ref={containerRef}
        className="relative flex items-center justify-center h-[500px] sm:h-[700px] md:h-[900px] lg:h-[1000px] overflow-hidden w-full max-w-full"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Navigation Arrows */}
        <button
          onClick={handlePrev}
          disabled={activeIndex === 0}
          className={cn(
            "absolute left-2 sm:left-4 z-20 p-2 sm:p-3 rounded-full",
            "bg-background/80 backdrop-blur-sm border border-border/50",
            "hover:bg-accent transition-all duration-200",
            "disabled:opacity-30 disabled:cursor-not-allowed"
          )}
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
        </button>
        
        <button
          onClick={handleNext}
          disabled={activeIndex === bodyTypeOptions.length - 1}
          className={cn(
            "absolute right-2 sm:right-4 z-20 p-2 sm:p-3 rounded-full",
            "bg-background/80 backdrop-blur-sm border border-border/50",
            "hover:bg-accent transition-all duration-200",
            "disabled:opacity-30 disabled:cursor-not-allowed"
          )}
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
        </button>

        {/* Cards */}
        <div className="relative flex items-center justify-center w-full h-full overflow-visible">
          {bodyTypeOptions.map((option, index) => {
            const style = getCardStyle(index);
            const isActive = index === activeIndex;
            const imageToShow = isFemale ? option.femaleImage : option.maleImage;
            
            return (
              <div
                key={option.id}
                className={cn(
                  "absolute flex flex-col items-center",
                  "transition-all duration-400 ease-out cursor-pointer"
                )}
                style={{
                  transform: style.transform,
                  opacity: style.opacity,
                  zIndex: style.zIndex,
                }}
                onClick={() => !isActive && scrollToIndex(index)}
              >
                {/* Card */}
                <div
                  className={cn(
                    "relative overflow-hidden rounded-2xl",
                    "w-[180px] sm:w-[240px] md:w-[300px] lg:w-[350px]",
                    "h-[300px] sm:h-[420px] md:h-[525px] lg:h-[612px]",
                    "border-2 transition-all duration-300",
                    isActive 
                      ? "border-primary shadow-2xl shadow-primary/20" 
                      : "border-border/30 shadow-lg"
                  )}
                >
                  {/* Image */}
                  <OptimizedImage
                    src={imageToShow || ''}
                    alt={option.label}
                    className="w-full h-full object-cover"
                    objectPosition="top"
                  />
                  
                  {/* Gradient Overlay */}
                  <div 
                    className={cn(
                      "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent",
                      "transition-opacity duration-300",
                      isActive ? "opacity-80" : "opacity-60"
                    )}
                  />
                  
                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <h3 className={cn(
                      "font-semibold text-white text-center transition-all duration-300",
                      isActive ? "text-lg sm:text-xl" : "text-sm sm:text-base"
                    )}>
                      {option.label}
                    </h3>
                    {isActive && (
                      <p className="text-xs sm:text-sm text-white/80 text-center mt-1 animate-fade-in">
                        {option.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Select Button - Only for active card */}
                {isActive && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect();
                    }}
                    className={cn(
                      "mt-4 px-8 py-2 animate-fade-in",
                      "bg-primary hover:bg-primary/90 text-primary-foreground",
                      "font-medium rounded-full shadow-lg shadow-primary/30"
                    )}
                  >
                    Select
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicator Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {bodyTypeOptions.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === activeIndex 
                ? "w-6 bg-primary" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
          />
        ))}
      </div>
    </FilterStepLayout>
  );
}