import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';
import { useFilterFlowGuard } from '@/hooks/useFilterFlowGuard';

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

// Male hair color images
import maleBlack from '@/assets/hair-colors/male-black.png';
import maleWhite from '@/assets/hair-colors/male-white.png';
import maleBrown from '@/assets/hair-colors/male-brown.png';
import maleRed from '@/assets/hair-colors/male-red.png';
import maleBlonde from '@/assets/hair-colors/male-blonde.png';
import maleDarkBlonde from '@/assets/hair-colors/male-dark-blonde.png';
import maleBlue from '@/assets/hair-colors/male-blue.png';
import malePurple from '@/assets/hair-colors/male-purple.png';
import maleGreen from '@/assets/hair-colors/male-green.png';

const femaleHairColorOptions = [
  { id: 'Black', label: 'Black', color: '#1C1C1C', image: femaleBlack },
  { id: 'White', label: 'White', color: '#F5F5F5', image: femaleWhite },
  { id: 'Brown', label: 'Brown', color: '#6A4E42', image: femaleBrown },
  { id: 'Red', label: 'Red', color: '#922B21', image: femaleRed },
  { id: 'Blonde', label: 'Blonde', color: '#E8D5B5', image: femaleBlonde },
  { id: 'Dark Blonde', label: 'Dark Blonde', color: '#B89B72', image: femaleDarkBlonde },
  { id: 'Blue', label: 'Blue', color: '#4A90D9', image: femaleBlue },
  { id: 'Purple', label: 'Purple', color: '#7B4B8A', image: femalePurple },
  { id: 'Green', label: 'Green', color: '#4A7C59', image: femaleGreen },
  { id: 'Platinum', label: 'Platinum', color: '#E5E4E2', image: femalePlatinum },
];

const maleHairColorOptions = [
  { id: 'Black', label: 'Black', color: '#1C1C1C', image: maleBlack },
  { id: 'White', label: 'White', color: '#F5F5F5', image: maleWhite },
  { id: 'Brown', label: 'Brown', color: '#6A4E42', image: maleBrown },
  { id: 'Red', label: 'Red', color: '#922B21', image: maleRed },
  { id: 'Blonde', label: 'Blonde', color: '#E8D5B5', image: maleBlonde },
  { id: 'Dark Blonde', label: 'Dark Blonde', color: '#B89B72', image: maleDarkBlonde },
  { id: 'Blue', label: 'Blue', color: '#4A90D9', image: maleBlue },
  { id: 'Purple', label: 'Purple', color: '#7B4B8A', image: malePurple },
  { id: 'Green', label: 'Green', color: '#4A7C59', image: maleGreen },
];

// Options for random all
const eyeColorOptions = ['Brown', 'Blue', 'Hazel', 'Black', 'Green', 'Amber', 'Grey'];
const bodyTypeOptions = ['Slim', 'Athletic', 'Average', 'Muscular', 'Curvy', 'Plus Size', 'Petite', 'Tall', 'Hourglass'];
const hairTypeOptions = ['Straight', 'Wavy', 'Curly', 'Coily', 'Bald', 'Short', 'Long'];
const poseOptions = ['Face Close-up', 'Standing', 'Sitting', 'Leaning', 'Arms Crossed', 'Back View', 'Low-angle', 'Hands on Hips'];
const backgroundOptions = ['City', 'Fashion White', 'Beach', 'Mountain', 'Forest', 'Snowy', 'Cafe', 'Underwater'];
const faceTypeOptions = ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond'];
const expressionOptions = ['Neutral', 'Smile', 'Serious', 'Confident'];
const beardTypeOptions = ['Clean Shaven', 'Stubble', 'Short Beard', 'Full Beard', 'Goatee', 'Mustache', 'Van Dyke', 'Circle Beard', 'Mutton Chops'];

