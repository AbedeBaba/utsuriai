import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';

// Female eye color images
import femaleBrown from '@/assets/eye-colors/female-brown.png';
import femaleBlue from '@/assets/eye-colors/female-blue.png';
import femaleHazel from '@/assets/eye-colors/female-hazel.png';
import femaleBlack from '@/assets/eye-colors/female-black.png';
import femaleGreen from '@/assets/eye-colors/female-green.png';
import femaleAmber from '@/assets/eye-colors/female-amber.png';
import femaleGrey from '@/assets/eye-colors/female-grey.png';

// Male eye color images
import maleBlue from '@/assets/eye-colors/male-blue.png';
import maleBrown from '@/assets/eye-colors/male-brown.png';
import maleBlack from '@/assets/eye-colors/male-black.png';
import maleHazel from '@/assets/eye-colors/male-hazel.png';
import maleGreen from '@/assets/eye-colors/male-green.png';
import maleAmber from '@/assets/eye-colors/male-amber.png';
import maleGrey from '@/assets/eye-colors/male-grey.png';

const femaleEyeColorOptions = [
  { id: 'Blue', label: 'Blue', color: '#4682B4', image: femaleBlue },
  { id: 'Brown', label: 'Brown', color: '#634E34', image: femaleBrown },
  { id: 'Black', label: 'Black', color: '#1C1C1C', image: femaleBlack },
  { id: 'Hazel', label: 'Hazel', color: '#8E7618', image: femaleHazel },
  { id: 'Green', label: 'Green', color: '#3D6B4F', image: femaleGreen },
  { id: 'Amber', label: 'Amber', color: '#CF9B52', image: femaleAmber },
  { id: 'Grey', label: 'Grey', color: '#808080', image: femaleGrey },
];

const maleEyeColorOptions = [
  { id: 'Blue', label: 'Blue', color: '#4682B4', image: maleBlue },
  { id: 'Brown', label: 'Brown', color: '#634E34', image: maleBrown },
  { id: 'Black', label: 'Black', color: '#1C1C1C', image: maleBlack },
  { id: 'Hazel', label: 'Hazel', color: '#8E7618', image: maleHazel },
  { id: 'Green', label: 'Green', color: '#3D6B4F', image: maleGreen },
  { id: 'Amber', label: 'Amber', color: '#CF9B52', image: maleAmber },
  { id: 'Grey', label: 'Grey', color: '#808080', image: maleGrey },
];

// Options for random all
const bodyTypeOptions = ['Slim', 'Athletic', 'Average', 'Muscular', 'Curvy', 'Plus Size', 'Petite', 'Tall', 'Hourglass'];
const hairTypeOptions = ['Straight', 'Wavy', 'Curly', 'Coily', 'Bald', 'Short', 'Long'];
const poseOptions = ['Face Close-up', 'Standing', 'Sitting', 'Leaning', 'Arms Crossed', 'Back View', 'Low-angle', 'Hands on Hips'];
const backgroundOptions = ['City', 'Fashion White', 'Beach', 'Mountain', 'Forest', 'Snowy', 'Cafe', 'Underwater'];
const faceTypeOptions = ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond'];
const expressionOptions = ['Neutral', 'Smile', 'Serious', 'Confident'];
const beardTypeOptions = ['Clean Shaven', 'Stubble', 'Short Beard', 'Full Beard', 'Goatee', 'Mustache', 'Van Dyke', 'Circle Beard', 'Mutton Chops'];

export default function FilterEyeColor() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep, getNextStepPath } = useModelConfig();
  const { isTrialProExhausted } = useSubscription();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverDisabled, setHoverDisabled] = useState(false);

  const isFemale = config.gender === 'Female';

  const eyeColorOptions = useMemo(() => {
    return isFemale ? femaleEyeColorOptions : maleEyeColorOptions;
  }, [isFemale]);

  useEffect(() => {
    setCurrentStep(config.gender === 'Female' ? 6 : 5);
  }, [setCurrentStep, config.gender]);

  const handleSelect = useCallback((eyeColor: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(eyeColor);
    setHoverDisabled(true);
    updateConfig('eyeColor', eyeColor);

    setTimeout(() => {
      navigate('/filter/body-type');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  const handleRandomSingle = useCallback(() => {
    if (isAnimating) return;
    
    const randomEyeColor = eyeColorOptions[Math.floor(Math.random() * eyeColorOptions.length)];
    setIsAnimating(true);
    setSelectedId(randomEyeColor.id);
    setHoverDisabled(true);
    updateConfig('eyeColor', randomEyeColor.id);

    setTimeout(() => {
      const nextPath = getNextStepPath('eyeColor', isTrialProExhausted);
      if (nextPath) {
        navigate(nextPath);
      }
    }, 800);
  }, [isAnimating, updateConfig, eyeColorOptions, navigate, getNextStepPath, isTrialProExhausted]);

  const handleRandomAll = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setHoverDisabled(true);
    
    const randomEyeColorId = eyeColorOptions[Math.floor(Math.random() * eyeColorOptions.length)].id;
    const randomBodyType = bodyTypeOptions[Math.floor(Math.random() * bodyTypeOptions.length)];
    const randomHairType = hairTypeOptions[Math.floor(Math.random() * hairTypeOptions.length)];
    
    setSelectedId(randomEyeColorId);
    
    updateConfig('eyeColor', randomEyeColorId);
    updateConfig('bodyType', randomBodyType);
    updateConfig('hairType', randomHairType);
    
    // Only set Pro features if not restricted
    if (!isTrialProExhausted) {
      const randomPose = poseOptions[Math.floor(Math.random() * poseOptions.length)];
      const randomBackground = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];
      const randomFaceType = faceTypeOptions[Math.floor(Math.random() * faceTypeOptions.length)];
      const randomExpression = expressionOptions[Math.floor(Math.random() * expressionOptions.length)];
      updateConfig('pose', randomPose);
      updateConfig('background', randomBackground);
      updateConfig('faceType', randomFaceType);
      updateConfig('facialExpression', randomExpression);
    }
    
    if (config.gender === 'Male') {
      const randomBeardType = beardTypeOptions[Math.floor(Math.random() * beardTypeOptions.length)];
      updateConfig('beardType', randomBeardType);
    }

    setTimeout(() => {
      navigate('/clothing');
    }, 1000);
  }, [isAnimating, navigate, updateConfig, config.gender, eyeColorOptions, isTrialProExhausted]);

  const infoText = "Images shown in the cards are for example purposes only. UtsuriAI does not recreate the exact same models; it generates random and unique models based on the selected filters.";

  // Handle back navigation - skip hair color if Hijab is selected
  const handleBack = useCallback(() => {
    if (config.modestOption === 'Hijab') {
      navigate('/filter/skin-tone');
    } else {
      navigate('/filter/hair-color');
    }
  }, [navigate, config.modestOption]);

  return (
    <FilterStepLayout 
      title="Select Eye Color"
      subtitle="Choose the eye color for your model"
      onBack={handleBack}
      onRandom={handleRandomAll}
      onRandomSingle={handleRandomSingle}
      infoText={infoText}
    >
      <div className={cn(
        "grid grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 relative w-full max-w-7xl mx-auto px-4",
        hoverDisabled && "pointer-events-none"
      )}>
        {eyeColorOptions.map((option, index) => (
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
              config.eyeColor === option.id && "border-violet-400 ring-4 ring-violet-400/40 shadow-[0_0_40px_rgba(139,92,246,0.4)]",
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
