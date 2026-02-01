import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';
import { useFilterFlowGuard } from '@/hooks/useFilterFlowGuard';
import { OptimizedImage } from '@/components/OptimizedImage';
import { useImagePrefetch } from '@/hooks/useImagePrefetch';
import { getFilterImages, FILTER_IMAGES } from '@/data/filterImages';

// Female hair type images
import femaleStraight from '@/assets/hair-types/female-straight.png';
import femaleWavy from '@/assets/hair-types/female-wavy.png';
import femaleCurly from '@/assets/hair-types/female-curly.png';
import femaleCoily from '@/assets/hair-types/female-coily.png';
import femaleBald from '@/assets/hair-types/female-bald.png';
import femaleShort from '@/assets/hair-types/female-short.png';
import femaleLong from '@/assets/hair-types/female-long.png';

// Male hair type images
import maleStraight from '@/assets/hair-types/male-straight.png';
import maleWavy from '@/assets/hair-types/male-wavy.png';
import maleCurly from '@/assets/hair-types/male-curly.png';
import maleCoily from '@/assets/hair-types/male-coily.png';
import maleBald from '@/assets/hair-types/male-bald.png';
import maleShort from '@/assets/hair-types/male-short.png';
import maleLong from '@/assets/hair-types/male-long.png';

const hairTypeOptions = [
  { id: 'Straight', label: 'Straight', subtitle: 'Sleek and smooth', femaleImage: femaleStraight, maleImage: maleStraight },
  { id: 'Wavy', label: 'Wavy', subtitle: 'Soft waves', femaleImage: femaleWavy, maleImage: maleWavy },
  { id: 'Curly', label: 'Curly', subtitle: 'Defined curls', femaleImage: femaleCurly, maleImage: maleCurly },
  { id: 'Coily', label: 'Coily', subtitle: 'Tight coils', femaleImage: femaleCoily, maleImage: maleCoily },
  { id: 'Bald', label: 'Bald', subtitle: 'Clean shaved', femaleImage: femaleBald, maleImage: maleBald },
  { id: 'Short', label: 'Short', subtitle: 'Cropped style', femaleImage: femaleShort, maleImage: maleShort },
  { id: 'Long', label: 'Long', subtitle: 'Flowing length', femaleImage: femaleLong, maleImage: maleLong },
];

// Options for random all
const poseOptions = ['Face Close-up', 'Standing', 'Sitting', 'Leaning', 'Arms Crossed', 'Back View', 'Low-angle', 'Hands on Hips'];
const backgroundOptions = ['City', 'Fashion White', 'Beach', 'Mountain', 'Forest', 'Snowy', 'Cafe', 'Underwater'];
const faceTypeOptions = ['Oval', 'Round', 'Square', 'Heart', 'Oblong', 'Diamond'];
const expressionOptions = ['Neutral', 'Smile', 'Serious', 'Confident'];
const beardTypeOptions = ['Clean Shaven', 'Stubble', 'Short Beard', 'Full Beard', 'Goatee', 'Mustache', 'Van Dyke', 'Circle Beard', 'Mutton Chops'];

