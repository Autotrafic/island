import { TExtendedOrder } from '../../../shared/interfaces/totalum/pedido';

export function validateOrder(order: TExtendedOrder) {
  if (!order) throw new Error(`No se ha podido encontrar el pedido`);

  if (order.persona_relacionada && order.persona_relacionada.length > 2)
    throw new Error(`El pedido contiene más de 2 personas relacionadas`);

  if (order.cliente.representante && order.cliente.representante.length > 1)
    throw new Error('El cliente contiene más de 1 representante relacionado');

  for (let relatedPerson of order.persona_relacionada) {
    if (relatedPerson.cliente.representante && relatedPerson.cliente.representante.length > 1)
      throw new Error('La persona relacionada contiene más de 1 representante relacionado');
  }
}
