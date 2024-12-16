interface DetailsForm {
  vehiclePlate: string;
  shipmentAddressStreet: string;
  shipmentAddressHouseNumber: string;
  shipmentAddressPostalCode: string;
  shipmentAddressCity: string;
  buyerPhone: PhoneNumber;
  sellerPhone: PhoneNumber;
}

interface PhoneNumber {
  areaCode: string;
  countryCode: number;
  isoCode: string;
  phoneNumber: string;
}
