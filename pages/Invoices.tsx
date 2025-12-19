import React, { useState, useEffect } from 'react';
import { mockInvoices, mockShipments, mockQuotations } from '../constants';
import Badge from '../components/Badge';
import { Invoice, PaymentStatus, Shipment, ShipmentStatus, Quotation } from '../types';
import { Search, FileDown, CreditCard, ExternalLink, Paperclip, Truck, Eye, Filter } from 'lucide-react';
import PrintPreviewModal from '../components/PrintPreviewModal';
import UpdatePaymentModal from '../components/UpdatePaymentModal';
import ShipmentCreationModal from '../components/ShipmentCreationModal';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.Paid: return 'green';
        case PaymentStatus.PartiallyPaid: return 'blue';
        case PaymentStatus.Unpaid: return 'red';
        default: return 'gray';
    }
};

const Invoices: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [visibleInvoices, setVisibleInvoices] = useState<Invoice[]>([]);
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isShipmentModalOpen, setIsShipmentModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Document Preview State
    const [selectedProof, setSelectedProof] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    useEffect(() => {
        // Load Invoices
        const storedInvoices = localStorage.getItem('crm_invoices');
        let parsedInvoices = storedInvoices ? JSON.parse(storedInvoices) : mockInvoices;
        
        // Migration logic
        parsedInvoices = parsedInvoices.map((inv: any) => {
            if (inv.paymentProof && (!inv.paymentProofs || inv.paymentProofs.length === 0)) {
                return { ...inv, paymentProofs: [inv.paymentProof], paymentProof: undefined };
            }
            return inv;
        });

        if (!storedInvoices) localStorage.setItem('crm_invoices', JSON.stringify(mockInvoices));
        setInvoices(parsedInvoices);

        // Load Shipments (to check if an invoice is already shipped)
        const storedShipments = localStorage.getItem('crm_shipments');
        if (storedShipments) {
            setShipments(JSON.parse(storedShipments));
        } else {
            setShipments(mockShipments);
            localStorage.setItem('crm_shipments', JSON.stringify(mockShipments));
        }
    }, []);

    // Filter Logic based on Role
    useEffect(() => {
        if (!user) return;
        if (user.role === 'Sales') {
            setVisibleInvoices(invoices.filter(i => i.userId === user.id));
        } else {
            setVisibleInvoices(invoices);
        }
    }, [invoices, user]);

    const handleOpenPrintModal = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsPrintModalOpen(true);
    };

    const handleOpenPaymentModal = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsPaymentModalOpen(true);
    };

    const handleOpenShipmentModal = (invoice: Invoice) => {
        setSelectedInvoice(invoice);
        setIsShipmentModalOpen(true);
    };

    const handleViewProof = (proofUrl: string) => {
        setSelectedProof(proofUrl);
        setIsPreviewOpen(true);
    };

    const handleUpdatePayment = (id: string, status: PaymentStatus, proofs: string[], amountPaid: number, balanceDue: number, paymentSource: string) => {
        const updatedInvoices = invoices.map(inv => 
            inv.id === id ? { 
                ...inv, 
                paymentStatus: status, 
                paymentProofs: proofs,
                amountPaid: amountPaid,
                balanceDue: balanceDue,
                paymentSource: paymentSource
            } : inv
        );
        
        try {
            setInvoices(updatedInvoices);
            localStorage.setItem('crm_invoices', JSON.stringify(updatedInvoices));
        } catch (e) {
             console.error("Quota Exceeded", e);
             alert("Failed to save payment proof: Storage full. Please remove old data or use smaller images.");
        }
    };

    const handleCreateShipment = (invoice: Invoice, documents: string[], trackingUrl: string, courier: string) => {
        const storedQuotations = localStorage.getItem('crm_quotations');
        const quotations: Quotation[] = storedQuotations ? JSON.parse(storedQuotations) : mockQuotations;
        const relatedQuote = quotations.find(q => q.id === invoice.quoteId);

        const newShipmentId = `SHP${(shipments.length + 1).toString().padStart(3, '0')}`;
        const newShipment: Shipment = {
            id: newShipmentId,
            userId: invoice.userId, // Inherit ownership
            invoiceNumber: invoice.id,
            awb: 'PENDING-' + Math.floor(Math.random() * 1000000), 
            customer: invoice.customer,
            origin: relatedQuote ? relatedQuote.origin : 'Unknown',
            destination: relatedQuote ? relatedQuote.destination : 'Unknown',
            courier: courier as any,
            status: ShipmentStatus.PendingPickup,
            lastUpdate: new Date().toISOString().split('T')[0],
            weight: relatedQuote ? relatedQuote.weight : 1.0,
            documents: documents,
            trackingUrl: trackingUrl
        };

        const updatedShipments = [newShipment, ...shipments];
        
        try {
            localStorage.setItem('crm_shipments', JSON.stringify(updatedShipments));
            setShipments(updatedShipments);

            // Close the modal immediately
            setIsShipmentModalOpen(false);
            
            setTimeout(() => {
                alert(`Shipment created successfully!\nAWB: ${newShipment.awb}\nCourier: ${courier}`);
                navigate('/shipments');
            }, 500);
        } catch (error) {
            console.error("Storage error:", error);
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                 alert("Storage Limit Exceeded: Browser storage is full. The shipment was created but documents could not be saved.");
            } else {
                 alert("Error: An unexpected error occurred while saving.");
            }
        }
    };

    const filteredInvoices = visibleInvoices.filter(inv => {
        const matchesSearch = inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter ? inv.paymentStatus === statusFilter : true;
        
        return matchesSearch && matchesStatus;
    });

    return (
        <>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Invoices</h2>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-auto">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text" 
                                placeholder="Search by invoice ID..." 
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
                                {Object.values(PaymentStatus).map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <Filter size={14} />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto min-h-[400px]">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">Invoice ID</th>
                                <th scope="col" className="px-6 py-3">Customer</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Paid</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Proofs</th>
                                <th scope="col" className="px-6 py-3">Due Date</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredInvoices.length > 0 ? (
                                filteredInvoices.map(invoice => {
                                    const isShipped = shipments.some(s => s.invoiceNumber === invoice.id);
                                    const isPaid = invoice.paymentStatus === PaymentStatus.Paid;
                                    
                                    return (
                                        <tr key={invoice.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">{invoice.id}</td>
                                            <td className="px-6 py-4">{invoice.customer.name}</td>
                                            <td className="px-6 py-4">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency }).format(invoice.totalAmount)}</td>
                                            <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                                                {invoice.amountPaid !== undefined ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: invoice.currency }).format(invoice.amountPaid) : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge color={getStatusColor(invoice.paymentStatus)}>{invoice.paymentStatus}</Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                {invoice.paymentProofs && invoice.paymentProofs.length > 0 ? (
                                                    <div className="flex flex-wrap gap-2">
                                                        {invoice.paymentProofs.map((proof, idx) => (
                                                            <div 
                                                                key={idx} 
                                                                onClick={() => handleViewProof(proof)}
                                                                className="relative h-10 w-10 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all group bg-gray-100"
                                                                title={`View Proof ${idx + 1}`}
                                                            >
                                                                <img 
                                                                    src={proof} 
                                                                    alt={`Proof ${idx + 1}`} 
                                                                    className="w-full h-full object-cover" 
                                                                />
                                                                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <Eye size={12} className="text-white drop-shadow-md" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">{invoice.dueDate}</td>
                                            <td className="px-6 py-4 flex gap-2">
                                                {isPaid && !isShipped && (
                                                    <button 
                                                        onClick={() => handleOpenShipmentModal(invoice)}
                                                        className="text-gray-500 hover:text-purple-600 transition-colors"
                                                        aria-label="Ship Now"
                                                        title="Ship Now"
                                                    >
                                                        <Truck size={18} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleOpenPaymentModal(invoice)} 
                                                    className="text-gray-500 hover:text-green-600 transition-colors" 
                                                    aria-label="Update Payment"
                                                    title="Update Payment"
                                                >
                                                    <CreditCard size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenPrintModal(invoice)} 
                                                    className="text-gray-500 hover:text-blue-600 transition-colors" 
                                                    aria-label="Download PDF"
                                                    title="Print/PDF"
                                                >
                                                    <FileDown size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">No invoices found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <PrintPreviewModal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                data={selectedInvoice}
                type="invoice"
            />
            <UpdatePaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                invoice={selectedInvoice}
                onUpdate={handleUpdatePayment}
            />
            <ShipmentCreationModal
                isOpen={isShipmentModalOpen}
                onClose={() => setIsShipmentModalOpen(false)}
                invoice={selectedInvoice}
                onSubmit={handleCreateShipment}
            />
            <DocumentPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                documentUrl={selectedProof}
            />
        </>
    );
};

export default Invoices;