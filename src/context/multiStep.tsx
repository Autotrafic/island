import { createContext, ReactNode, useContext, useState } from 'react';
import { Steps } from '../interfaces/enums';
import { multiStepContextInitialState } from '../utils/initialStates';
import { getCurrentStepTitle, scrollToNextStep } from '../utils/functions';

const MultiStepStore = (): IMultiStepContext => {
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.REQUIREMENTS);

  const stepTitle = getCurrentStepTitle(currentStep);

  return {
    updateCurrentStep(step: ((prevState: Steps) => Steps) | Steps) {
      setCurrentStep(step);
      scrollToNextStep();
    },

    currentStep,
    stepTitle,
  };
};

const MultiStepContext = createContext(multiStepContextInitialState);

export const useMultiStep = () => useContext(MultiStepContext);

export const MultiStepProvider = ({ children }: { children: ReactNode }) => {
  const multiStepStore = MultiStepStore();

  return <MultiStepContext.Provider value={multiStepStore}>{children}</MultiStepContext.Provider>;
};
