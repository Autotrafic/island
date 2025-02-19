import React, { Dispatch, SetStateAction, useState } from 'react';
import { Button, Upload, message as antdMessage, UploadFile } from 'antd';
import axios from 'axios';
import { CloseOutlined, UploadOutlined } from '@ant-design/icons';
import { WHATSAPP_API_URL } from '../../../shared/utils/urls';
import { WChat, WMessage } from '../interfaces';

interface MessageInputProps {
  selectedChat: WChat;
  quotedMessage: WMessage | null;
  setMessages: Dispatch<SetStateAction<WMessage[]>>;
  setQuotedMessage: Dispatch<SetStateAction<WMessage | null>>;
  setFilteredChats: Dispatch<SetStateAction<WChat[]>>;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  selectedChat,
  quotedMessage,
  setMessages,
  setQuotedMessage,
  setFilteredChats
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [loadingSendMessage, setLoadingSendMessage] = useState<boolean>(false);

  const handleUpload = ({ fileList }: { fileList: UploadFile[] }) => {
    setFileList(fileList);
  };

  const sendMessage = async () => {
    setLoadingSendMessage(true);

    try {
      const formData = new FormData();

      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('files', file.originFileObj);
        }
      });

      formData.append('chatId', selectedChat?.id);
      if (newMessage) formData.append('message', newMessage);
      if (quotedMessage) formData.append('quotedMessageId', quotedMessage.id._serialized);

      await axios.post(`${WHATSAPP_API_URL}/messages/send-any-chat`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const updatedMessages = await axios.get(`${WHATSAPP_API_URL}/messages/chat-messages/${selectedChat?.id}`);
      setMessages((prev) => [
        ...prev.filter((m) => m.chatId !== selectedChat?.id),
        ...updatedMessages.data.messages.map((msg: WMessage) => ({ ...msg, chatId: selectedChat?.id })),
      ]);

      setFilteredChats((prev) => {
        const chatIndex = prev.findIndex((c) => c.id === selectedChat?.id);
        const chat = prev[chatIndex];
        chat.lastMessage = updatedMessages.data.messages[updatedMessages.data.messages.length - 1];
        return [...prev.filter((c) => c.id !== selectedChat?.id), chat];
      });

      setFileList([]);
      setNewMessage('');
      setQuotedMessage(null);
    } catch (error) {
      antdMessage.error('Error sending media.');
    } finally {
      setLoadingSendMessage(false);
    }
  };

  return (
    <div className="message-input-container">
      {/* Quoted message */}
      {quotedMessage && (
        <div className="quoted-message-container p-2 border-b border-gray-300 bg-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Respondiendo a:</span>
            <Button
              type="text"
              icon={<CloseOutlined />}
              onClick={() => setQuotedMessage(null)}
              className="text-gray-500 hover:text-gray-700"
            />
          </div>
          <div className="quoted-message-content mt-1">
            <div className="flex gap-2">
              <div className="bg-blue-500 w-[3px] h-auto rounded"></div>

              {quotedMessage.hasMedia && quotedMessage.mediaUrl ? (
                <div className="media-preview">
                  {quotedMessage.mimetype?.startsWith('image/') ? (
                    <img src={quotedMessage.mediaUrl} alt="Quoted media" className="max-w-[100px] max-h-[100px] rounded" />
                  ) : quotedMessage.mimetype?.startsWith('video/') ? (
                    <video src={quotedMessage.mediaUrl} controls className="max-w-[100px] max-h-[100px] rounded" />
                  ) : (
                    <div className="file-preview">
                      <span className="text-sm text-gray-700">Archivo adjunto</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-700">{quotedMessage.body}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message input area */}
      <div className="message-input p-2 border-t border-gray-300 flex">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Escribe tu mensaje"
          className="flex-1 p-2 border border-gray-300 rounded-l"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <div className="flex flex-col gap-2 items-center pl-2">
          <div className="w-full">
            <Upload
              multiple
              beforeUpload={() => false}
              onChange={handleUpload}
              fileList={fileList}
              style={{ width: '100%' }}
            >
              <Button icon={<UploadOutlined />} style={{ width: '100%' }} />
            </Upload>
          </div>

          <Button onClick={sendMessage} type="primary" loading={loadingSendMessage}>
            Enviar
          </Button>
        </div>
      </div>
    </div>
  );
};
