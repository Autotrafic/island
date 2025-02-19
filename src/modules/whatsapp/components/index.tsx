import axios from 'axios';
import { useState, useEffect } from 'react';
import { message, Spin } from 'antd';
import { WHATSAPP_API_URL } from '../../../shared/utils/urls';
import { LoadingOutlined } from '@ant-design/icons';
import { ChatsList } from './ChatsList';
import { MessagesList } from './MessagesList';
import { MessageInput } from './MessageInput';
import { WChat, WMessage } from '../interfaces';

export function Whatsapp() {
  const [chats, setChats] = useState<WChat[]>([]);
  const [filteredChats, setFilteredChats] = useState<WChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<WChat | null>(null);
  const [messages, setMessages] = useState<WMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false);
  const [loadingChats, setLoadingChats] = useState<boolean>(true);
  const [quotedMessage, setQuotedMessage] = useState<WMessage | null>(null);

  const loadingInterface = loadingChats || loadingMessages;

  const selectChat = async (chat: WChat) => {
    setSelectedChat(chat);

    // Check if the chat is a new chat (i.e., not in the original chats list)
    const isNewChat = !chats.some((c) => c.id === chat.id);

    const updatedChat = { ...chat, unreadCount: 0 };

    // If it's a new chat, add it to the chats list
    const updatedChats = isNewChat ? [updatedChat, ...chats] : chats.map((c) => (c.id === chat.id ? updatedChat : c));

    setChats(updatedChats);
    setFilteredChats(updatedChats);

    setMessages([]);
    setLoadingMessages(true);

    // Send the correctly formatted chatId to the backend
    try {
      await axios.get(`${WHATSAPP_API_URL}/messages/seen-chat/${chat.id}`);

      await axios.get(`${WHATSAPP_API_URL}/messages/chat-messages/${chat.id}`).then((messageResponse) => {
        setMessages(messageResponse.data.messages.map((msg: WMessage) => ({ ...msg, chatId: chat.id })));
        setLoadingMessages(false);
      });
    } catch (error) {
      message.error('No se han podido obtener los mensajes del chat');
      setLoadingMessages(false);
    }
  };

  const onMessageReceived = async (newMessage: WMessage) => {
    if (newMessage.chatId === 'status@broadcast') return;

    // Play notification sound if the message is not from the user
    if (!newMessage.fromMe) {
      const notification = new Audio('/notification.wav');
      notification.play().catch((error) => console.error('Failed to play sound:', error));
    }

    // Update messages
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

    // Update chats
    setChats((prevChats) => {
      const existingChatIndex = prevChats.findIndex((chat) => chat.id === newMessage.chatId);

      if (existingChatIndex !== -1) {
        // Update existing chat
        return prevChats.map((chat) =>
          chat.id === newMessage.chatId
            ? {
                ...chat,
                unreadCount: chat.id === selectedChat?.id ? 0 : chat.unreadCount + 1,
                lastMessage: { viewed: newMessage.viewed, fromMe: newMessage.fromMe, body: newMessage.body },
              }
            : chat
        );
      } else {
        // Check if a temporary chat already exists
        const temporaryChatExists = prevChats.some(
          (chat) => chat.id === newMessage.chatId && chat.name === 'Chat sin nombre'
        );

        if (!temporaryChatExists) {
          // Create a temporary chat entry
          const newChat: WChat = {
            id: newMessage.chatId,
            name: 'Chat sin nombre',
            isGroup: false,
            unreadCount: 1,
            timestamp: newMessage.timestamp,
            lastMessage: { viewed: newMessage.viewed, fromMe: newMessage.fromMe, body: newMessage.body },
            profilePicUrl: undefined,
          };

          // Fetch chat details from backend
          axios
            .get(`${WHATSAPP_API_URL}/messages/chats/${newMessage.chatId}`)
            .then((response) => {
              const chatData: WChat = response.data.chat;

              // Replace the temporary chat with the fetched chat details
              setChats((prevChats) =>
                prevChats.map((chat) =>
                  chat.id === newMessage.chatId && chat.name === 'Chat sin nombre'
                    ? {
                        ...chatData,
                        lastMessage: { viewed: newMessage.viewed, fromMe: newMessage.fromMe, body: newMessage.body },
                      }
                    : chat
                )
              );
            })
            .catch(() => {
              // If fetching fails, keep the temporary chat
              console.error('Failed to fetch chat details');
            });

          // Add the temporary chat to the list
          return [newChat, ...prevChats];
        } else {
          // If a temporary chat already exists, do nothing
          return prevChats;
        }
      }
    });

    // Mark chat as seen if it's the selected chat
    if (selectedChat && selectedChat.id === newMessage.chatId) {
      try {
        await axios.get(`${WHATSAPP_API_URL}/messages/seen-chat/${newMessage.chatId}`);
      } catch (error) {
        console.error('Failed to mark chat as seen:', error);
      }
    }
  };

  useEffect(() => {
    async function fetchChatsAndMessages() {
      try {
        const chatResponse = await axios.get(`${WHATSAPP_API_URL}/messages/chats`);
        const chats = chatResponse.data.chats;

        setChats(chats);
        setFilteredChats(chats);
      } catch (error) {
        message.error('No se han podido obtener los chats');
      } finally {
        setLoadingChats(false);
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
  }, []);

  return (
    <div className="whatsapp-container flex h-screen">
      <ChatsList
        chats={chats}
        filteredChats={filteredChats}
        selectedChat={selectedChat}
        loadingInterface={loadingInterface}
        onSelectChat={selectChat}
        setFilteredChats={setFilteredChats}
      />

      <div className={`chat-messages flex-1 flex flex-col relative ${!loadingInterface && 'bg-gray-200'}`}>
        {loadingChats && (
          <div className="absolute top-1/3 left-1/2">
            <div className="flex flex-col gap-10 items-center">
              <h2>Cargando los chats</h2>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </div>
          </div>
        )}

        {loadingMessages && (
          <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full px-[20%]">
            <div className="flex flex-col gap-10 items-center">
              <h2>Cargando los mensajes</h2>
              <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            </div>
          </div>
        )}

        <MessagesList messages={messages} selectedChat={selectedChat} chats={chats} setQuotedMessage={setQuotedMessage} />

        {selectedChat && (
          <MessageInput
            selectedChat={selectedChat}
            quotedMessage={quotedMessage}
            setMessages={setMessages}
            setQuotedMessage={setQuotedMessage}
            setFilteredChats={setFilteredChats}
          />
        )}
      </div>
    </div>
  );
}
