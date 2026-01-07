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
      {/* Male Model - Left Side - Behind content */}
      <div 
        className={cn(
          "fixed left-0 bottom-0 z-0 transition-all duration-700 ease-out flex items-end justify-start",
          "h-[85vh] md:h-[90vh] lg:h-[95vh]",
          "w-auto",
          hoveredGender === 'Male' ? "opacity-100" : "opacity-70"
        )}
      >
        <img 
          src={maleModel} 
          alt="Male model"
          className={cn(
            "h-full w-auto object-contain transition-all duration-700",
            hoveredGender === 'Male' && "scale-[1.02] brightness-110"
          )}
          style={{ 
            objectPosition: 'left bottom',
            maxWidth: '35vw'
          }}
        />
        {/* Shine overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent transition-opacity duration-500 pointer-events-none",
            hoveredGender === 'Male' ? "opacity-100" : "opacity-0"
          )}
        />
        {/* Right edge fade for smooth blend */}
        <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background via-background/50 to-transparent pointer-events-none" />
      </div>

      {/* Female Model - Right Side - Behind content */}
      <div 
        className={cn(
          "fixed right-0 bottom-0 z-0 transition-all duration-700 ease-out flex items-end justify-end",
          "h-[85vh] md:h-[90vh] lg:h-[95vh]",
          "w-auto",
          hoveredGender === 'Female' ? "opacity-100" : "opacity-70"
        )}
      >
        <img 
          src={femaleModel} 
          alt="Female model"
          className={cn(
            "h-full w-auto object-contain transition-all duration-700",
            hoveredGender === 'Female' && "scale-[1.02] brightness-110"
          )}
          style={{ 
            objectPosition: 'right bottom',
            maxWidth: '35vw'
          }}
        />
        {/* Shine overlay */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-bl from-white/15 via-transparent to-transparent transition-opacity duration-500 pointer-events-none",
            hoveredGender === 'Female' ? "opacity-100" : "opacity-0"
          )}
        />
        {/* Left edge fade for smooth blend */}
        <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background via-background/50 to-transparent pointer-events-none" />
      </div>

      {/* Center content area with subtle background for card readability */}
      <div className="fixed inset-0 z-[1] pointer-events-none flex items-center justify-center">
        <div className="w-full max-w-2xl h-full bg-gradient-to-r from-transparent via-background/80 to-transparent" />
      </div>

      {/* Main Content - On top of everything */}
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
