import React, { useState, useEffect } from 'react';
import { X, Upload, Check, CreditCard, Image as ImageIcon, Trash2, Sparkles, Loader, Smartphone, Landmark, Globe, Wallet } from 'lucide-react';
import { Invoice, PaymentStatus } from '../types';
import { analyzePaymentProof, PaymentAnalysisResult } from '../services/geminiService';
import { processFileForUpload } from '../utils/fileHelpers';

interface UpdatePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice | null;
    onUpdate: (id: string, status: PaymentStatus, proofs: string[], amountPaid: number, balanceDue: number, paymentSource: string) => void;
}

const paymentSources = [
    { name: 'PhonePe', type: 'wallet', icon: Smartphone },
    { name: 'Paytm', type: 'wallet', icon: Smartphone },
    { name: 'Google Pay', type: 'wallet', icon: Smartphone },
    { name: 'Axis Bank', type: 'bank', icon: Landmark },
    { name: 'KVB Bank', type: 'bank', icon: Landmark },
    { name: 'Yes Bank', type: 'bank', icon: Landmark },
    { name: 'PayPal', type: 'gateway', icon: Wallet },
    { name: 'Razorpay', type: 'gateway', icon: CreditCard },
    { name: 'PayU Money', type: 'gateway', icon: CreditCard },
    { name: 'Wise', type: 'international', icon: Globe },
    { name: 'Remitly', type: 'international', icon: Globe },
    { name: 'Revolut', type: 'international', icon: Globe },
];

