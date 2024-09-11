import { createContext, ReactNode, useContext, useState } from 'react';
import { Steps } from '../interfaces/enums';
import { multiStepContextInitialState } from '../utils/initialStates';
import { getCurrentStepTitle, scrollToNextStep } from '../utils/functions';

const MultiStepStore = (): IMultiStepContext => {
  const [currentStep, setCurrentStep] = useState<Steps>(Steps.CONCLUSION);

  const stepTitle = getCurrentStepTitle(currentStep);

  return {
    updateCurrentStep(step: ((prevState: Steps) => Steps) | Steps) {
      setCurrentStep(step);
      scrollToNextStep();
    },
    updateToNextStep() {
      setCurrentStep((prevStep) => prevStep + 1);
    },
    updateToPreviousStep() {
      setCurrentStep((prevStep) => prevStep - 1);
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
