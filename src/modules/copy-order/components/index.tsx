import { useParams } from 'react-router-dom';
import { TExtendedOrder } from '../../../shared/interfaces/totalum/pedido';
import { useEffect, useState } from 'react';
import { getTotalumOrder } from '../services/totalum';

export default function CopyOrder() {
  const { orderId } = useParams();

  const [order, setOrder] = useState<TExtendedOrder>();

  useEffect(() => {
    if (orderId) {
      (async () => {
        try {
          const receivedOrder = await getTotalumOrder(orderId);
          setOrder(receivedOrder);
        } catch (error) {}
      })()
    }
  }, []);

  return (
    <>
      {order ? (
        <>
          <div>Matricula: {order.matricula}</div>
        </>
      ) : (
        <div>No se ha podido obtener el pedido!</div>
      )}
    </>
  );
}
