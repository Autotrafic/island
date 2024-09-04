import { Button } from 'antd';
import { useMultiStep } from '../context/multiStep';
import { Steps } from '../interfaces/enums';

function NavigationButtons() {
  const { currentStep, updateCurrentStep } = useMultiStep();

  const isFirstStep = currentStep === Steps.REQUIREMENTS;

  const navigateToPreviousStep = () => {
    updateCurrentStep((prevStep: Steps) => prevStep - 1);
  };

  const navigateToNextStep = () => {
    updateCurrentStep((prevStep: Steps) => prevStep + 1);
  };

  return (
    <div className={`w-full flex align-center justify-${isFirstStep ? 'end' : 'between'} mt-6`}>
      {!isFirstStep && <Button type="default" onClick={navigateToPreviousStep} style={{background: 'transparent'}}>Atrás</Button>}
      <Button type="primary" onClick={navigateToNextStep}>Siguiente</Button>
    </div>
  );
}

export default NavigationButtons;
