import { Form, Input } from 'antd';
import { useState } from 'react';
import { HomeIcon, CityIcon, PostalCodeIcon } from '../assets/icons';
import PhoneInput from 'antd-phone-input';
import NavigationButtons from '../components/NavigationButtons';

export default function DetailsFormContainer() {
  return (
    <>
      <DetailsForm />
      <NavigationButtons />
    </>
  );
}

function DetailsForm() {
  const [form] = Form.useForm();
  const [formValues, setFormValues] = useState<FormValues>({
    vehicleRegistration: '',
    address: '',
    city: '',
    postalCode: '',
    buyerPhone: '',
    sellerPhone: '',
  });

  const handleFormChange = (changedValues: Partial<FormValues>, allValues: FormValues) => {
    setFormValues(allValues);
  };

  const phoneValidator = (_: any, { valid }: { valid: any }) => {
    if (valid()) return Promise.resolve();
    return Promise.reject('Número de teléfono inválido');
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
        <Form.Item label="Matrícula del vehículo" name="vehicleRegistration">
          <Input value={formValues.vehicleRegistration} />
        </Form.Item>

        <Form.Item label="Dirección de envío del nuevo permiso de circulación">
          <Form.Item name="shipmentAddressStreet" style={{ marginBottom: 0 }}>
            <Input placeholder="Dirección" prefix={HomeIcon} value={formValues.address} style={{ marginBottom: 10 }} />
          </Form.Item>

          <Form.Item name="shipmentAddressCity" style={{ marginBottom: 0 }}>
            <Input placeholder="Localidad" prefix={CityIcon} value={formValues.city} style={{ marginBottom: 10 }} />
          </Form.Item>

          <Form.Item name="shipmentAddressPostalCode">
            <Input
              placeholder="Código postal"
              prefix={PostalCodeIcon}
              value={formValues.postalCode}
              style={{ width: '50%', marginBottom: 0 }}
            />
          </Form.Item>

          <Form.Item name="buyerPhone" rules={[{ validator: phoneValidator }]} label="Teléfono del comprador">
            <PhoneInput enableSearch value={formValues.buyerPhone} />
          </Form.Item>

          <Form.Item name="sellerPhone" rules={[{ validator: phoneValidator }]} label="Teléfono del vendedor">
            <PhoneInput enableSearch value={formValues.sellerPhone} />
          </Form.Item>
        </Form.Item>
      </Form>
    </div>
  );
}
