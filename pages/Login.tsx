
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, Lock, Mail, ArrowRight, Loader } from 'lucide-react';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);

        // Simulate network delay for effect
        setTimeout(async () => {
            const success = await login(email, password);
            if (success) {
                navigate('/dashboard');
            } else {
                setError('Invalid email or password. Please try again.');
                setIsLoggingIn(false);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white mb-4 shadow-lg">
                    <Package size={32} strokeWidth={2.5} />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">MediCourier CRM</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Log in to manage your shipments</p>
            </div>

            <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm p-3 rounded-lg flex items-center">
                                <span className="font-medium mr-1">Error:</span> {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoggingIn ? <Loader size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
