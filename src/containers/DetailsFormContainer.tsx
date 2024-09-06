import { useState } from 'react';
import NavigationButtons from '../components/NavigationButtons';
import { formatDetailsDataForExport } from '../utils/formatter';
import { updateOrderWithDocsDetails } from '../services/order';
import DetailsForm from '../components/details-form';
import { checkFilledForm } from '../utils/functions';
import { useModal } from '../context/modal';
import { useDocumentsData } from '../context/documentsData';

export default function DetailsFormContainer() {
  const { showModal } = useModal();
  const { orderId, detailsForm, updateDocumentsData } = useDocumentsData();

  const [formValues, setFormValues] = useState<DetailsForm>(detailsForm);

  const handleSubmit = () => {
    return new Promise(async (resolve, reject) => {
      try {
        const detailsData = formatDetailsDataForExport(formValues);
        await updateOrderWithDocsDetails(orderId, detailsData);
        updateDocumentsData((prev) => ({ ...prev, detailsForm: formValues }));

        resolve(true);
      } catch (error) {
        reject(new Error(error as string));
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
