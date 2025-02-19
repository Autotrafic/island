import { message } from "antd";

export function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function shouldRenderDateSeparator(currentTimestamp: number, previousTimestamp: number | null) {
  if (!previousTimestamp) return true;
  const currentDate = formatDate(currentTimestamp);
  const previousDate = formatDate(previousTimestamp);
  return currentDate !== previousDate;
}

export function getParticipantColor(senderId: string) {
  const hash = Array.from(senderId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colorIndex = hash % 10;
  const colors = [
    'text-red-500',
    'text-blue-500',
    'text-green-500',
    'text-yellow-500',
    'text-pink-500',
    'text-purple-500',
    'text-teal-500',
    'text-indigo-500',
    'text-gray-500',
    'text-orange-500',
  ];
  return colors[colorIndex];
}

export const copyToClipboard = (selectedText: string | undefined, messageBody?: string) => {
  const textToCopy = selectedText || messageBody;

  if (textToCopy)
    navigator.clipboard.writeText(textToCopy).then(() => {
      message.info('Copiado correctamente');
    });
};
