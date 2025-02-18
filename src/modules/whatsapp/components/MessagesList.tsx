import React, { useEffect, useRef } from 'react';
import { BellIcon, DoubleBlueCheckIcon, DoubleCheckIcon, PhoneIcon } from '../../../shared/assets/icons';
import { formatDate, getParticipantColor, shouldRenderDateSeparator } from '../helpers';
import { WChat, WMessage } from '../interfaces';
import { WMessageType } from '../interfaces/enums';
interface MessageListProps {
  messages: WMessage[];
  selectedChat: WChat | null;
  chats: WChat[];
}

export const MessagesList: React.FC<MessageListProps> = ({ messages, selectedChat, chats }) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const renderFilePreview = (mimetype: string, mediaUrl: string) => {
    if (mimetype?.startsWith('image/')) {
      return <img src={mediaUrl} alt="media" className="max-w-[400px] max-h-[400px] rounded-lg" />;
    }
    if (mimetype?.startsWith('audio/')) {
      return (
        <audio controls className="max-w-[400px]">
          <source src={mediaUrl} type={mimetype} />
          Your browser does not support the audio element.
        </audio>
      );
    }
    if (mimetype?.startsWith('video/')) {
      return (
        <video controls className="max-w-[400px]">
          <source src={mediaUrl} type={mimetype} />
          Your browser does not support the video element.
        </video>
      );
    }
    if (mimetype === 'application/pdf') {
      return (
        <div className="flex flex-col gap-2">
          <iframe src={mediaUrl} className="w-full h-[400px] rounded-lg border-none" title="PDF Preview" />
          <a href={mediaUrl} download="file.pdf" className="p-2 bg-blue-500 text-white rounded-lg text-xs text-center">
            Descargar PDF
          </a>
        </div>
      );
    }
    return (
      <a
        href={mediaUrl}
        download={`file.${mimetype?.split('/')[1]}`}
        className="p-2 bg-blue-500 text-white rounded-lg text-xs"
      >
        Descargar archivo
      </a>
    );
  };

  const renderMessageType = (message: WMessage) => {
    if (message.type === 'call_log') {
      return (
        <div className="flex items-center gap-2 rounded bg-gray-200 border-2 border-gray-300 px-2 py-4">
          <PhoneIcon />
          <span className="text-sm text-gray-700">Llamada realizada</span>
        </div>
      );
    }

    if (message.type === 'e2e_notification') {
      return (
        <div className="flex items-center gap-2 rounded bg-gray-200 border-2 border-gray-300 px-2 py-4">
          <BellIcon />
          <span className="text-sm text-gray-700">Notificación de WhatsApp</span>
        </div>
      );
    }

    const { attachedContact } = message;
    if (message.type === 'vcard' && attachedContact) {
      return (
        <div className="flex items-center gap-2 rounded bg-gray-200 border-2 border-gray-300 px-2 py-4">
          {attachedContact.img && <img src={attachedContact.img} alt="contact" className="w-8 h-8 rounded-full" />}

          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-700">{attachedContact.name}</p>
            <p className="text-xs text-gray-500">{attachedContact.phone}</p>
          </div>
        </div>
      );
    }
  };

  const renderMessageFormat = (message: WMessage) => {
    if (message.link) {
      const link = message.link;

      return (
        <a href={link.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          {message.body}
        </a>
      );
    } else {
      return <p dangerouslySetInnerHTML={{ __html: message.body.replace(/\n/g, '<br />') }} />;
    }
  };

  return (
    <div ref={messageContainerRef} className="messages flex-1 p-2 overflow-y-auto overflow-x-hidden flex-col-reverse whats-list-scrollbar">
      {selectedChat &&
        messages
          .filter((msg) => msg.chatId === selectedChat.id)
          .map((message, index, filteredMessages) => {
            const currentTimestamp = message.timestamp;
            const previousTimestamp = index > 0 ? filteredMessages[index - 1].timestamp : null;
            const renderDateSeparator = shouldRenderDateSeparator(currentTimestamp, previousTimestamp);

            // Determine if we should show the sender's name (only for group chats)
            const showSenderName = selectedChat.isGroup && !message.fromMe;
            const senderName = chats.find((chat) => chat.id === message.senderId)?.name || message.senderPhone;
            const isSameSenderAsPrevious = index > 0 && filteredMessages[index - 1].senderId === message.senderId;
            const senderColor = showSenderName ? getParticipantColor(message.senderId) : 'text-gray-700';

            return (
              <div key={message.id}>
                {renderDateSeparator && (
                  <div className="flex justify-center my-4">
                    <div className="px-3 py-1 bg-gray-300 text-gray-700 rounded-full text-sm">
                      {formatDate(currentTimestamp)}
                    </div>
                  </div>
                )}

                <div className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'} my-2 mx-[10%]`}>
                  <div
                    className={`px-2 py-1 text-sm rounded-xl ${
                      message.fromMe ? 'bg-green-100' : 'bg-white'
                    } max-w-lg shadow flex flex-col gap-1`}
                    style={{ minHeight: '32px' }}
                  >
                    {showSenderName && !isSameSenderAsPrevious && (
                      <p className={`text-xs font-semibold ${senderColor}`}>{senderName}</p>
                    )}

                    {Object.values(WMessageType).includes(message.type) ? (
                      <>{renderMessageType(message)} </>
                    ) : message.hasMedia && message.mimetype ? (
                      <div className="flex flex-col gap-2">
                        {renderFilePreview(message.mimetype, message.mediaUrl!)}
                        {renderMessageFormat(message)}
                      </div>
                    ) : (
                      <>{renderMessageFormat(message)}</>
                    )}

                    <div className="text-xs text-gray-500 bottom-1 right-2 flex items-center justify-end">
                      {new Date(message.timestamp * 1000).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                      {message.fromMe && (
                        <span className="ml-1">{message.viewed ? <DoubleBlueCheckIcon /> : <DoubleCheckIcon />}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
    </div>
  );
};
