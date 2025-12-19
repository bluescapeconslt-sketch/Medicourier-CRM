
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import InvoicePDFLayout from '../components/InvoicePDFLayout';
import { Invoice, Quotation } from '../types';
import { mockInvoices, mockQuotations } from '../constants';
import { FileDown, Loader } from 'lucide-react';
import { generatePDF } from '../services/pdfService';

const InvoicePrintPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [invoice, setInvoice] = useState<Invoice | null>(null);
    const [quotation, setQuotation] = useState<Quotation | undefined>(undefined);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (id) {
            const invoiceDataString = sessionStorage.getItem(`print_invoice_${id}`);
            let foundInvoice: Invoice | undefined;

            if (invoiceDataString) {
                try {
                    foundInvoice = JSON.parse(invoiceDataString) as Invoice;
                } catch (error) {
                    console.error("Failed to parse invoice data from sessionStorage", error);
                }
            }

            if (!foundInvoice) {
                // Check local storage first, then mock
                const storedInvoices = localStorage.getItem('crm_invoices');
                const allInvoices: Invoice[] = storedInvoices ? JSON.parse(storedInvoices) : mockInvoices;
                foundInvoice = allInvoices.find(i => i.id === id);
            }

            if (foundInvoice) {
                setInvoice(foundInvoice);
                // Fetch related quotation from local storage or mock
                const storedQuotations = localStorage.getItem('crm_quotations');
                const allQuotations: Quotation[] = storedQuotations ? JSON.parse(storedQuotations) : mockQuotations;
                const relatedQuotation = allQuotations.find(q => q.id === foundInvoice!.quoteId);
                
                setQuotation(relatedQuotation);
            }
        }
    }, [id]);

    const handleDownloadPDF = async () => {
        if (!invoice) return;
        setIsGenerating(true);
        await generatePDF('invoice-content', `Invoice_${invoice.id}.pdf`);
        setIsGenerating(false);
    };

    if (!invoice) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <h1 className="text-xl font-semibold">Loading Invoice...</h1>
                    <p className="text-gray-600 mt-2">If this takes too long, the invoice may not have been found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
            <div className="w-full max-w-[210mm] flex justify-between items-center mb-6 px-4 md:px-0">
                <h1 className="text-2xl font-bold text-gray-800">Invoice Preview</h1>
                <button 
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className={`flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow-lg transition-all hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isGenerating ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                    {isGenerating ? <Loader className="animate-spin" size={20} /> : <FileDown size={20} />}
                    {isGenerating ? 'Generating PDF...' : 'Download PDF'}
                </button>
            </div>

             <div className="shadow-2xl">
                <div id="invoice-content" className="w-[210mm] bg-white">
                    <InvoicePDFLayout invoice={invoice} quotation={quotation} />
                </div>
            </div>
        </div>
    );
};

export default InvoicePrintPage;
