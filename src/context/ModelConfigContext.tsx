import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface ModelConfig {
  gender: string;
  ethnicity: string;
  skinTone: string;
  hairColor: string;
  eyeColor: string;
  bodyType: string;
  hairType: string;
  beardType?: string;
  clothingTop?: string;
  clothingBottom?: string;
  shoes?: string;
  pose: string;
  background: string;
  facialExpression: string;
  faceType: string;
  modestOption: string;
}

// Filter steps configuration
export interface FilterStep {
  id: string;
  path: string;
  label: string;
  isCore: boolean;
  condition?: (config: ModelConfig) => boolean;
}

export const FILTER_STEPS: FilterStep[] = [
  { id: 'gender', path: '/filter/gender', label: 'Gender', isCore: true },
  { id: 'modestOption', path: '/filter/modest-option', label: 'Coverage', isCore: true, condition: (c) => c.gender === 'Female' },
  { id: 'ethnicity', path: '/filter/ethnicity', label: 'Ethnicity', isCore: false },
  { id: 'skinTone', path: '/filter/skin-tone', label: 'Skin Tone', isCore: false },
  { id: 'hairColor', path: '/filter/hair-color', label: 'Hair Color', isCore: false, condition: (c) => c.modestOption !== 'Hijab' },
  { id: 'eyeColor', path: '/filter/eye-color', label: 'Eye Color', isCore: false },
  { id: 'bodyType', path: '/filter/body-type', label: 'Body Type', isCore: false },
  { id: 'hairType', path: '/filter/hair-type', label: 'Hair Type', isCore: false, condition: (c) => c.modestOption !== 'Hijab' },
  { id: 'beardType', path: '/filter/beard-type', label: 'Beard Type', isCore: false, condition: (c) => c.gender === 'Male' },
  { id: 'pose', path: '/filter/pose', label: 'Pose', isCore: false },
  { id: 'background', path: '/filter/background', label: 'Background', isCore: false },
  { id: 'faceType', path: '/filter/face-type', label: 'Face Type', isCore: false },
  { id: 'facialExpression', path: '/filter/expression', label: 'Expression', isCore: false },
  { id: 'clothing', path: '/clothing', label: 'Clothing', isCore: false },
];

interface ModelConfigContextType {
  config: ModelConfig;
  updateConfig: (key: keyof ModelConfig, value: string) => void;
  resetConfig: () => void;
  resetSubsequentFilters: (fromKey: keyof ModelConfig) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
  getVisibleSteps: () => FilterStep[];
  isStepCompleted: (stepId: string) => boolean;
  isStepRequired: (stepId: string) => boolean;
  getNextStepPath: (currentStepId: string) => string | null;
}

const initialConfig: ModelConfig = {
  gender: '',
  ethnicity: '',
  skinTone: '',
  hairColor: '',
  eyeColor: '',
  bodyType: '',
  hairType: '',
  beardType: '',
  clothingTop: '',
  clothingBottom: '',
  shoes: '',
  pose: '',
  background: '',
  facialExpression: '',
  faceType: '',
  modestOption: '',
};

const ModelConfigContext = createContext<ModelConfigContextType | undefined>(undefined);

export function ModelConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ModelConfig>(initialConfig);
  const [currentStep, setCurrentStep] = useState(1);

  // Get visible steps based on current config
  const getVisibleSteps = useCallback((): FilterStep[] => {
    return FILTER_STEPS.filter(step => {
      if (!step.condition) return true;
      return step.condition(config);
    });
  }, [config]);

  const totalSteps = getVisibleSteps().length;

  // Check if a step is completed
  const isStepCompleted = useCallback((stepId: string): boolean => {
    if (stepId === 'clothing') return false; // Clothing is never "completed" until generation
    const value = config[stepId as keyof ModelConfig];
    return !!value && value.length > 0;
  }, [config]);

  // Check if a step is required (core step)
  const isStepRequired = useCallback((stepId: string): boolean => {
    const step = FILTER_STEPS.find(s => s.id === stepId);
    return step?.isCore ?? false;
  }, []);

  // Get the next step path from current step
  const getNextStepPath = useCallback((currentStepId: string): string | null => {
    const visibleSteps = getVisibleSteps();
    const currentIndex = visibleSteps.findIndex(s => s.id === currentStepId);
    if (currentIndex === -1 || currentIndex >= visibleSteps.length - 1) return null;
    return visibleSteps[currentIndex + 1].path;
  }, [getVisibleSteps]);

  // Reset filters that come after the specified key
  const resetSubsequentFilters = useCallback((fromKey: keyof ModelConfig) => {
    const stepIndex = FILTER_STEPS.findIndex(s => s.id === fromKey);
    if (stepIndex === -1) return;

    const subsequentSteps = FILTER_STEPS.slice(stepIndex + 1);
    
    setConfig(prev => {
      const newConfig = { ...prev };
      subsequentSteps.forEach(step => {
        if (step.id in newConfig) {
          (newConfig as Record<string, string>)[step.id] = '';
        }
      });
      return newConfig;
    });
  }, []);

  const updateConfig = useCallback((key: keyof ModelConfig, value: string) => {
    setConfig(prev => {
      // Check if this is a core field change (gender or modestOption)
      const isGenderChange = key === 'gender' && prev.gender !== value && prev.gender !== '';
      const isModestChange = key === 'modestOption' && prev.modestOption !== value && prev.modestOption !== '';
      
      const newConfig = { ...prev, [key]: value };
      
      // If gender changes, reset all subsequent filters
      if (isGenderChange) {
        const subsequentKeys: (keyof ModelConfig)[] = [
          'modestOption', 'ethnicity', 'skinTone', 'hairColor', 'eyeColor', 
          'bodyType', 'hairType', 'beardType', 'pose', 'background', 
          'faceType', 'facialExpression'
        ];
        subsequentKeys.forEach(k => {
          newConfig[k] = '';
        });
      }
      
      // If modest option changes (for females), reset subsequent filters
      if (isModestChange) {
        const subsequentKeys: (keyof ModelConfig)[] = [
          'ethnicity', 'skinTone', 'hairColor', 'eyeColor', 
          'bodyType', 'hairType', 'pose', 'background', 
          'faceType', 'facialExpression'
        ];
        subsequentKeys.forEach(k => {
          newConfig[k] = '';
        });
      }
      
      return newConfig;
    });
  }, []);

  const resetConfig = () => {
    setConfig(initialConfig);
    setCurrentStep(1);
  };

  return (
    <ModelConfigContext.Provider value={{ 
      config, 
      updateConfig, 
      resetConfig, 
      resetSubsequentFilters,
      currentStep, 
      setCurrentStep,
      totalSteps,
      getVisibleSteps,
      isStepCompleted,
      isStepRequired,
      getNextStepPath,
    }}>
      {children}
    </ModelConfigContext.Provider>
  );
}

export function useModelConfig() {
  const context = useContext(ModelConfigContext);
  if (context === undefined) {
    throw new Error('useModelConfig must be used within a ModelConfigProvider');
  }
  return context;
}
