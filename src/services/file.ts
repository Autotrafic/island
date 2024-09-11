import { autotraficApi } from '.';

export async function uploadFilesToDrive(files: File[], orderId: string) {
  await autotraficApi.files.upload(files, orderId);
}

export async function createInformationFile(orderId: string) {
  const orderData: DatabaseOrder = await autotraficApi.order.get(orderId);

  const folderName = orderData ? orderData.vehicle.plate : '❌ CARPETA SIN NOMBRE';

  await autotraficApi.files.createInformationFile({ orderData, folderName });
}
