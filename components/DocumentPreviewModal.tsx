
import React, { useEffect, useState } from 'react';
import { X, Download, FileText, Image as ImageIcon } from 'lucide-react';

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    documentUrl: string | null;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ isOpen, onClose, documentUrl }) => {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);
    const [fileType, setFileType] = useState<string>('');

    useEffect(() => {
        if (isOpen && documentUrl) {
            // Determine mime type from base64 string
            const match = documentUrl.match(/^data:(.*);base64,/);
            const mimeType = match ? match[1] : 'application/octet-stream';
            setFileType(mimeType);

            // Convert Base64 to Blob to avoid browser security restrictions on Data URLs in iframes/tabs
            try {
                let base64Data = documentUrl;
                if (documentUrl.includes(',')) {
                    base64Data = documentUrl.split(',')[1];
                }
                
                // Remove any whitespace which might break atob
                base64Data = base64Data.replace(/\s/g, '');

                const byteCharacters = atob(base64Data);
                const byteNumbers = new Array(byteCharacters.length);
                for (let i = 0; i < byteCharacters.length; i++) {
                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                }
                const byteArray = new Uint8Array(byteNumbers);
                const blob = new Blob([byteArray], { type: mimeType });
                const url = URL.createObjectURL(blob);
                setBlobUrl(url);
                
                // Cleanup URL on unmount or change
                return () => {
                    URL.revokeObjectURL(url);
                };
            } catch (e) {
                console.error("Error creating blob from base64", e);
                // Fallback to raw data URL if blob creation fails
                setBlobUrl(documentUrl);
            }
        } else {
            setBlobUrl(null);
        }
    }, [isOpen, documentUrl]);

    if (!isOpen || !documentUrl) return null;

    const isPdf = fileType.toLowerCase().includes('pdf');
    const isImage = fileType.toLowerCase().includes('image');

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-[60] flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        {isPdf ? <FileText size={20} className="text-red-500"/> : <ImageIcon size={20} className="text-blue-500"/>}
                        Document Preview
                    </h2>
                    <div className="flex items-center gap-3">
                        <a 
                            href={documentUrl} 
                            download={`document.${isPdf ? 'pdf' : 'png'}`}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                            title="Download File"
                        >
                            <Download size={16} /> Download
                        </a>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 bg-gray-100 dark:bg-gray-900 p-4 overflow-auto flex justify-center items-center relative">
                    {isImage && blobUrl && (
                        <img src={blobUrl} alt="Preview" className="max-w-full max-h-full object-contain shadow-lg" />
                    )}
                    {isPdf && blobUrl && (
                         <iframe src={blobUrl} className="w-full h-full rounded-md shadow-lg border-0 bg-white" title="PDF Preview"></iframe>
                    )}
                    {!isImage && !isPdf && (
                        <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow">
                            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-500 dark:text-gray-300 mb-4">Preview not available for this file type.</p>
                            <a href={documentUrl} download className="text-blue-600 underline">Download File</a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocumentPreviewModal;
