import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { DoubleBlueCheckIcon, DoubleCheckIcon } from '../../../shared/assets/icons';
import { WChat } from '../interfaces';
import { escapeRegExp, formatChatId, normalizeNumber } from '../helpers/parser';
import { getChatsByMessage } from '../services/whatsapp';
import { Spin } from 'antd';

interface ChatListProps {
  chats: WChat[];
  filteredChats: WChat[];
  selectedChat: WChat | null;
  loadingInterface: boolean;
  onSelectChat: (chat: WChat) => void;
  setFilteredChats: Dispatch<SetStateAction<WChat[]>>;
}

export const ChatsList: React.FC<ChatListProps> = ({
  chats,
  filteredChats,
  selectedChat,
  loadingInterface,
  onSelectChat,
  setFilteredChats,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loadingChats, setLoadingChats] = useState<boolean>(false);

  useEffect(() => {
    const fetchAndFilterChats = async () => {
      setLoadingChats(true);

      try {
        const escapedSearchQuery = escapeRegExp(searchQuery);
        const searchRegex = new RegExp(escapedSearchQuery.replace(/\s+/g, '.*'), 'i');
        const normalizedSearchQuery = normalizeNumber(searchQuery);

        let filteredByName = chats.filter((chat) => searchRegex.test(chat.name));

        const chatsByPartialId =
          normalizedSearchQuery && normalizedSearchQuery.length >= 4
            ? chats.filter(
                (chat) =>
                  (chat.id && normalizeNumber(chat.id)?.includes(normalizedSearchQuery)) ||
                  (chat.name && normalizeNumber(chat.name)?.includes(normalizedSearchQuery))
              )
            : [];

        const chatIdsFromSearch = await getChatsByMessage(searchQuery);
        const chatsFromMessages = chats.filter((chat) => chatIdsFromSearch.includes(chat.id));

        const mergedChats = [
          ...new Map([...filteredByName, ...chatsByPartialId, ...chatsFromMessages].map((chat) => [chat.id, chat])).values(),
        ].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        const chatExists = mergedChats.some((chat) => normalizeNumber(chat.id)?.includes(normalizedSearchQuery || ''));
        if (normalizedSearchQuery && !chatExists) {
          const newChat: WChat = {
            id: formatChatId(normalizedSearchQuery),
            name: searchQuery,
            isGroup: false,
            unreadCount: 0,
            timestamp: Date.now(),
            lastMessage: { viewed: false, fromMe: false, body: '' },
          };

          setFilteredChats([newChat, ...mergedChats]);
        } else {
          setFilteredChats(mergedChats);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setLoadingChats(false);
      }
    };

    if (searchQuery) {
      fetchAndFilterChats();
    } else {
      setFilteredChats(chats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
    }
  }, [searchQuery, chats]);

  return (
    <div className="chat-list w-1/5 border-r border-gray-300 overflow-y-auto bg-gray-900 text-white whats-list-scrollbar">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Buscar contactos o mensajes"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full p-3 bg-gray-800 border-b border-gray-700 focus:outline-none focus:border-blue-500 placeholder-gray-400 text-white transition-colors"
      />

      {loadingChats ? (
        <div className="w-full flex justify-center mt-20">
          <Spin size="large" />
        </div>
      ) : (
        <>
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item p-3 cursor-pointer flex items-center gap-3 ${
                selectedChat?.id === chat.id ? 'bg-gray-700' : 'bg-gray-800'
              } transition-colors duration-300 hover:bg-gray-700 ${
                loadingInterface ? 'pointer-events-none opacity-50' : ''
              }`}
              onClick={() => onSelectChat(chat)}
            >
              {/* Profile Picture */}
              <img
                src={chat.profilePicUrl || 'https://www.pngarts.com/files/10/Default-Profile-Picture-Transparent-Image.png'}
                alt={chat.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500"
              />

              {/* Chat Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate text-white">{chat.name}</h4>
                {chat?.lastMessage?.body && (
                  <div className="flex items-start gap-1 text-sm text-gray-400">
                    {chat.lastMessage.fromMe && (
                      <span className="flex items-center mt-1">
                        {chat.lastMessage.viewed ? <DoubleBlueCheckIcon /> : <DoubleCheckIcon />}
                      </span>
                    )}
                    <span className="line-clamp-2 overflow-hidden overflow-ellipsis">{chat.lastMessage.body}</span>
                  </div>
                )}
              </div>

              {/* Unread Count */}
              {chat.unreadCount > 0 && (
                <div className="flex items-center justify-center w-6 h-6 text-white bg-blue-500 rounded-full text-xs font-bold">
                  {chat.unreadCount}
                </div>
              )}
            </div>
          ))}
        </>
      )}
      {/* Chat List */}
    </div>
  );
};
