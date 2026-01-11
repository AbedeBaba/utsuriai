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
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 relative w-full max-w-7xl mx-auto px-4">
        {beardTypeOptions.map((option, index) => (
          <div
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "group relative flex flex-col items-center justify-end rounded-3xl cursor-pointer overflow-hidden",
              "h-[180px] sm:h-[220px] md:h-[260px] lg:h-[280px]",
              "transition-all duration-500 ease-out",
              "bg-gradient-to-b from-white/[0.08] to-white/[0.04] backdrop-blur-xl",
              "border-2 border-white/20 hover:border-violet-400/60",
              "shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:shadow-[0_20px_60px_rgba(139,92,246,0.35)]",
              "hover:scale-[1.03] hover:-translate-y-2",
              "outline-none ring-0",
              config.beardType === option.id && "border-violet-400 ring-4 ring-violet-400/40 shadow-[0_0_40px_rgba(139,92,246,0.4)]",
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
                className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
              />
              {/* Premium gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/10 transition-colors duration-500" />
            </div>
            
            {/* Label with enhanced styling */}
            <div className="relative z-10 text-center pb-5 px-3 w-full">
              <p className="font-bold text-lg md:text-xl tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {option.label}
              </p>
              <p className="text-sm mt-1 text-white/70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
                {option.subtitle}
              </p>
            </div>

            {/* Selection indicator */}
            {config.beardType === option.id && (
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
