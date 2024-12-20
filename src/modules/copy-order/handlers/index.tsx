import { TExtendedOrder } from '../../../shared/interfaces/totalum/pedido';

export function validateOrder(order: TExtendedOrder) {
  if (!order) throw new Error(`No se ha podido encontrar el pedido`);

  if (!order.cliente) throw new Error(`El pedido no contiene cliente relacionado`);

  if (order.persona_relacionada && order.persona_relacionada.length > 2)
    throw new Error(`El pedido contiene más de 2 personas relacionadas`);
}
