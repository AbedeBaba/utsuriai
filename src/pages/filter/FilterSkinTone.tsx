import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect } from 'react';

const skinToneOptions = [
  { id: 'Fair', label: 'Fair', color: '#FFE5D4' },
  { id: 'Light', label: 'Light', color: '#F5D0B5' },
  { id: 'Medium Light', label: 'Medium Light', color: '#D9A87C' },
  { id: 'Medium', label: 'Medium', color: '#C68642' },
  { id: 'Medium Dark', label: 'Medium Dark', color: '#8D5524' },
  { id: 'Dark', label: 'Dark', color: '#6B4423' },
  { id: 'Deep', label: 'Deep', color: '#4A2C17' },
  { id: 'Ebony', label: 'Ebony', color: '#3A1F0D' },
  { id: 'Olive', label: 'Olive', color: '#C4A77D' },
];

export default function FilterSkinTone() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();

  useEffect(() => {
    setCurrentStep(3);
  }, [setCurrentStep]);

  const handleSelect = (skinTone: string) => {
    updateConfig('skinTone', skinTone);
    navigate('/filter/hair-color');
  };

  return (
    <FilterStepLayout 
      title="Select Skin Tone"
      subtitle="Choose the skin tone for your model"
      onBack={() => navigate('/filter/ethnicity')}
    >
      <div className="grid grid-cols-3 gap-4">
        {skinToneOptions.map((option) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            colorSwatch={option.color}
            selected={config.skinTone === option.id}
            onClick={() => handleSelect(option.id)}
          />
        ))}
      </div>
    </FilterStepLayout>
  );
}
