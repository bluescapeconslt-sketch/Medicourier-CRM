
import React, { useState, useEffect } from 'react';
import { X, Link, Check } from 'lucide-react';
import { Shipment } from '../types';

interface EditTrackingUrlModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipment: Shipment | null;
    onUpdate: (shipmentId: string, trackingUrl: string) => void;
}

const EditTrackingUrlModal: React.FC<EditTrackingUrlModalProps> = ({ isOpen, onClose, shipment, onUpdate }) => {
    const [url, setUrl] = useState('');

    useEffect(() => {
        if (isOpen && shipment) {
            setUrl(shipment.trackingUrl || '');
        } else {
            setUrl('');
        }
    }, [isOpen, shipment]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (shipment) {
            onUpdate(shipment.id, url);
            onClose();
        }
    };

    if (!isOpen || !shipment) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <Link className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Tracking URL</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">AWB: {shipment.awb}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="py-6">
                    <div>
                        <label htmlFor="trackingUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Tracking URL
                        </label>
                        <input
                            type="text"
                            id="trackingUrl"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="https://..."
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Enter the full tracking link provided by the courier.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 mt-4 border-t dark:border-gray-700">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors"
                        >
                            <Check size={16} />
                            Save URL
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditTrackingUrlModal;
