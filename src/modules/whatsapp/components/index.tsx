import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Button, Progress, Spin } from 'antd';
import { WHATSAPP_API_URL } from '../../../shared/utils/urls';
import { DoubleCheckIcon, DoubleBlueCheckIcon } from '../../../shared/assets/icons';
import { LoadingOutlined } from '@ant-design/icons';

interface WChat {
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  timestamp: number;
  lastMessage: { viewed: boolean | undefined; body: string };
  profilePicUrl?: string;
}

interface WMessage {
  id: string;
  chatId: string;
  body: string;
  fromMe: boolean;
  viewed: boolean | undefined;
  timestamp: number;
  type: string;
  hasMedia: boolean;
  mediaUrl: string | undefined;
  mimetype: string | undefined;
}

export function Whatsapp() {
  const [chats, setChats] = useState<WChat[]>([]);
  const [filteredChats, setFilteredChats] = useState<WChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<WChat | null>(null);
  const [messages, setMessages] = useState<WMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [loadingChats, setLoadingChats] = useState<boolean>(true);
  const [loadingSendMessage, setLoadingSendMessage] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const loadingInterface = loadingChats || loadingMessages;

  useEffect(() => {
    async function fetchChatsAndMessages() {
      try {
        const chatResponse = await axios.get(`${WHATSAPP_API_URL}/messages/chats`);
        const chats = chatResponse.data.chats;
        setChats(chats);
        setFilteredChats(chats);
        setLoadingChats(false);
        setLoadingMessages(true);

        let loadedChats = 0;
        const allMessages: WMessage[] = [];
        for (const chat of chats) {
          try {
            const messageResponse = await axios.get(`${WHATSAPP_API_URL}/messages/chat-messages/${chat.id}`);
            allMessages.push(...messageResponse.data.messages.map((msg: WMessage) => ({ ...msg, chatId: chat.id })));
          } catch {
          } finally {
            loadedChats++;
            setProgress(Math.round((loadedChats / chats.length) * 100));
          }
        }
        setMessages(allMessages);
      } catch (error) {
        console.error('Error fetching chats and messages:', error);
      } finally {
        setLoadingMessages(false);
      }
    }
    fetchChatsAndMessages();
  }, []);

  useEffect(() => {
    const eventSource = new EventSource(`${WHATSAPP_API_URL}/connect`);

    eventSource.addEventListener('whatsapp-message', (event) => {
      const newMessage = JSON.parse(event.data) as WMessage;
      onMessageReceived(newMessage);
    });

    eventSource.onerror = (error) => {
      console.error('SSE error:', error);
    };

    return () => {
      eventSource.close();
    };
  }, [selectedChat]);

  const onMessageReceived = (newMessage: WMessage) => {
    setMessages((prevMessages) => {
      const existingMessageIndex = prevMessages.findIndex((msg) => msg.id === newMessage.id);
      if (existingMessageIndex !== -1) {
        // Update existing message
        const updatedMessages = [...prevMessages];
        updatedMessages[existingMessageIndex] = newMessage;
        return updatedMessages;
      } else {
        // Add new message
        return [...prevMessages, newMessage];
      }
    });

    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === newMessage.chatId
          ? {
              ...chat,
              unreadCount: chat.id === selectedChat?.id ? 0 : chat.unreadCount + 1,
              lastMessage: { viewed: newMessage.viewed, body: newMessage.body },
            }
          : chat
      )
    );

    if (selectedChat && selectedChat.id === newMessage.chatId) {
      axios.get(`${WHATSAPP_API_URL}/messages/seen-chat/${newMessage.chatId}`);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setLoadingSendMessage(true);

      // Check if the selected chat is a new chat (i.e., not in the original chats list)
      const isNewChat = !chats.some((chat) => chat.id === selectedChat?.id);

      // Send the message with the correctly formatted chatId
      await axios.post(`${WHATSAPP_API_URL}/messages/send`, {
        message: newMessage,
        phoneNumber: selectedChat?.id?.replace('@c.us', ''),
      });

      setNewMessage('');

      // If it's a new chat, add it to the chats list
      if (isNewChat && selectedChat) {
        const updatedChats = [selectedChat, ...chats];
        setChats(updatedChats);
        setFilteredChats([selectedChat]); // Ensure the new chat remains in the filtered list
      }

      // Fetch the updated messages for the selected chat
      const updatedMessages = await axios.get(`${WHATSAPP_API_URL}/messages/chat-messages/${selectedChat?.id}`);
      setMessages((prev) => [
        ...prev.filter((m) => m.chatId !== selectedChat?.id),
        ...updatedMessages.data.messages.map((msg: WMessage) => ({ ...msg, chatId: selectedChat?.id })),
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoadingSendMessage(false);
    }
  };

  const normalizeNumber = (number: string) => {
    // Remove all non-numeric characters
    const cleanedNumber = number.replace(/\D/g, '');

    // If the number starts with '+', treat it as a foreign number
    if (number.startsWith('+')) {
      return cleanedNumber; // Return the number with the country code
    }

    // If the number is a Spanish default number (e.g., 674218987), add the country code '34'
    if (cleanedNumber.length === 9 && !cleanedNumber.startsWith('34')) {
      return `34${cleanedNumber}`; // Add Spain's country code
    }

    // If the number already starts with '34', assume it's a Spanish number
    return cleanedNumber;
  };

  const formatChatId = (number: string) => {
    const normalizedNumber = normalizeNumber(number);
    return `${normalizedNumber}@c.us`;
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape special characters
  };

  useEffect(() => {
    const escapedSearchQuery = escapeRegExp(searchQuery); // Escape special characters
    const searchRegex = new RegExp(escapedSearchQuery.replace(/\s+/g, '.*'), 'i');
    const normalizedSearchQuery = normalizeNumber(searchQuery);

    // Filter chats based on the search query
    const filtered = chats.filter((chat) => {
      const normalizedChatId = normalizeNumber(chat.id);
      const matchesChatName = searchRegex.test(chat.name);
      const matchesChatId = normalizedSearchQuery && normalizedChatId.includes(normalizedSearchQuery);
      const matchesMessages = messages.some((msg) => msg.chatId === chat.id && searchRegex.test(msg.body));
      return matchesChatName || matchesChatId || matchesMessages;
    });

    // If no matches are found and the search query is a valid number, add the new chat
    if (filtered.length === 0 && normalizedSearchQuery) {
      const newChat: WChat = {
        id: formatChatId(normalizedSearchQuery), // Format the chatId correctly
        name: searchQuery, // Use the search query as the chat name
        isGroup: false,
        unreadCount: 0,
        timestamp: Date.now(),
        lastMessage: { viewed: false, body: '' },
      };

      // Set filteredChats to only contain the new chat
      setFilteredChats([newChat]);
    } else {
      // Otherwise, set filteredChats to the filtered list
      setFilteredChats(filtered);
    }
  }, [searchQuery, chats, messages]);

  const selectChat = (chat: WChat) => {
    setSelectedChat(chat);
    setSearchQuery(''); // Clear the search query

    // Check if the chat is a new chat (i.e., not in the original chats list)
    const isNewChat = !chats.some((c) => c.id === chat.id);

    // If it's a new chat, add it to the chats list
    if (isNewChat) {
      const updatedChats = [chat, ...chats];
      setChats(updatedChats);
      setFilteredChats(updatedChats); // Reset filteredChats to include all chats
    }

    setMessages([]);
    setLoadingMessages(true);

    // Send the correctly formatted chatId to the backend
    axios.get(`${WHATSAPP_API_URL}/messages/seen-chat/${chat.id}`);

    axios.get(`${WHATSAPP_API_URL}/messages/chat-messages/${chat.id}`).then((messageResponse) => {
      setMessages(messageResponse.data.messages.map((msg: WMessage) => ({ ...msg, chatId: chat.id })));
      setLoadingMessages(false);
    });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Helper function to determine if a date separator should be rendered
  const shouldRenderDateSeparator = (currentTimestamp: number, previousTimestamp: number | null) => {
    if (!previousTimestamp) return true; // Always render for the first message
    const currentDate = formatDate(currentTimestamp);
    const previousDate = formatDate(previousTimestamp);
    return currentDate !== previousDate;
  };

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="whatsapp-container flex h-screen">
      <div className="chat-list w-1/5 border-r border-gray-300 overflow-y-auto">
        <input
          type="text"
          placeholder="Buscar contactos o mensajes"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border-b border-gray-300"
        />
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item p-2 cursor-pointer flex items-center gap-3 ${
              selectedChat?.id === chat.id ? 'bg-gray-100' : 'bg-white'
            } transition-colors ${loadingInterface ? 'pointer-events-none bg-gray-200' : ''}`}
            style={{ transition: 'background-color 0.3s' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f7f7')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedChat?.id === chat.id ? '#f0f0f0' : '#fff')}
            onClick={() => selectChat(chat)}
          >
            <img
              src={chat.profilePicUrl || 'https://www.pngarts.com/files/10/Default-Profile-Picture-Transparent-Image.png'}
              alt={chat.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium">{chat.name}</h4>
            </div>
            {chat.unreadCount > 0 && (
              <div className="flex items-center justify-center w-6 h-6 text-white bg-green-500 rounded-full text-xs">
                {chat.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className={`chat-messages flex-1 flex flex-col relative ${!loadingInterface && 'bg-gray-200'}`}>
        {loadingChats && (
          <div className="absolute top-1/3 left-1/2">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
          </div>
        )}
        {loadingMessages && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-[20%]">
            <Progress percent={progress} format={(percent) => `${percent}%`} />
          </div>
        )}
        <div ref={messageContainerRef} className="messages flex-1 p-2 overflow-y-auto flex-col-reverse">
          {selectedChat &&
            messages
              .filter((msg) => msg.chatId === selectedChat.id)
              .map((message, index, filteredMessages) => {
                const currentTimestamp = message.timestamp;
                const previousTimestamp = index > 0 ? filteredMessages[index - 1].timestamp : null;

                // Check if a date separator should be rendered
                const renderDateSeparator = shouldRenderDateSeparator(currentTimestamp, previousTimestamp);

                return (
                  <div key={message.id}>
                    {/* Render the date separator */}
                    {renderDateSeparator && (
                      <div className="flex justify-center my-4">
                        <div className="px-3 py-1 bg-gray-300 text-gray-700 rounded-full text-sm">
                          {formatDate(currentTimestamp)}
                        </div>
                      </div>
                    )}

                    {/* Render the message */}
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

        {selectedChat && (
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
            <Button onClick={sendMessage} type="primary" loading={loadingSendMessage} className="h-full ml-2">
              Enviar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