export default function FilterHairColor() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep, getNextStepPath } = useModelConfig();
  const { hasProFeatureAccess } = useSubscription();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverDisabled, setHoverDisabled] = useState(false);

  // Guard: redirect to gender selection on page refresh
  useFilterFlowGuard();

  const isFemale = config.gender === 'Female';

  // Select hair color options based on gender
  const hairColorOptions = useMemo(() => {
    return isFemale ? femaleHairColorOptions : maleHairColorOptions;
  }, [isFemale]);

  useEffect(() => {
    setCurrentStep(config.gender === 'Female' ? 5 : 4);
  }, [setCurrentStep, config.gender]);

  // Redirect to eye color if Hijab is selected (hair color won't be visible)
  // This ensures hijab users skip hair-related steps but continue through ALL other filter steps
  useEffect(() => {
    if (config.modestOption === 'Hijab') {
      navigate('/filter/eye-color');
    }
  }, [config.modestOption, navigate]);

  const handleSelect = useCallback((hairColor: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(hairColor);
    setHoverDisabled(true);
    updateConfig('hairColor', hairColor);

    setTimeout(() => {
      navigate('/filter/eye-color');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  const handleRandomSingle = useCallback(() => {
    if (isAnimating) return;
    
    const randomHairColor = hairColorOptions[Math.floor(Math.random() * hairColorOptions.length)];
    setIsAnimating(true);
    setSelectedId(randomHairColor.id);
    setHoverDisabled(true);
    updateConfig('hairColor', randomHairColor.id);

    setTimeout(() => {
      const nextPath = getNextStepPath('hairColor', !hasProFeatureAccess);
      if (nextPath) {
        navigate(nextPath);
      }
    }, 800);
  }, [isAnimating, updateConfig, hairColorOptions, navigate, getNextStepPath, hasProFeatureAccess]);

  const handleRandomAll = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setHoverDisabled(true);
    
    const isHijab = config.modestOption === 'Hijab';
    
    // Only set hair color if NOT Hijab
    if (!isHijab) {
      const randomHairColor = hairColorOptions[Math.floor(Math.random() * hairColorOptions.length)].id;
      setSelectedId(randomHairColor);
      updateConfig('hairColor', randomHairColor);
    }
    
    const randomEyeColor = eyeColorOptions[Math.floor(Math.random() * eyeColorOptions.length)];
    const randomBodyType = bodyTypeOptions[Math.floor(Math.random() * bodyTypeOptions.length)];
    
    updateConfig('eyeColor', randomEyeColor);
    updateConfig('bodyType', randomBodyType);
    
    // Only set hair type if NOT Hijab
    if (!isHijab) {
      const randomHairType = hairTypeOptions[Math.floor(Math.random() * hairTypeOptions.length)];
      updateConfig('hairType', randomHairType);
    }
    
    // Only set Pro features if user has Pro feature access (Pro/Creator plans)
    if (hasProFeatureAccess) {
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
  }, [isAnimating, navigate, updateConfig, hairColorOptions, config.gender, config.modestOption, hasProFeatureAccess]);

  const infoText = "Images shown in the cards are for example purposes only. UtsuriAI does not recreate the exact same models; it generates random and unique models based on the selected filters.";

  return (
    <FilterStepLayout 
      title="Select Hair Color"
      subtitle="Choose the hair color for your model"
      onBack={() => navigate('/filter/skin-tone')}
      onRandom={handleRandomAll}
      onRandomSingle={handleRandomSingle}
      infoText={infoText}
    >
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 md:gap-8 relative w-full max-w-7xl mx-auto px-4",
        hoverDisabled && "pointer-events-none"
      )}>
        {hairColorOptions.map((option, index) => (
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
              config.hairColor === option.id && "border-violet-400 ring-4 ring-violet-400/40 shadow-[0_0_40px_rgba(139,92,246,0.4)]",
              selectedId === option.id && isAnimating && "scale-110 z-10",
              isAnimating && selectedId !== option.id && "opacity-20 scale-90 blur-[1px]"
            )}
            style={{ 
              animationDelay: `${index * 30}ms`,
            }}
            tabIndex={-1}
          >
            {/* Background Image */}
            {option.image && (
              <div className="absolute inset-0">
                <img 
                  src={option.image} 
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
            )}
            
            {/* Label with enhanced styling */}
            <div className="relative z-10 text-center pb-5 px-3 w-full">
              <p className="font-bold text-lg md:text-xl text-white tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
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
