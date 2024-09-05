export function formatDetailsDataForExport(formValues: DetailsForm): UpdateOrderNestedPropertiesBody {
  const { vehiclePlate, buyerPhone, sellerPhone, shipmentAddressCity, shipmentAddressPostalCode, shipmentAddressStreet } =
    formValues;

  return {
    vehiclePlate,
    shipmentAddress: { address: shipmentAddressStreet, city: shipmentAddressCity, postalCode: shipmentAddressPostalCode },
    buyerPhone: `+${buyerPhone.countryCode} ${buyerPhone.areaCode}${buyerPhone.phoneNumber}`,
    sellerPhone: `+${sellerPhone.countryCode} ${sellerPhone.areaCode}${sellerPhone.phoneNumber}`,
  };
}
