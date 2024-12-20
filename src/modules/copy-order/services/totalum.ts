import { TExtendedOrder } from '../../../shared/interfaces/totalum/pedido';
import { autotraficApi } from '../../../shared/services';

export async function getTotalumOrder(orderId: string) {
  try {
    const { order }: { order: TExtendedOrder } = await autotraficApi.order.getTotalum(orderId);
    
    return order;
  } catch (error: any) {
    throw new Error(`Error obteniendo el pedido: ${error.message}`);
  }
}
