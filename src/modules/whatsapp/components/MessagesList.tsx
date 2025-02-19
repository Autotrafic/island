import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import { BellIcon, DoubleBlueCheckIcon, DoubleCheckIcon, PhoneIcon } from '../../../shared/assets/icons';
import { formatDate, getParticipantColor, shouldRenderDateSeparator } from '../helpers';
import { WChat, WMessage } from '../interfaces';
import { WMessageType } from '../interfaces/enums';
import { useContextMenu } from '../context/useContextMenu';
interface MessageListProps {
  messages: WMessage[];
  selectedChat: WChat | null;
  chats: WChat[];
  setQuotedMessage: Dispatch<SetStateAction<WMessage | null>>;
}

export const MessagesList: React.FC<MessageListProps> = ({ messages, selectedChat, chats, setQuotedMessage }) => {
  const handleContextMenu = useContextMenu({ setQuotedMessage });

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
        <div className="flex items-center gap-3 rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 shadow-lg hover:bg-gray-750 transition-colors">
          <PhoneIcon className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-gray-300">Llamada realizada</span>
        </div>
      );
    }

    if (message.type === 'e2e_notification') {
      return (
        <div className="flex items-center gap-3 rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 shadow-lg hover:bg-gray-750 transition-colors">
          <BellIcon className="w-5 h-5 text-purple-400" />
          <span className="text-sm text-gray-300">Notificación de WhatsApp</span>
        </div>
      );
    }

    const { attachedContact } = message;
    if (message.type === 'vcard' && attachedContact) {
      return (
        <div className="flex items-center gap-3 rounded-lg bg-gray-800 border border-gray-700 px-4 py-3 shadow-lg hover:bg-gray-750 transition-colors">
          {attachedContact.img && (
            <img
              src={attachedContact.img}
              alt="contact"
              className="w-8 h-8 rounded-full border-2 border-blue-400"
            />
          )}

          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-300">{attachedContact.name}</p>
            <p className="text-xs text-gray-400">{attachedContact.phone}</p>
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
            const senderName = message.contactName || message.senderPhone;
            const isSameSenderAsPrevious = index > 0 && filteredMessages[index - 1].senderId === message.senderId;
            const senderColor = showSenderName ? getParticipantColor(message.senderId) : 'text-gray-700';

            return (
              <div key={message.id.id} onContextMenu={(e) => handleContextMenu(e, message)}>
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
                    {/* Render quoted message if it exists */}
                    {message.quotedMessage && (
                      <div className="quoted-message bg-gray-100 p-2 rounded-lg border-l-4 border-blue-500">
                        <div className="text-xs text-gray-600 mb-1">
                          Respondiendo a{' '}
                          <span className="font-semibold">
                            {message.quotedMessage.fromMe ? 'Tú' : senderName}
                          </span>
                        </div>
                        {message.quotedMessage.hasMedia && message.quotedMessage.mediaUrl ? (
                          <div className="media-preview">
                            {message.quotedMessage.mimetype?.startsWith('image/') ? (
                              <img
                                src={message.quotedMessage.mediaUrl}
                                alt="Quoted media"
                                className="max-w-[80px] max-h-[80px] rounded"
                              />
                            ) : message.quotedMessage.mimetype?.startsWith('video/') ? (
                              <video
                                src={message.quotedMessage.mediaUrl}
                                controls
                                className="max-w-[80px] max-h-[80px] rounded"
                              />
                            ) : (
                              <div className="file-preview">
                                <span className="text-xs text-gray-700">Archivo adjunto</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-700 truncate">{message.quotedMessage.body}</p>
                        )}
                      </div>
                    )}

                    {/* Render sender's name (for group chats) */}
                    {showSenderName && !isSameSenderAsPrevious && (
                      <p className={`text-sm font-semibold ${senderColor}`}>{senderName}</p>
                    )}

                    {/* Render message content */}
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

                    {/* Render message timestamp and read status */}
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
