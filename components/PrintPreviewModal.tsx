
import React, { useState } from 'react';
import { X, FileDown, Loader, Printer } from 'lucide-react';
import { Quotation, Invoice } from '../types';
import QuotationPDFLayout from './QuotationPDFLayout';
import InvoicePDFLayout from './InvoicePDFLayout';
import { generatePDF } from '../services/pdfService';
import { mockQuotations } from '../constants';

interface PrintPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: Quotation | Invoice | null;
    type: 'quotation' | 'invoice';
}

const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ isOpen, onClose, data, type }) => {
    const [isGenerating, setIsGenerating] = useState(false);

    if (!isOpen || !data) return null;

    const handleDownload = async () => {
        setIsGenerating(true);
        const elementId = 'pdf-render-content';
        const fileName = `${type}_${data.id}.pdf`;
        
        // Small timeout to allow the UI to update if needed
        setTimeout(async () => {
            await generatePDF(elementId, fileName);
            setIsGenerating(false);
        }, 100);
    };

    const handlePrint = () => {
        window.print();
    };

    let content;
    if (type === 'quotation') {
        content = <QuotationPDFLayout quotation={data as Quotation} />;
    } else {
        const inv = data as Invoice;
        // Load quotations from local storage to ensure we find the one linked to this invoice
        const storedQuotations = localStorage.getItem('crm_quotations');
        const allQuotations: Quotation[] = storedQuotations ? JSON.parse(storedQuotations) : mockQuotations;
        const relatedQuotation = allQuotations.find(q => q.id === inv.quoteId);
        
        content = <InvoicePDFLayout invoice={inv} quotation={relatedQuotation} />;
    }

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4 overflow-hidden">
             <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { visibility: hidden; }
                    #pdf-render-content { 
                        visibility: visible; 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 210mm;
                        margin: 0;
                        padding: 0;
                        overflow: visible;
                    }
                    #pdf-render-content * { visibility: visible; }
                    /* Force background graphics */
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}</style>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">{type} Preview</h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <Printer size={18} />
                            <span>Print</span>
                        </button>
                         <button
                            onClick={handleDownload}
                            disabled={isGenerating}
                            className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${isGenerating ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {isGenerating ? <Loader className="animate-spin" size={18}/> : <FileDown size={18}/>}
                            <span>{isGenerating ? 'Generating...' : 'Download PDF'}</span>
                        </button>
                        <button onClick={onClose} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                
                <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-900 p-8 flex justify-center">
                    {/* The specific width 210mm ensures A4 scaling matches the PDF generator expectation */}
                    <div className="shadow-lg">
                        <div id="pdf-render-content" className="bg-white w-[210mm] min-h-[297mm] origin-top">
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrintPreviewModal;
