interface ExtendedFile extends File {
  preview: string;
  id: keyof Files;
}

interface Documents {
  vehiclePlate: string;
  shippingAddress: string;
  postalCode: string;
  buyerPhone: string;
  sellerPhone: string;

  buyerDocuments: CustomerFiles;
  sellerDocuments: CustomerFiles;
  vehicleDocuments: VehicleFiles;
}

interface CustomerFiles {
  dniFrontal: File;
  dniBack: File;
}

interface VehicleFiles {
  permisoCirculacion: File;
  fichaTecnica: File;
  contratoCompVent: File;
  padron?: File;
}

interface CustomersFiles {
  buyerDniFront: ExtendedFile;
  buyerDniBack: ExtendedFile;
  sellerDniFront: ExtendedFile;
  sellerDniBack: ExtendedFile;
}

type Files = VehicleFiles & CustomersFiles;