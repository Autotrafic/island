interface WChat {
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  timestamp: number;
  lastMessage: { viewed: boolean | undefined; body: string };
  profilePicUrl?: string;
}

interface WMessage {
  id: string;
  chatId: string;
  body: string;
  fromMe: boolean;
  viewed: boolean | undefined;
  timestamp: number;
  type: string;
  hasMedia: boolean;
  mediaUrl: string | undefined;
  mimetype: string | undefined;
  senderId: string;
  senderName: string;
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
