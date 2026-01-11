import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';

// Import female ethnicity images
import arabicImg from '@/assets/ethnicities/arabic.png';
import turkishImg from '@/assets/ethnicities/turkish.png';
import russianImg from '@/assets/ethnicities/russian.png';
import asianImg from '@/assets/ethnicities/asian.png';
import latinImg from '@/assets/ethnicities/latin.png';
import scandinavianImg from '@/assets/ethnicities/scandinavian.png';
import australianImg from '@/assets/ethnicities/australian.png';
import indianImg from '@/assets/ethnicities/indian.png';
import localAmericanImg from '@/assets/ethnicities/local-american.png';
import afroAmericanImg from '@/assets/ethnicities/afro-american.png';
import italianImg from '@/assets/ethnicities/italian.png';
import europeanImg from '@/assets/ethnicities/european.png';

// Import male ethnicity images
import maleArabicImg from '@/assets/ethnicities/male-arabic.jpg';
import maleTurkishImg from '@/assets/ethnicities/male-turkish.png';
import maleRussianImg from '@/assets/ethnicities/male-russian.png';
import maleAsianImg from '@/assets/ethnicities/male-asian.png';
import maleLatinImg from '@/assets/ethnicities/male-latin.png';
import maleScandinavianImg from '@/assets/ethnicities/male-scandinavian.png';
import maleAustralianImg from '@/assets/ethnicities/male-australian.png';
import maleIndianImg from '@/assets/ethnicities/male-indian.png';
import maleLocalAmericanImg from '@/assets/ethnicities/male-local-american.png';
import maleAfroAmericanImg from '@/assets/ethnicities/male-afro-american.png';
import maleItalianImg from '@/assets/ethnicities/male-italian.png';
import maleEuropeanImg from '@/assets/ethnicities/male-european.png';

const femaleEthnicityOptions = [
  { id: 'Arabic', label: 'Arabic', image: arabicImg },
  { id: 'Turkish', label: 'Turkish', image: turkishImg },
  { id: 'Russian', label: 'Russian', image: russianImg },
  { id: 'Asian', label: 'Asian', image: asianImg },
  { id: 'Latin', label: 'Latin', image: latinImg },
  { id: 'Scandinavian', label: 'Scandinavian', image: scandinavianImg },
  { id: 'Australian', label: 'Australian', image: australianImg },
  { id: 'Indian', label: 'Indian', image: indianImg },
  { id: 'Local American', label: 'Local American', image: localAmericanImg },
  { id: 'Afro American', label: 'Afro American', image: afroAmericanImg },
  { id: 'Italian', label: 'Italian', image: italianImg },
  { id: 'European', label: 'European', image: europeanImg },
];

const maleEthnicityOptions = [
  { id: 'Arabic', label: 'Arabic', image: maleArabicImg },
  { id: 'Turkish', label: 'Turkish', image: maleTurkishImg },
  { id: 'Russian', label: 'Russian', image: maleRussianImg },
  { id: 'Asian', label: 'Asian', image: maleAsianImg },
  { id: 'Latin', label: 'Latin', image: maleLatinImg },
  { id: 'Scandinavian', label: 'Scandinavian', image: maleScandinavianImg },
  { id: 'Australian', label: 'Australian', image: maleAustralianImg },
  { id: 'Indian', label: 'Indian', image: maleIndianImg },
  { id: 'Local American', label: 'Local American', image: maleLocalAmericanImg },
  { id: 'Afro American', label: 'Afro American', image: maleAfroAmericanImg },
  { id: 'Italian', label: 'Italian', image: maleItalianImg },
  { id: 'European', label: 'European', image: maleEuropeanImg },
];

const skinToneOptions = ['Fair', 'Light', 'Medium Light', 'Medium', 'Medium Dark', 'Dark', 'Deep', 'Ebony', 'Olive'];
const hairColorOptions = ['Black', 'White', 'Brown', 'Red', 'Blonde', 'Dark Blonde', 'Blue', 'Purple', 'Green', 'Platinum'];
const eyeColorOptions = ['Brown', 'Blue', 'Hazel', 'Black', 'Green', 'Amber', 'Grey'];
const bodyTypeOptions = ['Slim', 'Athletic', 'Average', 'Muscular', 'Curvy', 'Plus Size', 'Petite', 'Tall', 'Hourglass'];
const hairTypeOptions = ['Straight', 'Wavy', 'Curly', 'Coily', 'Kinky', 'Bald', 'Short', 'Long', 'Braided'];
const poseOptions = ['Face Close-up', 'Standing', 'Sitting', 'Leaning', 'Top-down', 'Arms Crossed', 'Back View', 'Low-angle'];
const backgroundOptions = ['City', 'Fashion White', 'Beach', 'Mountain', 'Forest', 'Snowy', 'Cafe', 'Underwater'];
const faceTypeOptions = ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond'];
const expressionOptions = ['Neutral', 'Smile', 'Serious', 'Confident'];
const modestOptions = ['Standard', 'Hijab'];

