import { message } from 'antd';
import { Whatsapp } from './Whatsapp';
import { useEffect, useState } from 'react';
import { getWhatsappSession, updateWhatsappSession, createWhatsappSession } from '../services/totalum';
import { TSesionWhatsappEstado } from '../interfaces/enums';

export default function WhatsappAuth() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [inputSessionId, setInputSessionId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showCreateSession, setShowCreateSession] = useState<boolean>(false);
  const [newSessionId, setNewSessionId] = useState<string>('');
  const [newSessionInput, setNewSessionInput] = useState<string>('');
  const [newSessionLoading, setNewSessionLoading] = useState<boolean>(false);

  useEffect(() => {
    const storedSessionId = localStorage.getItem('whatsappSessionId');
    if (storedSessionId) {
      validateAndUseSession(storedSessionId, true);
    }
  }, []);

  const validateAndUseSession = async (id: string, isAutoLogin: boolean = false) => {
    setLoading(true);
    try {
      const session = await getWhatsappSession(id);

      if (
        (isAutoLogin && session.estado === TSesionWhatsappEstado.EnUso) ||
        (!isAutoLogin && session.estado === TSesionWhatsappEstado.Disponible)
      ) {
        if (!isAutoLogin) {
          await updateWhatsappSession(id, TSesionWhatsappEstado.EnUso);
        }

        setSessionId(id);
        localStorage.setItem('whatsappSessionId', id);
        message.success('Sesión validada correctamente!');
      } else {
        message.error(isAutoLogin ? 'La sesión ya está en uso.' : 'Ésta sesión no está disponible.');
        if (!isAutoLogin) {
          localStorage.removeItem('whatsappSessionId');
        }
      }
    } catch (error) {
      message.error('No se ha podido validar la sesión. Revisa el ID.');
      localStorage.removeItem('whatsappSessionId');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputSessionId) {
      message.error('Por favor introduce un ID de sesión.');
      return;
    }
    await validateAndUseSession(inputSessionId);
  };

  const handleCreateSession = async () => {
    if (!newSessionInput) {
      message.error('Por favor introduce un ID de sesión.');
      return;
    }
    setNewSessionLoading(true);
    try {
      const session = await getWhatsappSession(newSessionInput);
      if (session.estado === TSesionWhatsappEstado.Disponible) {
        const newSession = await createWhatsappSession();
        setNewSessionId(newSession);
        message.success('Se ha creado la sesión correctamente!');
      } else {
        message.error('El ID de sesión no está disponible.');
      }
    } catch (error) {
      message.error('No se ha podido crear la sesión.');
    } finally {
      setNewSessionLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('ID de sesión copiado correctamente');
  };

  if (sessionId) {
    return <Whatsapp />;
  }

  return (
    <div className="flex items-start justify-center pt-20 h-screen bg-gray-900 relative">
      <div
        className="absolute top-4 right-4 text-sm text-gray-400 underline cursor-pointer hover:text-gray-300"
        onClick={() => setShowCreateSession(!showCreateSession)}
      >
        Crear sesión
      </div>

      <form onSubmit={handleLogin} className="p-8 bg-gray-800 rounded-lg shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Iniciar sesión</h2>
        <input
          type="text"
          value={inputSessionId}
          onChange={(e) => setInputSessionId(e.target.value)}
          placeholder="Introduce el ID de la sesión"
          className="mb-6 p-3 border-2 border-gray-700 rounded-lg w-full bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-300"
          disabled={loading}
        >
          {loading ? 'Validating...' : 'Entrar'}
        </button>
      </form>

      {showCreateSession && (
        <div className="absolute top-20 right-4 p-6 bg-gray-800 rounded-lg shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-4">Crear sesión</h3>
          <input
            type="text"
            value={newSessionInput}
            onChange={(e) => setNewSessionInput(e.target.value)}
            placeholder="Introduce el ID de la sesión"
            className="mb-4 p-2 border-2 border-gray-700 rounded-lg w-full bg-gray-700 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            onClick={handleCreateSession}
            className="w-full p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-300 transition-colors duration-300"
            disabled={newSessionLoading}
          >
            {newSessionLoading ? 'Creating...' : 'Crear'}
          </button>
          {newSessionId && (
            <div className="mt-4 p-2 bg-gray-700 rounded-lg text-white flex justify-between items-center gap-4">
              <span>ID de la nueva sesión: {newSessionId}</span>
              <button
                onClick={() => copyToClipboard(newSessionId)}
                className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Copiar
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
