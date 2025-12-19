

import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, Shield } from 'lucide-react';
import { User, UserRole } from '../types';
import Badge from './Badge';

interface UserManagementModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    onUpdateUsers: (updatedUsers: User[]) => void;
}

const UserManagementModal: React.FC<UserManagementModalProps> = ({ isOpen, onClose, users, onUpdateUsers }) => {
    const [view, setView] = useState<'list' | 'form'>('list');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({
        name: '',
        email: '',
        role: 'Sales',
        status: 'Active',
        password: ''
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    if (!isOpen) return null;

    const handleAddNew = () => {
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            role: 'Sales',
            status: 'Active',
            password: ''
        });
        setErrors({});
        setView('form');
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            password: user.password // Load existing password (in real app, this wouldn't happen)
        });
        setErrors({});
        setView('form');
    };

    const handleDelete = (userId: string) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
            const updatedUsers = users.filter(u => u.id !== userId);
            onUpdateUsers(updatedUsers);
            // Also update localStorage immediately for consistency
            localStorage.setItem('crm_users', JSON.stringify(updatedUsers));
        }
    };

    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name?.trim()) newErrors.name = "Name is required";
        if (!formData.email?.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Invalid email format";
        if (!formData.password?.trim()) newErrors.password = "Password is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        let updatedList: User[];

        if (editingUser) {
            // Update existing
            updatedList = users.map(u => 
                u.id === editingUser.id 
                ? { ...u, ...formData } as User 
                : u
            );
        } else {
            // Create new
            const newUser: User = {
                id: `USR${(users.length + 1).toString().padStart(3, '0')}`,
                ...formData as User,
                lastLogin: 'Never'
            };
            updatedList = [...users, newUser];
        }
        
        onUpdateUsers(updatedList);
        localStorage.setItem('crm_users', JSON.stringify(updatedList));
        setView('list');
    };

    const inputClass = "block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl p-6 m-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Manage access and roles for your team</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pt-6">
                    {view === 'list' ? (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Total Users: <span className="font-semibold text-gray-900 dark:text-white">{users.length}</span>
                                </div>
                                <button 
                                    onClick={handleAddNew}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <Plus size={18} />
                                    Add User
                                </button>
                            </div>
                            
                            <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Login</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Badge color={
                                                        user.role === 'Admin' ? 'blue' : 
                                                        user.role === 'Sales' ? 'green' : 
                                                        user.role === 'Finance' ? 'yellow' : 'gray'
                                                    }>
                                                        {user.role}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        user.status === 'Active' 
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                                    }`}>
                                                        <span className={`w-2 h-2 rounded-full mr-1.5 ${user.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        {user.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                                    {user.lastLogin}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">
                                                        <Edit2 size={18} />
                                                    </button>
                                                    <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="max-w-2xl mx-auto">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
                                {editingUser ? 'Edit User' : 'Add New User'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className={inputClass}
                                            placeholder="John Doe"
                                        />
                                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                    </div>

                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                                        <input 
                                            type="email" 
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            className={inputClass}
                                            placeholder="john@medicourier.com"
                                        />
                                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                        <input 
                                            type="text" 
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                            className={inputClass}
                                            placeholder="Set login password"
                                        />
                                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                        <select 
                                            value={formData.role}
                                            onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                                            className={inputClass}
                                        >
                                            <option value="Admin">Admin</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Operations">Operations</option>
                                            <option value="Finance">Finance</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                                        <select 
                                            value={formData.status}
                                            onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Inactive'})}
                                            className={inputClass}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-6 border-t dark:border-gray-700">
                                    <button 
                                        type="button" 
                                        onClick={() => setView('list')}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Check size={18} className="mr-2" />
                                        {editingUser ? 'Update User' : 'Create User'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserManagementModal;