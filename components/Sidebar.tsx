
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, FileText, Receipt, BarChart2, Settings, X, Package } from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
    { icon: LayoutDashboard, text: 'Dashboard', path: '/dashboard' },
    { icon: Users, text: 'Customers', path: '/customers' },
    { icon: FileText, text: 'Quotations', path: '/quotations' },
    { icon: Receipt, text: 'Invoices', path: '/invoices' },
    { icon: Truck, text: 'Shipments', path: '/shipments' },
    { icon: BarChart2, text: 'Reports', path: '/reports' },
    { icon: Settings, text: 'Settings', path: '/settings' },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
    const NavItem: React.FC<{ item: typeof navItems[0] }> = ({ item }) => (
        <li>
            <NavLink
                to={item.path}
                className={({ isActive }) =>
                    `flex items-center p-3 my-1 rounded-lg transition-colors duration-200 ${
                        isActive
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`
                }
            >
                <item.icon className="h-5 w-5" />
                <span className="ml-4 text-sm font-medium">{item.text}</span>
            </NavLink>
        </li>
    );

    return (
        <>
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden ${isOpen ? 'block' : 'hidden'}`}
                onClick={() => setIsOpen(false)}
            ></div>
            <aside
                className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 shadow-xl z-30 w-64 transform transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                } md:relative md:translate-x-0 md:flex md:flex-shrink-0`}
            >
                <div className="flex flex-col w-full">
                    <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
                         <div className="flex items-center text-blue-600 dark:text-blue-400">
                             <Package size={28} className="mr-2"/>
                            <span className="text-xl font-bold">MediCourier</span>
                         </div>
                        <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700">
                            <X size={24} />
                        </button>
                    </div>
                    <nav className="flex-1 px-4 py-4">
                        <ul>
                            {navItems.map((item) => (
                                <NavItem key={item.text} item={item} />
                            ))}
                        </ul>
                    </nav>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
