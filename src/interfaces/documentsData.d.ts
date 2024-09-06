interface DocumentsData {
  orderId: string;
  detailsForm: DetailsForm;
  files: ExtendedFile[];
}

interface DocumentsDataContext extends DocumentsData {
  updateDocumentsData: (setStateFunc: (prevOrder: DocumentsData) => DocumentsData) => void;
}
