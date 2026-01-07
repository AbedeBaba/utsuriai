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
    
    // Clear beard type if switching from male to female
    if (gender === 'Female') {
      updateConfig('beardType', '');
    }

    setTimeout(() => {
      navigate('/filter/ethnicity');
    }, 1000);
  }, [isAnimating, navigate, updateConfig]);

  return (
    <FilterStepLayout 
      title="Select Gender"
      subtitle="Choose the gender for your fashion model"
      onBack={() => navigate('/')}
    >
      {/* Male Model Photo - Left Half */}
      <div 
        className={cn(
          "fixed left-0 top-0 h-screen w-1/2 overflow-hidden pointer-events-none z-0 transition-all duration-500",
          hoveredGender === 'Male' ? "opacity-100" : "opacity-50"
        )}
      >
        <img 
          src={maleModel} 
          alt="Male model"
          className={cn(
            "h-full w-full object-cover object-center transition-all duration-500",
            hoveredGender === 'Male' && "scale-110 brightness-125"
          )}
        />
        {/* Shine overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-opacity duration-500",
            hoveredGender === 'Male' ? "opacity-100 animate-pulse" : "opacity-0"
          )}
        />
        {/* Right edge fade to blend with center */}
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
      </div>

      {/* Female Model Photo - Right Half */}
      <div 
        className={cn(
          "fixed right-0 top-0 h-screen w-1/2 overflow-hidden pointer-events-none z-0 transition-all duration-500",
          hoveredGender === 'Female' ? "opacity-100" : "opacity-50"
        )}
      >
        <img 
          src={femaleModel} 
          alt="Female model"
          className={cn(
            "h-full w-full object-cover object-center transition-all duration-500",
            hoveredGender === 'Female' && "scale-110 brightness-125"
          )}
        />
        {/* Shine overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transition-opacity duration-500",
            hoveredGender === 'Female' ? "opacity-100 animate-pulse" : "opacity-0"
          )}
        />
        {/* Left edge fade to blend with center */}
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
      </div>

      {/* Backdrop */}
      <div className={cn("selection-backdrop", isAnimating && "active")} />
      
      <div className="grid grid-cols-2 gap-6 max-w-md mx-auto relative z-10">
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
  );
}
