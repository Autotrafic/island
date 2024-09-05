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
    case Steps.DETAILS_FORM:
      return 'Introducir datos';
    case Steps.CUSTOMERS_FILES:
      return 'Adjuntar documentos';
    case Steps.VEHICLE_FILES:
      return 'Adjuntar documentos vehículo';
    case Steps.CONCLUSION:
      return 'Documentación adjuntada correctamente';
  }
}

export function checkFilledForm(formValues: DetailsForm): boolean {
  const { vehiclePlate, shipmentAddressStreet, shipmentAddressCity, shipmentAddressPostalCode, buyerPhone, sellerPhone } =
    formValues;

  const isPhoneNumberFilled = (phone: PhoneNumber) => {
    return (
      phone.areaCode.trim() !== '' &&
      phone.countryCode !== undefined &&
      phone.isoCode.trim() !== '' &&
      phone.phoneNumber !== null &&
      phone.phoneNumber.trim() !== ''
    );
  };

  return (
    vehiclePlate.trim() !== '' &&
    shipmentAddressStreet.trim() !== '' &&
    shipmentAddressCity.trim() !== '' &&
    shipmentAddressPostalCode.trim() !== '' &&
    isPhoneNumberFilled(buyerPhone) &&
    isPhoneNumberFilled(sellerPhone)
  );
}
