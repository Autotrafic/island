import { createContext, ReactNode, useContext, useState } from 'react';
import { defaultDocumentsData, documentsDataContextInitialState } from '../utils/initialStates';

const DocumentsDataStore = (orderId: string): DocumentsDataContext => {
  const documentsDataInitialState: DocumentsData = { ...defaultDocumentsData, orderId };

  const [documentsData, setDocumentsData] = useState<DocumentsData>(documentsDataInitialState);

  const updateDocumentsData = (setStateFunc: (prevOrder: DocumentsData) => DocumentsData) => {
    setDocumentsData(setStateFunc);
  };

  return {
    orderId,
    detailsForm: documentsData.detailsForm,

    updateDocumentsData,
  };
};

const DocumentsDataContext = createContext<DocumentsDataContext>(documentsDataContextInitialState);

export const useDocumentsData = () => useContext(DocumentsDataContext);

export const DocumentsDataProvider = ({ orderId, children }: { orderId: string; children: ReactNode }) => {
  const documentsDataStore = DocumentsDataStore(orderId);

  return <DocumentsDataContext.Provider value={documentsDataStore}>{children}</DocumentsDataContext.Provider>;
};
