import { autotraficApi } from '.';

export const updateOrderWithDocsDetails = async (orderId: string, newData: UpdateOrderNestedPropertiesBody) => {
  await autotraficApi.order.update(orderId, newData);
};
