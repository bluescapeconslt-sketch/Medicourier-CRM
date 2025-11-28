
import React, { useState } from 'react';
import { X, Upload, FileText, Trash2, Plus, Image as ImageIcon, Loader } from 'lucide-react';
import { Shipment } from '../types';
import { processFileForUpload } from '../utils/fileHelpers';

interface AddShipmentDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipment: Shipment | null;
    onAdd: (shipmentId: string, newDocuments: string[]) => void;
}

const AddShipmentDocumentModal: React.FC<AddShipmentDocumentModalProps> = ({ isOpen, onClose, shipment, onAdd }) => {
    const [documents, setDocuments] = useState<string[]>([]);
    const [dragActive, setDragActive] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen || !shipment) return null;

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
        if (documents.length > 0) {
            onAdd(shipment.id, documents);
            setDocuments([]);
            onClose();
        }
    };

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

                    {/* Document List */}
                    {documents.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                            {documents.map((doc, index) => {
                                const isPdf = doc.match(/^data:application\/pdf/);
                                return (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                        <div className="flex items-center gap-3 overflow-hidden">
                                            {isPdf ? (
                                                <FileText size={16} className="text-red-500 flex-shrink-0" />
                                            ) : (
                                                <ImageIcon size={16} className="text-blue-500 flex-shrink-0" />
                                            )}
                                            <span className="text-xs text-gray-700 dark:text-gray-300 truncate">
                                                New Document {index + 1}
                                            </span>
                                        </div>
                                        <button 
                                            onClick={() => handleRemoveDocument(index)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
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
                        disabled={documents.length === 0 || isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isProcessing ? <Loader className="animate-spin" size={16} /> : <Plus size={16} />}
                        {isProcessing ? 'Processing...' : 'Add Documents'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddShipmentDocumentModal;
