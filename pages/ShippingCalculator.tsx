

import React, { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';

const ShippingCalculator: React.FC = () => {
    const [baseRate, setBaseRate] = useState<number>(0);
    const [covidSurcharge, setCovidSurcharge] = useState<number>(0);
    const [fuelSurchargePercent, setFuelSurchargePercent] = useState<number>(0); // Renamed to reflect percentage

    // Derived calculations
    const subtotal1 = useMemo(() => baseRate + covidSurcharge, [baseRate, covidSurcharge]);
    
    // Calculate actual fuel surcharge amount based on percentage
    const actualFuelSurchargeAmount = useMemo(() => subtotal1 * (fuelSurchargePercent / 100), [subtotal1, fuelSurchargePercent]);
    
    // Subtotal 2: subtotal1 + actual fuel surcharge amount
    const subtotal2 = useMemo(() => subtotal1 + actualFuelSurchargeAmount, [subtotal1, actualFuelSurchargeAmount]);
    
    const gstAmount = useMemo(() => subtotal2 * 0.18, [subtotal2]); // 18% GST
    const grandTotal = useMemo(() => subtotal2 + gstAmount, [subtotal2, gstAmount]);

    const formatCurrency = (value: number) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<number>>, value: string) => {
        const num = parseFloat(value);
        setter(isNaN(num) ? 0 : num);
    };

    const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
    const displayClass = "mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-md shadow-sm sm:text-sm font-medium text-gray-900 dark:text-white cursor-default";

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Calculator size={32} className="text-blue-600 dark:text-blue-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shipping Calculator</h2>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-xl mx-auto">
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Calculate estimated shipping costs with detailed breakdown, including GST.
                </p>

                <div className="space-y-5">
                    {/* Input Fields */}
                    <div>
                        <label htmlFor="baseRate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Base rate (₹)</label>
                        <input
                            type="number"
                            id="baseRate"
                            value={baseRate === 0 ? '' : baseRate}
                            onChange={(e) => handleInputChange(setBaseRate, e.target.value)}
                            className={inputClass}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                    </div>
                    <div>
                        <label htmlFor="covidSurcharge" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Covid/Peak surcharge (₹)</label>
                        <input
                            type="number"
                            id="covidSurcharge"
                            value={covidSurcharge === 0 ? '' : covidSurcharge}
                            onChange={(e) => handleInputChange(setCovidSurcharge, e.target.value)}
                            className={inputClass}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                    </div>

                    {/* First Total */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total (Base rate + Covid/Peak surcharge)</label>
                        <input
                            type="text"
                            value={formatCurrency(subtotal1)}
                            className={displayClass}
                            readOnly
                        />
                    </div>

                    <div>
                        <label htmlFor="fuelSurchargePercent" className="block text-sm font-medium text-gray-700 dark:text-gray-300">FS (Fuel Surcharge) (%)</label>
                        <input
                            type="number"
                            id="fuelSurchargePercent"
                            value={fuelSurchargePercent === 0 ? '' : fuelSurchargePercent}
                            onChange={(e) => handleInputChange(setFuelSurchargePercent, e.target.value)}
                            className={inputClass}
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">Calculated amount: {formatCurrency(actualFuelSurchargeAmount)}</p>
                    </div>

                    {/* Second Total */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total (after Fuel Surcharge)</label>
                        <input
                            type="text"
                            value={formatCurrency(subtotal2)}
                            className={displayClass}
                            readOnly
                        />
                    </div>

                    {/* GST */}
                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GST 18%</label>
                        <input
                            type="text"
                            value={formatCurrency(gstAmount)}
                            className={displayClass}
                            readOnly
                        />
                    </div>

                    {/* Grand Total */}
                    <div className="pt-4 border-t-2 border-blue-500 dark:border-blue-400">
                        <label className="block text-xl font-bold text-gray-900 dark:text-white">Grand total</label>
                        <input
                            type="text"
                            value={formatCurrency(grandTotal)}
                            className={`${displayClass} !text-2xl !font-extrabold !text-blue-600 dark:!text-blue-400`}
                            readOnly
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShippingCalculator;
