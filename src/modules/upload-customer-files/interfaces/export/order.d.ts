interface UpdateOrderNestedPropertiesBody {
  vehiclePlate: string;
  shipmentAddress: { address: string; city: string; postalCode: string };
  buyerPhone: string;
  sellerPhone: string;
}

interface UpdateTotalumOrderDetailsBody extends UpdateOrderNestedPropertiesBody {
  orderId: string;
}

interface UpdateTotalumOrderDocsUrlBody {
  orderId: string;
  driveFolderId: string;
}
