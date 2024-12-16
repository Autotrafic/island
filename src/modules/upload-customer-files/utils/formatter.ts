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

export function renameFile(file: File, newName: string) {
  const extensionIndex = file.name.lastIndexOf('.');
  const extension = file.name.substring(extensionIndex);

  const newFileName = newName + extension;

  const renamedFile = new File([file], newFileName, { type: file.type });

  return renamedFile;
}
