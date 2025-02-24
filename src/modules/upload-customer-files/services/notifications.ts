import { autotraficApi } from '../../../shared/services';
import { createWhatsAppConfirmationMessage } from '../utils/functions';

async function sendWhatsAppConfirmation(order: DatabaseOrder) {
  const message = createWhatsAppConfirmationMessage(order);

  const phoneNumber = order.user.phoneNumber.replace(/\D/g, '');

  await autotraficApi.notification.sendWhatsapp({ phoneNumber, message });
}

async function sendSlackConfirmation(order: DatabaseOrder) {
  const message = `Se han subido los documentos para la matrícula: ${order.vehicle.plate}.
  
✏️ Ya se pueden enviar los mandatos`;

  await autotraficApi.notification.sendSlack({ message, channel: 'orders' });
}

export async function sendConfirmationNotifications(orderId: string) {
  const order = await autotraficApi.order.get(orderId);

  sendWhatsAppConfirmation(order);
  sendSlackConfirmation(order);
}
