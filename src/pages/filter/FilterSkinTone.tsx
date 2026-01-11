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

// Artistic brush stroke SVG patterns for each card
const BrushStrokePattern = ({ color, darkColor, seed }: { color: string; darkColor: string; seed: number }) => {
  // Create unique pattern based on seed
  const strokes = [
    { x: 10 + (seed % 3) * 5, y: 15, width: 55, height: 45, rotate: -8 + (seed % 5) },
    { x: 20 + (seed % 4) * 3, y: 30, width: 50, height: 35, rotate: 5 - (seed % 3) },
    { x: 5 + (seed % 2) * 8, y: 25, width: 60, height: 40, rotate: -3 + (seed % 4) },
  ];

  return (
    <svg 
      viewBox="0 0 80 80" 
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <filter id={`texture-${seed}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" seed={seed} />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`blur-${seed}`}>
          <feGaussianBlur stdDeviation="0.5" />
        </filter>
      </defs>
      
      {/* Base textured layer */}
      <ellipse 
        cx="40" 
        cy="42" 
        rx="32" 
        ry="28" 
        fill={darkColor}
        opacity="0.4"
        filter={`url(#texture-${seed})`}
        transform={`rotate(${-5 + seed % 10}, 40, 42)`}
      />
      
      {/* Main brush strokes */}
      {strokes.map((stroke, i) => (
        <ellipse
          key={i}
          cx={stroke.x + stroke.width / 2}
          cy={stroke.y + stroke.height / 2}
          rx={stroke.width / 2}
          ry={stroke.height / 2}
          fill={i === 1 ? color : darkColor}
          opacity={i === 0 ? 0.6 : i === 1 ? 0.85 : 0.5}
          transform={`rotate(${stroke.rotate}, ${stroke.x + stroke.width / 2}, ${stroke.y + stroke.height / 2})`}
          filter={`url(#texture-${seed})`}
        />
      ))}
      
      {/* Highlight stroke */}
      <ellipse
        cx="35"
        cy="35"
        rx="20"
        ry="12"
        fill={color}
        opacity="0.7"
        transform={`rotate(${-15 + seed % 8}, 35, 35)`}
        filter={`url(#blur-${seed})`}
      />
      
      {/* Small accent strokes */}
      <ellipse
        cx={25 + seed % 10}
        cy={50 + seed % 8}
        rx="8"
        ry="5"
        fill={color}
        opacity="0.5"
        transform={`rotate(${20 - seed % 15}, ${25 + seed % 10}, ${50 + seed % 8})`}
      />
    </svg>
  );
};

export default function FilterSkinTone() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const { t } = useLanguage();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  const handleSelect = useCallback((skinTone: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(skinTone);
    updateConfig('skinTone', skinTone);

    setTimeout(() => {
      navigate('/filter/hair-color');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title={t('filter.selectSkinTone')}
      subtitle={t('filter.skinToneSubtitle')}
      onBack={() => navigate('/filter/ethnicity')}
    >
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-3 gap-3 md:gap-4 relative max-w-md mx-auto">
        {skinToneOptions.map((option, index) => (
          <div
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={cn(
              "group relative flex flex-col items-center justify-end rounded-xl cursor-pointer overflow-hidden",
              "h-[70px] md:h-[80px]",
              "transition-all duration-500 ease-out",
              "bg-black/20 backdrop-blur-sm",
              "border border-white/15 hover:border-violet-400/50",
              "shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(139,92,246,0.25)]",
              "hover:scale-[1.05] hover:-translate-y-1",
              "outline-none ring-0",
              config.skinTone === option.id && "border-violet-400 ring-2 ring-violet-400/40 shadow-[0_0_20px_rgba(139,92,246,0.3)]",
              selectedId === option.id && isAnimating && "scale-110 z-10",
              isAnimating && selectedId !== option.id && "opacity-20 scale-90 blur-[1px]"
            )}
            style={{ animationDelay: `${index * 30}ms` }}
            tabIndex={-1}
          >
            {/* Artistic brush stroke background */}
            <div className="absolute inset-0 opacity-90 group-hover:opacity-100 transition-opacity duration-300">
              <BrushStrokePattern color={option.color} darkColor={option.darkColor} seed={index * 7 + 13} />
            </div>
            
            {/* Subtle overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5" />
            
            {/* Label */}
            <div className="relative z-10 text-center pb-2 px-1 w-full">
              <p className="font-medium text-xs md:text-sm text-white tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                {option.label}
              </p>
            </div>

            {/* Selection indicator */}
            {config.skinTone === option.id && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
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
