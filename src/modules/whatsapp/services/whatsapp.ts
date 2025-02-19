import axios from 'axios';
import { WHATSAPP_API_URL } from '../../../shared/utils/urls';

export async function getChatsByMessage(message: string) {
  try {
    const chatsResponse = await axios.post(`${WHATSAPP_API_URL}/messages/search-chats-by-message`, {
      searchString: message,
    });

    return chatsResponse.data.chatsContainingMessage;
  } catch (error) {
    const errorReceived = error as any;
    throw new Error(`Error obteniendo los chats por mensaje: ${errorReceived.message}`);
  }
}

export async function editMessage(messageId: string, newMessage: string) {
  try {
    await axios.post(`${WHATSAPP_API_URL}/messages/edit`, { messageId, newMessage });
  } catch (error) {
    const errorReceived = error as any;
    throw new Error(`Error obteniendo los chats por mensaje: ${errorReceived.message}`);
  }
}
