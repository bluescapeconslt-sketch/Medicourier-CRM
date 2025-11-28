
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Customer } from '../types';

interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddCustomer: (customer: Customer) => void;
    customerCount: number;
}

const AddCustomerModal: React.FC<AddCustomerModalProps> = ({ isOpen, onClose, onAddCustomer, customerCount }) => {
    const initialFormState = {
        name: '',
        email: '',
        phone: '',
        address: '',
        country: '',
    };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is invalid";
        }
        if (!formData.phone.trim()) newErrors.phone = "Phone is required";
        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.country.trim()) newErrors.country = "Country is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const newCustomer: Customer = {
            id: `CUST${(customerCount + 1).toString().padStart(3, '0')}`,
            ...formData,
            joinDate: new Date().toISOString().split('T')[0],
        };
        onAddCustomer(newCustomer);
        setFormData(initialFormState);
        setErrors({});
    };
    
    if (!isOpen) return null;

    const inputClass = "mt-1 block w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md";
    const errorClass = "text-red-500 text-xs mt-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Customer</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="pt-4">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputClass} />
                            {errors.name && <p className={errorClass}>{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={inputClass} />
                             {errors.email && <p className={errorClass}>{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                            <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
                             {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                            <input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className={inputClass} />
                             {errors.address && <p className={errorClass}>{errors.address}</p>}
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Country</label>
                            <input type="text" name="country" id="country" value={formData.country} onChange={handleChange} className={inputClass} />
                             {errors.country && <p className={errorClass}>{errors.country}</p>}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Customer</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddCustomerModal;