
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QuotationPDFLayout from '../components/QuotationPDFLayout';
import { Quotation } from '../types';
import { mockQuotations } from '../constants';
import { FileDown, Loader } from 'lucide-react';
import { generatePDF } from '../services/pdfService';

const QuotationPrintPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [quotation, setQuotation] = useState<Quotation | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (id) {
            const quoteDataString = sessionStorage.getItem(`print_quote_${id}`);
            if (quoteDataString) {
                try {
                    const quoteData = JSON.parse(quoteDataString) as Quotation;
                    setQuotation(quoteData);
                } catch (error) {
                    console.error("Failed to parse quotation data from sessionStorage", error);
                    const found = mockQuotations.find(q => q.id === id);
                    if (found) setQuotation(found);
                }
            } else {
                const found = mockQuotations.find(q => q.id === id);
                if (found) setQuotation(found);
            }
        }
    }, [id]);

    const handleDownloadPDF = async () => {
        if (!quotation) return;
        setIsGenerating(true);
        // "quotation-content" is the ID of the wrapper div below
        await generatePDF('quotation-content', `Quotation_${quotation.id}.pdf`);
        setIsGenerating(false);
    };

    if (!quotation) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <div className="text-center">
                    <h1 className="text-xl font-semibold">Loading Quotation...</h1>
                    <p className="text-gray-600 mt-2">If this takes too long, the quotation may not have been found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
            <div className="w-full max-w-[210mm] flex justify-between items-center mb-6 px-4 md:px-0">
                <h1 className="text-2xl font-bold text-gray-800">Quotation Preview</h1>
                <button 
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className={`flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow-lg transition-all hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isGenerating ? 'opacity-75 cursor-not-allowed' : ''}`}
                >
                    {isGenerating ? <Loader className="animate-spin" size={20} /> : <FileDown size={20} />}
                    {isGenerating ? 'Generating PDF...' : 'Download PDF'}
                </button>
            </div>

            {/* 
                This container creates the visual "A4 paper" look on screen.
                The ID "quotation-content" is targeted by html2canvas.
                The width is explicitly set to 210mm to match A4 width for the PDF generator.
            */}
            <div className="shadow-2xl">
                <div id="quotation-content" className="w-[210mm] bg-white">
                    <QuotationPDFLayout quotation={quotation} />
                </div>
            </div>
        </div>
    );
};

export default QuotationPrintPage;
