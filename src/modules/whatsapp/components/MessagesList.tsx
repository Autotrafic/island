import React, { useEffect, useRef } from 'react';
import { DoubleBlueCheckIcon, DoubleCheckIcon } from '../../../shared/assets/icons';
import { formatDate, shouldRenderDateSeparator } from '../helpers';

interface MessageListProps {
  messages: WMessage[];
  selectedChat: WChat | null;
}

export const MessagesList: React.FC<MessageListProps> = ({ messages, selectedChat }) => {
  const messageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div
      ref={messageContainerRef}
      className="messages flex-1 p-2 overflow-y-auto overflow-x-hidden flex-col-reverse"
    >
      {selectedChat &&
        messages
          .filter((msg) => msg.chatId === selectedChat.id)
          .map((message, index, filteredMessages) => {
            const currentTimestamp = message.timestamp;
            const previousTimestamp = index > 0 ? filteredMessages[index - 1].timestamp : null;

            const renderDateSeparator = shouldRenderDateSeparator(currentTimestamp, previousTimestamp);

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
                    } max-w-lg shadow flex gap-4 items-end`}
                    style={{ minHeight: '32px' }}
                  >
                    {message.hasMedia ? (
                      message.mimetype?.startsWith('image/') ? (
                        <div className="flex flex-col gap-2">
                          <img src={message.mediaUrl} alt="media" className="max-w-[400px] max-h-[400px] rounded-lg" />
                          <p>{message.body}</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          <a
                            href={message.mediaUrl}
                            download={`file.${message.mimetype?.split('/')[1]}`}
                            className="p-2 bg-blue-500 text-white rounded-lg text-xs"
                          >
                            Descargar archivo
                          </a>
                          <p>{message.body}</p>
                        </div>
                      )
                    ) : (
                      <p dangerouslySetInnerHTML={{ __html: message.body.replace(/\n/g, '<br />') }} />
                    )}
                    <div className="text-xs text-gray-500 bottom-1 right-2 flex items-center">
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
