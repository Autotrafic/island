import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, message, notification } from 'antd';
import { getTotalumOrder } from '../services/totalum';
import { isEmptyObject, parseOrderToRenderOrder } from '../parser';
import HeaderCard from './HeaderCard';
import { TExtendedOrder } from '../../../shared/interfaces/totalum/pedido';
import { PersonRenderOrder, RenderCard, RenderField, RenderOrder, VehicleRenderOrder } from '../interfaces/RenderOrder';
import { getCardSubtitleColor } from '../utils/funcs';
import { getAlertOptions } from '../../../shared/utils/funcs';
import { BuildingUserIcon } from '../../../shared/assets/icons';

export default function CopyOrder() {
  const { orderId } = useParams();

  const [messageApi, messageContextHolder] = message.useMessage();
  const [api, contextHolder] = notification.useNotification();

  const [order, setOrder] = useState<TExtendedOrder>();
  const [renderOrder, setRenderOrder] = useState<RenderOrder>();

  const copyToClipboard = (value: any) => {
    navigator.clipboard.writeText(value).then(() => {
      messageApi.info(`${value} copiado correctamente`);
    });
  };

  const openNotification = (success: boolean, message: string) => {
    if (!success) api.error(getAlertOptions('No se han podido obtener los datos', message));
  };

  useEffect(() => {
    if (orderId) {
      (async () => {
        try {
          const order = await getTotalumOrder(orderId);
          setOrder(order);
          setRenderOrder(parseOrderToRenderOrder(order));
        } catch (error: any) {
          openNotification(false, error.message);
          console.error('Error fetching order:', error);
        }
      })();
    }
  }, [orderId]);

  const renderPersonCard = (cardData: RenderCard<PersonRenderOrder> | RenderCard<VehicleRenderOrder> | null) => {
    const person = cardData?.data;
    if (!person || isEmptyObject(person)) return null;

    const personAsRecord = person as unknown as Record<string, RenderField<any> | null>;

    return (
      <Card
        key={cardData.title}
        title={
          <div className="w-full flex justify-between">
            <span className="flex items-center gap-4">
              {cardData.icon} {cardData.title}
            </span>
            {cardData.subtitle && (
              <span style={{ backgroundColor: getCardSubtitleColor(cardData.subtitle) }} className="px-2 rounded">
                {cardData.subtitle}
              </span>
            )}
          </div>
        }
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
        <div className="flex flex-col gap-4">{renderFields(personAsRecord)}</div>
      </Card>
    );
  };

  const renderFields = (data: Record<string, RenderField<any> | null>, parentKey: string = ''): JSX.Element[] => {
    return (
      <div className="flex flex-col gap-4">
        {Object.entries(data)
          .filter(([, fieldValue]: any) => fieldValue !== null)
          .map(([fieldKey, fieldValue]) => {
            const { label, value, buttons = [] } = fieldValue as RenderField<any>;
            if (!value) return null;

            // Nested fields
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
              return (
                <div key={parentKey + fieldKey} className="w-full">
                  
                  <h3 className="font-semibold text-base mb-2 flex gap-4 items-center">{BuildingUserIcon} {label}</h3>
                  <div className="pl-4">
                    {renderFields(value as Record<string, RenderField<any>>, `${parentKey + fieldKey}.`)}
                  </div>
                </div>
              );
            }

            // Default fields
            return (
              <div key={parentKey + fieldKey} className="w-full flex gap-10 justify-between items-center">
                <div className="flex gap-2 items-center">
                  <span className="font-semibold">{label}:</span>
                  <span>{value}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Button size="small" onClick={() => copyToClipboard(value)}>
                    Copiar
                  </Button>

                  {buttons.length > 0 && (
                    <>
                      {buttons.map((button: JSX.Element, index: number) => (
                        <>{button}</>
                      ))}
                    </>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    ) as any;
  };

  return (
    <div className="w-full min-h-screen bg-gray-200 p-10 flex flex-col justify-center">
      {contextHolder}
      {messageContextHolder}

      <div className="w-full flex justify-center">
        {order ? (
          <div className="w-full max-w-[1250px] ">
            <HeaderCard order={order} copyFunc={copyToClipboard} />
            <div className="w-full flex flex-wrap gap-5 justify-center">
              {renderOrder?.client && renderPersonCard(renderOrder.client)}
              {renderOrder?.relatedPerson && renderPersonCard(renderOrder.relatedPerson)}
              {renderOrder?.secondRelatedPerson && renderPersonCard(renderOrder.secondRelatedPerson)}
              {renderOrder?.partner && renderPersonCard(renderOrder.partner)}
              {renderOrder?.vehicle && renderPersonCard(renderOrder.vehicle)}
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
