import { Button } from 'antd';
import { useMultiStep } from '../context/multiStep';
import { Steps } from '../interfaces/enums';

function NavigationButtons({ isOnlyNext }: { isOnlyNext?: boolean }) {
  const { updateCurrentStep } = useMultiStep();

  const navigateToPreviousStep = () => {
    updateCurrentStep((prevStep: Steps) => prevStep - 1);
  };

  const navigateToNextStep = () => {
    updateCurrentStep((prevStep: Steps) => prevStep + 1);
  };

  return (
    <div className={`w-full flex align-center justify-${isOnlyNext ? 'end' : 'between'} mt-6`}>
      {!isOnlyNext && (
        <Button type="default" onClick={navigateToPreviousStep} style={{ background: 'transparent' }}>
          Atrás
        </Button>
      )}
      <Button type="primary" onClick={navigateToNextStep}>
        Siguiente
      </Button>
    </div>
  );
}

export default NavigationButtons;
