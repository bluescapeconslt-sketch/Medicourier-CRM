
import React, { useState, useEffect } from 'react';
import { mockQuotations, mockCustomers, mockInvoices } from '../constants';
import { QuoteStatus, Quotation, Invoice, PaymentStatus, Customer } from '../types';
import { Search, PlusCircle, FileDown, Eye, Edit3, ChevronDown, FileCheck, Filter } from 'lucide-react';
import AddQuotationModal from '../components/AddQuotationModal';
import ViewQuotationModal from '../components/ViewQuotationModal';
import PrintPreviewModal from '../components/PrintPreviewModal';
import ConfirmConversionModal from '../components/ConfirmConversionModal';
import { useNavigate } from 'react-router-dom';

const statusStyles = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
};

const getStatusColorKey = (status: QuoteStatus): keyof typeof statusStyles => {
    switch (status) {
        case QuoteStatus.Accepted:
        case QuoteStatus.Converted: return 'green';
        case QuoteStatus.Sent: return 'blue';
        case QuoteStatus.Draft: return 'gray';
        case QuoteStatus.Rejected: return 'red';
        default: return 'gray';
    }
};

const Quotations: React.FC = () => {
    const navigate = useNavigate();
    const [quotations, setQuotations] = useState<Quotation[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
    const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
    const [quoteToConvert, setQuoteToConvert] = useState<Quotation | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Load data on mount
    useEffect(() => {
        // Load Customers from local storage
        const storedCustomers = localStorage.getItem('crm_customers');
        if (storedCustomers) {
            setCustomers(JSON.parse(storedCustomers));
        } else {
            setCustomers(mockCustomers);
        }

        // Load Quotations
        const storedQuotations = localStorage.getItem('crm_quotations');
        if (storedQuotations) {
            setQuotations(JSON.parse(storedQuotations));
        } else {
            setQuotations(mockQuotations);
        }
    }, []);

    // Persist changes to local storage whenever quotations change
    useEffect(() => {
        if (quotations.length > 0) {
            localStorage.setItem('crm_quotations', JSON.stringify(quotations));
        }
    }, [quotations]);

    const handleOpenAddModal = () => {
        setSelectedQuotation(null);
        setIsAddEditModalOpen(true);
    };

    const handleOpenEditModal = (quotation: Quotation) => {
        setSelectedQuotation(quotation);
        setIsAddEditModalOpen(true);
    };

    const handleOpenViewModal = (quotation: Quotation) => {
        setSelectedQuotation(quotation);
        setIsViewModalOpen(true);
    };

    const handleViewDownload = () => {
        setIsViewModalOpen(false);
        setIsPrintModalOpen(true);
    };

    const handleOpenPrintModal = (quotation: Quotation) => {
        setSelectedQuotation(quotation);
        setIsPrintModalOpen(true);
    };

    const handleSaveQuotation = (savedQuotation: Quotation) => {
        const exists = quotations.some(q => q.id === savedQuotation.id);
        if (exists) {
            setQuotations(quotations.map(q => q.id === savedQuotation.id ? savedQuotation : q));
        } else {
            setQuotations(prev => [savedQuotation, ...prev]);
        }
        setIsAddEditModalOpen(false);
    };

    const handleStatusChange = (id: string, newStatus: QuoteStatus) => {
        // If converting to invoice, open confirmation modal instead of updating immediately
        if (newStatus === QuoteStatus.Converted) {
            const quotationToConvert = quotations.find(q => q.id === id);
            if (quotationToConvert) {
                handleConvertClick(quotationToConvert);
            }
        } else {
             // Normal status update
             const updatedQuotations = quotations.map(q => 
                q.id === id ? { ...q, status: newStatus } : q
            );
            setQuotations(updatedQuotations);
        }
    };

    const handleConvertClick = (quote: Quotation) => {
        setQuoteToConvert(quote);
        setIsConvertModalOpen(true);
    };

    const handleConfirmConvert = () => {
        if (!quoteToConvert) return;

        // Update status
        const updatedQuotations = quotations.map(q => 
            q.id === quoteToConvert.id ? { ...q, status: QuoteStatus.Converted } : q
        );
        setQuotations(updatedQuotations);
        createInvoiceFromQuote(quoteToConvert);
        
        setIsConvertModalOpen(false);
        setQuoteToConvert(null);
    };

    const createInvoiceFromQuote = (quote: Quotation) => {
        // 1. Get existing invoices from storage to determine ID
        const storedInvoicesStr = localStorage.getItem('crm_invoices');
        const existingInvoices: Invoice[] = storedInvoicesStr 
            ? JSON.parse(storedInvoicesStr) 
            : mockInvoices;

        // 2. Create new Invoice object
        const newInvoiceId = `INV${(existingInvoices.length + 1).toString().padStart(3, '0')}`;
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 15);

        const newInvoice: Invoice = {
            id: newInvoiceId,
            quoteId: quote.id,
            customer: quote.customer,
            totalAmount: quote.totalCost,
            currency: 'INR', // Default, or fetch from settings
            paymentStatus: PaymentStatus.Unpaid,
            issueDate: today.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            taxName: quote.taxName,
            taxRate: quote.taxRate,
            discount: quote.discount,
            purpose: quote.purpose,
            remoteAreaCharges: quote.remoteAreaCharges,
            deliveryCharges: quote.deliveryCharges,
            pickupCharges: quote.pickupCharges,
        };

        // 3. Save to local storage
        const updatedInvoices = [newInvoice, ...existingInvoices];
        localStorage.setItem('crm_invoices', JSON.stringify(updatedInvoices));

        // 4. Navigate to invoices page
        navigate('/invoices');
    };

    const filteredQuotations = quotations.filter(q => {
        const matchesSearch = q.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              q.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter ? q.status === statusFilter : true;
        
        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Quotations</h2>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by quote ID or Customer..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full sm:w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div className="relative w-full sm:w-40">
                             <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full appearance-none pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-200"
                            >
                                <option value="">All Statuses</option>
                                {Object.values(QuoteStatus).map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <Filter size={14} />
                            </div>
                        </div>
                        <button 
                            onClick={handleOpenAddModal}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 whitespace-nowrap">
                            <PlusCircle size={20} />
                            <span>New Quote</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Quote ID</th>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Origin</th>
                                <th scope="col" className="px-6 py-3">Destination</th>
                                <th scope="col" className="px-6 py-3">Weight (kg)</th>
                                <th scope="col" className="px-6 py-3">Total Cost</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredQuotations.map(quote => (
                                <tr key={quote.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">{quote.id}</td>
                                    <td className="px-6 py-4">{quote.customer.name}</td>
                                    <td className="px-6 py-4">{quote.origin}</td>
                                    <td className="px-6 py-4">{quote.destination}</td>
                                    <td className="px-6 py-4">{quote.weight.toFixed(2)}</td>
                                    <td className="px-6 py-4">₹{quote.totalCost.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <div className="relative">
                                            <select
                                                value={quote.status}
                                                onChange={(e) => handleStatusChange(quote.id, e.target.value as QuoteStatus)}
                                                className={`appearance-none block w-full pl-3 pr-8 py-1.5 text-xs font-semibold rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${statusStyles[getStatusColorKey(quote.status)]}`}
                                            >
                                                {Object.values(QuoteStatus).map((status) => (
                                                    <option key={status} value={status} className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600 dark:text-gray-300">
                                                <ChevronDown size={12} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 flex items-center space-x-3">
                                        <button onClick={() => handleOpenViewModal(quote)} className="text-gray-500 hover:text-blue-600" aria-label="View quotation" title="View">
                                            <Eye size={18} />
                                        </button>
                                        <button onClick={() => handleOpenEditModal(quote)} className="text-gray-500 hover:text-green-600" aria-label="Edit quotation" title="Edit">
                                            <Edit3 size={18} />
                                        </button>
                                        <button onClick={() => handleOpenPrintModal(quote)} className="text-gray-500 hover:text-red-600" aria-label="Download PDF" title="Print/PDF">
                                            <FileDown size={18} />
                                        </button>
                                        {quote.status !== QuoteStatus.Converted && (
                                            <button 
                                                onClick={() => handleConvertClick(quote)} 
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-xs font-semibold ml-2" 
                                                aria-label="Convert to Invoice"
                                                title="Convert to Invoice"
                                            >
                                                <FileCheck size={14} />
                                                Convert
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddQuotationModal
                isOpen={isAddEditModalOpen}
                onClose={() => setIsAddEditModalOpen(false)}
                onSave={handleSaveQuotation}
                customers={customers}
                quotationCount={quotations.length}
                quotationToEdit={selectedQuotation}
            />
            <ViewQuotationModal 
                isOpen={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                quotation={selectedQuotation}
                onDownload={handleViewDownload}
            />
            <PrintPreviewModal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                data={selectedQuotation}
                type="quotation"
            />
            <ConfirmConversionModal 
                isOpen={isConvertModalOpen}
                onClose={() => setIsConvertModalOpen(false)}
                onConfirm={handleConfirmConvert}
                quotation={quoteToConvert}
            />
        </>
    );
};

export default Quotations;
