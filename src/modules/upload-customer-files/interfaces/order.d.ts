interface WebOrder {
  orderId: string;
  isProduction: boolean;
  isReferralValid: boolean;
  itp: IOrderITP;
  prices: IOrderPrices;
  crossSelling: IOrderCrossSelling;
  vehicle: ICarSpecifications | IMotorbikeSpecifications;
  user: IRegisterOrderUser;
}

interface WebOrderDetails {
  vehicle: { plate: string };
  user: { shipmentAddress: string };
  buyer: { phoneNumber: string };
  seller: { phoneNumber: string };
}

interface IOrderITP {
  ITP: number;
  valorFiscal: number;
  imputacionItp: number;
  valorDepreciacion: number;
}

interface IOrderPrices {
  basePrice: number;
  totalPrice: string;
  highTicketOrderFee: number;
  referralDiscount: number;
}

interface IRegisterOrderUser {
  fullName: string;
  phoneNumber: string;
  email: string;
  buyerCommunity: AutonomousCommunityValue;
}
interface ICarSpecifications extends ICar {
  type: VehicleType.CAR;
  registrationDate: string;
  brand: string;
}

interface IMotorbikeSpecifications extends IMotorbike {
  type: VehicleType.MOTORBIKE;
  registrationDate: string;
}

interface IOrderCrossSelling {
  etiquetaMedioambiental: boolean;
  informeDgt: boolean;
}
