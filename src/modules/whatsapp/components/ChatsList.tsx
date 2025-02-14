import React from 'react';

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
    <div className="chat-list w-1/5 border-r border-gray-300 overflow-y-auto">
      <input
        type="text"
        placeholder="Buscar contactos o mensajes"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
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
          onClick={() => onSelectChat(chat)}
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
  );
};
