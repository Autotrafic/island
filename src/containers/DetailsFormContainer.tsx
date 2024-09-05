import { useState } from 'react';
import NavigationButtons from '../components/NavigationButtons';
import { formatDetailsDataForExport } from '../utils/formatter';
import { updateOrderWithDocsDetails } from '../services/order';
import DetailsForm from '../components/details-form';
import { detailsFormInitialState } from '../utils/initialStates';

export default function DetailsFormContainer() {
  const [formValues, setFormValues] = useState<FormValues>(detailsFormInitialState);

  const handleSubmit = async () => {
    const detailsData = formatDetailsDataForExport(formValues);
    await updateOrderWithDocsDetails('gkkdt3d8lnhuo8ryh55rsgou', detailsData);
  };

  return (
    <>
      <DetailsForm formValues={formValues} setFormValues={setFormValues} />
      <NavigationButtons handleNext={handleSubmit} />
    </>
  );
}
