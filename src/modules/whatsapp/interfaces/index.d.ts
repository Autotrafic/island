import { WMessageType } from "./enums";

interface WChat {
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  timestamp: number;
  lastMessage: { viewed: boolean | undefined; fromMe: boolean; body: string };
  profilePicUrl?: string;
}

interface WMessage {
  id: string;
  chatId: string;
  body: string;
  fromMe: boolean;
  viewed: boolean | undefined;
  timestamp: number;
  type: WMessageType;
  hasMedia: boolean;
  mediaUrl: string | undefined;
  mimetype: string | undefined;
  senderId: string;
  senderPhone: string;
  link: { link: string; isSuspicious: boolean } | null;
  vCard: any;
  attachedContact: {
    name: string;
    phone: string;
    img: string;
  } | null;
}

interface SendMessagePayload {
  chatId: string;
  files: UploadFileData[];
  message?: string;
}

interface UploadFileData {
  base64Data: string;
  filename: string;
  mimetype: string;
}
