import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Progress, Spin } from 'antd';
import { WHATSAPP_API_URL } from '../../../shared/utils/urls';
import { LoadingOutlined } from '@ant-design/icons';
import { ChatsList } from './ChatsList';
import { MessagesList } from './MessagesList';
import { MessageInput } from './MessageInput';
import { escapeRegExp, formatChatId, normalizeNumber } from '../helpers/parser';

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

  const loadingInterface = loadingChats || loadingMessages;

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

  return (
    <div className="whatsapp-container flex h-screen">
      <ChatsList
        chats={chats}
        filteredChats={filteredChats}
        selectedChat={selectedChat}
        searchQuery={searchQuery}
        loadingInterface={loadingInterface}
        onSearchChange={setSearchQuery}
        onSelectChat={selectChat}
      />

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
        <MessagesList messages={messages} selectedChat={selectedChat} />
        {selectedChat && (
          <MessageInput
            newMessage={newMessage}
            loadingSendMessage={loadingSendMessage}
            onMessageChange={setNewMessage}
            onSendMessage={sendMessage}
          />
        )}
      </div>
    </div>
  );
}
