import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Beard type images
import cleanShavenImg from '@/assets/beard-types/clean-shaven.png';
import stubbleImg from '@/assets/beard-types/stubble.png';
import shortBeardImg from '@/assets/beard-types/short-beard.png';
import fullBeardImg from '@/assets/beard-types/full-beard.png';
import goateeImg from '@/assets/beard-types/goatee.png';
import mustacheImg from '@/assets/beard-types/mustache.png';
import vanDykeImg from '@/assets/beard-types/van-dyke.png';
import circleBeardImg from '@/assets/beard-types/circle-beard.png';
import muttonChopsImg from '@/assets/beard-types/mutton-chops.png';

const beardTypeOptions = [
  { id: 'Clean Shaven', label: 'Clean Shaven', subtitle: 'No facial hair', image: cleanShavenImg },
  { id: 'Stubble', label: 'Stubble', subtitle: '2-3 day growth', image: stubbleImg },
  { id: 'Short Beard', label: 'Short Beard', subtitle: 'Trimmed close', image: shortBeardImg },
  { id: 'Full Beard', label: 'Full Beard', subtitle: 'Full coverage', image: fullBeardImg },
  { id: 'Goatee', label: 'Goatee', subtitle: 'Chin beard', image: goateeImg },
  { id: 'Mustache', label: 'Mustache', subtitle: 'Upper lip only', image: mustacheImg },
  { id: 'Van Dyke', label: 'Van Dyke', subtitle: 'Goatee + mustache', image: vanDykeImg },
  { id: 'Circle Beard', label: 'Circle Beard', subtitle: 'Connected style', image: circleBeardImg },
  { id: 'Mutton Chops', label: 'Mutton Chops', subtitle: 'Side whiskers', image: muttonChopsImg },
];

export default function FilterBeardType() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(8);
  }, [setCurrentStep]);

  useEffect(() => {
    if (config.gender !== 'Male') {
      navigate('/filter/pose');
    }
  }, [config.gender, navigate]);

  const handleSelect = useCallback((beardType: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(beardType);
    updateConfig('beardType', beardType);

    setTimeout(() => {
      navigate('/filter/pose');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  const infoText = "Images shown in the cards are for example purposes only. UtsuriAI does not recreate the exact same models; it generates random and unique models based on the selected filters.";

  return (
    <FilterStepLayout 
      title="Select Beard Type"
      subtitle="Choose the facial hair style for your model"
      onBack={() => navigate('/filter/hair-type')}
      infoText={infoText}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-3 gap-2 md:gap-3 relative">
        {beardTypeOptions.map((option, index) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "group relative rounded-2xl overflow-hidden transition-all duration-500 ease-out aspect-square w-full max-w-[180px] md:max-w-[200px] lg:max-w-[220px] mx-auto",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              config.beardType === option.id
                ? "ring-2 ring-primary shadow-lg scale-[1.02]"
                : "hover:shadow-xl hover:scale-[1.01]",
              selectedId === option.id && "selection-card-selected",
              isAnimating && selectedId !== option.id && "selection-card-fade-out"
            )}
            style={{
              animationDelay: isAnimating && selectedId !== option.id ? `${index * 30}ms` : '0ms'
            }}
            tabIndex={-1}
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img 
                src={option.image} 
                alt={option.label}
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradient overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>
            
            {/* Selection indicator */}
            {config.beardType === option.id && (
              <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center z-20">
                <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
            
            {/* Label with enhanced styling */}
            <div className="absolute bottom-0 left-0 right-0 z-10 text-center pb-5 px-3 w-full">
              <p className="font-bold text-lg md:text-xl tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {option.label}
              </p>
              <p className="text-sm mt-1 text-white/70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                {option.subtitle}
              </p>
            </div>
          </button>
        ))}
      </div>
    </FilterStepLayout>
  );
}
