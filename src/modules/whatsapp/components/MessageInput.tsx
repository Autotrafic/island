import React, { Dispatch, SetStateAction, useState } from 'react';
import { Button, Upload, message as antdMessage, UploadFile } from 'antd';
import axios from 'axios';
import { UploadOutlined } from '@ant-design/icons';
import { WHATSAPP_API_URL } from '../../../shared/utils/urls';
import { WMessage } from '../interfaces';

interface MessageInputProps {
  newMessage: string;
  loadingSendMessage: boolean;
  selectedChatId: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  setLoadingSendMessage: Dispatch<SetStateAction<boolean>>;
  setMessages: Dispatch<SetStateAction<WMessage[]>>
}

export const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  loadingSendMessage,
  selectedChatId,
  onMessageChange,
  onSendMessage,
  setLoadingSendMessage,
  setMessages
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleUpload = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
  };

  const handleSendMedia = async () => {
    if (!selectedChatId || fileList.length === 0) {
      antdMessage.error('Please enter a Chat ID and select at least one file.');
      return;
    }

    setLoadingSendMessage(true);

    try {
      const formData = new FormData();

      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('files', file.originFileObj);
        }
      });

      formData.append('chatId', selectedChatId);
      if (newMessage) formData.append('message', newMessage);

      const response = await axios.post(`${WHATSAPP_API_URL}/messages/send-any-chat`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedMessages = await axios.get(`${WHATSAPP_API_URL}/messages/chat-messages/${selectedChatId}`);
      setMessages((prev) => [
        ...prev.filter((m) => m.chatId !== selectedChatId),
        ...updatedMessages.data.messages.map((msg: WMessage) => ({ ...msg, chatId: selectedChatId })),
      ]);

      setFileList([]);
      onMessageChange('');
    } catch (error) {
      antdMessage.error('Error sending media.');
    } finally {
      setLoadingSendMessage(false);
    }
  };

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
      <div className="flex flex-col gap-2 items-center pl-2">
        <div className="w-full">
          <Upload multiple beforeUpload={() => false} onChange={handleUpload} fileList={fileList} style={{ width: '100%' }}>
            <Button icon={<UploadOutlined />} style={{ width: '100%' }} />
          </Upload>
        </div>

        <Button onClick={handleSendMedia} type="primary" loading={loadingSendMessage}>
          Enviar
        </Button>
      </div>
    </div>
  );
};
