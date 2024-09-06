interface DocumentsData {
  orderId: string;
  detailsForm: DetailsForm;
  files: filesForms;
}

interface FilesForms {
  customers: ExtendedFile[];
  vehicle: ExtendedFile[];
}

interface DocumentsDataContext extends DocumentsData {
  updateDocumentsData: (setStateFunc: (prevOrder: DocumentsData) => DocumentsData) => void;
}