export default function FilterHairType() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep, getNextStepPath } = useModelConfig();
  const { t } = useLanguage();
  const { hasProFeatureAccess, hasCreatorFeatureAccess, loading } = useSubscription();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverDisabled, setHoverDisabled] = useState(false);

  // Guard: redirect to gender selection on page refresh
  useFilterFlowGuard();

  const isFemale = config.gender === 'Female';

  useEffect(() => {
    setCurrentStep(config.gender === 'Female' ? 8 : 7);
  }, [setCurrentStep, config.gender]);

  // Prefetch next step images
  const nextStepImages = useMemo(() => {
    if (config.gender === 'Male') {
      return FILTER_IMAGES.beardType.all;
    }
    // Female goes to pose (Pro) or clothing
    if (hasProFeatureAccess) {
      return getFilterImages('pose', config.gender as 'Male' | 'Female');
    }
    return []; // No prefetch for clothing
  }, [config.gender, hasProFeatureAccess]);
  
  useImagePrefetch(nextStepImages);

  // Redirect to next step if Hijab is selected (hair won't be visible)
  // Hijab users should continue through ALL filter steps, just skip hair-related ones
  // IMPORTANT: Wait for subscription to load before redirecting
  useEffect(() => {
    if (loading) return; // Wait for subscription data to load
    
    if (config.modestOption === 'Hijab') {
      if (config.gender === 'Male') {
        // Males go to beard type
        navigate('/filter/beard-type');
      } else {
        // Females continue to pose (Pro/Creator) or clothing (Trial/Starter)
        if (hasProFeatureAccess) {
          navigate('/filter/pose');
        } else {
          // For non-Pro females with hijab, skip to clothing
          navigate('/clothing');
        }
      }
    }
  }, [config.modestOption, config.gender, navigate, hasProFeatureAccess, loading]);

  const handleSelect = useCallback((hairType: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(hairType);
    setHoverDisabled(true);
    updateConfig('hairType', hairType);

    setTimeout(() => {
      if (config.gender === 'Male') {
        navigate('/filter/beard-type');
      } else {
        // Skip Pro features if user doesn't have Pro feature access (Trial/Starter)
        navigate(hasProFeatureAccess ? '/filter/pose' : '/clothing');
      }
    }, 1000);
  }, [isAnimating, navigate, updateConfig, config.gender, hasProFeatureAccess]);

  const handleRandomSingle = useCallback(() => {
    if (isAnimating) return;
    
    const randomHairType = hairTypeOptions[Math.floor(Math.random() * hairTypeOptions.length)];
    setIsAnimating(true);
    setSelectedId(randomHairType.id);
    setHoverDisabled(true);
    updateConfig('hairType', randomHairType.id);

    setTimeout(() => {
      const nextPath = getNextStepPath('hairType', !hasProFeatureAccess);
      if (nextPath) {
        navigate(nextPath);
      }
    }, 800);
  }, [isAnimating, updateConfig, navigate, getNextStepPath, hasProFeatureAccess]);

  const handleRandomAll = useCallback(() => {
    if (isAnimating) return;
    // Subscription might not be loaded yet; avoid running randomization with stale feature flags.
    if (loading) return;
    setIsAnimating(true);
    setHoverDisabled(true);
    
    const randomHairType = hairTypeOptions[Math.floor(Math.random() * hairTypeOptions.length)].id;
    setSelectedId(randomHairType);
    updateConfig('hairType', randomHairType);
    
    // Only set Pro features if user has Pro feature access (Pro/Creator plans)
    if (hasProFeatureAccess) {
      const randomPose = poseOptions[Math.floor(Math.random() * poseOptions.length)];
      const randomBackground = backgroundOptions[Math.floor(Math.random() * backgroundOptions.length)];
      updateConfig('pose', randomPose);
      updateConfig('background', randomBackground);
    }

    // Only set Creator features (Face Type, Expression) if user has Creator access
    if (hasCreatorFeatureAccess) {
      const randomFaceType = faceTypeOptions[Math.floor(Math.random() * faceTypeOptions.length)];
      const randomExpression = expressionOptions[Math.floor(Math.random() * expressionOptions.length)];
      updateConfig('faceType', randomFaceType);
      updateConfig('facialExpression', randomExpression);
    }
    
    if (config.gender === 'Male') {
      const randomBeardType = beardTypeOptions[Math.floor(Math.random() * beardTypeOptions.length)];
      updateConfig('beardType', randomBeardType);
    }

    setTimeout(() => { navigate('/clothing'); }, 1000);
  }, [isAnimating, loading, navigate, updateConfig, config.gender, hasProFeatureAccess, hasCreatorFeatureAccess]);

  const infoText = "Images shown in the cards are for example purposes only. UtsuriAI does not recreate the exact same models; it generates random and unique models based on the selected filters.";

  return (
    <FilterStepLayout 
      title={t('filter.selectHairType')}
      subtitle={t('filter.hairTypeSubtitle')}
      onBack={() => navigate('/filter/body-type')}
      onRandom={handleRandomAll}
      onRandomSingle={handleRandomSingle}
      infoText={infoText}
    >
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 relative w-full max-w-7xl mx-auto px-4",
        hoverDisabled && "pointer-events-none"
      )}>
        {hairTypeOptions.map((option, index) => (
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
              config.hairType === option.id && "border-violet-400 ring-4 ring-violet-400/40 shadow-[0_0_40px_rgba(139,92,246,0.4)]",
              selectedId === option.id && isAnimating && "scale-110 z-10",
              isAnimating && selectedId !== option.id && "opacity-20 scale-90 blur-[1px]"
            )}
            style={{ 
              animationDelay: `${index * 30}ms`,
            }}
            tabIndex={-1}
          >
            {/* Background Image */}
            {(isFemale ? option.femaleImage : option.maleImage) ? (
              <div className="absolute inset-0">
                <OptimizedImage 
                  src={isFemale ? option.femaleImage : option.maleImage} 
                  alt={option.label}
                  className={cn(
                    "w-full h-full object-cover transition-transform duration-700",
                    !hoverDisabled && "group-hover:scale-110"
                  )}
                  objectPosition="center"
                />
                {/* Premium gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                {/* Hover glow effect */}
                <div className={cn(
                  "absolute inset-0 bg-violet-500/0 transition-colors duration-500",
                  !hoverDisabled && "group-hover:bg-violet-500/10"
                )} />
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/[0.08] to-white/[0.04]">
                <span className="text-4xl md:text-5xl opacity-50">💇</span>
              </div>
            )}
            
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
            {config.hairType === option.id && (
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
