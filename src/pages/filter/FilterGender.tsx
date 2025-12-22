import { useNavigate } from 'react-router-dom';
import { useModelConfig } from '@/context/ModelConfigContext';
import { FilterStepLayout } from '@/components/FilterStepLayout';
import { SelectionCard } from '@/components/SelectionCard';
import { useEffect } from 'react';
import { User, Users } from 'lucide-react';

const genderOptions = [
  { id: 'Male', label: 'Male', icon: <User className="h-8 w-8" /> },
  { id: 'Female', label: 'Female', icon: <Users className="h-8 w-8" /> },
];

export default function FilterGender() {
  const navigate = useNavigate();
  const { config, updateConfig, setCurrentStep } = useModelConfig();

  useEffect(() => {
    setCurrentStep(1);
  }, [setCurrentStep]);

  const handleSelect = (gender: string) => {
    updateConfig('gender', gender);
    // Clear beard type if switching from male to female
    if (gender === 'Female') {
      updateConfig('beardType', '');
    }
    navigate('/filter/ethnicity');
  };

  return (
    <FilterStepLayout 
      title="Select Gender"
      subtitle="Choose the gender for your fashion model"
      onBack={() => navigate('/')}
    >
      <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
        {genderOptions.map((option) => (
          <SelectionCard
            key={option.id}
            title={option.label}
            icon={option.icon}
            selected={config.gender === option.id}
            onClick={() => handleSelect(option.id)}
          />
        ))}
      </div>
    </FilterStepLayout>
  );
}
