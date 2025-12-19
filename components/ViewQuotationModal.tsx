
import React, { useState, useEffect } from 'react';
import { X, FileDown } from 'lucide-react';
import { Quotation } from '../types';
import Badge from './Badge';
import { QuoteStatus } from '../types';

interface ViewQuotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    quotation: Quotation | null;
    onDownload?: () => void;
}

const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
        case QuoteStatus.Accepted:
        case QuoteStatus.Converted: return 'green';
        case QuoteStatus.Sent: return 'blue';
        case QuoteStatus.Draft: return 'gray';
        case QuoteStatus.Rejected: return 'red';
        default: return 'gray';
    }
};

const ViewQuotationModal: React.FC<ViewQuotationModalProps> = ({ isOpen, onClose, quotation, onDownload }) => {
    // State to hold tax config
    const [taxConfig, setTaxConfig] = useState({ name: 'GST', rate: 5 });

    useEffect(() => {
        if (isOpen && quotation) {
             const storedName = quotation.taxName || localStorage.getItem('crm_tax_name') || 'GST';
             // Default tax rate in config is overridden by line-item calc, but kept here for display if needed
             const storedRate = quotation.taxRate !== undefined ? quotation.taxRate : parseFloat(localStorage.getItem('crm_tax_rate') || '5');
             setTaxConfig({ name: storedName, rate: isNaN(storedRate) ? 0 : storedRate });
        }
    }, [isOpen, quotation]);

    if (!isOpen || !quotation) return null;

    const discountRate = quotation.discount || 0;
    const decimalDiscountRate = discountRate / 100;
    const remoteCharges = quotation.remoteAreaCharges || 0;
    const deliveryCharges = quotation.deliveryCharges || 0;
    const pickupCharges = quotation.pickupCharges || 0;

    // Check if Intra-State (Kerala)
    const isIntraState = quotation.billingState?.trim().toLowerCase() === 'kerala';

    // Calculate totals based on item rates
    let grossSubtotal = 0;
    let totalItemTax = 0;

    quotation.medicines.forEach(med => {
        const lineTotal = med.quantity * med.rate;
        grossSubtotal += lineTotal;
        const medGst = med.gstRate !== undefined ? med.gstRate : 12; // default to 12 if missing
        totalItemTax += lineTotal * (medGst / 100);
    });

    const discountAmount = grossSubtotal * decimalDiscountRate;
    
    // Delivery is Exclusive of 18% GST -> add tax
    const deliveryBase = deliveryCharges;
    const deliveryTax = deliveryCharges * 0.18;

    // Remote is Exclusive -> add tax
    const remoteTax = remoteCharges * 0.18;

    const chargesTax = deliveryTax + remoteTax;
    const totalTax = totalItemTax + chargesTax;
    
    // Split for display
    const totalCGST = totalTax / 2;
    const totalSGST = totalTax / 2;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quotation Details: {quotation.id}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="pt-4 max-h-[80vh] overflow-y-auto pr-2 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Details */}
                        <div>
                            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Customer Information</h3>
                            <div className="space-y-1 text-gray-800 dark:text-gray-200">
                                <p><strong>Name:</strong> {quotation.customer.name}</p>
                                <p><strong>Email:</strong> {quotation.customer.email}</p>
                                <p><strong>Phone:</strong> {quotation.customer.phone}</p>
                                <p><strong>Address:</strong> {quotation.customer.address}</p>
                                {quotation.billingState && <p><strong>State:</strong> {quotation.billingState}</p>}
                            </div>
                        </div>

                        {/* Shipment Details */}
                        <div>
                             <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Shipment & Status</h3>
                            <div className="space-y-1 text-gray-800 dark:text-gray-200">
                                <p><strong>Origin:</strong> {quotation.origin}</p>
                                <p><strong>Destination:</strong> {quotation.destination}</p>
                                <p><strong>Total Weight:</strong> {quotation.weight.toFixed(2)} kg</p>
                                <p className="flex items-center"><strong>Status:</strong> <span className="ml-2"><Badge color={getStatusColor(quotation.status)}>{quotation.status}</Badge></span></p>
                            </div>
                        </div>
                    </div>

                    {/* Medicine Details */}
                    <div className="mt-6">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Items</h3>
                        <div className="overflow-x-auto border dark:border-gray-600 rounded-lg">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-xs uppercase">
                                    <tr>
                                        <th className="p-2">Name</th>
                                        <th className="p-2">HS Code</th>
                                        <th className="p-2 text-center">Total Weight (kg)</th>
                                        <th className="p-2 text-center">Qty</th>
                                        <th className="p-2 text-right">Rate</th>
                                        <th className="p-2 text-center">GST%</th>
                                        <th className="p-2 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-gray-600">
                                    {quotation.medicines.map((med, index) => (
                                        <tr key={index}>
                                            <td className="p-2">{med.name}</td>
                                            <td className="p-2">{med.hsCode}</td>
                                            <td className="p-2 text-center">{(med.weight || 0).toFixed(2)}</td>
                                            <td className="p-2 text-center">{med.quantity}</td>
                                            <td className="p-2 text-right">₹{med.rate.toFixed(2)}</td>
                                            <td className="p-2 text-center">{med.gstRate !== undefined ? med.gstRate : 12}%</td>
                                            <td className="p-2 text-right">₹{(med.quantity * med.rate).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                     {/* Cost Details */}
                    <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Cost Breakdown</h4>
                        <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                            <div className="flex justify-between"><span>Subtotal:</span> <span>₹{grossSubtotal.toFixed(2)}</span></div>
                             {discountRate > 0 && (
                                <div className="flex justify-between text-green-600 dark:text-green-400"><span>Discount ({discountRate}%):</span> <span>-₹{discountAmount.toFixed(2)}</span></div>
                            )}
                            {deliveryCharges > 0 && (
                                <div className="flex justify-between"><span>Delivery Charges:</span> <span>₹{deliveryBase.toFixed(2)}</span></div>
                            )}
                            {pickupCharges > 0 && (
                                <div className="flex justify-between"><span>Pick Up Charges:</span> <span>₹{pickupCharges.toFixed(2)}</span></div>
                            )}
                            {remoteCharges > 0 && (
                                <div className="flex justify-between"><span>Remote Area Charges:</span> <span>₹{remoteCharges.toFixed(2)}</span></div>
                            )}
                            
                            {isIntraState ? (
                                <>
                                    <div className="flex justify-between text-blue-600 dark:text-blue-400"><span>Output CGST:</span> <span>₹{totalCGST.toFixed(2)}</span></div>
                                    <div className="flex justify-between text-blue-600 dark:text-blue-400"><span>Output SGST:</span> <span>₹{totalSGST.toFixed(2)}</span></div>
                                </>
                            ) : (
                                <div className="flex justify-between text-blue-600 dark:text-blue-400"><span>Output IGST:</span> <span>₹{totalTax.toFixed(2)}</span></div>
                            )}
                            
                            <hr className="my-1 border-gray-300 dark:border-gray-600"/>
                            <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white"><span>Total Cost:</span> <span>₹{quotation.totalCost.toFixed(2)}</span></div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-4">
                     <button
                        onClick={onDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        aria-label="Download PDF"
                    >
                        <FileDown size={16} />
                        <span>Download PDF</span>
                    </button>
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ViewQuotationModal;
