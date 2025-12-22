import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect } from 'react';

const ethnicityOptions = [
  { id: 'Caucasian', label: 'Caucasian' },
  { id: 'African', label: 'African' },
  { id: 'Asian', label: 'Asian' },
  { id: 'Hispanic', label: 'Hispanic' },
  { id: 'Middle Eastern', label: 'Middle Eastern' },
  { id: 'South Asian', label: 'South Asian' },
  { id: 'Mixed', label: 'Mixed' },
  { id: 'Pacific Islander', label: 'Pacific Islander' },
  { id: 'Indigenous', label: 'Indigenous' },
];

export default function FilterEthnicity() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();

  useEffect(() => {
    setCurrentStep(2);
  }, [setCurrentStep]);

  const handleSelect = (ethnicity: string) => {
    updateConfig('ethnicity', ethnicity);
    navigate('/filter/skin-tone');
  };

  return (
    <FilterStepLayout 
      title="Select Ethnicity"
      subtitle="Choose the ethnicity for your model"
      onBack={() => navigate('/filter/gender')}
    >
      <div className="grid grid-cols-3 gap-4">
        {ethnicityOptions.map((option) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            selected={config.ethnicity === option.id}
            onClick={() => handleSelect(option.id)}
          />
        ))}
      </div>
    </FilterStepLayout>
  );
}
