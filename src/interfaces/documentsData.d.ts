interface DocumentsData {
  orderId: string;
  detailsForm: DetailsForm;
}

interface DocumentsDataContext {
  orderId: string;
  detailsForm: DetailsForm;

  updateDocumentsData: (setStateFunc: (prevOrder: DocumentsData) => DocumentsData) => void;
}
