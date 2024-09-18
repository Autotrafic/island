interface SendNotificationBody {
    message: string;
  }
interface SendWhatsAppNotificationBody extends SendNotificationBody {
    phoneNumber: string;
  }