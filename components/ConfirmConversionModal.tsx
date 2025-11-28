
import React from 'react';
import { Quotation } from '../types';
import { AlertTriangle, FileCheck } from 'lucide-react';

interface ConfirmConversionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    quotation: Quotation | null;
}

const ConfirmConversionModal: React.FC<ConfirmConversionModalProps> = ({ isOpen, onClose, onConfirm, quotation }) => {
    if (!isOpen || !quotation) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4 animate-fade-in" onClick={e => e.stopPropagation()}>
                <div className="flex items-center gap-4 mb-4 text-amber-600 dark:text-amber-500">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                        <AlertTriangle size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Confirm Conversion</h2>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    You are about to convert Quote <span className="font-bold text-gray-900 dark:text-white">#{quotation.id}</span> to an official Invoice.
                    This action will generate a new invoice and update the quote status.
                </p>

                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-6 border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Customer</span>
                        <span className="font-medium text-gray-900 dark:text-white">{quotation.customer.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Total Amount</span>
                        <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                            ₹{quotation.totalCost.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                        </span>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <FileCheck size={16} />
                        Confirm & Convert
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmConversionModal;
