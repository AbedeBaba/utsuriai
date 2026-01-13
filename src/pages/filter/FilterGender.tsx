import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect, useState, useCallback } from 'react';
import { User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import maleModel from '@/assets/gender-male.jpeg';
import femaleModel from '@/assets/gender-female.jpeg';
import { useSubscription } from '@/hooks/useSubscription';
import { LoadSavedModelDialog } from '@/components/LoadSavedModelDialog';
import { useSavedModels, SavedModel } from '@/hooks/useSavedModels';

const genderOptions = [
  { id: 'Male', label: 'Male', icon: <User className="h-8 w-8" /> },
  { id: 'Female', label: 'Female', icon: <Users className="h-8 w-8" /> },
];

export default function FilterGender() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep, loadSavedModel } = useModelConfig();
  const { hasCreatorFeatureAccess } = useSubscription();
  const { convertToModelConfig } = useSavedModels();
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredGender, setHoveredGender] = useState<string | null>(null);

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  // Handle loading a saved model
  const handleLoadSavedModel = useCallback((savedModel: SavedModel) => {
    const modelConfig = convertToModelConfig(savedModel);
    loadSavedModel(modelConfig);
    // Navigate to clothing page since all filters are pre-filled
    navigate('/clothing');
  }, [convertToModelConfig, loadSavedModel, navigate]);

  const handleSelect = useCallback((gender: string) => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setSelectedId(gender);
    updateConfig('gender', gender);
    
    if (gender === 'Female') {
      updateConfig('beardType', '');
    }

    setTimeout(() => {
      if (gender === 'Female') {
        navigate('/filter/modest-option');
      } else {
        navigate('/filter/ethnicity');
      }
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Softer premium gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-800 via-slate-700/95 to-slate-800" />
      
      {/* Male Model - Left Side with vignette fade */}
      <div 
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[32%] z-[2] transition-all duration-700 flex items-center",
          hoveredGender === 'Male' ? "opacity-100" : "opacity-85"
        )}
      >
        <div className="relative h-full w-full flex items-center justify-start">
          <img 
            src={maleModel} 
            alt="Male model"
            className={cn(
              "h-full w-auto object-contain object-left transition-all duration-700",
              hoveredGender === 'Male' && "brightness-[1.35] contrast-[1.08] scale-[1.02]",
              "brightness-[1.25] contrast-[1.05]"
            )}
            style={{
              filter: hoveredGender === 'Male' 
                ? 'drop-shadow(0 0 100px rgba(168, 139, 250, 0.4))' 
                : 'drop-shadow(0 0 60px rgba(139, 92, 246, 0.2))'
            }}
          />
          {/* Vignette fade toward center */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900/90 pointer-events-none" />
          {/* Subtle accent glow on hover */}
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-r from-violet-400/10 via-transparent to-transparent transition-opacity duration-700 pointer-events-none",
              hoveredGender === 'Male' ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      </div>

      {/* Female Model - Right Side with vignette fade */}
      <div 
        className={cn(
          "fixed right-0 top-0 bottom-0 w-[32%] z-[2] flex items-center justify-end transition-all duration-700",
          hoveredGender === 'Female' ? "opacity-100" : "opacity-85"
        )}
      >
        <div className="relative h-full w-full flex items-center justify-end">
          <img 
            src={femaleModel} 
            alt="Female model"
            className={cn(
              "h-full w-auto object-contain object-right transition-all duration-700",
              hoveredGender === 'Female' && "brightness-[1.35] contrast-[1.08] scale-[1.02]",
              "brightness-[1.25] contrast-[1.05]"
            )}
            style={{
              filter: hoveredGender === 'Female' 
                ? 'drop-shadow(0 0 100px rgba(168, 139, 250, 0.4))' 
                : 'drop-shadow(0 0 60px rgba(139, 92, 246, 0.2))'
            }}
          />
          {/* Vignette fade toward center */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-slate-900/90 pointer-events-none" />
          {/* Subtle accent glow on hover */}
          <div 
            className={cn(
              "absolute inset-0 bg-gradient-to-l from-violet-400/10 via-transparent to-transparent transition-opacity duration-700 pointer-events-none",
              hoveredGender === 'Female' ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      </div>

      {/* Center panel - lighter gradient for content separation */}
      <div className="fixed inset-0 z-[3] pointer-events-none flex justify-center">
        <div className="w-[45%] h-full bg-gradient-to-b from-slate-700/50 via-slate-600/35 to-slate-700/50 backdrop-blur-sm" />
      </div>
      
      {/* Soft radial glow in center */}
      <div className="fixed inset-0 z-[4] pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-violet-400/8 blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen">
        <FilterStepLayout 
          title="Select Gender"
          subtitle="Choose the gender for your fashion model"
          onBack={() => navigate('/')}
          hideSubtitleBackground={true}
          isCorePage={true}
        >
          {/* Load Saved Model Button - Creator Only */}
          {hasCreatorFeatureAccess && (
            <div className="flex justify-center mb-6">
              <LoadSavedModelDialog onSelect={handleLoadSavedModel} />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto relative outline-none" tabIndex={-1}>
            {genderOptions.map((option, index) => (
              <div
                key={option.id}
                onMouseEnter={() => setHoveredGender(option.id)}
                onMouseLeave={() => setHoveredGender(null)}
                className="group perspective-1000 outline-none focus:outline-none"
                tabIndex={-1}
              >
                <div
                  onClick={() => handleSelect(option.id)}
                  tabIndex={-1}
                  className={cn(
                    "gender-card relative flex flex-col items-center justify-center gap-5 min-h-[220px] rounded-2xl cursor-pointer select-none",
                    "transition-all duration-500 ease-out",
                    "bg-gradient-to-b from-white/[0.18] to-white/[0.10] backdrop-blur-xl",
                    "border border-white/30 hover:border-violet-300/50",
                    "shadow-[0_4px_24px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(139,92,246,0.15)]",
                    "outline-none ring-0",
                    config.gender === option.id && "border-violet-400/70 bg-gradient-to-b from-violet-500/20 to-violet-600/10",
                    isAnimating && selectedId === option.id && "scale-105",
                    isAnimating && selectedId !== option.id && "opacity-30 scale-95"
                  )}
                >
                  {/* Bottom-to-top glow sweep on hover */}
                  <div className={cn(
                    "absolute inset-0 rounded-2xl overflow-hidden pointer-events-none",
                    "before:absolute before:inset-0 before:bg-gradient-to-t before:from-violet-400/20 before:via-violet-300/5 before:to-transparent",
                    "before:translate-y-full before:transition-transform before:duration-700 before:ease-out",
                    "group-hover:before:translate-y-0"
                  )} />
                  
                  {/* Top highlight reflection */}
                  <div className={cn(
                    "absolute top-0 left-4 right-4 h-[1px] rounded-full transition-all duration-500 pointer-events-none",
                    "bg-gradient-to-r from-transparent via-white/20 to-transparent",
                    "group-hover:via-violet-300/40"
                  )} />
                  
                  {/* Inner surface highlight */}
                  <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-b from-white/10 via-transparent to-transparent pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Icon container */}
                  <div className={cn(
                    "relative z-10 p-4 rounded-xl transition-all duration-500 ease-out",
                    "bg-gradient-to-br from-violet-500/25 to-purple-600/15",
                    "group-hover:from-violet-400/40 group-hover:to-purple-500/25",
                    "group-hover:scale-110 group-hover:shadow-[0_8px_24px_rgba(139,92,246,0.3)]",
                    "border border-violet-400/20 group-hover:border-violet-300/40"
                  )}>
                    <div className="text-violet-300 group-hover:text-violet-200 transition-colors duration-500">
                      {option.icon}
                    </div>
                  </div>
                  
                  {/* Label */}
                  <span className={cn(
                    "relative z-10 text-xl font-medium tracking-wide transition-all duration-500",
                    "text-white/80 group-hover:text-white"
                  )}>
                    {option.label}
                  </span>
                  
                  {/* Selection indicator */}
                  {config.gender === option.id && (
                    <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(167,139,250,0.6)]" />
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
