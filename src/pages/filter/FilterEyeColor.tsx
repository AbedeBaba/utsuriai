import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect } from 'react';

const eyeColorOptions = [
  { id: 'Brown', label: 'Brown', color: '#634E34' },
  { id: 'Dark Brown', label: 'Dark Brown', color: '#3D2314' },
  { id: 'Hazel', label: 'Hazel', color: '#8E7618' },
  { id: 'Green', label: 'Green', color: '#3D6B4F' },
  { id: 'Blue', label: 'Blue', color: '#4682B4' },
  { id: 'Light Blue', label: 'Light Blue', color: '#87CEEB' },
  { id: 'Gray', label: 'Gray', color: '#808080' },
  { id: 'Amber', label: 'Amber', color: '#CF9B52' },
  { id: 'Black', label: 'Black', color: '#1C1C1C' },
];

export default function FilterEyeColor() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();

  useEffect(() => {
    setCurrentStep(5);
  }, [setCurrentStep]);

  const handleSelect = (eyeColor: string) => {
    updateConfig('eyeColor', eyeColor);
    navigate('/filter/body-type');
  };

  return (
    <FilterStepLayout 
      title="Select Eye Color"
      subtitle="Choose the eye color for your model"
      onBack={() => navigate('/filter/hair-color')}
    >
      <div className="grid grid-cols-3 gap-4">
        {eyeColorOptions.map((option) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            colorSwatch={option.color}
            selected={config.eyeColor === option.id}
            onClick={() => handleSelect(option.id)}
          />
        ))}
      </div>
    </FilterStepLayout>
  );
}
