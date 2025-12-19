
import React, { useState, useEffect } from 'react';
import { CreditCard, Globe, Users, Mail, Save, Building2, Upload, FileText, Image as ImageIcon, Trash2, PenTool } from 'lucide-react';
import { User } from '../types';
import { mockUsers } from '../constants';
import UserManagementModal from '../components/UserManagementModal';

interface SettingsCardProps {
    icon: React.ElementType;
    title: string;
    description: string;
    children: React.ReactNode;
    className?: string;
}

const SettingsCard: React.FC<SettingsCardProps> = ({ icon: Icon, title, description, children, className = "" }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow h-full flex flex-col ${className}`}>
        <div className="p-6 border-b dark:border-gray-700">
            <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-md">
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                </div>
            </div>
        </div>
        <div className="p-6 space-y-4 flex-1">
            {children}
        </div>
    </div>
);

const Settings: React.FC = () => {
    // Financial Settings
    const [taxName, setTaxName] = useState('GST');
    const [taxRate, setTaxRate] = useState(5);
    const [currency, setCurrency] = useState('INR - Indian Rupee');

    // Company Profile Settings
    const [companyName, setCompanyName] = useState('MediCourier Solutions Inc.');
    const [companyAddress, setCompanyAddress] = useState('123 Global Way, Suite 500, New York, NY 10001');
    const [logo, setLogo] = useState<string | null>(null);
    
    // Document Settings
    const [quoteTerms, setQuoteTerms] = useState(`Payment is due within 15 days of invoice date.\nOverdue interest @ 14% will be charged on delayed payments.\nPlease quote the quotation number in all correspondence.`);
    const [invoiceTerms, setInvoiceTerms] = useState(`Payment is due within 15 days.\nPlease include the invoice number in your transaction description.\nGoods once sold will not be taken back.`);
    
    // Payment & Signature
    const [paymentInstructions, setPaymentInstructions] = useState(
        `Bank: Global City Bank\nAccount #: 123-456-7890\nSwift Code: GCBUS33\nPayable to: MediCourier Solutions`
    );
    const [signature, setSignature] = useState<string | null>(null);

    // Users & Roles
    const [users, setUsers] = useState<User[]>([]);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);

    useEffect(() => {
        // Load Financials
        const storedTaxName = localStorage.getItem('crm_tax_name');
        const storedTaxRate = localStorage.getItem('crm_tax_rate');
        const storedCurrency = localStorage.getItem('crm_currency');

        if (storedTaxName) setTaxName(storedTaxName);
        if (storedTaxRate) setTaxRate(parseFloat(storedTaxRate));
        if (storedCurrency) setCurrency(storedCurrency);

        // Load Company Profile
        const storedCompanyName = localStorage.getItem('crm_company_name');
        const storedCompanyAddress = localStorage.getItem('crm_company_address');
        const storedLogo = localStorage.getItem('crm_logo');
        
        if (storedCompanyName) setCompanyName(storedCompanyName);
        if (storedCompanyAddress) setCompanyAddress(storedCompanyAddress);
        if (storedLogo) setLogo(storedLogo);
        
        // Load Document Settings
        const storedQuoteTerms = localStorage.getItem('crm_quote_terms');
        const storedInvoiceTerms = localStorage.getItem('crm_invoice_terms');
        const storedPaymentInst = localStorage.getItem('crm_payment_instructions');
        const storedSignature = localStorage.getItem('crm_signature');

        if (storedQuoteTerms) setQuoteTerms(storedQuoteTerms);
        if (storedInvoiceTerms) setInvoiceTerms(storedInvoiceTerms);
        if (storedPaymentInst) setPaymentInstructions(storedPaymentInst);
        if (storedSignature) setSignature(storedSignature);

        // Load Users
        const storedUsers = localStorage.getItem('crm_users');
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        } else {
            setUsers(mockUsers);
            localStorage.setItem('crm_users', JSON.stringify(mockUsers));
        }
    }, []);

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setLogo(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setSignature(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveLogo = () => setLogo(null);
    const handleRemoveSignature = () => setSignature(null);

    const handleSaveAll = () => {
        // Save Financials
        localStorage.setItem('crm_tax_name', taxName);
        localStorage.setItem('crm_tax_rate', taxRate.toString());
        localStorage.setItem('crm_currency', currency);

        // Save Company Profile
        localStorage.setItem('crm_company_name', companyName);
        localStorage.setItem('crm_company_address', companyAddress);
        if (logo) localStorage.setItem('crm_logo', logo);
        else localStorage.removeItem('crm_logo');

        // Save Document Settings
        localStorage.setItem('crm_quote_terms', quoteTerms);
        localStorage.setItem('crm_invoice_terms', invoiceTerms);
        localStorage.setItem('crm_payment_instructions', paymentInstructions);
        
        if (signature) localStorage.setItem('crm_signature', signature);
        else localStorage.removeItem('crm_signature');

        alert('All settings saved successfully!');
    };

    return (
        <>
            <div className="space-y-8 pb-10">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Settings</h2>
                    <button 
                        onClick={handleSaveAll}
                        className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                        <Save size={18} className="mr-2" />
                        Save All Changes
                    </button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Company Profile Card */}
                    <SettingsCard
                        icon={Building2}
                        title="Company Profile"
                        description="Upload logo, set company name, and address."
                        className="lg:row-span-2"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Logo</label>
                            <div className="flex items-center space-x-4">
                                <div className="h-24 w-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700 relative group">
                                    {logo ? (
                                        <>
                                            <img src={logo} alt="Company Logo" className="h-full w-full object-contain" />
                                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button onClick={handleRemoveLogo} className="text-white hover:text-red-400">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <ImageIcon className="text-gray-400" size={32} />
                                    )}
                                </div>
                                <div>
                                    <label className="cursor-pointer flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <Upload size={16} className="mr-2" />
                                        Upload Logo
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">Recommended: 200x200px PNG</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                            <input 
                                type="text" 
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="e.g. MediCourier Solutions Inc."
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Address</label>
                            <textarea 
                                value={companyAddress}
                                onChange={(e) => setCompanyAddress(e.target.value)}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Full address for documents"
                            />
                        </div>
                    </SettingsCard>

                    {/* Financial Settings Card */}
                    <SettingsCard
                        icon={CreditCard}
                        title="Financial Settings"
                        description="Manage taxes, currencies, and billing details."
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Default Currency</label>
                            <select 
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            >
                                <option>INR - Indian Rupee</option>
                                <option>USD - United States Dollar</option>
                                <option>AED - UAE Dirham</option>
                                <option>EUR - Euro</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tax Name</label>
                                <input 
                                    type="text" 
                                    value={taxName}
                                    onChange={(e) => setTaxName(e.target.value)}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="GST"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tax Rate (%)</label>
                                <input 
                                    type="number" 
                                    value={taxRate}
                                    onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        </div>
                    </SettingsCard>

                    {/* Payment & Signature Card */}
                    <SettingsCard
                        icon={PenTool}
                        title="Payment & Authorization"
                        description="Configure invoice payment details and signature."
                    >
                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Instructions</label>
                            <textarea 
                                value={paymentInstructions}
                                onChange={(e) => setPaymentInstructions(e.target.value)}
                                rows={4}
                                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-xs"
                                placeholder="Enter Bank Details, UPI ID, etc."
                            />
                            <p className="text-xs text-gray-500 mt-1">This text will appear on invoices.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Authorized Signature</label>
                            <div className="flex items-center space-x-4">
                                <div className="h-16 w-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-700 relative group">
                                    {signature ? (
                                        <>
                                            <img src={signature} alt="Signature" className="h-full w-full object-contain" />
                                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button onClick={handleRemoveSignature} className="text-white hover:text-red-400">
                                                    <Trash2 size={20} />
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-xs text-gray-400">No Signature</span>
                                    )}
                                </div>
                                <div>
                                    <label className="cursor-pointer flex items-center px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
                                        <Upload size={16} className="mr-2" />
                                        Upload
                                        <input type="file" className="hidden" accept="image/*" onChange={handleSignatureUpload} />
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1">Transparent PNG recommended.</p>
                                </div>
                            </div>
                        </div>
                    </SettingsCard>

                    {/* Terms & Conditions Card */}
                    <SettingsCard
                        icon={FileText}
                        title="Document Terms"
                        description="Set default terms for invoices and quotations."
                        className="lg:col-span-2"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quotation Terms & Conditions</label>
                                <textarea 
                                    value={quoteTerms}
                                    onChange={(e) => setQuoteTerms(e.target.value)}
                                    rows={6}
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-xs"
                                    placeholder="Enter default terms for quotations..."
                                />
                                <p className="text-xs text-gray-500 mt-1">Each line will be treated as a bullet point.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Terms & Conditions</label>
                                <textarea 
                                    value={invoiceTerms}
                                    onChange={(e) => setInvoiceTerms(e.target.value)}
                                    rows={6}
                                    className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-mono text-xs"
                                    placeholder="Enter default terms for invoices..."
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter legal text, payment instructions, etc.</p>
                            </div>
                        </div>
                    </SettingsCard>
                    
                    <SettingsCard
                        icon={Globe}
                        title="Shipping & Logistics"
                        description="Configure shipping rates and zones."
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Base Rate per Kg (₹)</label>
                            <input type="number" defaultValue="2000" className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                        </div>
                        <div className="flex items-center">
                            <input id="dhl" type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                            <label htmlFor="dhl" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Enable DHL API</label>
                        </div>
                    </SettingsCard>
                    
                    <SettingsCard
                        icon={Users}
                        title="Users & Roles"
                        description="Manage team members and their permissions."
                    >
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Manage access control for Admins, Sales, and Operations teams. 
                            Currently {users.length} active users.
                        </p>
                        <button 
                            onClick={() => setIsUserModalOpen(true)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-auto transition-colors"
                        >
                            Manage Users
                        </button>
                    </SettingsCard>

                    <SettingsCard
                        icon={Mail}
                        title="Email Templates"
                        description="Customize automated email notifications."
                    >
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Edit templates for Quotations, Invoices, and Shipment Updates.</p>
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mt-auto transition-colors">
                            Edit Templates
                        </button>
                    </SettingsCard>
                </div>
            </div>

            <UserManagementModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                users={users}
                onUpdateUsers={setUsers}
            />
        </>
    );
};

export default Settings;
