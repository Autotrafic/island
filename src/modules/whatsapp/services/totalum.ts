import axios from 'axios';
import { BACKEND_API_URL } from '../../../shared/utils/urls';
import { TSesionWhatsappEstado } from '../interfaces/enums';
import { TSesionWhatsapp } from '../interfaces';

export async function createWhatsappSession(): Promise<string> {
  try {
    const newSession = await axios.get(`${BACKEND_API_URL}/totalum/whatsapp-session/create`);

    return newSession.data.newSessionId;
  } catch (error) {
    const errorReceived = error as any;
    throw new Error(`Error creando la sesión de whatsapp: ${errorReceived.message}`);
  }
}

export async function getWhatsappSession(sessionId: string): Promise<TSesionWhatsapp> {
  try {
    const session = await axios.get(`${BACKEND_API_URL}/totalum/whatsapp-session/${sessionId}`);

    return session.data;
  } catch (error) {
    const errorReceived = error as any;
    throw new Error(`Error obteniendo la sesión de whatsapp: ${errorReceived.message}`);
  }
}

export async function updateWhatsappSession(sessionId: string, newSessionState: TSesionWhatsappEstado) {
  try {
    await axios.post(`${BACKEND_API_URL}/totalum/whatsapp-session/update`, { sessionId, newSessionState });
  } catch (error) {
    const errorReceived = error as any;
    throw new Error(`Error modificando la sesión de whatsapp: ${errorReceived.message}`);
  }
}
