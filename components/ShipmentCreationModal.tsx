

import React, { useState } from 'react';
import { X, Upload, Package, FileText, Trash2, Truck, Loader, Link, Box } from 'lucide-react';
import { Invoice } from '../types';
import { processFileForUpload } from '../utils/fileHelpers';

interface ShipmentCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice | null;
    onSubmit: (invoice: Invoice, documents: string[], trackingUrl: string, courier: string) => void;
}

const ShipmentCreationModal: React.FC<ShipmentCreationModalProps> = ({ isOpen, onClose, invoice, onSubmit }) => {
    const [documents, setDocuments] = useState<string[]>([]);
    const [trackingUrl, setTrackingUrl] = useState('');
    const [courier, setCourier] = useState('DHL');
    const [dragActive, setDragActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen || !invoice) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
        // Reset input value to allow re-selecting the same file if needed
        e.target.value = '';
    };

    const processFiles = async (fileList: FileList) => {
        setIsProcessing(true);
        const files = Array.from(fileList);
        
        try {
            const processedDocs = await Promise.all(
                files.map(file => processFileForUpload(file))
            );
            setDocuments(prev => [...prev, ...processedDocs]);
        } catch (error) {
            console.error("Error processing files:", error);
            alert(error instanceof Error ? error.message : "Failed to process files.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleRemoveDocument = (index: number) => {
        setDocuments(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        onSubmit(invoice, documents, trackingUrl, courier);
        setDocuments([]);
        setTrackingUrl('');
        setCourier('DHL');
        // Don't close here, let the parent handle closure/success
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Shipment</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Invoice #{invoice.id} • {invoice.customer.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="py-6 space-y-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md border border-blue-100 dark:border-blue-800">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                            Please provide courier details and upload necessary documents to proceed.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Courier Partner
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Box className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </div>
                                <select
                                    value={courier}
                                    onChange={(e) => setCourier(e.target.value)}
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 appearance-none"
                                >
                                    <option value="DHL">DHL</option>
                                    <option value="FedEx">FedEx</option>
                                    <option value="Aramex">Aramex</option>
                                    <option value="UPS">UPS</option>
                                    <option value="India Post">India Post</option>
                                    <option value="EMS">EMS</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Custom Tracking URL (Optional)
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Link className="h-4 w-4 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    type="text"
                                    name="trackingUrl"
                                    id="trackingUrl"
                                    className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2"
                                    placeholder="https://..."
                                    value={trackingUrl}
                                    onChange={(e) => setTrackingUrl(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shipping Documents</label>
                            <span className="text-xs text-gray-500">{documents.length} files attached</span>
                        </div>
                        
                        <div 
                            className={`flex flex-col justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="space-y-1 text-center">
                                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                    <label htmlFor="doc-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        <span>Upload documents</span>
                                        <input 
                                            id="doc-upload" 
                                            name="doc-upload" 
                                            type="file" 
                                            className="sr-only" 
                                            multiple 
                                            accept=".pdf,image/*"
                                            onChange={handleFileChange} 
                                        />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PDF, JPG, PNG supported (Max 300KB)</p>
                            </div>
                        </div>

                        {/* Document List */}
                        {documents.length > 0 && (
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-40 overflow-y-auto">
                                {documents.map((doc, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <FileText size={16} className="text-blue-500 flex-shrink-0" />
                                            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">Document {index + 1}</span>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveDocument(index)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? <Loader className="animate-spin" size={16} /> : <Package size={16} />}
                        {isProcessing ? 'Processing...' : 'Submit & Ship'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShipmentCreationModal;
