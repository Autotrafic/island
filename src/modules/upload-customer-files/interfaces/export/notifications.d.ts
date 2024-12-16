interface SendNotificationBody {
  message: string;
  channel?: 'whatsapp_messages' | 'orders';
}
interface SendWhatsAppNotificationBody extends SendNotificationBody {
  phoneNumber: string;
}
