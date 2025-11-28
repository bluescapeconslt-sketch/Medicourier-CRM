
import React from 'react';
import { Invoice, Quotation, PaymentStatus } from '../types';
import { Package } from 'lucide-react';

interface InvoicePDFLayoutProps {
    invoice: Invoice;
    quotation: Quotation | undefined;
}

const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.Paid:
            return <span className="text-green-700 border-2 border-green-600 bg-green-50 px-3 py-1 rounded text-xs font-bold tracking-wider">PAID</span>;
        case PaymentStatus.PartiallyPaid:
            return <span className="text-blue-700 border-2 border-blue-600 bg-blue-50 px-3 py-1 rounded text-xs font-bold tracking-wider">PARTIAL</span>;
        case PaymentStatus.Unpaid:
            return <span className="text-red-700 border-2 border-red-600 bg-red-50 px-3 py-1 rounded text-xs font-bold tracking-wider">UNPAID</span>;
        default:
            return null;
    }
};

const InvoicePDFLayout: React.FC<InvoicePDFLayoutProps> = ({ invoice, quotation }) => {
    // Read config from invoice object (if it exists) or local storage
    const taxName = invoice.taxName || localStorage.getItem('crm_tax_name') || 'GST';
    
    // Note: invoice.taxRate is largely ignored in favor of per-item and charge-specific tax from quotation
    
    const discountRate = invoice.discount || 0;
    const decimalDiscountRate = discountRate / 100;
    const remoteCharges = invoice.remoteAreaCharges || 0;
    const deliveryCharges = invoice.deliveryCharges || 0;
    const pickupCharges = invoice.pickupCharges || 0;

    // Use medicines from linked quotation if available, otherwise fallback or empty
    const medicines = quotation?.medicines || [];

    // Calculate totals based on item rates
    let grossSubtotal = 0;
    let totalItemTax = 0;

    medicines.forEach(med => {
        const lineTotal = med.quantity * med.rate;
        grossSubtotal += lineTotal;
        const medGst = med.gstRate || 12; // default to 12 if missing
        totalItemTax += lineTotal * (medGst / 100);
    });
    
    const discountAmount = grossSubtotal * decimalDiscountRate;
    
    // Charges attract 18% GST (excluding Pickup Charges)
    const chargesTax = (deliveryCharges + remoteCharges) * 0.18;
    const totalTax = totalItemTax + chargesTax;
    
    const taxableAmount = (grossSubtotal - discountAmount) + deliveryCharges + remoteCharges + pickupCharges;
    
    // Load Company Settings
    const companyName = localStorage.getItem('crm_company_name') || 'MEDICOURIER Solutions Inc.';
    const companyAddress = localStorage.getItem('crm_company_address') || '123 Global Way, Suite 500, New York, NY 10001';
    const logoUrl = localStorage.getItem('crm_logo');
    const termsText = localStorage.getItem('crm_invoice_terms') || 'Payment is due within 15 days.';

    return (
        // Main Container
        <div className="bg-white text-gray-800 font-sans flex flex-col box-border w-[210mm] min-h-[297mm]">
            
            {/* Modern Split Header */}
            <header className="flex w-full mb-8 pdf-item-row">
                {/* Left Side: Logo Only */}
                <div className="w-[60%] pt-10 pl-12 pr-6 flex flex-col justify-center items-start">
                     {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-24 w-auto object-contain" />
                    ) : (
                        <div className="bg-[#005b9e] text-white p-3 rounded-lg">
                            <Package size={40} strokeWidth={1.5} />
                        </div>
                    )}
                </div>

                {/* Right Side: Document Details Banner */}
                <div className="w-[40%] bg-[#005b9e] text-white pt-10 pr-12 pl-10 pb-8 flex flex-col justify-center items-end rounded-bl-[60px]">
                    <h1 className="text-4xl font-extrabold tracking-widest uppercase mb-4">Invoice</h1>
                    <div className="space-y-2 text-right">
                        <div>
                            <span className="block text-blue-200 text-xs font-semibold uppercase tracking-wider">Invoice #</span>
                            <span className="block text-xl font-bold">{invoice.id}</span>
                        </div>
                        <div>
                            <span className="block text-blue-200 text-xs font-semibold uppercase tracking-wider">Issue Date</span>
                            <span className="block text-md font-medium">
                                {new Date(invoice.issueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        <div>
                            <span className="block text-blue-200 text-xs font-semibold uppercase tracking-wider">Due Date</span>
                            <span className="block text-md font-medium">
                                {new Date(invoice.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Wrapper */}
            <div className="px-12 flex-grow flex flex-col">

                {/* Address Blocks Grid - Perfectly Aligned Side-by-Side */}
                <section className="grid grid-cols-2 gap-12 mb-10 items-start pdf-item-row">
                     {/* From */}
                     <div>
                         <h3 className="text-xs font-bold text-[#005b9e] uppercase tracking-wider mb-2 border-b border-[#005b9e]/20 pb-1">Invoice By</h3>
                         <div className="text-sm space-y-1">
                            <p className="font-bold text-gray-900 text-lg">{companyName}</p>
                            <p className="text-gray-600 leading-snug whitespace-pre-line break-words">{companyAddress}</p>
                         </div>
                    </div>

                    {/* To */}
                    <div>
                        <div className="flex justify-between items-start border-b border-[#005b9e]/20 pb-1 mb-2">
                             <h3 className="text-xs font-bold text-[#005b9e] uppercase tracking-wider">Bill To</h3>
                             <div>{getStatusBadge(invoice.paymentStatus)}</div>
                        </div>
                        <div className="text-sm space-y-1">
                            <p className="font-bold text-gray-900 text-lg">{invoice.customer.name}</p>
                            <p className="text-gray-600 leading-snug whitespace-pre-line break-words">{invoice.customer.address}</p>
                            <p className="text-gray-600 mt-1"><span className="font-medium text-gray-800">Phone:</span> {invoice.customer.phone}</p>
                        </div>
                    </div>
                </section>
                
                {/* Logistics Info Bar (Consistent with Quotation) */}
                {quotation && (
                    <div className="grid grid-cols-3 gap-8 px-6 py-5 mb-10 bg-[#005b9e]/5 rounded-lg border border-[#005b9e]/10 text-center pdf-item-row">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-[#005b9e] uppercase font-bold tracking-widest">Origin (Place of Supply)</span>
                            <span className="font-bold text-gray-900 text-lg">{quotation.origin}</span>
                        </div>
                        {invoice.purpose && (
                            <div className="flex flex-col border-l border-r border-[#005b9e]/10">
                                <span className="text-[10px] text-[#005b9e] uppercase font-bold tracking-widest">Purpose</span>
                                <span className="font-bold text-gray-900 text-lg">{invoice.purpose}</span>
                            </div>
                        )}
                        <div className="flex flex-col">
                            <span className="text-[10px] text-[#005b9e] uppercase font-bold tracking-widest">Destination (Country of Supply)</span>
                            <span className="font-bold text-gray-900 text-lg">{quotation.destination}</span>
                        </div>
                    </div>
                )}

                {/* Table */}
                <section className="mb-10">
                    <table className="w-full text-sm border-collapse table-fixed">
                        <thead>
                            <tr className="text-[#005b9e] border-b-2 border-[#005b9e]">
                                <th className="py-3 px-2 text-center font-bold uppercase tracking-wider w-[5%]">#</th>
                                <th className="py-3 px-2 text-left font-bold uppercase tracking-wider w-[40%]">Item Description</th>
                                <th className="py-3 px-2 text-center font-bold uppercase tracking-wider w-[10%]">Quantity</th>
                                <th className="py-3 px-2 text-right font-bold uppercase tracking-wider w-[15%]">Rate</th>
                                <th className="py-3 px-2 text-center font-bold uppercase tracking-wider w-[10%]">GST%</th>
                                <th className="py-3 px-2 text-right font-bold uppercase tracking-wider w-[20%]">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {medicines.map((med, index) => {
                                const itemTotal = med.quantity * med.rate;
                                const isEven = index % 2 === 0;
                                return (
                                    <tr key={index} className={`pdf-item-row ${isEven ? "bg-white" : "bg-gray-50"}`}>
                                        <td className="py-4 px-2 text-center align-top text-gray-500 font-medium">{index + 1}</td>
                                        <td className="py-4 px-2 align-top">
                                            <div className="font-bold text-gray-900 text-base break-words whitespace-normal">{med.name}</div>
                                            <div className="text-gray-500 text-xs mt-1">HS Code: <span className="font-mono bg-gray-100 px-1 rounded">{med.hsCode}</span></div>
                                        </td>
                                        <td className="py-4 px-2 text-center align-top text-gray-700 font-medium">{med.quantity}</td>
                                        <td className="py-4 px-2 text-right align-top text-gray-700">₹{med.rate.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td className="py-4 px-2 text-center align-top text-gray-700">{med.gstRate || 12}%</td>
                                        <td className="py-4 px-2 text-right align-top font-bold text-gray-900">₹{itemTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </section>

                {/* Footer Section */}
                <div className="grid grid-cols-2 gap-12 mt-auto pt-8 border-t border-gray-200 pdf-item-row">
                    {/* Left Column: Payment Info & Terms */}
                    <div>
                         <h3 className="text-gray-900 font-bold mb-4 text-xs uppercase tracking-widest">Payment Instructions</h3>
                         <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs text-gray-600 mb-6 bg-gray-50 p-4 rounded-md">
                            <span className="font-bold text-gray-800">Bank:</span>
                            <span>Global City Bank</span>
                            
                            <span className="font-bold text-gray-800">Account #:</span>
                            <span className="font-mono">123-456-7890</span>
                            
                            <span className="font-bold text-gray-800">Swift Code:</span>
                            <span className="font-mono">GCBUS33</span>
                         </div>
                         
                         <div className="mb-6">
                            <h3 className="text-gray-900 font-bold mb-2 text-xs uppercase tracking-widest">Terms & Conditions</h3>
                            <p className="text-xs text-gray-500 whitespace-pre-line leading-relaxed">
                                {termsText}
                            </p>
                         </div>
                    </div>
                    
                    {/* Right Column: Totals */}
                    <div className="flex flex-col">
                        <div className="space-y-3 pb-4 border-b border-gray-200">
                            <div className="flex justify-between text-sm px-2">
                                <span className="text-gray-600 font-medium">Subtotal</span>
                                <span className="font-bold text-gray-900">₹{grossSubtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>

                            {discountRate > 0 && (
                                <div className="flex justify-between text-sm px-2">
                                    <span className="text-gray-600 font-medium">Discount ({discountRate}%)</span>
                                    <span className="font-bold text-red-600">-₹{discountAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>
                            )}

                             {deliveryCharges > 0 && (
                                <div className="flex justify-between text-sm bg-purple-50 p-2 rounded border-l-4 border-purple-200">
                                    <span className="text-purple-900 font-medium">Delivery Charges</span>
                                    <span className="font-bold text-purple-900">₹{deliveryCharges.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>
                            )}

                            {pickupCharges > 0 && (
                                <div className="flex justify-between text-sm bg-purple-50 p-2 rounded border-l-4 border-purple-200">
                                    <span className="text-purple-900 font-medium">Pick Up Charges</span>
                                    <span className="font-bold text-purple-900">₹{pickupCharges.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>
                            )}

                            {remoteCharges > 0 && (
                                <div className="flex justify-between text-sm bg-purple-50 p-2 rounded border-l-4 border-purple-200">
                                    <span className="text-purple-900 font-medium">Remote Area Charges</span>
                                    <span className="font-bold text-purple-900">₹{remoteCharges.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm px-2">
                                <span className="text-gray-600 font-medium">Total GST</span>
                                <span className="font-bold text-gray-900">₹{totalTax.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center py-4 px-2">
                            <span className="text-[#005b9e] font-bold text-xl uppercase tracking-tight">Total Due</span>
                            <span className="text-3xl font-extrabold text-[#005b9e]">₹{invoice.totalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>

                        <div className="flex justify-end mt-10">
                             <div className="text-center w-48">
                                 {/* Signature Placeholder */}
                                <div className="h-12 border-b-2 border-gray-300 mb-2 flex items-end justify-center">
                                    <span className="font-dancing-script text-3xl text-[#005b9e]">Authorized</span>
                                </div>
                                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Authorized Signature</div>
                            </div>
                        </div>
                    </div>
                </div>

                 {/* Bottom padding for page */}
                <div className="pb-12 text-center text-[10px] text-gray-400 mt-8">
                     <p>Generated by MediCourier CRM • {companyName}</p>
                </div>
            </div>
        </div>
    );
};

export default InvoicePDFLayout;
