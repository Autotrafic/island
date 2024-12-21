import { Form, Input } from 'antd';
import PhoneInput from 'antd-phone-input';
import { HomeIcon, CityIcon, PostalCodeIcon } from '../../../../shared/assets/icons';

interface DetailsFormProps {
  formValues: DetailsForm;
  setFormValues: React.Dispatch<React.SetStateAction<DetailsForm>>;
}

export default function DetailsForm({ formValues, setFormValues }: DetailsFormProps) {
  const [form] = Form.useForm();

  const handleFormChange = (changedValues: Partial<DetailsForm>, allValues: DetailsForm) => {
    setFormValues(allValues);
  };

  const phoneValidator = (_: any, { valid }: { valid: any }) => {
    if (valid()) return Promise.resolve();
    return Promise.reject('Número de teléfono inválido');
  };

  const handleVehiclePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const upperCaseValue = e.target.value.toUpperCase();
    setFormValues({
      ...formValues,
      vehiclePlate: upperCaseValue,
    });
    form.setFieldsValue({ vehiclePlate: upperCaseValue });
  };

  return (
    <div className="w-full">
      <Form
        form={form}
        name="basic"
        initialValues={formValues}
        onValuesChange={handleFormChange}
        autoComplete="off"
        layout="vertical"
      >
        <Form.Item label="Matrícula del vehículo" name="vehiclePlate">
          <Input value={formValues.vehiclePlate} onChange={handleVehiclePlateChange} />
        </Form.Item>

        <Form.Item label="Dirección de envío del nuevo permiso de circulación">
          <Form.Item name="shipmentAddressStreet" style={{ marginBottom: 0 }}>
            <Input
              placeholder="Dirección"
              prefix={HomeIcon}
              value={formValues.shipmentAddressStreet}
              style={{ marginBottom: 10 }}
            />
          </Form.Item>

          <Form.Item name="shipmentAddressCity" style={{ marginBottom: 0 }}>
            <Input
              placeholder="Localidad"
              prefix={CityIcon}
              value={formValues.shipmentAddressCity}
              style={{ marginBottom: 10 }}
            />
          </Form.Item>

          <Form.Item name="shipmentAddressPostalCode">
            <Input
              placeholder="Código postal"
              prefix={PostalCodeIcon}
              value={formValues.shipmentAddressPostalCode}
              style={{ width: '50%', marginBottom: 0 }}
            />
          </Form.Item>

          <Form.Item name="buyerPhone" rules={[{ validator: phoneValidator }]} label="Teléfono del comprador">
            <PhoneInput enableSearch disableParentheses value={formValues.buyerPhone} preferredCountries={['es']} />
          </Form.Item>

          <Form.Item name="sellerPhone" rules={[{ validator: phoneValidator }]} label="Teléfono del vendedor">
            <PhoneInput enableSearch disableParentheses value={formValues.sellerPhone} preferredCountries={['es']} />
          </Form.Item>
        </Form.Item>
      </Form>
    </div>
  );
}
