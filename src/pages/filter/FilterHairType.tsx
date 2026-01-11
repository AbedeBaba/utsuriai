import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// Female hair type images
import femaleStraight from '@/assets/hair-types/female-straight.png';
import femaleWavy from '@/assets/hair-types/female-wavy.png';
import femaleCurly from '@/assets/hair-types/female-curly.png';
import femaleCoily from '@/assets/hair-types/female-coily.png';
import femaleBald from '@/assets/hair-types/female-bald.png';
import femaleShort from '@/assets/hair-types/female-short.png';
import femaleLong from '@/assets/hair-types/female-long.png';

const hairTypeOptions = [
  { id: 'Straight', label: 'Straight', subtitle: 'Sleek and smooth', femaleImage: femaleStraight },
  { id: 'Wavy', label: 'Wavy', subtitle: 'Soft waves', femaleImage: femaleWavy },
  { id: 'Curly', label: 'Curly', subtitle: 'Defined curls', femaleImage: femaleCurly },
  { id: 'Coily', label: 'Coily', subtitle: 'Tight coils', femaleImage: femaleCoily },
  { id: 'Bald', label: 'Bald', subtitle: 'Clean shaved', femaleImage: femaleBald },
  { id: 'Short', label: 'Short', subtitle: 'Cropped style', femaleImage: femaleShort },
  { id: 'Long', label: 'Long', subtitle: 'Flowing length', femaleImage: femaleLong },
];

export default function FilterHairType() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isFemale = config.gender === 'Female';

  useEffect(() => {
    setCurrentStep(7);
  }, [setCurrentStep]);

  const handleSelect = useCallback((hairType: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(hairType);
    updateConfig('hairType', hairType);

    setTimeout(() => {
      navigate('/filter/hair-style');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title={t('filter.selectHairType')}
      subtitle={t('filter.hairTypeSubtitle')}
      onBack={() => navigate('/filter/body-type')}
    >
      <div className="grid grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 relative w-full max-w-7xl mx-auto px-4">
        {hairTypeOptions.map((option, index) => (
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
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-white/[0.08] to-white/[0.04]">
                <span className="text-4xl md:text-5xl opacity-50">💇</span>
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
              <p className={cn(
                "text-sm mt-1",
                isFemale ? "text-white/70 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]" : "text-muted-foreground"
              )}>
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
