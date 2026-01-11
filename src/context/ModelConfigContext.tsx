import { createContext, useContext, useState, ReactNode } from 'react';

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

interface ModelConfigContextType {
  config: ModelConfig;
  updateConfig: (key: keyof ModelConfig, value: string) => void;
  resetConfig: () => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
  totalSteps: number;
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

  // Total steps: Gender, Coverage (female only), Ethnicity, Skin Tone, Hair Color, Eye Color, Body Type, Hair Type, 
  // Beard (male only), Pose, Background, Face Type, Facial Expression, Clothing
  const totalSteps = config.gender === 'Male' ? 12 : 12;

  const updateConfig = (key: keyof ModelConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const resetConfig = () => {
    setConfig(initialConfig);
    setCurrentStep(1);
  };

  return (
    <ModelConfigContext.Provider value={{ 
      config, 
      updateConfig, 
      resetConfig, 
      currentStep, 
      setCurrentStep,
      totalSteps 
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
