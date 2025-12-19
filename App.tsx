

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
import Login from './pages/Login';
import SmartAssistant from './components/SmartAssistant';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { MessageCircle } from 'lucide-react';
import QuotationPrintPage from './pages/QuotationPrintPage';
import InvoicePrintPage from './pages/InvoicePrintPage';
import ShippingCalculator from './pages/ShippingCalculator'; // New import

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
        <AuthProvider>
            <HashRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    {/* Public Print Routes (optional, usually secured but left open for iframe/preview logic if needed) */}
                    <Route path="/quotation/print/:id" element={<QuotationPrintPage />} />
                    <Route path="/invoice/print/:id" element={<InvoicePrintPage />} />
                    
                    {/* Role Based Routes */}
                    <Route element={<MainLayout />}>
                        
                        {/* Common Routes: Accessible by All Authenticated Users */}
                        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Sales', 'Operations', 'Finance']} />}>
                            <Route path="/" element={<Navigate to="/dashboard" />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                        </Route>

                        {/* Operations & Admin & Sales */}
                        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Operations', 'Sales']} />}>
                            <Route path="/shipments" element={<Shipments />} />
                        </Route>

                        {/* Sales & Admin */}
                        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Sales']} />}>
                            <Route path="/customers" element={<Customers />} />
                            <Route path="/quotations" element={<Quotations />} />
                            <Route path="/shipping-calculator" element={<ShippingCalculator />} /> {/* New Route */}
                        </Route>

                        {/* Finance & Admin & Sales */}
                        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Finance', 'Sales']} />}>
                            <Route path="/invoices" element={<Invoices />} />
                        </Route>

                        {/* Finance & Admin */}
                        <Route element={<ProtectedRoute allowedRoles={['Admin', 'Finance']} />}>
                            <Route path="/reports" element={<Reports />} />
                        </Route>

                        {/* Admin Only */}
                        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                            <Route path="/settings" element={<Settings />} />
                        </Route>

                    </Route>
                    
                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </HashRouter>
        </AuthProvider>
    );
};

export default App;