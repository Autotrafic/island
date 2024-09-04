interface IMultiStepContext {
  updateCurrentStep: (step: Steps | ((prevState: Steps) => Steps)) => void;
  currentStep: Steps;
  stepTitle: string;
}
