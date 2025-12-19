
import React from 'react';
import { Quotation } from '../types';
import { Package } from 'lucide-react';

interface QuotationPDFLayoutProps {
    quotation: Quotation;
}

const QuotationPDFLayout: React.FC<QuotationPDFLayoutProps> = ({ quotation }) => {
    // Read config from quotation object, fallback to local storage
    const taxName = quotation.taxName || localStorage.getItem('crm_tax_name') || 'GST';
    
    const discountRate = quotation.discount || 0;
    const decimalDiscountRate = discountRate / 100;
    const remoteCharges = quotation.remoteAreaCharges || 0;
    const deliveryCharges = quotation.deliveryCharges || 0;
    const pickupCharges = quotation.pickupCharges || 0;

    // Check if Intra-State (Kerala)
    const isIntraState = quotation.billingState?.trim().toLowerCase() === 'kerala';

    // Calculate totals based on item rates and individual tax
    let grossSubtotal = 0;
    let totalItemTax = 0;

    quotation.medicines.forEach(med => {
        const lineTotal = med.quantity * med.rate;
        grossSubtotal += lineTotal;
        const medGst = med.gstRate !== undefined ? med.gstRate : 12; // default to 12 if missing in old data
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
    
    // Split Tax for display
    const totalCGST = totalTax / 2;
    const totalSGST = totalTax / 2;
    
    // Load Company Settings
    const companyName = localStorage.getItem('crm_company_name') || 'MEDICOURIER Solutions Inc.';
    const companyAddress = localStorage.getItem('crm_company_address') || '123 Global Way, New York';
    const logoUrl = localStorage.getItem('crm_logo');
    const signatureUrl = localStorage.getItem('crm_signature');
    const termsText = localStorage.getItem('crm_quote_terms') || 
        `Payment is due within 15 days of invoice date.\nOverdue interest @ 14% will be charged on delayed payments.\nPlease quote the quotation number in all correspondence.`;
    
    const termsList = termsText.split('\n').filter(line => line.trim() !== '');

    const billingAddress = quotation.customer.billingAddress || quotation.customer.address;
    const shippingAddress = quotation.customer.shippingAddress || quotation.customer.address;

    return (
        // Main Container
        <div className="bg-white text-gray-800 font-sans flex flex-col box-border w-[210mm] min-h-[297mm]">
            
            {/* Modern Split Header */}
            <header className="flex w-full mb-8 pdf-item-row overflow-hidden">
                {/* Left Side: Logo & Company Info */}
                <div className="w-[60%] pt-10 pl-12 pr-4 flex flex-col justify-start items-start">
                     {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-16 w-auto object-contain mb-4" />
                    ) : (
                        <div className="bg-[#005b9e] text-white p-3 rounded-lg mb-4">
                            <Package size={32} strokeWidth={1.5} />
                        </div>
                    )}
                    <h2 className="font-bold text-gray-900 text-lg uppercase mb-1 break-words w-full">{companyName}</h2>
                    <p className="text-gray-500 text-xs leading-snug whitespace-pre-line max-w-sm break-words">
                        {companyAddress}
                    </p>
                </div>

                {/* Right Side: Document Details Banner */}
                <div className="w-[40%] bg-[#005b9e] text-white pt-10 pr-8 pl-8 pb-8 flex flex-col justify-center items-end rounded-bl-[60px] overflow-hidden">
                    <h1 className="text-4xl font-extrabold tracking-wide uppercase mb-4 text-right break-words w-full">Quotation</h1>
                    <div className="space-y-2 text-right">
                        <div>
                            <span className="block text-blue-200 text-xs font-semibold uppercase tracking-wider">Quotation #</span>
                            <span className="block text-lg font-bold">{quotation.id}</span>
                        </div>
                        <div>
                            <span className="block text-blue-200 text-xs font-semibold uppercase tracking-wider">Date</span>
                            <span className="block text-md font-medium">
                                {new Date(quotation.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                        <div>
                            <span className="block text-blue-200 text-xs font-semibold uppercase tracking-wider">Valid Until</span>
                            <span className="block text-md font-medium">
                                {new Date(quotation.validity).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Wrapper */}
            <div className="px-12 flex-grow flex flex-col">
                
                {/* BILL TO / SHIP TO Grid */}
                <section className="grid grid-cols-2 gap-12 mb-10 items-start pdf-item-row">
                    {/* Bill To */}
                    <div>
                        <h3 className="text-xs font-bold text-[#005b9e] uppercase tracking-wider mb-2 border-b-2 border-[#005b9e]/20 pb-1">Bill To</h3>
                        <div className="text-sm space-y-1">
                            <p className="font-bold text-gray-900 text-lg">{quotation.customer.name}</p>
                            <p className="text-gray-600 leading-snug whitespace-pre-line break-words">{billingAddress}</p>
                            <p className="text-gray-600 mt-1"><span className="font-medium text-gray-800">Email:</span> {quotation.customer.email}</p>
                            {quotation.billingState && (
                                <p className="text-gray-600 mt-1"><span className="font-medium text-gray-800">State:</span> {quotation.billingState}</p>
                            )}
                        </div>
                    </div>

                    {/* Ship To */}
                    <div>
                        <h3 className="text-xs font-bold text-[#005b9e] uppercase tracking-wider mb-2 border-b-2 border-[#005b9e]/20 pb-1">Ship To</h3>
                        <div className="text-sm space-y-1">
                            <p className="font-bold text-gray-900 text-lg">{quotation.customer.name}</p>
                            <p className="text-gray-600 leading-snug whitespace-pre-line break-words">{shippingAddress}</p>
                            <p className="text-gray-600 mt-1"><span className="font-medium text-gray-800">Email:</span> {quotation.customer.email}</p>
                        </div>
                    </div>
                </section>

                {/* Logistics Info Bar */}
                <div className="grid grid-cols-2 gap-8 px-6 py-5 mb-10 bg-[#005b9e]/5 rounded-lg border border-[#005b9e]/10 text-center pdf-item-row">
                    <div className="flex flex-col border-r border-[#005b9e]/10">
                        <span className="text-[10px] text-[#005b9e] uppercase font-bold tracking-widest">Origin (Place of Supply)</span>
                        <span className="font-bold text-gray-900 text-lg">{quotation.origin}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-[#005b9e] uppercase font-bold tracking-widest">Destination (Country of Supply)</span>
                        <span className="font-bold text-gray-900 text-lg">{quotation.destination}</span>
                    </div>
                </div>

                {/* Table */}
                <section className="mb-10">
                    <table className="w-full text-sm border-collapse table-fixed">
                        <thead>
                            <tr className="text-[#005b9e] border-b-2 border-[#005b9e] pdf-item-row">
                                <th className="py-3 px-1 text-center font-bold uppercase tracking-wider w-[5%]">#</th>
                                <th className="py-3 px-2 text-left font-bold uppercase tracking-wider w-[40%]">Item Description</th>
                                <th className="py-3 px-1 text-center font-bold uppercase tracking-wider w-[10%]">Qty</th>
                                <th className="py-3 px-2 text-right font-bold uppercase tracking-wider w-[15%]">Rate</th>
                                <th className="py-3 px-1 text-center font-bold uppercase tracking-wider w-[10%]">GST %</th>
                                <th className="py-3 px-2 text-right font-bold uppercase tracking-wider w-[20%]">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {quotation.medicines.map((med, index) => {
                                const itemTotal = med.quantity * med.rate;
                                const isEven = index % 2 === 0;
                                const gstRate = med.gstRate !== undefined ? med.gstRate : 12; // default to 12 if missing

                                return (
                                    <tr key={index} className={`pdf-item-row ${isEven ? "bg-white" : "bg-gray-50"}`}>
                                        <td className="py-4 px-1 text-center align-top text-gray-500 font-medium">{index + 1}</td>
                                        <td className="py-4 px-2 align-top">
                                            <div className="font-bold text-gray-900 text-base break-words whitespace-normal">{med.name}</div>
                                            <div className="text-gray-500 text-xs mt-1">HS Code: <span className="font-mono bg-gray-100 px-1 rounded">{med.hsCode}</span></div>
                                        </td>
                                        <td className="py-4 px-1 text-center align-top text-gray-700 font-medium">{med.quantity}</td>
                                        <td className="py-4 px-2 text-right align-top text-gray-700">₹{med.rate.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                        <td className="py-4 px-1 text-center align-top text-gray-500">{gstRate}%</td>
                                        <td className="py-4 px-2 text-right align-top font-bold text-gray-900">₹{itemTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </section>

                {/* Footer Section */}
                <div className="grid grid-cols-2 gap-12 mt-auto pt-8 border-t border-gray-200 pdf-item-row">
                    {/* Left Column: Terms */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-3 text-xs uppercase tracking-widest">Terms & Conditions</h3>
                        <ul className="list-disc list-inside text-xs text-gray-500 space-y-1 mb-6 leading-relaxed marker:text-[#005b9e]">
                            {termsList.map((term, i) => (
                                <li key={i}>{term}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Right Column: Totals */}
                    <div className="flex flex-col">
                        <div className="space-y-3 pb-4 border-b border-gray-200">
                            <div className="flex justify-between text-sm px-2">
                                <span className="text-gray-600 font-medium">Total Weight</span>
                                <span className="font-bold text-gray-900">{quotation.weight.toFixed(2)} kg</span>
                            </div>
                            <div className="flex justify-between text-sm px-2">
                                <span className="text-gray-600 font-medium">Sub Total</span>
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
                                    {/* Display Base Amount for Delivery */}
                                    <span className="font-bold text-purple-900">₹{deliveryBase.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
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

                            {isIntraState ? (
                                <>
                                    <div className="flex justify-between text-sm px-2">
                                        <span className="text-gray-600 font-medium">Output CGST</span>
                                        <span className="font-bold text-gray-900">₹{totalCGST.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    </div>
                                    <div className="flex justify-between text-sm px-2">
                                        <span className="text-gray-600 font-medium">Output SGST</span>
                                        <span className="font-bold text-gray-900">₹{totalSGST.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                    </div>
                                </>
                            ) : (
                                <div className="flex justify-between text-sm px-2">
                                    <span className="text-gray-600 font-medium">Output IGST</span>
                                    <span className="font-bold text-gray-900">₹{totalTax.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center py-4 px-2">
                            <span className="text-[#005b9e] font-bold text-xl uppercase tracking-tight">Total</span>
                            <span className="text-3xl font-extrabold text-[#005b9e]">₹{quotation.totalCost.toLocaleString('en-IN', {minimumFractionDigits: 0, maximumFractionDigits: 0})}</span>
                        </div>
                        
                        <div className="flex justify-end mt-10">
                             <div className="text-center w-48">
                                 {/* Signature */}
                                <div className="h-12 border-b-2 border-gray-300 mb-2 flex items-end justify-center">
                                    {signatureUrl ? (
                                        <img src={signatureUrl} alt="Signature" className="h-12 object-contain" />
                                    ) : (
                                        <span className="font-dancing-script text-3xl text-[#005b9e]">Authorized</span>
                                    )}
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

export default QuotationPDFLayout;
