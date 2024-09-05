import { autotraficApi } from '.';

export const getOrderById = async (orderId: string) => {
  const order = await autotraficApi.order.get(orderId);
  return order ?? null;
};

export const updateOrderWithDocsDetails = async (orderId: string, newData: UpdateOrderNestedPropertiesBody) => {
  await autotraficApi.order.update(orderId, newData);
};
