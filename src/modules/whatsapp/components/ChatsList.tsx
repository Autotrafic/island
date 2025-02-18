import React from 'react';
import { DoubleBlueCheckIcon, DoubleCheckIcon } from '../../../shared/assets/icons';

interface ChatListProps {
  filteredChats: WChat[];
  selectedChat: WChat | null;
  searchQuery: string;
  loadingInterface: boolean;
  onSearchChange: (query: string) => void;
  onSelectChat: (chat: WChat) => void;
}

export const ChatsList: React.FC<ChatListProps> = ({
  filteredChats,
  selectedChat,
  searchQuery,
  loadingInterface,
  onSearchChange,
  onSelectChat,
}) => {
  return (
    <div className="chat-list w-1/5 border-r border-gray-300 overflow-y-auto bg-gray-900 text-white">
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Buscar contactos o mensajes"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full p-3 bg-gray-800 border-b border-gray-700 focus:outline-none focus:border-blue-500 placeholder-gray-400 text-white transition-colors"
      />

      {/* Chat List */}
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
            {chat.lastMessage.body && (
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
    </div>
);
};
