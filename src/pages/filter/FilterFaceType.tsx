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

// Male face type images
import maleOval from '@/assets/face-types/male-oval.png';
import maleRound from '@/assets/face-types/male-round.png';
import maleSquare from '@/assets/face-types/male-square.png';
import maleHeart from '@/assets/face-types/male-heart.png';
import maleOblong from '@/assets/face-types/male-oblong.png';
import maleDiamond from '@/assets/face-types/male-diamond.png';

const faceTypeOptions = [
  { id: 'Oval', label: 'Oval', subtitle: 'Balanced proportions', icon: <Circle className="h-6 w-6" />, femaleImage: femaleOval, maleImage: maleOval },
  { id: 'Round', label: 'Round', subtitle: 'Soft curves', icon: <Circle className="h-6 w-6" />, femaleImage: femaleRound, maleImage: maleRound },
  { id: 'Square', label: 'Square', subtitle: 'Strong jawline', icon: <Square className="h-6 w-6" />, femaleImage: femaleSquare, maleImage: maleSquare },
  { id: 'Heart', label: 'Heart', subtitle: 'Pointed chin', icon: <Heart className="h-6 w-6" />, femaleImage: femaleHeart, maleImage: maleHeart },
  { id: 'Oblong', label: 'Oblong', subtitle: 'Elongated shape', icon: <Hexagon className="h-6 w-6" />, femaleImage: femaleOblong, maleImage: maleOblong },
  { id: 'Diamond', label: 'Diamond', subtitle: 'Angular features', icon: <Diamond className="h-6 w-6" />, femaleImage: femaleDiamond, maleImage: maleDiamond },
];

// Options for random all
const expressionOptions = ['Neutral', 'Smile', 'Serious', 'Confident'];

export default function FilterFaceType() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep, getNextStepPath } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverDisabled, setHoverDisabled] = useState(false);

  const isFemale = config.gender === 'Female';

  useEffect(() => {
    setCurrentStep(11);
  }, [setCurrentStep]);

  const handleSelect = useCallback((faceType: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(faceType);
    setHoverDisabled(true);
    updateConfig('faceType', faceType);

    setTimeout(() => {
      navigate('/filter/expression');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  const handleRandomSingle = useCallback(() => {
    if (isAnimating) return;
    const randomFaceType = faceTypeOptions[Math.floor(Math.random() * faceTypeOptions.length)];
    setIsAnimating(true);
    setSelectedId(randomFaceType.id);
    setHoverDisabled(true);
    updateConfig('faceType', randomFaceType.id);
    setTimeout(() => {
      const nextPath = getNextStepPath('faceType');
      if (nextPath) { navigate(nextPath); }
    }, 800);
  }, [isAnimating, updateConfig, navigate, getNextStepPath]);

  const handleRandomAll = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setHoverDisabled(true);
    
    const randomFaceType = faceTypeOptions[Math.floor(Math.random() * faceTypeOptions.length)].id;
    const randomExpression = expressionOptions[Math.floor(Math.random() * expressionOptions.length)];
    
    setSelectedId(randomFaceType);
    updateConfig('faceType', randomFaceType);
    updateConfig('facialExpression', randomExpression);

    setTimeout(() => { navigate('/clothing'); }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  const infoText = "Images shown in the cards are for example purposes only. UtsuriAI does not recreate the exact same models; it generates random and unique models based on the selected filters.";

  return (
    <FilterStepLayout 
      title="Select Face Type"
      subtitle="Choose the face shape for your model"
      onBack={() => navigate('/filter/background')}
      onRandom={handleRandomAll}
      onRandomSingle={handleRandomSingle}
      infoText={infoText}
    >
      <div className={cn(
        "grid grid-cols-3 lg:grid-cols-3 gap-6 md:gap-8 relative w-full max-w-5xl mx-auto px-4",
        hoverDisabled && "pointer-events-none"
      )}>
        {faceTypeOptions.map((option, index) => (
          <div
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "group relative flex flex-col items-center justify-end rounded-3xl cursor-pointer overflow-hidden",
              "h-[180px] sm:h-[220px] md:h-[260px] lg:h-[280px]",
              "transition-all duration-500 ease-out",
              "bg-gradient-to-b from-white/[0.08] to-white/[0.04] backdrop-blur-xl",
              "border-2 border-white/20",
              "shadow-[0_8px_32px_rgba(0,0,0,0.25)]",
              "outline-none ring-0",
              !hoverDisabled && "hover:border-violet-400/60 hover:shadow-[0_20px_60px_rgba(139,92,246,0.35)] hover:scale-[1.03] hover:-translate-y-2",
              config.faceType === option.id && "border-violet-400 ring-4 ring-violet-400/40 shadow-[0_0_40px_rgba(139,92,246,0.4)]",
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
                src={isFemale ? option.femaleImage : option.maleImage} 
                alt={option.label}
                className={cn(
                  "w-full h-full object-cover object-top transition-transform duration-700",
                  !hoverDisabled && "group-hover:scale-110"
                )}
              />
              {/* Premium gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              {/* Hover glow effect */}
              <div className={cn(
                "absolute inset-0 bg-violet-500/0 transition-colors duration-500",
                !hoverDisabled && "group-hover:bg-violet-500/10"
              )} />
            </div>
            
            {/* Label with enhanced styling */}
            <div className="relative z-10 text-center pb-5 px-3 w-full">
              <p className="font-bold text-lg md:text-xl tracking-wide text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {option.label}
              </p>
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
