import { BASE_API_URL } from '../utils/urls';

export const autotraficApi = {
  order: {
    get: (orderId: string) => makeRequest(`order/${orderId}`),
    update: (orderId: string, data: UpdateOrderNestedPropertiesBody) =>
      makeRequest(`order/documentsDetails/${orderId}`, data),
  },
  files: {
    upload: (files: File[], orderId: string) => fetchFiles('files/upload', files, orderId),
    createInformationFile: (data: CreateInformationFileBody) => makeRequest('files/create-information-file', data),
  },
};

type RequestParams = UpdateOrderNestedPropertiesBody | CreateInformationFileBody;

const makeRequest = async (endpoint: string, data?: RequestParams) => {
  try {
    const response = await fetch(`${BASE_API_URL}/${endpoint}`, {
      method: data ? 'POST' : 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : null,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      throw new Error('Failed to parse JSON');
    }

    return result;
  } catch (error) {
    console.error('Error during request:', error);
    throw error;
  }
};

async function fetchFiles(endpoint: string, files: File[], orderId: string) {
  try {
    const orderData: DatabaseOrder = await autotraficApi.order.get(orderId);

    const formData = new FormData();
    files.forEach((file: Blob) => {
      formData.append('files', file);
    });

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
