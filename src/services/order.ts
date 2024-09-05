import { autotraficApi } from '.';

export const updateNestedOrder = async (orderId: string, newData: UpdateOrderNestedPropertiesBody) => {
  await autotraficApi.order.update(orderId, newData);
};
