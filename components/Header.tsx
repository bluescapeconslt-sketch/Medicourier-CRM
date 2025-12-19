

import React, { useState } from 'react';
import { Menu, UserCircle, Bell, LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import NotificationsDropdown from './NotificationsDropdown';
import { mockNotifications } from '../constants';
import { Notification } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout, user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const getTitle = () => {
        const path = location.pathname.split('/')[1];
        if (!path) return 'Dashboard';
        return path.charAt(0).toUpperCase() + path.slice(1);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => 
            n.id === id ? { ...n, isRead: true } : n
        ));
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative z-40">
            <div className="flex items-center">
                <button
                    className="text-gray-500 focus:outline-none md:hidden"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    <Menu size={24} />
                </button>
                <h1 className="text-xl font-semibold text-gray-800 dark:text-white ml-4 md:ml-0">{getTitle()}</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="relative">
                    <button 
                        className="text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors relative"
                        onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                    >
                        <Bell size={24} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold ring-2 ring-white dark:ring-gray-800">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                    <NotificationsDropdown 
                        isOpen={isNotificationsOpen}
                        onClose={() => setIsNotificationsOpen(false)}
                        notifications={notifications}
                        onMarkAsRead={handleMarkAsRead}
                        onMarkAllAsRead={handleMarkAllAsRead}
                    />
                </div>
                
                <div className="flex items-center gap-3 border-l border-gray-200 dark:border-gray-700 pl-4">
                    <div className="flex items-center">
                        <UserCircle size={28} className="text-gray-600 dark:text-gray-300" />
                        <div className="hidden md:flex flex-col ml-2">
                            <span className="text-sm font-medium dark:text-gray-200">{user?.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;