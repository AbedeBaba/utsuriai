import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { useLanguage } from '@/context/LanguageContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

const skinToneOptions = [
  { id: 'Fair', label: 'Fair', color: '#FFE5D4', darkColor: '#e6cfc0' },
  { id: 'Light', label: 'Light', color: '#F5D0B5', darkColor: '#dbb9a0' },
  { id: 'Medium Light', label: 'Medium Light', color: '#D9A87C', darkColor: '#c4956b' },
  { id: 'Medium', label: 'Medium', color: '#C68642', darkColor: '#a87038' },
  { id: 'Medium Dark', label: 'Medium Dark', color: '#8D5524', darkColor: '#704419' },
  { id: 'Dark', label: 'Dark', color: '#6B4423', darkColor: '#52351a' },
  { id: 'Deep', label: 'Deep', color: '#4A2C17', darkColor: '#3a2212' },
  { id: 'Ebony', label: 'Ebony', color: '#3A1F0D', darkColor: '#2a170a' },
  { id: 'Olive', label: 'Olive', color: '#C4A77D', darkColor: '#a89068' },
];

// Horizontal brush stroke pattern like paint strokes
const BrushStrokePattern = ({ color, darkColor, seed }: { color: string; darkColor: string; seed: number }) => {
  // Create horizontal brush stroke lines with variation
  const yOffset1 = 18 + (seed % 6);
  const yOffset2 = 38 + (seed % 5);
  const yOffset3 = 58 + (seed % 4);
  
  return (
    <svg 
      viewBox="0 0 120 80" 
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <filter id={`brush-texture-${seed}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" result="noise" seed={seed * 3} />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`rough-edge-${seed}`}>
          <feTurbulence type="turbulence" baseFrequency="0.05" numOctaves="2" result="noise" seed={seed} />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" />
        </filter>
      </defs>
      
      {/* First horizontal brush stroke */}
      <path
        d={`M -5 ${yOffset1} 
            Q 10 ${yOffset1 - 3}, 30 ${yOffset1 + 1} 
            Q 60 ${yOffset1 + 2}, 90 ${yOffset1 - 1} 
            Q 110 ${yOffset1 + 1}, 125 ${yOffset1}
            L 125 ${yOffset1 + 12}
            Q 100 ${yOffset1 + 14}, 70 ${yOffset1 + 11}
            Q 40 ${yOffset1 + 13}, 10 ${yOffset1 + 10}
            Q -2 ${yOffset1 + 12}, -5 ${yOffset1 + 11}
            Z`}
        fill={darkColor}
        opacity="0.7"
        filter={`url(#rough-edge-${seed})`}
      />
      
      {/* Second horizontal brush stroke - main */}
      <path
        d={`M -5 ${yOffset2 - 2} 
            Q 20 ${yOffset2 - 4}, 50 ${yOffset2} 
            Q 80 ${yOffset2 + 2}, 100 ${yOffset2 - 1} 
            Q 115 ${yOffset2}, 125 ${yOffset2 + 1}
            L 125 ${yOffset2 + 14}
            Q 95 ${yOffset2 + 16}, 60 ${yOffset2 + 12}
            Q 30 ${yOffset2 + 15}, 5 ${yOffset2 + 13}
            Q -3 ${yOffset2 + 14}, -5 ${yOffset2 + 12}
            Z`}
        fill={color}
        opacity="0.95"
        filter={`url(#brush-texture-${seed})`}
      />
      
      {/* Third horizontal brush stroke */}
      <path
        d={`M -5 ${yOffset3} 
            Q 15 ${yOffset3 + 2}, 45 ${yOffset3 - 1} 
            Q 75 ${yOffset3 + 1}, 105 ${yOffset3} 
            Q 118 ${yOffset3 - 1}, 125 ${yOffset3 + 1}
            L 125 ${yOffset3 + 10}
            Q 90 ${yOffset3 + 12}, 55 ${yOffset3 + 9}
            Q 25 ${yOffset3 + 11}, 0 ${yOffset3 + 10}
            Q -3 ${yOffset3 + 9}, -5 ${yOffset3 + 9}
            Z`}
        fill={darkColor}
        opacity="0.5"
        filter={`url(#rough-edge-${seed})`}
      />
      
      {/* Accent thin stroke */}
      <path
        d={`M 10 ${yOffset2 + 5} 
            Q 40 ${yOffset2 + 3}, 80 ${yOffset2 + 6} 
            Q 100 ${yOffset2 + 4}, 115 ${yOffset2 + 5}
            L 115 ${yOffset2 + 8}
            Q 70 ${yOffset2 + 10}, 30 ${yOffset2 + 8}
            Q 15 ${yOffset2 + 9}, 10 ${yOffset2 + 8}
            Z`}
        fill={color}
        opacity="0.6"
      />
    </svg>
  );
};

export default function FilterSkinTone() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep, getNextStepPath } = useModelConfig();
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoverDisabled, setHoverDisabled] = useState(false);

  useEffect(() => {
    setCurrentStep(config.gender === 'Female' ? 4 : 3);
  }, [setCurrentStep, config.gender]);

  const handleSelect = useCallback((skinTone: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(skinTone);
    setHoverDisabled(true);
    updateConfig('skinTone', skinTone);

    setTimeout(() => {
      // Skip hair color if Hijab is selected (hair won't be visible)
      if (config.modestOption === 'Hijab') {
        navigate('/filter/eye-color');
      } else {
        navigate('/filter/hair-color');
      }
    }, 1000);
  }, [isAnimating, navigate, updateConfig, config.modestOption]);

  const handleRandomSingle = useCallback(() => {
    if (isAnimating) return;
    
    const randomSkinTone = skinToneOptions[Math.floor(Math.random() * skinToneOptions.length)];
    setIsAnimating(true);
    setSelectedId(randomSkinTone.id);
    setHoverDisabled(true);
    updateConfig('skinTone', randomSkinTone.id);

    setTimeout(() => {
      const nextPath = getNextStepPath('skinTone');
      if (nextPath) {
        navigate(nextPath);
      }
    }, 800);
  }, [isAnimating, updateConfig, navigate, getNextStepPath]);

  return (
    <FilterStepLayout 
      title={t('filter.selectSkinTone')}
      subtitle={t('filter.skinToneSubtitle')}
      onBack={() => navigate('/filter/ethnicity')}
      onRandomSingle={handleRandomSingle}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className={cn(
        "grid grid-cols-3 gap-4 md:gap-6 relative max-w-2xl mx-auto",
        hoverDisabled && "pointer-events-none"
      )}>
        {skinToneOptions.map((option, index) => (
          <div
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "group relative flex flex-col items-center justify-end rounded-2xl cursor-pointer overflow-hidden",
              "h-[130px] sm:h-[150px] md:h-[170px]",
              "transition-all duration-500 ease-out",
              "bg-black/30 backdrop-blur-sm",
              "border border-white/20",
              "shadow-[0_4px_20px_rgba(0,0,0,0.25)]",
              "outline-none ring-0",
              !hoverDisabled && "hover:border-violet-400/50 hover:shadow-[0_12px_32px_rgba(139,92,246,0.3)] hover:scale-[1.04] hover:-translate-y-1",
              config.skinTone === option.id && "border-violet-400 ring-2 ring-violet-400/40 shadow-[0_0_24px_rgba(139,92,246,0.35)]",
              selectedId === option.id && isAnimating && "scale-[1.02] z-10 shadow-[0_0_30px_rgba(139,92,246,0.5)]",
              isAnimating && selectedId !== option.id && "opacity-30 scale-[0.98]"
            )}
            style={{ animationDelay: `${index * 30}ms` }}
            tabIndex={-1}
          >
            {/* Horizontal brush stroke background */}
            <div className={cn(
              "absolute inset-0 opacity-90 transition-opacity duration-300",
              !hoverDisabled && "group-hover:opacity-100"
            )}>
              <BrushStrokePattern color={option.color} darkColor={option.darkColor} seed={index * 7 + 13} />
            </div>
            
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/5" />
            
            {/* Label */}
            <div className="relative z-10 text-center pb-3 px-2 w-full">
              <p className="font-semibold text-sm md:text-base text-white tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                {option.label}
              </p>
            </div>

            {/* Selection indicator */}
            {config.skinTone === option.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
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
