import { Steps } from '../interfaces/enums';

const ELEMENT_TO_SCROLL_ID = 'root';

export function scrollToNextStep() {
  const elementToScroll = document.getElementById(ELEMENT_TO_SCROLL_ID);

  if (elementToScroll && window.innerWidth < 600) {
    elementToScroll.scrollIntoView({ behavior: 'smooth' });
  }
}

export function getCurrentStepTitle(currentStep: Steps) {
  switch (currentStep) {
    case Steps.REQUIREMENTS:
      return 'Ten listos éstos documentos antes de empezar';
    case Steps.DATA_INPUTS:
      return 'Introducir datos';
    case Steps.CUSTOMERS_FILES:
      return 'Adjuntar documentos';
    case Steps.VEHICLE_FILES:
      return 'Adjuntar documentos vehículo';
    case Steps.CONCLUSION:
      return 'Documentación adjuntada correctamente';
  }
}
