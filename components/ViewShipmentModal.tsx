
import React, { useState, useEffect } from 'react';
import { X, Package, User, MapPin, FileText, ExternalLink, Truck, Calendar, Receipt, FileDown } from 'lucide-react';
import { Shipment, ShipmentStatus, Invoice } from '../types';
import Badge from './Badge';
import { mockInvoices } from '../constants';
import PrintPreviewModal from './PrintPreviewModal';

interface ViewShipmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    shipment: Shipment | null;
}

const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
        case ShipmentStatus.Delivered: return 'green';
        case ShipmentStatus.InTransit:
        case ShipmentStatus.OutForDelivery:
        case ShipmentStatus.PickedUp:
        case ShipmentStatus.DepartedCountry:
        case ShipmentStatus.ArrivedDestination:
        case ShipmentStatus.ArrivedExport:
             return 'blue';
        case ShipmentStatus.CustomsClearance:
        case ShipmentStatus.PendingPickup: return 'yellow';
        case ShipmentStatus.Returned: 
        case ShipmentStatus.Destroyed:
            return 'red';
        default: return 'gray';
    }
};

const ViewShipmentModal: React.FC<ViewShipmentModalProps> = ({ isOpen, onClose, shipment }) => {
    const [linkedInvoice, setLinkedInvoice] = useState<Invoice | null>(null);
    const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);

    useEffect(() => {
        if (isOpen && shipment) {
            // Find the invoice linked to this shipment
            const storedInvoices = localStorage.getItem('crm_invoices');
            const allInvoices: Invoice[] = storedInvoices ? JSON.parse(storedInvoices) : mockInvoices;
            const found = allInvoices.find(inv => inv.id === shipment.invoiceNumber);
            setLinkedInvoice(found || null);
        } else {
            setLinkedInvoice(null);
        }
    }, [isOpen, shipment]);

    if (!isOpen || !shipment) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                                <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipment Details</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">AWB: {shipment.awb}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Status Banner */}
                        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Status</p>
                                <Badge color={getStatusColor(shipment.status)}>{shipment.status}</Badge>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Last Update</p>
                                <div className="flex items-center gap-1 text-gray-900 dark:text-white font-medium">
                                    <Calendar size={14} />
                                    {shipment.lastUpdate}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Logistics Details */}
                            <div>
                                <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b dark:border-gray-700">
                                    <Package size={18} className="text-blue-500" />
                                    Logistics Info
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Courier Partner:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{shipment.courier}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Invoice Number:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{shipment.invoiceNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Weight:</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{shipment.weight} kg</span>
                                    </div>
                                    {shipment.trackingUrl && (
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-gray-500 dark:text-gray-400">Tracking:</span>
                                            <a 
                                                href={shipment.trackingUrl} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                            >
                                                Track Shipment <ExternalLink size={12} />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div>
                                <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b dark:border-gray-700">
                                    <User size={18} className="text-purple-500" />
                                    Customer Info
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Name</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{shipment.customer.name}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Email</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{shipment.customer.email}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 dark:text-gray-400 text-xs">Phone</span>
                                        <span className="font-medium text-gray-900 dark:text-white">{shipment.customer.phone}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Invoice & Payment Details */}
                        {linkedInvoice && (
                            <div>
                                <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b dark:border-gray-700">
                                    <Receipt size={18} className="text-yellow-600" />
                                    Invoice & Payment
                                </h3>
                                <div className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                            Invoice #{linkedInvoice.id}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Total: {new Intl.NumberFormat('en-IN', { style: 'currency', currency: linkedInvoice.currency }).format(linkedInvoice.totalAmount)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            linkedInvoice.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 
                                            linkedInvoice.paymentStatus === 'Partially Paid' ? 'bg-blue-100 text-blue-800' : 
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {linkedInvoice.paymentStatus}
                                        </span>
                                        <button 
                                            onClick={() => setIsInvoicePreviewOpen(true)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 rounded-md transition-colors text-xs font-medium"
                                            title="View Invoice PDF"
                                        >
                                            <FileDown size={14} /> View Invoice
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Route Details */}
                        <div>
                            <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b dark:border-gray-700">
                                <MapPin size={18} className="text-red-500" />
                                Shipping Route
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
                                <div>
                                    <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Origin</span>
                                    <span className="block font-semibold text-gray-900 dark:text-white text-lg">{shipment.origin}</span>
                                </div>
                                <div className="text-right">
                                    <span className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Destination</span>
                                    <span className="block font-semibold text-gray-900 dark:text-white text-lg">{shipment.destination}</span>
                                    <span className="block text-xs text-gray-500 mt-1 max-w-[200px] ml-auto truncate" title={shipment.customer.address}>{shipment.customer.address}</span>
                                </div>
                            </div>
                        </div>

                        {/* Documents */}
                        {shipment.documents && shipment.documents.length > 0 && (
                            <div>
                                <h3 className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b dark:border-gray-700">
                                    <FileText size={18} className="text-green-500" />
                                    Attached Documents
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {shipment.documents.map((doc, idx) => (
                                        <div key={idx} className="flex items-center p-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                                            <div className="p-2 bg-gray-100 dark:bg-gray-600 rounded mr-3">
                                                <FileText size={20} className="text-gray-500 dark:text-gray-300" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">Document {idx + 1}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">Attached</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>

            {/* Nested Invoice Preview Modal */}
            <PrintPreviewModal 
                isOpen={isInvoicePreviewOpen}
                onClose={() => setIsInvoicePreviewOpen(false)}
                data={linkedInvoice}
                type="invoice"
            />
        </>
    );
};

export default ViewShipmentModal;
