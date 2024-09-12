import { useState } from 'react';
import NavigationButtons from '../components/NavigationButtons';
import { formatDetailsDataForExport } from '../utils/formatter';
import {
  updateOrderWithDocsDetails,
  updateTotalumOrderDocsFolderUrl,
  updateTotalumOrderWithDocsDetails,
} from '../services/order';
import DetailsForm from '../components/details-form';
import { checkFilledForm } from '../utils/functions';
import { useDocumentsData } from '../context/documentsData';
import { createInformationFile } from '../services/file';

export default function DetailsFormContainer() {
  const { orderId, detailsForm, updateDocumentsData } = useDocumentsData();

  const [formValues, setFormValues] = useState<DetailsForm>(detailsForm);

  const handleSubmit = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const detailsData = formatDetailsDataForExport(formValues);
        updateOrderWithDocsDetails(orderId, detailsData);
        updateTotalumOrderWithDocsDetails(orderId, detailsData);
        const driveOrderFolderId = await createInformationFile(orderId);
        await updateTotalumOrderDocsFolderUrl(orderId, driveOrderFolderId);
        updateDocumentsData((prev) => ({ ...prev, detailsForm: formValues }));

        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  };

  const isAllFormFilled = checkFilledForm(formValues);

  return (
    <>
      <DetailsForm formValues={formValues} setFormValues={setFormValues} />
      <NavigationButtons disabled={!isAllFormFilled} handleNext={handleSubmit} />
    </>
  );
}