const UpdatePaymentModal: React.FC<UpdatePaymentModalProps> = ({ isOpen, onClose, invoice, onUpdate }) => {
    const [status, setStatus] = useState<PaymentStatus>(PaymentStatus.Unpaid);
    const [proofs, setProofs] = useState<string[]>([]);
    const [dragActive, setDragActive] = useState(false);
    
    // Financials
    const [amountPaid, setAmountPaid] = useState<string>('');
    const [balanceDue, setBalanceDue] = useState<string>('');
    const [paymentSource, setPaymentSource] = useState<string>('');
    
    // AI Analysis State
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<PaymentAnalysisResult | null>(null);

    useEffect(() => {
        if (isOpen && invoice) {
            setStatus(invoice.paymentStatus);
            setProofs(invoice.paymentProofs || []);
            setAmountPaid(invoice.amountPaid?.toString() || '');
            setBalanceDue(invoice.balanceDue?.toString() || '');
            setPaymentSource(invoice.paymentSource || '');
            setAnalysisResult(null);
        } else {
            setStatus(PaymentStatus.Unpaid);
            setProofs([]);
            setAmountPaid('');
            setBalanceDue('');
            setPaymentSource('');
            setAnalysisResult(null);
        }
    }, [isOpen, invoice]);

    // Auto-update status based on balance calculation
    useEffect(() => {
        if (!invoice) return;
        const paid = parseFloat(amountPaid) || 0;
        const total = invoice.totalAmount;
        
        if (paid === 0) {
           // Keep user selected status if Unpaid, usually
        } else if (paid >= total) {
            setStatus(PaymentStatus.Paid);
        } else if (paid > 0 && paid < total) {
            setStatus(PaymentStatus.PartiallyPaid);
        }
        
        // Auto calc balance if not set manually by user interaction
        const diff = total - paid;
        setBalanceDue(diff.toFixed(2));
        
    }, [amountPaid, invoice]);

    if (!isOpen || !invoice) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    };

    const processFiles = async (fileList: FileList) => {
        setIsProcessing(true);
        const files = Array.from(fileList);
        const validFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (validFiles.length === 0) {
            setIsProcessing(false);
            return;
        }

        try {
            const newProofs = await Promise.all(
                validFiles.map(file => processFileForUpload(file))
            );
            setProofs(prev => [...prev, ...newProofs]);
        } catch (error) {
            console.error("Error processing proofs:", error);
            alert(error instanceof Error ? error.message : "Failed to process files.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAnalyze = async () => {
        if (proofs.length === 0) return;
        
        setIsAnalyzing(true);
        setAnalysisResult(null);
        
        const result = await analyzePaymentProof(invoice.totalAmount, proofs);
        
        setIsAnalyzing(false);
        if (result) {
            setAnalysisResult(result);
            setAmountPaid(result.paidAmount.toString());
            setBalanceDue(result.difference.toFixed(2));
            
            // Auto update status based on AI result
            if (result.difference <= 0) {
                setStatus(PaymentStatus.Paid);
            } else {
                setStatus(PaymentStatus.PartiallyPaid);
            }
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleRemoveProof = (index: number) => {
        setProofs(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = () => {
        onUpdate(
            invoice.id, 
            status, 
            proofs, 
            parseFloat(amountPaid) || 0, 
            parseFloat(balanceDue) || 0,
            paymentSource
        );
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl p-6 m-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                            <CreditCard className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Update Payment</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Invoice #{invoice.id} • Total: ₹{invoice.totalAmount.toLocaleString()}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>

                <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                    
                    {/* Left Col: Uploads */}
                    <div className="space-y-4">
                         <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Payment Proofs</label>
                            <span className="text-xs text-gray-500">{proofs.length} uploaded</span>
                        </div>
                        
                        <div 
                            className={`flex flex-col justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${dragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <div className="space-y-1 text-center">
                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                        <span>Upload files</span>
                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handleFileChange} />
                                    </label>
                                    <p className="pl-1">or drag and drop</p>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB (Auto-compressed)</p>
                            </div>
                        </div>

                        {proofs.length > 0 && (
                             <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing || isProcessing}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 shadow-sm transition-all disabled:opacity-50"
                            >
                                {isAnalyzing ? <Loader className="animate-spin" size={16}/> : <Sparkles size={16} />}
                                {isAnalyzing ? 'Analyzing Payment...' : 'Verify with AI'}
                            </button>
                        )}
                        
                        {isProcessing && (
                            <div className="text-center text-xs text-blue-500 flex items-center justify-center gap-2">
                                <Loader size={12} className="animate-spin"/> Compressing & Processing images...
                            </div>
                        )}

                        {/* Image Preview Grid */}
                        {proofs.length > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                                {proofs.map((img, index) => (
                                    <div key={index} className="relative rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden group aspect-square">
                                        <img src={img} alt={`Proof ${index + 1}`} className="w-full h-full object-cover bg-gray-50 dark:bg-gray-900" />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => handleRemoveProof(index)}
                                                className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-lg"
                                                title="Remove Image"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Col: Details & AI Results */}
                    <div className="space-y-6">
                        {analysisResult && (
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md text-sm">
                                <div className="flex items-center gap-2 mb-2 text-purple-700 dark:text-purple-300 font-semibold">
                                    <Sparkles size={16} /> AI Analysis
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 mb-2">{analysisResult.notes}</p>
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                                    <span>Detected: ₹{analysisResult.paidAmount}</span>
                                    <span>Diff: ₹{analysisResult.difference}</span>
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Status</label>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.values(PaymentStatus).map((s) => (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setStatus(s)}
                                        className={`px-2 py-2 text-xs font-medium rounded-md border transition-colors ${
                                            status === s
                                                ? s === PaymentStatus.Paid 
                                                    ? 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700'
                                                    : s === PaymentStatus.PartiallyPaid
                                                        ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700'
                                                        : 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Source of Payment</label>
                            <div className="relative">
                                <select
                                    value={paymentSource}
                                    onChange={(e) => setPaymentSource(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 sm:text-sm appearance-none"
                                >
                                    <option value="">Select Source</option>
                                    {paymentSources.map((src) => (
                                        <option key={src.name} value={src.name}>
                                            {src.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                    {paymentSource ? (
                                        React.createElement(paymentSources.find(s => s.name === paymentSource)?.icon || CreditCard, { size: 18 })
                                    ) : (
                                        <CreditCard size={18} />
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Paid (₹)</label>
                                <input 
                                    type="number" 
                                    value={amountPaid}
                                    onChange={(e) => setAmountPaid(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="0.00"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Balance Due (₹)</label>
                                <input 
                                    type="number" 
                                    value={balanceDue}
                                    onChange={(e) => setBalanceDue(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-500 cursor-not-allowed sm:text-sm"
                                    placeholder="0.00"
                                    readOnly 
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={isProcessing}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
                    >
                        {isProcessing ? <Loader className="animate-spin" size={16} /> : <Check size={16} />}
                        Update Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UpdatePaymentModal;