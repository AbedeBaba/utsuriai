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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Male Model - Left Side - Original size, clipped at center */}
      <div 
        className={cn(
          "fixed left-0 top-0 bottom-0 z-0 overflow-hidden transition-opacity duration-500",
          "w-[calc(50%-14rem)]", // Stop before the cards (cards are max-w-md = 28rem, so half is 14rem from center)
          hoveredGender === 'Male' ? "opacity-100" : "opacity-80"
        )}
      >
        <img 
          src={maleModel} 
          alt="Male model"
          className={cn(
            "h-full w-auto min-w-full object-cover object-left transition-all duration-500",
            hoveredGender === 'Male' && "brightness-110"
          )}
        />
        {/* Shine overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent transition-opacity duration-500 pointer-events-none",
            hoveredGender === 'Male' ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {/* Female Model - Right Side - Original size, clipped at center */}
      <div 
        className={cn(
          "fixed right-0 top-0 bottom-0 z-0 overflow-hidden transition-opacity duration-500",
          "w-[calc(50%-14rem)]", // Stop before the cards
          hoveredGender === 'Female' ? "opacity-100" : "opacity-80"
        )}
      >
        <img 
          src={femaleModel} 
          alt="Female model"
          className={cn(
            "h-full w-auto min-w-full object-cover object-right transition-all duration-500",
            hoveredGender === 'Female' && "brightness-110"
          )}
        />
        {/* Shine overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-l from-white/10 via-white/5 to-transparent transition-opacity duration-500 pointer-events-none",
            hoveredGender === 'Female' ? "opacity-100" : "opacity-0"
          )}
        />
      </div>

      {/* Main Content - On top */}
      <div className="relative z-10">
        <FilterStepLayout 
          title="Select Gender"
          subtitle="Choose the gender for your fashion model"
          onBack={() => navigate('/')}
        >
          {/* Backdrop */}
          <div className={cn("selection-backdrop", isAnimating && "active")} />
          
          <div className="grid grid-cols-2 gap-6 max-w-md mx-auto relative">
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
                />
              </div>
            ))}
          </div>
        </FilterStepLayout>
      </div>
    </div>
  );
}
