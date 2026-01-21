import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

// Female pose images
import femaleFaceCloseup from '@/assets/poses/female-face-closeup.png';
import femaleStanding from '@/assets/poses/female-standing.png';
import femaleSitting from '@/assets/poses/female-sitting.png';
import femaleLeaning from '@/assets/poses/female-leaning.png';
import femaleArmsCrossed from '@/assets/poses/female-arms-crossed.png';
import femaleBackView from '@/assets/poses/female-back-view.png';
import femaleLowAngle from '@/assets/poses/female-low-angle.png';
import femaleHandsOnHips from '@/assets/poses/female-hands-on-hips.png';

// Male pose images
import maleFaceCloseup from '@/assets/poses/male-face-closeup.png';
import maleStanding from '@/assets/poses/male-standing.png';
import maleSitting from '@/assets/poses/male-sitting.png';
import maleLeaning from '@/assets/poses/male-leaning.png';
import maleArmsCrossed from '@/assets/poses/male-arms-crossed.png';
import maleBackView from '@/assets/poses/male-back-view.png';
import maleLowAngle from '@/assets/poses/male-low-angle.png';
import maleHandsOnHips from '@/assets/poses/male-hands-on-hips.png';

const poseOptions = [
  { id: 'Face Close-up', label: 'Face Close-up', subtitle: 'Portrait shot', femaleImage: femaleFaceCloseup, maleImage: maleFaceCloseup },
  { id: 'Standing', label: 'Standing', subtitle: 'Full body upright', femaleImage: femaleStanding, maleImage: maleStanding },
  { id: 'Sitting', label: 'Sitting', subtitle: 'Seated position', femaleImage: femaleSitting, maleImage: maleSitting },
  { id: 'Leaning', label: 'Leaning', subtitle: 'Casual lean', femaleImage: femaleLeaning, maleImage: maleLeaning },
  { id: 'Arms Crossed', label: 'Arms Crossed', subtitle: 'Confident pose', femaleImage: femaleArmsCrossed, maleImage: maleArmsCrossed },
  { id: 'Back View', label: 'Back View', subtitle: 'Rear angle', femaleImage: femaleBackView, maleImage: maleBackView },
  { id: 'Low-angle', label: 'Low-angle', subtitle: 'Dramatic upward', femaleImage: femaleLowAngle, maleImage: maleLowAngle },
  { id: 'Hands on Hips', label: 'Hands on Hips', subtitle: 'Power stance', femaleImage: femaleHandsOnHips, maleImage: maleHandsOnHips },
];

const backgroundOptions = ['City', 'Fashion White', 'Beach', 'Mountain', 'Forest', 'Snowy', 'Cafe', 'Underwater'];
const faceTypeOptions = ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond'];
const expressionOptions = ['Neutral', 'Smile', 'Serious', 'Confident'];

export default function FilterPose() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const { hasProFeatureAccess, hasCreatorFeatureAccess, loading } = useSubscription();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isFemale = config.gender === 'Female';

  // Redirect Trial and Starter users (no Pro feature access)
  useEffect(() => {
    if (!loading && !hasProFeatureAccess) {
      navigate('/clothing');
    }
  }, [hasProFeatureAccess, loading, navigate]);

  useEffect(() => {
    setCurrentStep(config.gender === 'Male' ? 9 : 9);
  }, [setCurrentStep, config.gender]);

  // Handle scroll/swipe
  const scrollToIndex = useCallback((index: number) => {
    if (isTransitioning) return;
    
    // Clamp index to valid range
    const newIndex = Math.max(0, Math.min(poseOptions.length - 1, index));
    
    if (newIndex !== activeIndex) {
      setIsTransitioning(true);
      setActiveIndex(newIndex);
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    }
  }, [activeIndex, isTransitioning]);

  const handlePrev = useCallback(() => {
    scrollToIndex(activeIndex - 1);
  }, [activeIndex, scrollToIndex]);

  const handleNext = useCallback(() => {
    scrollToIndex(activeIndex + 1);
  }, [activeIndex, scrollToIndex]);

  const handleSelect = useCallback(() => {
    const selectedOption = poseOptions[activeIndex];
    updateConfig('pose', selectedOption.id);
    
    setTimeout(() => {
      navigate('/filter/background');
    }, 300);
  }, [activeIndex, navigate, updateConfig]);

  const handleRandomSingle = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * poseOptions.length);
    const randomPose = poseOptions[randomIndex];
    updateConfig('pose', randomPose.id);
    
    setTimeout(() => {
      navigate('/filter/background');
    }, 300);
  }, [updateConfig, navigate]);

  const handleRandomAll = useCallback(() => {
    // Select random for this filter and Pro features
    const randomPose = poseOptions[Math.floor(Math.random() * poseOptions.length)];
    const randomBackground = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];
    
    updateConfig('pose', randomPose.id);
    updateConfig('background', randomBackground);
    
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
      title="Select Pose"
      subtitle="Scroll left or right to choose the pose"
      onBack={() => {
        // For hijab females, go back to body-type (skipping hair-type)
        if (config.gender === 'Male') {
          navigate('/filter/beard-type');
        } else if (config.modestOption === 'Hijab') {
          navigate('/filter/body-type');
        } else {
          navigate('/filter/hair-type');
        }
      }}
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
          disabled={activeIndex === poseOptions.length - 1}
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
          {poseOptions.map((option, index) => {
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
                  <img
                    src={imageToShow}
                    alt={option.label}
                    className="w-full h-full object-cover object-top"
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
        {poseOptions.map((_, index) => (
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