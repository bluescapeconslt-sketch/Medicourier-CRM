

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { mockUsers } from '../constants';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Init: Check local storage for persistent session
        const storedUser = sessionStorage.getItem('crm_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        // 1. Get users from localStorage (or fallback to mock)
        const storedUsersStr = localStorage.getItem('crm_users');
        const allUsers: User[] = storedUsersStr ? JSON.parse(storedUsersStr) : mockUsers;

        // 2. Validate credentials
        const foundUser = allUsers.find(u => 
            u.email.toLowerCase() === email.toLowerCase() && 
            u.password === password &&
            u.status === 'Active'
        );

        if (foundUser) {
            // Update last login
            const updatedUser = { ...foundUser, lastLogin: new Date().toLocaleString() };
            
            // Persist session
            setUser(updatedUser);
            sessionStorage.setItem('crm_user', JSON.stringify(updatedUser));
            
            // Save updated last login time to DB (localStorage in this case)
            // Note: In a real app, this would be an API call
            const updatedUsersList = allUsers.map(u => u.id === foundUser.id ? updatedUser : u);
            localStorage.setItem('crm_users', JSON.stringify(updatedUsersList));
            
            return true;
        }

        return false;
    };

    const logout = () => {
        sessionStorage.removeItem('crm_user');
        setUser(null);
    };

    if (isLoading) {
        return <div className="h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-500">Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};