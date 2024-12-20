import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, message } from 'antd'; // Replace with actual parsing function import
import { DisplayOrder } from '../interfaces';
import { getTotalumOrder } from '../services/totalum';
import { parseOrderToDisplayOrder } from '../parser';
import GeneralInfoCard from './GeneralInfoCard';

export default function CopyOrder() {
  const { orderId } = useParams();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [displayOrder, setDisplayOrder] = useState<DisplayOrder>();

  const copyToClipboard = (value: any) => {
    navigator.clipboard.writeText(value).then(() => {
      messageApi.info(`${value} copiado correctamente`);
    });
  };

  const hasNonEmptyProperties = (obj: any): boolean => {
    return Object.values(obj || {}).some((value) => value !== null && value !== undefined && value !== '');
  };

  const renderProperty = (key: string, value: any, path: string, optionalButtons: any[] = []) => (
    <div key={path} className="flex items-center my-3 justify-between gap-4">
      <div className="flex gap-2">
        <span className="font-semibold">{key}:</span>
        <span>{value ?? 'N/A'}</span>
      </div>

      {value && (
        <div>
          <Button size="small" onClick={() => copyToClipboard(value)}>
            Copiar
          </Button>
          {optionalButtons.map((button, index) => (
            <button
              key={index}
              className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
              onClick={button.onClick}
            >
              {button.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const renderCard = (title: string, data: any, propertyPath: string, buttonConfig: any = []) => {
    if (!data || !hasNonEmptyProperties(data)) return null;

    return (
      <Card
        key={propertyPath}
        title={title}
        bordered={true}
        size="small"
        style={{
          fontFamily: 'Poppins',
          boxShadow: '0 3px 6px rgba(0, 0, 0, 0.1)',
          width: '100%',
          maxWidth: '400px',
          flex: '1 1 400px',
          marginBottom: '16px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {Object.entries(data).map(([key, value]) => {
          const path = `${propertyPath}.${key}`;
          const optionalButtons = buttonConfig.find((config: any) => config.propertyPath === path)?.buttons || [];
          return renderProperty(key, value, path, optionalButtons);
        })}
      </Card>
    );
  };

  useEffect(() => {
    if (orderId) {
      (async () => {
        try {
          const order = await getTotalumOrder(orderId);
          setDisplayOrder(parseOrderToDisplayOrder(order));
        } catch (error) {
          console.error('Error fetching order:', error);
        }
      })();
    }
  }, [orderId]);

  return (
    <div className="w-full min-h-screen bg-gray-200 p-10 flex flex-col justify-center">
      {messageContextHolder}
      <div className="w-full flex justify-center">
        {displayOrder ? (
          <div className="w-full max-w-[1250px] ">
            <GeneralInfoCard displayOrder={displayOrder} copyFunc={copyToClipboard} />
            <div className="w-full flex flex-wrap gap-5 justify-center">
              {renderCard('Comprador', displayOrder.client, 'client')}
              {renderCard('Vendedor', displayOrder.relatedPerson, 'relatedPerson')}
              {renderCard('Segundo vendedor', displayOrder.secondRelatedPerson, 'secondRelatedPerson')}
              {renderCard('Socio profesional', displayOrder.partner, 'partner')}
            </div>
          </div>
        ) : (
          <div>Cargando...</div>
        )}
      </div>
      <div className="flex flex-1"></div>
    </div>
  );
}
