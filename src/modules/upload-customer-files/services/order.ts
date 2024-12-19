import { autotraficApi } from '../../../shared/services';

type UpdateOrderWithDocsDetails = (orderId: string, newData: UpdateOrderNestedPropertiesBody) => Promise<void>;

export const getOrderById = async (orderId: string) => {
  const order = await autotraficApi.order.get(orderId);
  return order ?? null;
};

export const updateOrderWithDocsDetails: UpdateOrderWithDocsDetails = async (orderId, newData) => {
  await autotraficApi.order.update(orderId, newData);
};

export const updateTotalumOrderWithDocsDetails: UpdateOrderWithDocsDetails = async (orderId, newData) => {
  await autotraficApi.order.updateTotalumOrderDocsDetails({ orderId, ...newData });
};

export const updateTotalumOrderDocsFolderUrl = async (orderId: string, driveFolderId: string) => {
  await autotraficApi.order.updateTotalumOrderDocsUrl(orderId, driveFolderId);
};
