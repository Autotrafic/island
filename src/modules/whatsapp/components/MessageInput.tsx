import React from 'react';
import { Button } from 'antd';

interface MessageInputProps {
  newMessage: string;
  loadingSendMessage: boolean;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  loadingSendMessage,
  onMessageChange,
  onSendMessage,
}) => {
  return (
    <div className="message-input p-2 border-t border-gray-300 flex">
      <textarea
        value={newMessage}
        onChange={(e) => onMessageChange(e.target.value)}
        placeholder="Escribe tu mensaje"
        className="flex-1 p-2 border border-gray-300 rounded-l"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
          }
        }}
      />
      <Button onClick={onSendMessage} type="primary" loading={loadingSendMessage} className="h-full ml-2">
        Enviar
      </Button>
    </div>
  );
};