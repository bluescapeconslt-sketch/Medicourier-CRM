
import React from 'react';
import { Notification } from '../types';
import { Check, Info, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NotificationsDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
}

const getIcon = (type: Notification['type']) => {
    switch (type) {
        case 'info': return <Info size={16} className="text-blue-500" />;
        case 'success': return <CheckCircle size={16} className="text-green-500" />;
        case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
        case 'error': return <XCircle size={16} className="text-red-500" />;
        default: return <Info size={16} className="text-gray-500" />;
    }
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
};

const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({ isOpen, onClose, notifications, onMarkAsRead, onMarkAllAsRead }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleNotificationClick = (notification: Notification) => {
        onMarkAsRead(notification.id);
        if (notification.link) {
            navigate(notification.link);
            onClose();
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-40" onClick={onClose}></div>
            <div className="absolute right-0 top-12 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                    <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-200">Notifications</h3>
                    <button 
                        onClick={onMarkAllAsRead}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center"
                    >
                        <Check size={12} className="mr-1" /> Mark all read
                    </button>
                </div>
                
                <div className="max-h-[350px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No new notifications.
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                onClick={() => handleNotificationClick(notification)}
                                className={`p-3 border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors relative ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1 flex items-center">
                                            <Clock size={10} className="mr-1" />
                                            {formatTime(notification.timestamp)}
                                        </p>
                                    </div>
                                    {!notification.isRead && (
                                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 text-center">
                    <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                        View All Activity
                    </button>
                </div>
            </div>
        </>
    );
};

export default NotificationsDropdown;