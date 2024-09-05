import { Steps } from '../interfaces/enums';
import { getCurrentStepTitle } from './functions';

const emptyFile = new File([''], 'file.txt', { type: 'text/plain' });

export const multiStepContextInitialState: IMultiStepContext = {
  updateCurrentStep(newStep) {},
  updateToNextStep() {},
  updateToPreviousStep() {},
  currentStep: Steps.REQUIREMENTS,
  stepTitle: getCurrentStepTitle(Steps.REQUIREMENTS),
};

export const documentsDataInitialState: Documents = {
  vehiclePlate: '',
  shippingAddress: '',
  postalCode: '',
  buyerPhone: '',
  sellerPhone: '',
  buyerDocuments: { dniFrontal: emptyFile, dniBack: emptyFile },
  sellerDocuments: { dniFrontal: emptyFile, dniBack: emptyFile },
  vehicleDocuments: { contratoCompVent: emptyFile, permisoCirculacion: emptyFile, fichaTecnica: emptyFile },
};

export const detailsFormInitialState: FormValues = {
  vehiclePlate: '',
  shipmentAddressStreet: '',
  shipmentAddressCity: '',
  shipmentAddressPostalCode: '',
  buyerPhone: { areaCode: '', countryCode: 0, isoCode: '', phoneNumber: '' },
  sellerPhone: { areaCode: '', countryCode: 0, isoCode: '', phoneNumber: '' },
};
