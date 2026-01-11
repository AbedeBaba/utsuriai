import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

const bodyTypeOptions = [
  { id: 'Slim', label: 'Slim', subtitle: 'Lean and slender', femaleImage: femaleSlim },
  { id: 'Athletic', label: 'Athletic', subtitle: 'Toned and fit', femaleImage: femaleAthletic },
  { id: 'Average', label: 'Average', subtitle: 'Balanced build', femaleImage: femaleAverage },
  { id: 'Muscular', label: 'Muscular', subtitle: 'Strong and defined', femaleImage: femaleMuscular },
  { id: 'Curvy', label: 'Curvy', subtitle: 'Full figured', femaleImage: femaleCurvy },
  { id: 'Plus Size', label: 'Plus Size', subtitle: 'Full bodied', femaleImage: femalePlusSize },
  { id: 'Petite', label: 'Petite', subtitle: 'Small and delicate', femaleImage: femalePetite },
  { id: 'Tall', label: 'Tall', subtitle: 'Long and lean', femaleImage: femaleTall },
  { id: 'Hourglass', label: 'Hourglass', subtitle: 'Balanced proportions', femaleImage: femaleHourglass },
];

export default function FilterBodyType() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isFemale = config.gender === 'Female';

  useEffect(() => {
    setCurrentStep(6);
  }, [setCurrentStep]);

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
  }, [activeIndex, isTransitioning]);

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
  }, [activeIndex, navigate, updateConfig]);

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

  // Calculate position and style for each card
  const getCardStyle = (index: number) => {
    const diff = index - activeIndex;
    const absDiff = Math.abs(diff);
    
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
      scale = 0.75;
      opacity = 0.7;
      zIndex = 8;
      translateX = diff * 351;
    } else if (absDiff === 2) {
      // Outer cards
      scale = 0.55;
      opacity = 0.4;
      zIndex = 6;
      translateX = diff * 312;
    } else {
      // Hidden cards
      scale = 0.4;
      opacity = 0;
      zIndex = 1;
      translateX = diff * 273;
    }
    
    return {
      transform: `translateX(${translateX}px) scale(${scale})`,
      opacity,
      zIndex,
    };
  };

  return (
    <FilterStepLayout 
      title="Select Body Type"
      subtitle="Scroll left or right to choose the body type"
      onBack={() => navigate('/filter/eye-color')}
    >
      {/* Carousel Container */}
      <div 
        ref={containerRef}
        className="relative flex items-center justify-center h-[975px] sm:h-[1073px] md:h-[1170px] overflow-hidden"
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
        <div className="relative flex items-center justify-center w-full h-full">
          {bodyTypeOptions.map((option, index) => {
            const style = getCardStyle(index);
            const isActive = index === activeIndex;
            const imageToShow = isFemale ? option.femaleImage : option.femaleImage; // Add male images later
            
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
                    "w-[312px] sm:w-[351px] md:w-[390px]",
                    "h-[546px] sm:h-[663px] md:h-[741px]",
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
