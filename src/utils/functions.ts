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
      return 'Introduce los datos';
    case Steps.CUSTOMERS_FILES:
      return 'Adjunta los documentos';
    case Steps.VEHICLE_FILES:
      return 'Adjunta los documentos del vehículo';
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

interface Dropzone {
  id: keyof CustomersFiles | keyof VehicleFiles;
  files: ExtendedFile[];
  title: string;
}

export type GetDropzoneFunc = (files: ExtendedFile[]) => Dropzone[];

export const getCustomersDropzones: GetDropzoneFunc = (files) => {
  const buyerDniFront = files.filter((file) => file.id === 'buyerDniFront');
  const buyerDniBack = files.filter((file) => file.id === 'buyerDniBack');
  const sellerDniFront = files.filter((file) => file.id === 'sellerDniFront');
  const sellerDniBack = files.filter((file) => file.id === 'sellerDniBack');

  return [
    {
      id: 'buyerDniFront',
      files: buyerDniFront,
      title: 'DNI Comprador frontal',
    },
    {
      id: 'buyerDniBack',
      files: buyerDniBack,
      title: 'DNI Comprador trasero',
    },
    {
      id: 'sellerDniFront',
      files: sellerDniFront,
      title: 'DNI Vendedor frontal',
    },
    {
      id: 'sellerDniBack',
      files: sellerDniBack,
      title: 'DNI Vendedor trasero',
    },
  ];
};

export const getVehicleDropzones: GetDropzoneFunc = (files) => {
  const permisoCirculacion = files.filter((file) => file.id === 'permisoCirculacion');
  const fichaTecnica = files.filter((file) => file.id === 'fichaTecnica');
  const contratoCompVent = files.filter((file) => file.id === 'contratoCompVent');
  const padron = files.filter((file) => file.id === 'padron');

  return [
    {
      id: 'permisoCirculacion',
      files: permisoCirculacion,
      title: 'Permiso de circulación',
    },
    {
      id: 'fichaTecnica',
      files: fichaTecnica,
      title: 'Ficha técnica',
    },
    {
      id: 'contratoCompVent',
      files: contratoCompVent,
      title: 'Contrato de compraventa o factura',
    },
    {
      id: 'padron',
      files: padron,
      title: 'Padron',
    },
  ];
};