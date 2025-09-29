
import React, { useState } from 'react';
import { Notification } from '../types';

interface NotificationsProps {
  notifications: Notification[];
  onToggleRead: (id: number) => void;
}

const Notifications: React.FC<NotificationsProps> = ({ notifications, onToggleRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-white/80 hover:text-white transition-colors"
        aria-label={`Notificações (${unreadCount} não lidas)`}
      >
        <i className="bi bi-bell text-xl"></i>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 md:w-96 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none animate-fade-in-down z-30"
          role="menu" 
          aria-orientation="vertical"
        >
          <div className="py-1">
            <div className="px-4 py-2 text-sm font-semibold text-text-primary border-b border-greatek-border">
              Notificações em Tempo Real
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((notification) => {
                  const isRead = notification.read;
                  return (
                    <div key={notification.id} className={`px-4 py-3 border-b border-greatek-border/50 last:border-b-0 transition-colors ${isRead ? 'bg-greatek-bg-light/50' : 'bg-white'}`}>
                      <p className={`font-semibold ${isRead ? 'text-text-secondary' : 'text-text-primary'}`}>{notification.title}</p>
                      <p className={`text-xs mt-1 ${isRead ? 'text-text-secondary/80' : 'text-text-secondary'}`}>{notification.description}</p>
                      <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-gray-400">{notification.timestamp}</p>
                          <button 
                            onClick={() => onToggleRead(notification.id)} 
                            className={`flex items-center space-x-1.5 text-xs font-medium py-1 px-2 rounded-md transition-colors ${isRead ? 'text-gray-500 hover:bg-gray-200' : 'text-greatek-blue hover:bg-greatek-blue/10'}`}
                          >
                            <i className={`bi ${isRead ? 'bi-envelope-open' : 'bi-check-circle'}`}></i>
                            <span>{isRead ? 'Marcar como não lida' : 'Marcar como lida'}</span>
                          </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                    <i className="bi bi-check-circle text-4xl text-green-500"></i>
                    <p className="mt-2 text-sm font-semibold text-text-primary">Tudo certo!</p>
                    <p className="text-xs text-text-secondary">Nenhuma notificação nova.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;