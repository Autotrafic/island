import { autotraficApi } from '.';
import { BASE_API_URL } from '../utils/urls';

export async function uploadFilesToDrive(files: ExtendedFile[], orderId: string) {
  await autotraficApi.files.upload(files, orderId);
}

export async function fetchFiles(endpoint: string, files: ExtendedFile[], orderId: string) {
  const orderData = await autotraficApi.order.get(orderId);

  const formData = new FormData();
  files.forEach((file: Blob) => {
    formData.append('files', file);
  });

  orderData && formData.append('orderData', JSON.stringify(orderData));
  formData.append('folderName', orderData ? orderData.vehicle.plate : '❌ NO FOLDER NAME');

  await fetch(`${BASE_API_URL}/${endpoint}`, {
    method: 'POST',
    body: formData,
  });
}
