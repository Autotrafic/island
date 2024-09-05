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
  const { detailsForm } = useDocumentsData();

  const [formValues, setFormValues] = useState<DetailsForm>(detailsForm);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const detailsData = formatDetailsDataForExport(formValues);
      await updateOrderWithDocsDetails('gkkdt3d8lnhuo8ryh55rsgou', detailsData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showModal();
      throw new Error(error as string);
    }
  };

  const isAllFormFilled = checkFilledForm(formValues);

  return (
    <>
      <DetailsForm formValues={formValues} setFormValues={setFormValues} />
      <NavigationButtons disabled={!isAllFormFilled} loading={loading} handleNext={handleSubmit} />
    </>
  );
}
