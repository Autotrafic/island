import { CheckGreenIcon, DocumentVisibleIcon, InfoGreyIcon, LightBulbIcon } from '../assets/icons';

export const REQUIRED_DOCS = [
  {
    title: 'DNIs Comprador y Vendedor',
    description: 'En caso de NIE, aportar documento donde se vea el rostro. En caso de empresa, aportar CIF',
    icon: CheckGreenIcon,
  },
  {
    title: 'Permiso de circulación del vehículo',
    icon: CheckGreenIcon,
  },
  {
    title: 'Ficha técnica del vehículo',
    icon: CheckGreenIcon,
  },
  {
    title: 'Contrato de compraventa',
    icon: CheckGreenIcon,
  },
  {
    title: 'Padrón del comprador',
    description: 'En caso que la dirección en el contrato de compraventa sea distinta a la del DNI',
    icon: InfoGreyIcon,
  },
];

export const REQUIRED_DOCS_CONDITION = [
  {
    title: 'Asegúrate que las 4 esquinas del documento sean visibles en la foto',
    description: 'Se debe ver el documento entero, sin recortes',
    icon: DocumentVisibleIcon,
  },
  {
    title: 'Toma las fotos con suficiente luminosidad',
    description: 'La foto debe tener suficiente luz para que el documento sea claramente visible',
    icon: LightBulbIcon,
  },
];
