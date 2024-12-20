import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, Card, message } from 'antd';
import { getTotalumOrder } from '../services/totalum';
import { isEmptyObject, parseOrderToRenderOrder } from '../parser';
import GeneralInfoCard from './GeneralInfoCard';
import { TExtendedOrder } from '../../../shared/interfaces/totalum/pedido';
import { getCardName } from '../utils/funcs';

export default function CopyOrder() {
  const { orderId } = useParams();
  const [messageApi, messageContextHolder] = message.useMessage();
  const [order, setOrder] = useState<TExtendedOrder>();

  const copyToClipboard = (value: any) => {
    navigator.clipboard.writeText(value).then(() => {
      messageApi.info(`${value} copiado correctamente`);
    });
  };

  useEffect(() => {
    if (orderId) {
      (async () => {
        try {
          const order = await getTotalumOrder(orderId);
          setOrder(order);
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
        {order ? (
          <div className="w-full max-w-[1250px] ">
            <GeneralInfoCard order={order} copyFunc={copyToClipboard} />
            <div className="w-full flex flex-wrap gap-5 justify-center">
              {Object.entries(parseOrderToRenderOrder(order)).map(([key, value]) => {
                if (!value || isEmptyObject(value) || key === 'general') return null;
                console.log(value);
                return (
                  <Card
                    key={key}
                    title={getCardName(key)}
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
                    {typeof value === 'object' && !Array.isArray(value) && (
                      <div className="flex flex-col gap-4">
                        {Object.entries(value).map(([fieldKey, fieldValue]: any) => {
                          if (!fieldValue) return null;

                          const { label, value = 'N/A' } = fieldValue;

                          return (
                            <div key={fieldKey} className="w-full flex gap-10 justify-between items-center">
                              <div className="flex gap-2 items-center">
                                <span className="font-semibold">{label}:</span>
                                <span>{value}</span>
                              </div>

                              <Button size="small" onClick={() => copyToClipboard(value)}>
                                Copiar
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                );
              })}
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
