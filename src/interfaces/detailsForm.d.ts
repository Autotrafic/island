interface DetailsForm {
  vehiclePlate: string;
  shipmentAddressStreet: string;
  shipmentAddressCity: string;
  shipmentAddressPostalCode: string;
  buyerPhone: PhoneNumber;
  sellerPhone: PhoneNumber;
}

interface PhoneNumber {
  areaCode: string;
  countryCode: number;
  isoCode: string;
  phoneNumber: string;
}
