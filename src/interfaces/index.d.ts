declare module '*.jpg'{
  const value: any;
  export = value;
};
declare module '*.jpeg';
declare module '*.png';
declare module '*.gif';
declare module '*.svg';

interface ExtendedFile extends File {
  preview: string;
  path: string;
  id: keyof Files;
  file: File;
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