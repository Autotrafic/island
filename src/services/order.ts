import { autotraficApi } from '.';

export const updateOrderWithDocsDetails = (orderId: string, newData: UpdateOrderNestedPropertiesBody) => {
  console.log('newdata', newData);
  autotraficApi.order.update(orderId, newData);
};
