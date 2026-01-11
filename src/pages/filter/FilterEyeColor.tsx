import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Female eye color images
import femaleBrown from '@/assets/eye-colors/female-brown.png';
import femaleBlue from '@/assets/eye-colors/female-blue.png';
import femaleHazel from '@/assets/eye-colors/female-hazel.png';
import femaleBlack from '@/assets/eye-colors/female-black.png';
import femaleGreen from '@/assets/eye-colors/female-green.png';
import femaleAmber from '@/assets/eye-colors/female-amber.png';
import femaleGrey from '@/assets/eye-colors/female-grey.png';

const eyeColorOptions = [
  { id: 'Blue', label: 'Blue', color: '#4682B4', femaleImage: femaleBlue },
  { id: 'Brown', label: 'Brown', color: '#634E34', femaleImage: femaleBrown },
  { id: 'Black', label: 'Black', color: '#1C1C1C', femaleImage: femaleBlack },
  { id: 'Hazel', label: 'Hazel', color: '#8E7618', femaleImage: femaleHazel },
  { id: 'Green', label: 'Green', color: '#3D6B4F', femaleImage: femaleGreen },
  { id: 'Amber', label: 'Amber', color: '#CF9B52', femaleImage: femaleAmber },
  { id: 'Grey', label: 'Grey', color: '#808080', femaleImage: femaleGrey },
];

export default function FilterEyeColor() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isFemale = config.gender === 'Female';

  useEffect(() => {
    setCurrentStep(5);
  }, [setCurrentStep]);

  const handleSelect = useCallback((eyeColor: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(eyeColor);
    updateConfig('eyeColor', eyeColor);

    setTimeout(() => {
      navigate('/filter/body-type');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title="Select Eye Color"
      subtitle="Choose the eye color for your model"
      onBack={() => navigate('/filter/hair-color')}
    >
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 relative w-full max-w-7xl mx-auto px-4">
        {eyeColorOptions.map((option, index) => (
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
              config.eyeColor === option.id && "border-violet-400 ring-4 ring-violet-400/40 shadow-[0_0_40px_rgba(139,92,246,0.4)]",
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
                  className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
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
            {config.eyeColor === option.id && (
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