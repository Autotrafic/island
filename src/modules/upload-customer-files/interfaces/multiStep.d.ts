interface IMultiStepContext {
  updateCurrentStep: (step: Steps | ((prevState: Steps) => Steps)) => void;
  updateToNextStep: () => void;
  updateToPreviousStep: () => void;

  currentStep: Steps;
  stepTitle: string;
}
