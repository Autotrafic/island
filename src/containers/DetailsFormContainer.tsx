import { useState } from 'react';
import NavigationButtons from '../components/NavigationButtons';
import { formatDetailsDataForExport } from '../utils/formatter';
import { updateOrderWithDocsDetails } from '../services/order';
import DetailsForm from '../components/details-form';
import { detailsFormInitialState } from '../utils/initialStates';
import { checkFilledForm } from '../utils/functions';

export default function DetailsFormContainer() {
  const [formValues, setFormValues] = useState<FormValues>(detailsFormInitialState);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const detailsData = formatDetailsDataForExport(formValues);
      await updateOrderWithDocsDetails('gkkdt3d8lnhuo8ryh55rsgou', detailsData);
      setLoading(false);
    } catch (error) {
      setLoading(false);
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
