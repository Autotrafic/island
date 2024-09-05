interface UpdateOrderNestedPropertiesBody {
  generalData: {
    vehicle: { vechiclePlate: string };
    buyer: { phoneNumber: string; shipmentAddress: { street: string; city: string; postalCode: string } };
    seller: { phoneNumber: string };
  };
}
