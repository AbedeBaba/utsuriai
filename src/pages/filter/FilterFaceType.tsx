import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Circle, Square, Diamond, Heart, Hexagon } from 'lucide-react';

// Female face type images
import femaleOval from '@/assets/face-types/female-oval.png';
import femaleRound from '@/assets/face-types/female-round.png';
import femaleSquare from '@/assets/face-types/female-square.png';
import femaleHeart from '@/assets/face-types/female-heart.png';
import femaleOblong from '@/assets/face-types/female-oblong.png';
import femaleDiamond from '@/assets/face-types/female-diamond.png';

const faceTypeOptions = [
  { id: 'Oval', label: 'Oval', subtitle: 'Balanced proportions', icon: <Circle className="h-6 w-6" />, femaleImage: femaleOval },
  { id: 'Round', label: 'Round', subtitle: 'Soft curves', icon: <Circle className="h-6 w-6" />, femaleImage: femaleRound },
  { id: 'Square', label: 'Square', subtitle: 'Strong jawline', icon: <Square className="h-6 w-6" />, femaleImage: femaleSquare },
  { id: 'Heart', label: 'Heart', subtitle: 'Pointed chin', icon: <Heart className="h-6 w-6" />, femaleImage: femaleHeart },
  { id: 'Oblong', label: 'Oblong', subtitle: 'Elongated shape', icon: <Hexagon className="h-6 w-6" />, femaleImage: femaleOblong },
  { id: 'Diamond', label: 'Diamond', subtitle: 'Angular features', icon: <Diamond className="h-6 w-6" />, femaleImage: femaleDiamond },
];

export default function FilterFaceType() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isFemale = config.gender === 'Female';

  useEffect(() => {
    setCurrentStep(config.gender === 'Male' ? 13 : 12);
  }, [setCurrentStep, config.gender]);

  const handleSelect = useCallback((faceType: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(faceType);
    updateConfig('faceType', faceType);

    setTimeout(() => {
      navigate('/filter/expression');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title="Select Face Type"
      subtitle="Choose the face shape for your model"
      onBack={() => navigate('/filter/background')}
    >
      <div className="grid grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8 relative w-full max-w-5xl mx-auto px-4">
        {faceTypeOptions.map((option, index) => (
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
              config.faceType === option.id && "border-violet-400 ring-4 ring-violet-400/40 shadow-[0_0_40px_rgba(139,92,246,0.4)]",
              selectedId === option.id && isAnimating && "scale-110 z-10",
              isAnimating && selectedId !== option.id && "opacity-20 scale-90 blur-[1px]"
            )}
            style={{ 
              animationDelay: `${index * 30}ms`,
            }}
            tabIndex={-1}
          >
            {/* Background Image or Icon */}
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
                <div className="text-primary text-4xl md:text-5xl transition-transform duration-300 group-hover:scale-110">
                  {option.icon}
                </div>
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
              {!isFemale && option.subtitle && (
                <p className="text-sm text-muted-foreground mt-1">{option.subtitle}</p>
              )}
            </div>

            {/* Selection indicator */}
            {config.faceType === option.id && (
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
