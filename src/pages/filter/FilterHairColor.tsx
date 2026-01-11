import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Female hair color images
import femaleBlack from '@/assets/hair-colors/female-black.png';
import femaleWhite from '@/assets/hair-colors/female-white.png';
import femaleBrown from '@/assets/hair-colors/female-brown.png';
import femaleRed from '@/assets/hair-colors/female-red.png';
import femaleBlonde from '@/assets/hair-colors/female-blonde.png';
import femaleDarkBlonde from '@/assets/hair-colors/female-dark-blonde.png';
import femaleBlue from '@/assets/hair-colors/female-blue.png';
import femalePurple from '@/assets/hair-colors/female-purple.png';
import femaleGreen from '@/assets/hair-colors/female-green.png';
import femalePlatinum from '@/assets/hair-colors/female-platinum.png';

const hairColorOptions = [
  { id: 'Black', label: 'Black', color: '#1C1C1C', femaleImage: femaleBlack },
  { id: 'White', label: 'White', color: '#F5F5F5', femaleImage: femaleWhite },
  { id: 'Brown', label: 'Brown', color: '#6A4E42', femaleImage: femaleBrown },
  { id: 'Red', label: 'Red', color: '#922B21', femaleImage: femaleRed },
  { id: 'Blonde', label: 'Blonde', color: '#E8D5B5', femaleImage: femaleBlonde },
  { id: 'Dark Blonde', label: 'Dark Blonde', color: '#B89B72', femaleImage: femaleDarkBlonde },
  { id: 'Blue', label: 'Blue', color: '#4A90D9', femaleImage: femaleBlue },
  { id: 'Purple', label: 'Purple', color: '#7B4B8A', femaleImage: femalePurple },
  { id: 'Green', label: 'Green', color: '#4A7C59', femaleImage: femaleGreen },
  { id: 'Platinum', label: 'Platinum', color: '#E5E4E2', femaleImage: femalePlatinum },
];

export default function FilterHairColor() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isFemale = config.gender === 'Female';

  useEffect(() => {
    setCurrentStep(4);
  }, [setCurrentStep]);

  const handleSelect = useCallback((hairColor: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(hairColor);
    updateConfig('hairColor', hairColor);

    setTimeout(() => {
      navigate('/filter/eye-color');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title="Select Hair Color"
      subtitle="Choose the hair color for your model"
      onBack={() => navigate('/filter/skin-tone')}
    >
      <div className="grid grid-cols-3 lg:grid-cols-5 gap-6 md:gap-8 relative w-full max-w-7xl mx-auto px-4">
        {hairColorOptions.map((option, index) => (
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
              config.hairColor === option.id && "border-violet-400 ring-4 ring-violet-400/40 shadow-[0_0_40px_rgba(139,92,246,0.4)]",
              selectedId === option.id && isAnimating && "scale-110 z-10",
              isAnimating && selectedId !== option.id && "opacity-20 scale-90 blur-[1px]"
            )}
            style={{ 
              animationDelay: `${index * 30}ms`,
            }}
            tabIndex={-1}
          >
            {/* Background Image or Color Swatch */}
            {isFemale && option.femaleImage ? (
              <div className="absolute inset-0">
                <img 
                  src={option.femaleImage} 
                  alt={option.label}
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                />
                {/* Premium gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-violet-500/0 group-hover:bg-violet-500/10 transition-colors duration-500" />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white/30 shadow-lg transition-transform duration-300 group-hover:scale-110"
                  style={{ backgroundColor: option.color }}
                />
              </div>
            )}
            
            {/* Label with enhanced styling */}
            <div className="relative z-10 text-center pb-5 px-3 w-full">
              <p className={cn(
                "font-bold text-lg md:text-xl tracking-wide",
                isFemale ? "text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" : "text-foreground"
              )}>
                {option.label}
              </p>
            </div>

            {/* Selection indicator */}
            {config.hairColor === option.id && (
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
