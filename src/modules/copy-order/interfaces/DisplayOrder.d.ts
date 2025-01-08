import { AutonomousCommunity, TOrderState, TOrderType } from '../../../shared/interfaces/enums';
import { TClientType } from '../../../shared/interfaces/totalum/cliente';
import { TOrderMandate } from '../../../shared/interfaces/totalum/pedido';

interface DisplayOrder {
  client: DisplayPerson;
  relatedPerson?: DisplayPerson;
  secondRelatedPerson?: DisplayPerson;
  partner?: DisplayPerson;
  general: GeneralOrderInfo;
}

interface DisplayPerson {
  type: TClientType;
  nif: string;
  name: string;
  firstSurname?: string;
  secondSurname?: string;
  address?: string;
  birthDate?: Date;
  representative?: {
    nif: string;
    name: string;
    firstSurname: string;
    secondSurname: string;
  };
  iae?: string;
}

interface GeneralOrderInfo {
  orderType: TOrderType;
  orderState: TOrderState;
  vehiclePlate: string;
  autonomousCommunity: AutonomousCommunity;
  mandate: TOrderMandate;
}