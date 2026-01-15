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
      {/* Muted off-white background */}
      <div className="fixed inset-0 bg-[#eceef1]" />
      
      {/* Male Model - Left Side */}
      <div 
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[32%] z-[2] flex items-center",
          hoveredGender === 'Male' ? "opacity-100" : "opacity-95"
        )}
      >
        <img 
          src={maleModel} 
          alt="Male model"
          className="h-full w-auto object-contain object-left"
        />
      </div>

      {/* Female Model - Right Side */}
      <div 
        className={cn(
          "fixed right-0 top-0 bottom-0 w-[32%] z-[2] flex items-center justify-end",
          hoveredGender === 'Female' ? "opacity-100" : "opacity-95"
        )}
      >
        <img 
          src={femaleModel} 
          alt="Female model"
          className="h-full w-auto object-contain object-right"
        />
      </div>

      {/* Center panel */}
      <div className="fixed inset-0 z-[3] pointer-events-none flex justify-center">
        <div className="w-[45%] h-full bg-[#eceef1]" />
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
          
          <div className="grid grid-cols-2 gap-6 max-w-lg mx-auto relative outline-none" tabIndex={-1}>
            {genderOptions.map((option) => (
              <div
                key={option.id}
                onMouseEnter={() => setHoveredGender(option.id)}
                onMouseLeave={() => setHoveredGender(null)}
                className="group outline-none focus:outline-none"
                tabIndex={-1}
              >
                <div
                  onClick={() => handleSelect(option.id)}
                  tabIndex={-1}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-4 min-h-[200px] rounded-xl cursor-pointer select-none",
                    "transition-all duration-300 ease-out",
                    "bg-white border border-[#e5e7eb]",
                    "hover:border-violet-400 hover:bg-[#faf9ff]",
                    "outline-none ring-0",
                    config.gender === option.id && "border-violet-500 bg-violet-50/80",
                    isAnimating && selectedId === option.id && "scale-[1.02]",
                    isAnimating && selectedId !== option.id && "opacity-40 scale-[0.98]"
                  )}
                >
                  {/* Icon container */}
                  <div className={cn(
                    "relative z-10 p-4 rounded-lg transition-all duration-300",
                    "bg-[#f2f3f5] group-hover:bg-violet-100",
                    config.gender === option.id && "bg-violet-100"
                  )}>
                    <div className={cn(
                      "text-slate-500 group-hover:text-violet-600 transition-colors duration-300",
                      config.gender === option.id && "text-violet-600"
                    )}>
                      {option.icon}
                    </div>
                  </div>
                  
                  {/* Label */}
                  <span className={cn(
                    "relative z-10 text-lg font-semibold tracking-wide transition-colors duration-300",
                    "text-slate-800 group-hover:text-slate-900"
                  )}>
                    {option.label}
                  </span>
                  
                  {/* Selection indicator */}
                  {config.gender === option.id && (
                    <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-violet-500" />
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
