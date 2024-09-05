import { BASE_API_URL } from '../utils/urls';

export const autotraficApi = {
  order: {
    update: (orderId: string, data: UpdateOrderNestedPropertiesBody) => makeRequest(`order/documentsDetails/${orderId}`, data),
  },
};

type RequestParams = UpdateOrderNestedPropertiesBody;

const makeRequest = async (endpoint: string, data?: RequestParams) => {
  const response = await fetch(`${BASE_API_URL}/${endpoint}`, {
    method: data ? 'POST' : 'GET',
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
    },
    body: data ? JSON.stringify({ ...data }) : null,
  });

  const result = await response.json();

  if (result) return result;
};
