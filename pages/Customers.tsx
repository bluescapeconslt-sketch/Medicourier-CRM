
import React, { useState, useEffect } from 'react';
import { mockCustomers } from '../constants';
import Badge from '../components/Badge';
import { Search, PlusCircle } from 'lucide-react';
import { Customer } from '../types';
import AddCustomerModal from '../components/AddCustomerModal';
import { useAuth } from '../context/AuthContext';

const Customers: React.FC = () => {
    const { user } = useAuth();
    
    // Initialize from local storage or mock data
    const [customers, setCustomers] = useState<Customer[]>(() => {
        const stored = localStorage.getItem('crm_customers');
        return stored ? JSON.parse(stored) : mockCustomers;
    });
    
    // Filter customers based on user role (Sales view only their own)
    const [visibleCustomers, setVisibleCustomers] = useState<Customer[]>([]);

    useEffect(() => {
        if (!user) return;
        if (user.role === 'Sales') {
            setVisibleCustomers(customers.filter(c => c.userId === user.id));
        } else {
            setVisibleCustomers(customers);
        }
    }, [customers, user]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const handleAddCustomer = (newCustomer: Customer) => {
        // Attach current user ID to the new customer
        const customerWithUser = { ...newCustomer, userId: user?.id };
        
        const updatedCustomers = [customerWithUser, ...customers];
        setCustomers(updatedCustomers);
        // Persist to local storage
        localStorage.setItem('crm_customers', JSON.stringify(updatedCustomers));
        setIsModalOpen(false);
    };

    const filteredCustomers = visibleCustomers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Customers</h2>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search customers..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200">
                            <PlusCircle size={20} />
                            <span>New Customer</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Phone</th>
                                <th scope="col" className="px-6 py-3">Country</th>
                                <th scope="col" className="px-6 py-3">Address</th>
                                <th scope="col" className="px-6 py-3">Join Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCustomers.length > 0 ? (
                                filteredCustomers.map(customer => (
                                    <tr key={customer.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{customer.name}</td>
                                        <td className="px-6 py-4">{customer.email}</td>
                                        <td className="px-6 py-4">{customer.phone}</td>
                                        <td className="px-6 py-4">{customer.country}</td>
                                        <td className="px-6 py-4 truncate max-w-[200px]" title={customer.address}>{customer.address}</td>
                                        <td className="px-6 py-4">{customer.joinDate}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No customers found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddCustomerModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAddCustomer={handleAddCustomer}
                customerCount={customers.length}
            />
        </>
    );
};

export default Customers;
