
import React, { useState, useEffect } from 'react';
import { X, PlusCircle, Trash2, Search, ChevronDown } from 'lucide-react';
import { Customer, Quotation, QuoteStatus, MedicineItem } from '../types';

interface AddQuotationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (quotation: Quotation) => void;
    customers: Customer[];
    quotationCount: number;
    quotationToEdit: Quotation | null;
}

const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Maharashtra", "Madhya Pradesh",
    "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
    "Tamil Nadu", "Tripura", "Telangana", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const AddQuotationModal: React.FC<AddQuotationModalProps> = ({ isOpen, onClose, onSave, customers, quotationCount, quotationToEdit }) => {
    const isEditMode = !!quotationToEdit;

    const initialFormState = {
        customerId: '',
        weight: '',
        origin: 'India',
        destination: '',
        billingState: ''
    };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    // Initialize with unitWeight and lineTotalWeight to avoid uncontrolled input issues
    const initialMedicineState = { name: '', quantity: '1', rate: '0', hsCode: '', gstRate: '5', unitWeight: '0', lineTotalWeight: '0' };
    const [medicines, setMedicines] = useState([initialMedicineState]);
    const [medicineErrors, setMedicineErrors] = useState<({[key: string]: string})[]>([]);

    const [costDetails, setCostDetails] = useState({ subtotal: 0, discountAmount: 0, deliveryCharges: 0, remoteCharges: 0, pickupCharges: 0, tax: 0, total: 0, totalCGST: 0, totalSGST: 0 });
    const [taxConfig, setTaxConfig] = useState({ name: 'GST', rate: 5 }); // Kept for consistency, but line items are now primary
    const [discount, setDiscount] = useState<string>('0');
    const [remoteCharges, setRemoteCharges] = useState<string>('0');
    const [deliveryCharges, setDeliveryCharges] = useState<string>('0');
    const [pickupCharges, setPickupCharges] = useState<string>('0');

    // Searchable Dropdown State
    const [customerSearch, setCustomerSearch] = useState('');
    const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);

    const filteredCustomers = customers.filter(c => 
        c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
        c.id.toLowerCase().includes(customerSearch.toLowerCase()) ||
        c.email.toLowerCase().includes(customerSearch.toLowerCase())
    );

    const resetForm = () => {
        setFormData(initialFormState);
        setMedicines([initialMedicineState]);
        setErrors({});
        setMedicineErrors([]);
        setDiscount('0');
        setRemoteCharges('0');
        setDeliveryCharges('0');
        setPickupCharges('0');
        setCustomerSearch('');
    };
    
    useEffect(() => {
        // Load global tax config first
        const globalName = localStorage.getItem('crm_tax_name') || 'GST';
        const globalRate = localStorage.getItem('crm_tax_rate') || '5';
        
        if (isOpen && quotationToEdit) {
            setFormData({
                customerId: quotationToEdit.customer.id,
                weight: quotationToEdit.weight.toString(),
                origin: quotationToEdit.origin,
                destination: quotationToEdit.destination,
                billingState: quotationToEdit.billingState || ''
            });
            
            // Set initial search term for existing customer
            const cust = customers.find(c => c.id === quotationToEdit.customer.id);
            setCustomerSearch(cust ? `${cust.name} - ${cust.id}` : '');

            setMedicines(quotationToEdit.medicines.map(m => ({
                name: m.name, 
                quantity: m.quantity.toString(),
                rate: m.rate.toString(),
                hsCode: m.hsCode,
                gstRate: (m.gstRate !== undefined ? m.gstRate : 5).toString(), // Default to 5 if missing from old data
                unitWeight: (m.unitWeight !== undefined ? m.unitWeight : 0).toString(),
                lineTotalWeight: (m.weight || 0).toString() // line total is stored in 'weight' property
            })));
            // Use quotation's tax if available, else global
            setTaxConfig({ 
                name: quotationToEdit.taxName || globalName, 
                rate: quotationToEdit.taxRate !== undefined ? quotationToEdit.taxRate : parseFloat(globalRate) 
            });
            setDiscount(quotationToEdit.discount?.toString() || '0');
            setRemoteCharges(quotationToEdit.remoteAreaCharges?.toString() || '0');
            setDeliveryCharges(quotationToEdit.deliveryCharges?.toString() || '0');
            setPickupCharges(quotationToEdit.pickupCharges?.toString() || '0');
        } else if (isOpen) {
            resetForm();
            setTaxConfig({ name: globalName, rate: parseFloat(globalRate) });
        }
    }, [isOpen, quotationToEdit, customers]);
    
    useEffect(() => {
        const discPercent = parseFloat(discount) || 0;
        const remote = parseFloat(remoteCharges) || 0;
        const delivery = parseFloat(deliveryCharges) || 0;
        const pickup = parseFloat(pickupCharges) || 0;

        // 1. Calculate Gross Subtotal (Sum of Qty * Rate) & Auto Calculate Weight
        let grossSubtotal = 0;
        let totalItemTax = 0;
        let totalWeight = 0;

        medicines.forEach(med => {
            const qty = parseFloat(med.quantity) || 0;
            const itemRate = parseFloat(med.rate) || 0;
            const gst = parseFloat(med.gstRate) || 0;
            const lineWeight = parseFloat(med.lineTotalWeight) || 0;
            
            const lineTotal = qty * itemRate;
            grossSubtotal += lineTotal;
            
            // Tax calculated on line total
            totalItemTax += lineTotal * (gst / 100);

            // Accumulate weight (Treat input as Total Line Weight)
            totalWeight += lineWeight;
        });
        
        // Update total weight in form data automatically
        setFormData(prev => ({ ...prev, weight: totalWeight.toFixed(2) }));

        // 2. Calculate Discount Amount
        const discountAmount = grossSubtotal * (discPercent / 100);
        
        // 3. Calculate Tax on Charges 
        // Delivery is Exclusive of 18% GST -> add it
        const deliveryTax = delivery * 0.18;
        
        // Remote is Exclusive of 18% GST -> add it
        const remoteTax = remote * 0.18;
        
        const chargesTax = deliveryTax + remoteTax;

        // 4. Total Tax
        const totalTax = totalItemTax + chargesTax;
        
        // Split for display (even if totalTax is IGST, CGST/SGST would be half for intra-state display)
        const totalCGST = totalTax / 2;
        const totalSGST = totalTax / 2;

        // 5. Grand Total
        // (Item Subtotal - Discount) + TotalItemTax + Delivery(Base) + DeliveryTax + Remote(Base) + RemoteTax + Pickup
        const total = (grossSubtotal - discountAmount) + totalItemTax + delivery + deliveryTax + remote + remoteTax + pickup;

        setCostDetails({
            subtotal: parseFloat(grossSubtotal.toFixed(2)),
            discountAmount: parseFloat(discountAmount.toFixed(2)),
            deliveryCharges: parseFloat(delivery.toFixed(2)),
            remoteCharges: parseFloat(remote.toFixed(2)),
            pickupCharges: parseFloat(pickup.toFixed(2)),
            tax: parseFloat(totalTax.toFixed(2)),
            total: parseFloat(total.toFixed(2)),
            totalCGST: parseFloat(totalCGST.toFixed(2)),
            totalSGST: parseFloat(totalSGST.toFixed(2))
        });
        
    }, [medicines, discount, remoteCharges, deliveryCharges, pickupCharges]);

    const validate = (): boolean => {
        const newErrors: { [key: string]: string } = {};
        if (!formData.customerId) newErrors.customerId = "Customer is required";
        if (!formData.weight || +formData.weight <= 0) newErrors.weight = "A valid total weight (kg) is required";
        if (!formData.origin.trim()) newErrors.origin = "Origin country is required";
        if (!formData.destination.trim()) newErrors.destination = "Destination is required";
        
        const newMedicineErrors: ({[key: string]: string})[] = [];
        let medicinesAreValid = true;
        medicines.forEach((med, index) => {
            const medErrors: {[key: string]: string} = {};
            if (!med.name.trim()) {
                medErrors.name = "Name is required";
                medicinesAreValid = false;
            }
            if (!med.quantity || +med.quantity <= 0) {
                medErrors.quantity = "Invalid quantity";
                medicinesAreValid = false;
            }
             if (!med.rate || +med.rate < 0) {
                medErrors.rate = "Invalid rate";
                medicinesAreValid = false;
            }
            newMedicineErrors[index] = medErrors;
        });

        setErrors(newErrors);
        setMedicineErrors(newMedicineErrors);

        return Object.keys(newErrors).length === 0 && medicinesAreValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleMedicineChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedMedicines = [...medicines];
        updatedMedicines[index] = { 
            ...updatedMedicines[index], 
            [name]: value 
        };
        
        // Auto calculate Line Total Weight if Unit Weight or Quantity changes
        if (name === 'unitWeight' || name === 'quantity') {
            const unitWt = name === 'unitWeight' ? parseFloat(value) : parseFloat(updatedMedicines[index].unitWeight || '0');
            const qty = name === 'quantity' ? parseFloat(value) : parseFloat(updatedMedicines[index].quantity || '0');
            
            if (!isNaN(unitWt) && !isNaN(qty)) {
                updatedMedicines[index].lineTotalWeight = (unitWt * qty).toFixed(2);
            }
        }

        setMedicines(updatedMedicines);
    };

    const addMedicineRow = () => {
        setMedicines([...medicines, { ...initialMedicineState }]);
    };

    const removeMedicineRow = (index: number) => {
        setMedicines(medicines.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        const selectedCustomer = customers.find(c => c.id === formData.customerId);
        if (!selectedCustomer) {
            setErrors(prev => ({...prev, customerId: "Invalid customer selected."}));
            return;
        }
        
        const today = new Date();
        const validityDate = new Date();
        validityDate.setDate(today.getDate() + 15);

        const quotationData = {
            customer: selectedCustomer,
            medicines: medicines.map(med => ({ 
                name: med.name, 
                quantity: +med.quantity, 
                rate: +med.rate,
                hsCode: med.hsCode,
                gstRate: +med.gstRate,
                unitWeight: parseFloat(med.unitWeight as unknown as string) || 0,
                weight: parseFloat(med.lineTotalWeight as unknown as string) || 0 // Store line total weight in 'weight' field for compatibility
            })),
            weight: +formData.weight,
            origin: formData.origin,
            destination: formData.destination,
            billingState: formData.billingState,
            totalCost: costDetails.total,
            taxName: taxConfig.name,
            taxRate: 0, // Rate is now per-item calculated, setting 0 or relying on taxName for display
            discount: parseFloat(discount) || 0,
            remoteAreaCharges: parseFloat(remoteCharges) || 0,
            deliveryCharges: parseFloat(deliveryCharges) || 0,
            pickupCharges: parseFloat(pickupCharges) || 0,
        };

        let savedQuotation: Quotation;
        if (isEditMode) {
             savedQuotation = {
                ...quotationToEdit,
                ...quotationData,
            };
        } else {
             savedQuotation = {
                id: `QT${(quotationCount + 1).toString().padStart(3, '0')}`,
                ...quotationData,
                status: QuoteStatus.Draft,
                createdDate: today.toISOString().split('T')[0],
                validity: validityDate.toISOString().split('T')[0],
            };
        }
        onSave(savedQuotation);
    };
    
    if (!isOpen) return null;

    const inputClass = "block w-full pl-3 pr-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md";
    const errorClass = "text-red-500 text-xs mt-1";
    
    // Determine if intra-state for display in modal
    const currentSelectedCustomer = customers.find(c => c.id === formData.customerId);
    const isIntraState = currentSelectedCustomer?.country.trim().toLowerCase() === 'india' && formData.billingState?.trim().toLowerCase() === 'kerala';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl p-6 m-4">
                <div className="flex justify-between items-center pb-4 border-b dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{isEditMode ? 'Edit Quotation' : 'Create New Quotation'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="pt-4 max-h-[80vh] overflow-y-auto pr-2">
                    <div className="space-y-4">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Searchable Customer Dropdown */}
                            <div className="relative">
                                <label htmlFor="customerSearch" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Customer</label>
                                <div className="relative mt-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="customerSearch"
                                        value={customerSearch}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            setIsCustomerDropdownOpen(true);
                                            if (formData.customerId) {
                                                setFormData(prev => ({ ...prev, customerId: '' }));
                                            }
                                        }}
                                        onFocus={() => setIsCustomerDropdownOpen(true)}
                                        onBlur={() => setTimeout(() => setIsCustomerDropdownOpen(false), 200)}
                                        className={`${inputClass} pl-10`}
                                        placeholder="Search by name, ID or email..."
                                        autoComplete="off"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                        <ChevronDown className="h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                                
                                {isCustomerDropdownOpen && (
                                    <ul className="absolute z-10 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto mt-1">
                                        {filteredCustomers.length > 0 ? (
                                            filteredCustomers.map(customer => (
                                                <li
                                                    key={customer.id}
                                                    onMouseDown={() => {
                                                        setFormData(prev => ({ ...prev, customerId: customer.id }));
                                                        setCustomerSearch(`${customer.name} - ${customer.id}`);
                                                        setIsCustomerDropdownOpen(false);
                                                        if (errors.customerId) setErrors(prev => ({ ...prev, customerId: '' }));
                                                    }}
                                                    className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-gray-600 cursor-pointer text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-600 last:border-0"
                                                >
                                                    <div className="font-medium">{customer.name}</div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                                                        <span>{customer.id}</span>
                                                        <span>{customer.email}</span>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">No customers found</li>
                                        )}
                                    </ul>
                                )}
                                {errors.customerId && <p className={errorClass}>{errors.customerId}</p>}
                            </div>

                            {/* Billing State Dropdown */}
                            <div>
                                <label htmlFor="billingState" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Billing State (Place of Supply)</label>
                                <select 
                                    name="billingState" 
                                    id="billingState" 
                                    value={formData.billingState} 
                                    onChange={handleChange} 
                                    className={`mt-1 ${inputClass}`}
                                >
                                    <option value="">Select State</option>
                                    {indianStates.map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items</label>
                            {/* Header Row for Desktop */}
                            <div className="hidden md:grid grid-cols-12 gap-2 mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-3">Item Name</div>
                                <div className="col-span-2">HS Code</div>
                                <div className="col-span-1">Unit Wt (kg)</div>
                                <div className="col-span-1">Qty</div>
                                <div className="col-span-2">Rate (₹)</div>
                                <div className="col-span-1">GST %</div>
                                <div className="col-span-2 text-right">Total Weight (kg)</div>
                            </div>

                            <div className="space-y-3">
                                {medicines.map((med, index) => (
                                    <div key={index} className="flex items-start gap-2 p-3 border dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900/50">
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-2">
                                            <div className="md:col-span-3">
                                                <label htmlFor={`medicine-name-${index}`} className="md:hidden text-xs font-medium text-gray-500 mb-1 block">Item Name</label>
                                                <input type="text" name="name" id={`medicine-name-${index}`} value={med.name} onChange={(e) => handleMedicineChange(index, e)} className={inputClass} placeholder="Item Name" />
                                                {medicineErrors[index]?.name && <p className={errorClass}>{medicineErrors[index].name}</p>}
                                            </div>
                                             <div className="md:col-span-2">
                                                <label htmlFor={`medicine-hsCode-${index}`} className="md:hidden text-xs font-medium text-gray-500 mb-1 block">HS Code</label>
                                                <input type="text" name="hsCode" id={`medicine-hsCode-${index}`} value={med.hsCode} onChange={(e) => handleMedicineChange(index, e)} className={inputClass} placeholder="HS Code" />
                                            </div>
                                            <div className="md:col-span-1">
                                                <label htmlFor={`medicine-unitWeight-${index}`} className="md:hidden text-xs font-medium text-gray-500 mb-1 block">Unit Weight (kg)</label>
                                                <input type="number" name="unitWeight" id={`medicine-unitWeight-${index}`} value={med.unitWeight} onChange={(e) => handleMedicineChange(index, e)} className={inputClass} placeholder="kg" min="0" step="0.01"/>
                                            </div>
                                            <div className="md:col-span-1">
                                                <label htmlFor={`medicine-quantity-${index}`} className="md:hidden text-xs font-medium text-gray-500 mb-1 block">Quantity</label>
                                                <input type="number" name="quantity" id={`medicine-quantity-${index}`} value={med.quantity} onChange={(e) => handleMedicineChange(index, e)} className={inputClass} placeholder="Qty" min="1"/>
                                                {medicineErrors[index]?.quantity && <p className={errorClass}>{medicineErrors[index].quantity}</p>}
                                            </div>
                                             <div className="md:col-span-2">
                                                <label htmlFor={`medicine-rate-${index}`} className="md:hidden text-xs font-medium text-gray-500 mb-1 block">Rate</label>
                                                <input type="number" name="rate" id={`medicine-rate-${index}`} value={med.rate} onChange={(e) => handleMedicineChange(index, e)} className={inputClass} placeholder="Rate" min="0" step="0.01"/>
                                                {medicineErrors[index]?.rate && <p className={errorClass}>{medicineErrors[index].rate}</p>}
                                            </div>
                                            <div className="md:col-span-1">
                                                <label htmlFor={`medicine-gst-${index}`} className="md:hidden text-xs font-medium text-gray-500 mb-1 block">GST %</label>
                                                <select name="gstRate" id={`medicine-gst-${index}`} value={med.gstRate} onChange={(e) => handleMedicineChange(index, e)} className={inputClass}>
                                                    <option value="0">0%</option>
                                                    <option value="5">5%</option>
                                                    <option value="18">18%</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="md:hidden text-xs font-medium text-gray-500 mb-1 block">Total Weight (kg)</label>
                                                <input 
                                                    type="text" 
                                                    value={med.lineTotalWeight} 
                                                    className={`${inputClass} bg-gray-100 text-right font-medium`} 
                                                    readOnly 
                                                    tabIndex={-1}
                                                />
                                            </div>
                                        </div>
                                        {medicines.length > 1 && (
                                            <button type="button" onClick={() => removeMedicineRow(index)} className="mt-1 p-2 text-red-500 hover:text-red-700 self-center">
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button type="button" onClick={addMedicineRow} className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                                <PlusCircle size={16} /> Add Item
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="origin" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Origin Country</label>
                                <input type="text" name="origin" id="origin" value={formData.origin} onChange={handleChange} className={`mt-1 ${inputClass}`} />
                                 {errors.origin && <p className={errorClass}>{errors.origin}</p>}
                            </div>
                             <div>
                                <label htmlFor="destination" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Destination Country</label>
                                <input type="text" name="destination" id="destination" value={formData.destination} onChange={handleChange} className={`mt-1 ${inputClass}`} />
                                 {errors.destination && <p className={errorClass}>{errors.destination}</p>}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Weight (kg)</label>
                                <input 
                                    type="number" 
                                    name="weight" 
                                    id="weight" 
                                    value={formData.weight} 
                                    onChange={handleChange} 
                                    className={`mt-1 ${inputClass} bg-gray-100 cursor-not-allowed`} 
                                    placeholder="Auto-calculated" 
                                    step="0.01" 
                                    readOnly 
                                />
                                <p className="text-xs text-gray-500 mt-1">Calculated based on item weights.</p>
                                {errors.weight && <p className={errorClass}>{errors.weight}</p>}
                            </div>
                             <div>
                                <label htmlFor="discount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Discount (%)</label>
                                <input type="number" name="discount" id="discount" value={discount} onChange={(e) => setDiscount(e.target.value)} className={`mt-1 ${inputClass}`} placeholder="0" min="0" max="100" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                             <div>
                                <label htmlFor="deliveryCharges" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Charges (₹)</label>
                                <input type="number" name="deliveryCharges" id="deliveryCharges" value={deliveryCharges} onChange={(e) => setDeliveryCharges(e.target.value)} className={`mt-1 ${inputClass}`} placeholder="0.00" min="0" step="0.01" />
                                <p className="text-xs text-gray-500 mt-1">Attracts 18% GST</p>
                            </div>
                            <div>
                                <label htmlFor="remoteCharges" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Remote Area (₹)</label>
                                <input type="number" name="remoteCharges" id="remoteCharges" value={remoteCharges} onChange={(e) => setRemoteCharges(e.target.value)} className={`mt-1 ${inputClass}`} placeholder="0.00" min="0" step="0.01" />
                                <p className="text-xs text-gray-500 mt-1">Attracts 18% GST</p>
                            </div>
                            <div>
                                <label htmlFor="pickupCharges" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pick Up Charges (₹)</label>
                                <input type="number" name="pickupCharges" id="pickupCharges" value={pickupCharges} onChange={(e) => setPickupCharges(e.target.value)} className={`mt-1 ${inputClass}`} placeholder="0.00" min="0" step="0.01" />
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Cost Calculation</h4>
                            <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex justify-between"><span>Subtotal:</span> <span>₹{costDetails.subtotal.toFixed(2)}</span></div>
                                {costDetails.discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600 dark:text-green-400"><span>Discount ({discount}%):</span> <span>-₹{costDetails.discountAmount.toFixed(2)}</span></div>
                                )}
                                {costDetails.deliveryCharges > 0 && (
                                    <div className="flex justify-between"><span>Delivery Charges:</span> <span>₹{costDetails.deliveryCharges.toFixed(2)}</span></div>
                                )}
                                {costDetails.pickupCharges > 0 && (
                                    <div className="flex justify-between"><span>Pick Up Charges:</span> <span>₹{costDetails.pickupCharges.toFixed(2)}</span></div>
                                )}
                                {costDetails.remoteCharges > 0 && (
                                    <div className="flex justify-between"><span>Remote Area Charges:</span> <span>₹{costDetails.remoteCharges.toFixed(2)}</span></div>
                                )}
                                <div className="flex justify-between text-blue-600 dark:text-blue-400">
                                    <span>{isIntraState ? 'Total Output CGST + SGST:' : 'Total Output IGST:'}</span> 
                                    <span>₹{costDetails.tax.toFixed(2)}</span>
                                </div>
                                <hr className="my-1 border-gray-300 dark:border-gray-600"/>
                                <div className="flex justify-between font-bold text-lg text-gray-900 dark:text-white"><span>Total Cost:</span> <span>₹{costDetails.total.toFixed(2)}</span></div>
                            </div>
                        </div>

                    </div>
                    <div className="mt-6 flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">{isEditMode ? 'Save Changes' : 'Save Quotation'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddQuotationModal;
