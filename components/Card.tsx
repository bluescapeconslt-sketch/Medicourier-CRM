
import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface CardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    change?: string;
    changeType?: 'increase' | 'decrease';
}

const Card: React.FC<CardProps> = ({ title, value, icon: Icon, change, changeType }) => {
    const changeColor = changeType === 'increase' ? 'text-green-500' : 'text-red-500';

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                {change && (
                    <p className={`text-xs mt-2 ${changeColor}`}>
                        {change} vs last month
                    </p>
                )}
            </div>
            <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-3">
                <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
        </div>
    );
};

export default Card;
