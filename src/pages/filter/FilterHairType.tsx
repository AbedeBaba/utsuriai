import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect } from 'react';

const hairTypeOptions = [
  { id: 'Straight', label: 'Straight', subtitle: 'Sleek and smooth' },
  { id: 'Wavy', label: 'Wavy', subtitle: 'Soft waves' },
  { id: 'Curly', label: 'Curly', subtitle: 'Defined curls' },
  { id: 'Coily', label: 'Coily', subtitle: 'Tight coils' },
  { id: 'Kinky', label: 'Kinky', subtitle: 'Dense texture' },
  { id: 'Bald', label: 'Bald', subtitle: 'Clean shaved' },
  { id: 'Short', label: 'Short', subtitle: 'Cropped style' },
  { id: 'Long', label: 'Long', subtitle: 'Flowing length' },
  { id: 'Braided', label: 'Braided', subtitle: 'Styled braids' },
];

export default function FilterHairType() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();

  useEffect(() => {
    setCurrentStep(7);
  }, [setCurrentStep]);

  const handleSelect = (hairType: string) => {
    updateConfig('hairType', hairType);
    // If male, go to beard type; otherwise go to clothing
    if (config.gender === 'Male') {
      navigate('/filter/beard-type');
    } else {
      navigate('/clothing');
    }
  };

  return (
    <FilterStepLayout 
      title="Select Hair Type"
      subtitle="Choose the hair type for your model"
      onBack={() => navigate('/filter/body-type')}
    >
      <div className="grid grid-cols-3 gap-4">
        {hairTypeOptions.map((option) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            subtitle={option.subtitle}
            selected={config.hairType === option.id}
            onClick={() => handleSelect(option.id)}
          />
        ))}
      </div>
    </FilterStepLayout>
  );
}
