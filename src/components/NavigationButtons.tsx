import { Button } from 'antd';
import { useMultiStep } from '../context/multiStep';
import { Steps } from '../interfaces/enums';

interface NavigationButtonsProps {
  isOnlyNext?: boolean;
  disabled?: boolean;
  loading?: boolean;
  handleNext?: () => Promise<void>;
}

function NavigationButtons({
  isOnlyNext,
  disabled,
  loading,
  handleNext = () =>
    new Promise((res) => {
      res();
    }),
}: NavigationButtonsProps) {
  const { updateCurrentStep } = useMultiStep();

  const navigateToPreviousStep = () => {
    updateCurrentStep((prevStep: Steps) => prevStep - 1);
  };

  const navigateToNextStep = async () => {
    try {
      await handleNext();
      updateCurrentStep((prevStep: Steps) => prevStep + 1);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={`w-full flex align-center justify-${isOnlyNext ? 'end' : 'between'} mt-6`}>
      {!isOnlyNext && (
        <Button type="default" onClick={navigateToPreviousStep} style={{ background: 'transparent' }}>
          Atrás
        </Button>
      )}
      <Button type="primary" disabled={disabled} loading={loading} onClick={navigateToNextStep}>
        Siguiente
      </Button>
    </div>
  );
}

export default NavigationButtons;
