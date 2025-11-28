
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Shipments from './pages/Shipments';
import Customers from './pages/Customers';
import Quotations from './pages/Quotations';
import Invoices from './pages/Invoices';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import SmartAssistant from './components/SmartAssistant';
import { MessageCircle } from 'lucide-react';

const App: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isAssistantOpen, setIsAssistantOpen] = useState(false);

    const MainLayout = () => (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header sidebarOpen={isSidebarOpen} setSidebarOpen={setIsSidebarOpen} />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 sm:p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>
             <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsAssistantOpen(!isAssistantOpen)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    aria-label="Toggle AI Assistant"
                >
                    <MessageCircle size={24} />
                </button>
            </div>
            <SmartAssistant isOpen={isAssistantOpen} setIsOpen={setIsAssistantOpen} />
        </div>
    );

    return (
        <HashRouter>
            <Routes>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/shipments" element={<Shipments />} />
                    <Route path="/customers" element={<Customers />} />
                    <Route path="/quotations" element={<Quotations />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
            </Routes>
        </HashRouter>
    );
};

export default App;
