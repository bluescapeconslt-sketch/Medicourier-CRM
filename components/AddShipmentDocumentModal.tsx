
import React, { useState } from 'react';
import { X, Upload, FileText, Trash2, Plus, Image as ImageIcon, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Shipment } from '../types';
import { processFileForUpload } from '../utils/fileHelpers';

interface AddShipmentDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipment: Shipment | null;
    onAdd: (shipmentId: string, newDocuments: string[]) => void;
}

interface FileUploadItem {
    id: string;
    name: string;
    status: 'processing' | 'success' | 'error';
    base64?: string;
    error?: string;
}

const AddShipmentDocumentModal: React.FC<AddShipmentDocumentModalProps> = ({ isOpen, onClose, shipment, onAdd }) => {
    const [fileQueue, setFileQueue] = useState<FileUploadItem[]>([]);
    const [dragActive, setDragActive] = useState(false);

    if (!isOpen || !shipment) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
        // Reset input value to allow re-selecting the same file if needed
        e.target.value = '';
    };

    const processFiles = (fileList: FileList) => {
        const files = Array.from(fileList);
        
        // Create entries for new files
        const newItems: FileUploadItem[] = files.map(file => ({
            id: Math.random().toString(36).substring(2) + Date.now().toString(),
            name: file.name,
            status: 'processing'
        }));

        setFileQueue(prev => [...prev, ...newItems]);

        // Process each file individually
        files.forEach(async (file, index) => {
            const item = newItems[index];
            try {
                const base64 = await processFileForUpload(file);
                setFileQueue(prev => prev.map(i => 
                    i.id === item.id ? { ...i, status: 'success', base64 } : i
                ));
            } catch (error) {
                console.error("Error processing file:", file.name, error);
                setFileQueue(prev => prev.map(i => 
                    i.id === item.id ? { 
                        ...i, 
                        status: 'error', 
                        error: error instanceof Error ? error.message : "Failed to process" 
                    } : i
                ));
            }
        });
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

    const handleRemoveItem = (id: string) => {
        setFileQueue(prev => prev.filter(i => i.id !== id));
    };

    const handleSubmit = () => {
        const successfulDocs = fileQueue
            .filter(i => i.status === 'success' && i.base64)
            .map(i => i.base64!);

        if (successfulDocs.length > 0) {
            onAdd(shipment.id, successfulDocs);
            setFileQueue([]);
            onClose();
        }
    };

    const isProcessing = fileQueue.some(i => i.status === 'processing');
    const hasSuccessfulDocs = fileQueue.some(i => i.status === 'success');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Documents</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Shipment #{shipment.awb}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="py-6 space-y-4">
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
                                <label htmlFor="add-doc-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                    <span>Upload files</span>
                                    <input 
                                        id="add-doc-upload" 
                                        name="add-doc-upload" 
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

                    {/* File List with Status */}
                    {fileQueue.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
                            {fileQueue.map((item) => {
                                const isPdf = item.name.toLowerCase().endsWith('.pdf');
                                return (
                                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                                            {isPdf ? (
                                                <FileText size={16} className="text-red-500 flex-shrink-0" />
                                            ) : (
                                                <ImageIcon size={16} className="text-blue-500 flex-shrink-0" />
                                            )}
                                            <span className="text-xs text-gray-700 dark:text-gray-300 truncate font-medium max-w-[150px]">
                                                {item.name}
                                            </span>
                                            
                                            {/* Status Indicators */}
                                            {item.status === 'processing' && (
                                                <span className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                                    <Loader size={10} className="animate-spin" /> Processing
                                                </span>
                                            )}
                                            {item.status === 'success' && (
                                                <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                                    <CheckCircle size={10} /> Ready
                                                </span>
                                            )}
                                            {item.status === 'error' && (
                                                <span className="flex items-center gap-1 text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-full" title={item.error}>
                                                    <AlertCircle size={10} /> Failed
                                                </span>
                                            )}
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveItem(item.id)}
                                            className="text-gray-400 hover:text-red-500 p-1 rounded-full transition-colors"
                                            disabled={item.status === 'processing'}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
                        disabled={!hasSuccessfulDocs || isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={16} />
                        Add {fileQueue.filter(i => i.status === 'success').length > 0 ? fileQueue.filter(i => i.status === 'success').length : ''} Documents
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddShipmentDocumentModal;
