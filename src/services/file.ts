import { autotraficApi } from '.';
import { BASE_API_URL } from '../utils/urls';

export async function uploadFilesToDrive(files: File[], orderId: string) {
  await autotraficApi.files.upload(files, orderId);
}

export async function fetchFiles(endpoint: string, files: File[], orderId: string) {
  try {
    const orderData = await autotraficApi.order.get(orderId);

    const formData = new FormData();
    files.forEach((file: Blob) => {
      formData.append('files', file);
    });

    orderData && formData.append('orderData', JSON.stringify(orderData));
    formData.append('folderName', orderData ? orderData.vehicle.plate : '❌ CARPETA SIN NOMBRE');

    const response = await fetch(`${BASE_API_URL}/${endpoint}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (error) {
    throw new Error(error as string);
  }
}
