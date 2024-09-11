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

export const defaultDocumentsData: DocumentsData = {
  orderId: '',
  detailsForm: {
    vehiclePlate: '',
    shipmentAddressStreet: '',
    shipmentAddressCity: '',
    shipmentAddressPostalCode: '',
    buyerPhone: { areaCode: '', countryCode: 0, isoCode: '', phoneNumber: '' },
    sellerPhone: { areaCode: '', countryCode: 0, isoCode: '', phoneNumber: '' },
  },
  files: { customers: [], vehicle: [] },
};

export const documentsDataContextInitialState: DocumentsDataContext = {
  updateDocumentsData(setStateFunc) {},
  ...defaultDocumentsData,
};