export default function FilterEthnicity() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep, getNextStepPath } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverDisabled, setHoverDisabled] = useState(false);

  // Select ethnicity options based on gender
  const ethnicityOptions = useMemo(() => {
    return config.gender === 'Male' ? maleEthnicityOptions : femaleEthnicityOptions;
  }, [config.gender]);

  useEffect(() => {
    // For females: step 3 (after gender, coverage). For males: step 2 (after gender)
    setCurrentStep(config.gender === 'Female' ? 3 : 2);
  }, [setCurrentStep, config.gender]);

  const handleSelect = useCallback((ethnicity: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(ethnicity);
    setHoverDisabled(true);
    updateConfig('ethnicity', ethnicity);

    setTimeout(() => {
      navigate('/filter/skin-tone');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  const handleRandomAll = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setHoverDisabled(true);
    
    // Randomly select all filters
    const randomEthnicity = ethnicityOptions[Math.floor(Math.random() * ethnicityOptions.length)].id;
    const randomSkinTone = skinToneOptions[Math.floor(Math.random() * skinToneOptions.length)];
    const randomHairColor = hairColorOptions[Math.floor(Math.random() * hairColorOptions.length)];
    const randomEyeColor = eyeColorOptions[Math.floor(Math.random() * eyeColorOptions.length)];
    const randomBodyType = bodyTypeOptions[Math.floor(Math.random() * bodyTypeOptions.length)];
    const randomHairType = hairTypeOptions[Math.floor(Math.random() * hairTypeOptions.length)];
    const randomPose = poseOptions[Math.floor(Math.random() * poseOptions.length)];
    const randomBackground = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];
    const randomFaceType = faceTypeOptions[Math.floor(Math.random() * faceTypeOptions.length)];
    const randomExpression = expressionOptions[Math.floor(Math.random() * expressionOptions.length)];
    const randomModest = modestOptions[Math.floor(Math.random() * modestOptions.length)];
    
    setSelectedId(randomEthnicity);
    
    // Update all configs
    updateConfig('ethnicity', randomEthnicity);
    updateConfig('skinTone', randomSkinTone);
    updateConfig('hairColor', randomHairColor);
    updateConfig('eyeColor', randomEyeColor);
    updateConfig('bodyType', randomBodyType);
    updateConfig('hairType', randomHairType);
    updateConfig('pose', randomPose);
    updateConfig('background', randomBackground);
    updateConfig('faceType', randomFaceType);
    updateConfig('facialExpression', randomExpression);
    updateConfig('modestOption', randomModest);

    setTimeout(() => {
      navigate('/clothing');
    }, 1000);
  }, [isAnimating, navigate, updateConfig, ethnicityOptions]);

  const handleRandomSingle = useCallback(() => {
    if (isAnimating) return;
    
    const randomEthnicity = ethnicityOptions[Math.floor(Math.random() * ethnicityOptions.length)];
    setIsAnimating(true);
    setSelectedId(randomEthnicity.id);
    setHoverDisabled(true);
    updateConfig('ethnicity', randomEthnicity.id);

    // Navigate to next step after selection
    setTimeout(() => {
      const nextPath = getNextStepPath('ethnicity');
      if (nextPath) {
        navigate(nextPath);
      }
    }, 800);
  }, [isAnimating, updateConfig, ethnicityOptions, navigate, getNextStepPath]);

  const infoText = "Images shown in the cards are for example purposes only. UtsuriAI does not recreate the exact same models; it generates random and unique models based on the selected filters.";

  return (
    <FilterStepLayout 
      title="Select Ethnicity"
      subtitle="Choose the ethnicity for your model"
      onBack={() => config.gender === 'Female' ? navigate('/filter/modest-option') : navigate('/filter/gender')}
      onRandom={handleRandomAll}
      onRandomSingle={handleRandomSingle}
      infoText={infoText}
    >
      <div className={cn(
        "grid grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 relative w-full max-w-7xl mx-auto px-4",
        hoverDisabled && "pointer-events-none"
      )}>
        {ethnicityOptions.map((option, index) => (
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
              // Hover effects only when not disabled
              !hoverDisabled && "hover:border-violet-400/60 hover:shadow-[0_20px_60px_rgba(139,92,246,0.35)] hover:scale-[1.03] hover:-translate-y-2",
              config.ethnicity === option.id && "border-violet-400 ring-4 ring-violet-400/40 shadow-[0_0_40px_rgba(139,92,246,0.4)]",
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
              <p className="font-bold text-xl md:text-2xl text-white tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {option.label}
              </p>
            </div>

            {/* Selection indicator */}
            {config.ethnicity === option.id && (
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
