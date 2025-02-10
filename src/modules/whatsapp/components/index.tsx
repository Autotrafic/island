import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Progress } from 'antd';
import { BASE_API_URL } from '../../../shared/utils/urls';
import { CheckIcon } from '@heroicons/react/24/solid';
import { DoubleBlueCheckIcon } from '../../../shared/assets/icons';

interface WChat {
  id: string;
  name: string;
  isGroup: boolean;
  unreadCount: number;
  timestamp: number;
  lastMessage: { viewed: boolean; body: string };
}

interface WMessage {
  id: string;
  fromMe: boolean;
  viewed: boolean;
  hasMedia: boolean;
  body: string;
  timestamp: number;
  hasReaction: boolean;
  chatId: string;
}

export function Whatsapp() {
  const [chats, setChats] = useState<WChat[]>([]);
  const [filteredChats, setFilteredChats] = useState<WChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<WChat | null>(null);
  const [messages, setMessages] = useState<WMessage[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);

  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function fetchChatsAndMessages() {
      try {
        const chatResponse = await axios.get(`${BASE_API_URL}/whatsapp/chats`);
        const chats = chatResponse.data.chats.slice(0, 5);
        setChats(chats);
        setFilteredChats(chats);

        let loadedChats = 0;
        const allMessages: WMessage[] = [];
        for (const chat of chats) {
          const messageResponse = await axios.get(`${BASE_API_URL}/whatsapp/messages/${chat.id}`);
          allMessages.push(...messageResponse.data.chatMessages.map((msg: WMessage) => ({ ...msg, chatId: chat.id })));
          loadedChats++;
          setProgress(Math.round((loadedChats / chats.length) * 100));
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
    const interval = setInterval(async () => {
      try {
        const chatResponse = await axios.get(`${BASE_API_URL}/whatsapp/chats`);
        const chats = chatResponse.data.chats.slice(0, 5);
        setChats(chats);
        setFilteredChats(chats);
      } catch (error) {
        console.error('Error updating chats:', error);
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      await axios.post(`${BASE_API_URL}/whatsapp/message`, {
        message: newMessage,
        phoneNumber: selectedChat?.id?.replace('@c.us', ''),
      });
      setNewMessage('');
      const updatedMessages = await axios.get(`${BASE_API_URL}/whatsapp/messages/${selectedChat?.id}`);
      setMessages((prev) => [
        ...prev.filter((m) => m.chatId !== selectedChat?.id),
        ...updatedMessages.data.chatMessages.map((msg: WMessage) => ({ ...msg, chatId: selectedChat?.id })),
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const normalizeNumber = (number: string) => number.replace(/\D/g, '');

  useEffect(() => {
    const searchRegex = new RegExp(searchQuery.replace(/\s+/g, '.*'), 'i');
    const normalizedSearchQuery = normalizeNumber(searchQuery);

    const filtered = chats.filter((chat) => {
      const normalizedChatId = normalizeNumber(chat.id);
      const matchesChatName = searchRegex.test(chat.name);
      const matchesChatId = normalizedSearchQuery && normalizedChatId.includes(normalizedSearchQuery);
      const matchesMessages = messages.some((msg) => msg.chatId === chat.id && searchRegex.test(msg.body));
      return matchesChatName || matchesChatId || matchesMessages;
    });

    setFilteredChats(filtered);
  }, [searchQuery, chats, messages]);

  // Function to handle chat selection
  const selectChat = (chat: WChat) => {
    setSelectedChat(chat);
    // Reset unreadCount to 0 when the chat is opened
    setChats((prevChats) => prevChats.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c)));
    setMessages([]); // Reset messages for the selected chat
    setLoadingMessages(true);

    // Mark all messages in this chat as viewed
    axios.get(`${BASE_API_URL}/whatsapp/chat/send-seen/${chat.id}`);

    // Fetch the messages for the selected chat
    axios.get(`${BASE_API_URL}/whatsapp/messages/${chat.id}`).then((messageResponse) => {
      setMessages(messageResponse.data.chatMessages.map((msg: WMessage) => ({ ...msg, chatId: chat.id })));
      setLoadingMessages(false);
    });
  };

  // Scroll to bottom whenever new messages are added
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch messages every 5 seconds for the selected chat
  useEffect(() => {
    if (selectedChat) {
      const interval = setInterval(() => {
        axios.get(`${BASE_API_URL}/whatsapp/messages/${selectedChat.id}`).then((messageResponse) => {
          setMessages((prevMessages) => [
            ...prevMessages.filter((msg) => msg.chatId !== selectedChat.id),
            ...messageResponse.data.chatMessages.map((msg: WMessage) => ({ ...msg, chatId: selectedChat.id })),
          ]);
        });
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [selectedChat]);

  return (
    <div className="whatsapp-container flex h-screen">
      <div className="chat-list w-1/6 border-r border-gray-300 overflow-y-auto">
        <input
          type="text"
          placeholder="Search chats or messages"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border-b border-gray-300"
        />
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            className={`chat-item p-2 cursor-pointer ${
              selectedChat?.id === chat.id ? 'bg-gray-100' : 'bg-white'
            } transition-colors ${loadingMessages ? 'pointer-events-none bg-gray-200' : ''}`}
            style={{ transition: 'background-color 0.3s' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f7f7f7')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedChat?.id === chat.id ? '#f0f0f0' : '#fff')}
            onClick={() => selectChat(chat)}
          >
            <div className="flex items-center justify-between">
              <h4>{chat.name}</h4>
              {chat.unreadCount > 0 && (
                <div className="flex items-center justify-center w-6 h-6 text-white bg-green-500 rounded-full text-xs">
                  {chat.unreadCount}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={`chat-messages flex-1 flex flex-col relative ${!loadingMessages && 'bg-gray-200'}`}>
        {loadingMessages && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-[20%]">
            <Progress percent={progress} format={(percent) => `${percent}%`} />
          </div>
        )}
        <div ref={messageContainerRef} className="messages flex-1 p-2 overflow-y-auto flex-col-reverse">
          {selectedChat &&
            messages
              .filter((msg) => msg.chatId === selectedChat.id)
              .map((message) => (
                <div key={message.id} className={`flex ${message.fromMe ? 'justify-end' : 'justify-start'} my-2 mx-[10%]`}>
                  <div
                    className={`px-2 py-1 text-sm rounded-xl ${
                      message.fromMe ? 'bg-green-100' : 'bg-white'
                    } max-w-lg shadow flex gap-4 items-end`}
                    style={{ minHeight: '32px' }}
                  >
                    <p>{message.body}</p>
                    <div className="text-xs text-gray-500 bottom-1 right-2 flex items-center">
                      {new Date(message.timestamp * 1000).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,
                      })}
                      {message.fromMe && (
                        <span className={`ml-1`}>{message.viewed ? <CheckIcon /> : <DoubleBlueCheckIcon />}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
        </div>

        {/* Input to send a message */}
        {selectedChat && (
          <div className="message-input p-2 border-t border-gray-300 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message"
              className="flex-1 p-2 border border-gray-300 rounded-l"
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button onClick={sendMessage} className="p-2 bg-blue-500 text-white rounded-r">
              Send
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
