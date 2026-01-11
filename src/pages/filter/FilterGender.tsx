import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import maleModel from '@/assets/gender-male.jpeg';
import femaleModel from '@/assets/gender-female.jpeg';

const genderOptions = [
  { id: 'Male', label: 'Male', icon: <User className="h-8 w-8" /> },
  { id: 'Female', label: 'Female', icon: <Users className="h-8 w-8" /> },
];

export default function FilterGender() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredGender, setHoveredGender] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const handleSelect = useCallback((gender: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(gender);
    updateConfig('gender', gender);
    
    if (gender === 'Female') {
      updateConfig('beardType', '');
    }

    setTimeout(() => {
      navigate('/filter/ethnicity');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Premium gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-900" />
      <div className="fixed inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
      
      {/* Subtle pattern overlay */}
      <div className="fixed inset-0 opacity-5" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '40px 40px'
      }} />

      {/* Male Model - Left Side */}
      <div 
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[35%] z-[2] transition-all duration-700 flex items-center",
          hoveredGender === 'Male' ? "opacity-100" : "opacity-75"
        )}
      >
        <div className="relative h-full w-full flex items-center justify-start pl-4">
          <img 
            src={maleModel} 
            alt="Male model"
            className={cn(
              "h-[90%] w-auto object-contain object-left transition-all duration-700 drop-shadow-2xl",
              hoveredGender === 'Male' && "brightness-125 contrast-110 scale-[1.03]",
              "brightness-110 contrast-105"
            )}
            style={{
              filter: hoveredGender === 'Male' 
                ? 'drop-shadow(0 0 60px rgba(139, 92, 246, 0.4))' 
                : 'drop-shadow(0 0 40px rgba(0, 0, 0, 0.5))'
            }}
          />
          {/* Accent glow overlay */}
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-r from-violet-500/20 via-transparent to-transparent transition-opacity duration-500 pointer-events-none",
              hoveredGender === 'Male' ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      </div>

      {/* Female Model - Right Side */}
      <div 
        className={cn(
          "fixed right-0 top-0 bottom-0 w-[35%] z-[2] flex items-center justify-end transition-all duration-700",
          hoveredGender === 'Female' ? "opacity-100" : "opacity-75"
        )}
      >
        <div className="relative h-full w-full flex items-center justify-end pr-4">
          <img 
            src={femaleModel} 
            alt="Female model"
            className={cn(
              "h-[90%] w-auto object-contain object-right transition-all duration-700 drop-shadow-2xl",
              hoveredGender === 'Female' && "brightness-125 contrast-110 scale-[1.03]",
              "brightness-110 contrast-105"
            )}
            style={{
              filter: hoveredGender === 'Female' 
                ? 'drop-shadow(0 0 60px rgba(139, 92, 246, 0.4))' 
                : 'drop-shadow(0 0 40px rgba(0, 0, 0, 0.5))'
            }}
          />
          {/* Accent glow overlay */}
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-l from-violet-500/20 via-transparent to-transparent transition-opacity duration-500 pointer-events-none",
              hoveredGender === 'Female' ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      </div>

      {/* Center content area with subtle vignette */}
      <div className="fixed inset-0 z-[3] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-full bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-950/80" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <FilterStepLayout 
          title="Select Gender"
          subtitle="Choose the gender for your fashion model"
          onBack={() => navigate('/')}
        >
          {/* Backdrop */}
          <div className={cn("selection-backdrop", isAnimating && "active")} />
          
          <div className="grid grid-cols-2 gap-10 max-w-xl mx-auto relative">
            {genderOptions.map((option, index) => (
              <div
                key={option.id}
                onMouseEnter={() => setHoveredGender(option.id)}
                onMouseLeave={() => setHoveredGender(null)}
                className="group"
              >
                <div
                  onClick={() => handleSelect(option.id)}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-4 min-h-[200px] rounded-2xl cursor-pointer transition-all duration-500",
                    "bg-gradient-to-br from-white/[0.12] to-white/[0.04] backdrop-blur-xl",
                    "border border-white/20 hover:border-violet-400/60",
                    "shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_16px_48px_rgba(139,92,246,0.25)]",
                    config.gender === option.id && "border-violet-400 bg-gradient-to-br from-violet-500/20 to-purple-600/10",
                    isAnimating && selectedId === option.id && "scale-105",
                    isAnimating && selectedId !== option.id && "opacity-30 scale-95"
                  )}
                >
                  {/* Glow effect on hover */}
                  <div className={cn(
                    "absolute inset-0 rounded-2xl transition-opacity duration-500 opacity-0 group-hover:opacity-100",
                    "bg-gradient-to-br from-violet-500/10 via-transparent to-purple-500/10"
                  )} />
                  
                  {/* Inner highlight */}
                  <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Icon */}
                  <div className={cn(
                    "relative z-10 p-4 rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-600/20 transition-all duration-300",
                    "group-hover:from-violet-500/50 group-hover:to-purple-600/30 group-hover:scale-110",
                    "shadow-lg shadow-violet-500/20"
                  )}>
                    {option.icon}
                  </div>
                  
                  {/* Label */}
                  <span className={cn(
                    "relative z-10 text-xl font-semibold tracking-wide transition-all duration-300",
                    "text-white/90 group-hover:text-white"
                  )}>
                    {option.label}
                  </span>
                  
                  {/* Selection indicator */}
                  {config.gender === option.id && (
                    <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-violet-400 shadow-lg shadow-violet-400/50 animate-pulse" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </FilterStepLayout>
      </div>
    </div>
  );
}
