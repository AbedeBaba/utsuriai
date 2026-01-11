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
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-950 to-black relative overflow-hidden">
      {/* Male Model - Left Side */}
      <div 
        className={cn(
          "fixed left-0 top-0 bottom-0 w-[40%] z-0 transition-all duration-500",
          hoveredGender === 'Male' ? "opacity-100" : "opacity-60"
        )}
      >
        <img 
          src={maleModel} 
          alt="Male model"
          className={cn(
            "h-full w-auto object-contain object-left transition-all duration-500",
            hoveredGender === 'Male' && "brightness-110 scale-[1.02]"
          )}
        />
        {/* Shine overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent transition-opacity duration-500 pointer-events-none",
            hoveredGender === 'Male' ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {/* Female Model - Right Side */}
      <div 
        className={cn(
          "fixed right-0 top-0 bottom-0 w-[40%] z-0 flex justify-end transition-all duration-500",
          hoveredGender === 'Female' ? "opacity-100" : "opacity-60"
        )}
      >
        <img 
          src={femaleModel} 
          alt="Female model"
          className={cn(
            "h-full w-auto object-contain object-right transition-all duration-500",
            hoveredGender === 'Female' && "brightness-110 scale-[1.02]"
          )}
        />
        {/* Shine overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-l from-primary/30 to-transparent transition-opacity duration-500 pointer-events-none",
            hoveredGender === 'Female' ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {/* Center gradient overlay for better text readability */}
      <div className="fixed inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/90 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
      </div>

      {/* Main Content - On top */}
      <div className="relative z-10 min-h-screen">
        <FilterStepLayout 
          title="Select Gender"
          subtitle="Choose the gender for your fashion model"
          onBack={() => navigate('/')}
        >
          {/* Backdrop */}
          <div className={cn("selection-backdrop", isAnimating && "active")} />
          
          <div className="grid grid-cols-2 gap-8 max-w-lg mx-auto relative">
            {genderOptions.map((option, index) => (
              <div
                key={option.id}
                onMouseEnter={() => setHoveredGender(option.id)}
                onMouseLeave={() => setHoveredGender(null)}
              >
                <SelectionCard
                  title={option.label}
                  icon={option.icon}
                  selected={config.gender === option.id}
                  onClick={() => handleSelect(option.id)}
                  isAnimating={selectedId === option.id}
                  isFadingOut={isAnimating && selectedId !== option.id}
                  animationDelay={index * 50}
                  className="bg-white/10 backdrop-blur-md border-2 border-white/20 hover:border-primary/60 hover:bg-white/20 text-white min-h-[180px]"
                />
              </div>
            ))}
          </div>
        </FilterStepLayout>
      </div>
    </div>
  );
}
