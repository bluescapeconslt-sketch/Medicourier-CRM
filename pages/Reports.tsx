
import React, { useMemo, useState } from 'react';
import { BarChart2, FileDown, DollarSign, Package, TrendingUp, Filter, Calendar, RefreshCw, FileText, PieChart as PieIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { legacyShipments } from '../data/legacyData';
import Card from '../components/Card';

const Reports: React.FC = () => {
    // View State
    const [activeTab, setActiveTab] = useState<'performance' | 'gst'>('performance');

    // Filter State
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedCountry, setSelectedCountry] = useState('');
    const [selectedPartner, setSelectedPartner] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    // GST Settings
    const [taxRate, setTaxRate] = useState(18); // Default GST Rate for Service

    // Extract unique values for dropdowns
    const { uniqueCountries, uniquePartners, uniqueStatuses } = useMemo(() => {
        const countries = new Set<string>();
        const partners = new Set<string>();
        const statuses = new Set<string>();

        legacyShipments.forEach(item => {
            if (item.country) countries.add(item.country.trim().toUpperCase());
            if (item.shippingPartner) partners.add(item.shippingPartner.trim().toUpperCase());
            if (item.status) statuses.add(item.status.trim());
        });

        return {
            uniqueCountries: Array.from(countries).sort(),
            uniquePartners: Array.from(partners).sort(),
            uniqueStatuses: Array.from(statuses).sort()
        };
    }, []);

    // Helper to parse DD-MM-YYYY dates
    const parseDate = (dateStr: string) => {
        if (!dateStr) return null;
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;
        return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    };

    // Filter Logic
    const filteredData = useMemo(() => {
        return legacyShipments.filter(item => {
            let matches = true;

            // Date Range Filter
            if (startDate || endDate) {
                const itemDate = parseDate(item.date);
                if (itemDate) {
                    if (startDate) {
                        const start = new Date(startDate);
                        start.setHours(0, 0, 0, 0);
                        if (itemDate < start) matches = false;
                    }
                    if (endDate && matches) {
                        const end = new Date(endDate);
                        end.setHours(23, 59, 59, 999);
                        if (itemDate > end) matches = false;
                    }
                } else {
                    matches = false;
                }
            }

            if (matches && selectedCountry) {
                matches = item.country?.trim().toUpperCase() === selectedCountry;
            }
            if (matches && selectedPartner) {
                matches = item.shippingPartner?.trim().toUpperCase() === selectedPartner;
            }
            if (matches && selectedStatus) {
                matches = item.status?.trim() === selectedStatus;
            }

            return matches;
        });
    }, [startDate, endDate, selectedCountry, selectedPartner, selectedStatus]);

    // --- Performance Metrics ---
    const metrics = useMemo(() => {
        let totalRevenue = 0;
        let totalProfit = 0;
        let totalShipments = filteredData.length;
        const countryMap: {[key: string]: number} = {};
        const courierMap: {[key: string]: number} = {};

        filteredData.forEach(item => {
            totalRevenue += item.receivedAmt || 0;
            totalProfit += item.profit || 0;
            
            const country = item.country?.trim().toUpperCase() || 'UNKNOWN';
            if (country) countryMap[country] = (countryMap[country] || 0) + 1;

            let courier = item.shippingPartner?.trim().toUpperCase() || 'OTHER';
            if (courier.includes('DHL')) courier = 'DHL';
            else if (courier.includes('ARAMEX')) courier = 'ARAMEX';
            else if (courier.includes('INDIAN POST')) courier = 'INDIA POST';
            
            courierMap[courier] = (courierMap[courier] || 0) + 1;
        });

        const countryData = Object.entries(countryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);

        const courierData = Object.entries(courierMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        return { totalRevenue, totalProfit, totalShipments, countryData, courierData };
    }, [filteredData]);

    // --- GST Calculation Logic ---
    const gstReportData = useMemo(() => {
        let totalTaxable = 0;
        let totalCGST = 0;
        let totalSGST = 0;
        let totalIGST = 0;

        const rows = filteredData.map(item => {
            // Determine Place of Supply
            const isDomestic = item.country?.trim().toLowerCase() === 'india';
            
            // Taxable Value logic: Use Shipping Charge. If 0, assume receivedAmt contains it or is 0.
            const taxableValue = item.shippingCharge || 0;
            
            let cgst = 0, sgst = 0, igst = 0, taxType = '';

            if (isDomestic) {
                // Domestic: Intra-State (CGST + SGST)
                const halfRate = taxRate / 2;
                cgst = taxableValue * (halfRate / 100);
                sgst = taxableValue * (halfRate / 100);
                taxType = 'Intra-State';
            } else {
                // International: Inter-State / Export (IGST)
                igst = taxableValue * (taxRate / 100);
                taxType = 'Inter-State (Export)';
            }

            // Update Summaries
            totalTaxable += taxableValue;
            totalCGST += cgst;
            totalSGST += sgst;
            totalIGST += igst;

            const totalInvValue = taxableValue + cgst + sgst + igst;

            return {
                ...item,
                taxableValue,
                cgst,
                sgst,
                igst,
                totalInvValue,
                taxType,
                hsn: '9968', // SAC for Courier Services
                description: 'Courier / Logistics Services'
            };
        });

        return { rows, totalTaxable, totalCGST, totalSGST, totalIGST };
    }, [filteredData, taxRate]);


    const handleDownloadPerformanceCSV = () => {
        const headers = ["REF NUMBER", "DATE", "INVOICE", "CUSTOMER", "COUNTRY", "PARTNER", "WEIGHT", "AWB", "STATUS", "AMOUNT", "PROFIT"];
        const csvRows = [
            headers.join(','),
            ...filteredData.map(item => [
                item.refNumber, `"${item.date}"`, item.gstInvoice, `"${item.receiverName}"`, `"${item.country}"`, `"${item.shippingPartner}"`, `"${item.weight}"`, `"${item.waybillNumber}"`, item.status, item.receivedAmt, item.profit
            ].join(','))
        ];
        downloadCSV(csvRows.join('\n'), 'MediCourier_Performance_Report');
    };

    const handleDownloadGSTCSV = () => {
        const headers = [
            "Date", "Invoice No", "Customer", "Place of Supply", "HSN/SAC", "Description",
            "Taxable Value", "Tax Rate", "CGST Amt", "SGST Amt", "IGST Amt", "Total Inv Value"
        ];
        const csvRows = [
            headers.join(','),
            ...gstReportData.rows.map(row => [
                `"${row.date}"`,
                row.gstInvoice,
                `"${row.receiverName}"`,
                `"${row.country}"`,
                row.hsn,
                `"${row.description}"`,
                row.taxableValue.toFixed(2),
                `${taxRate}%`,
                row.cgst.toFixed(2),
                row.sgst.toFixed(2),
                row.igst.toFixed(2),
                row.totalInvValue.toFixed(2)
            ].join(','))
        ];
        downloadCSV(csvRows.join('\n'), 'MediCourier_GST_Report');
    };

    const downloadCSV = (csvString: string, fileName: string) => {
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleResetFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedCountry('');
        setSelectedPartner('');
        setSelectedStatus('');
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h2>
                    <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('performance')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'performance' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
                        >
                            Performance
                        </button>
                        <button
                            onClick={() => setActiveTab('gst')}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'gst' ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'}`}
                        >
                            GST Report
                        </button>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleResetFilters}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
                    >
                        <RefreshCw size={16} /> Reset
                    </button>
                    <button 
                        onClick={activeTab === 'performance' ? handleDownloadPerformanceCSV : handleDownloadGSTCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-colors text-sm font-medium"
                    >
                        <FileDown size={18} /> {activeTab === 'performance' ? 'Export Analytics' : 'Export GST Data'}
                    </button>
                </div>
            </div>

            {/* Common Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Filter size={16} /> Filter Data
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Start Date</label>
                        <div className="relative">
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" />
                            <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                    </div>
                    <div className="relative">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">End Date</label>
                        <div className="relative">
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white" />
                            <Calendar size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Country</label>
                        <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white">
                            <option value="">All Countries</option>
                            {uniqueCountries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Partner</label>
                        <select value={selectedPartner} onChange={(e) => setSelectedPartner(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white">
                            <option value="">All Partners</option>
                            {uniquePartners.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Status</label>
                        <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white">
                            <option value="">All Statuses</option>
                            {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* --- TAB CONTENT --- */}
            {activeTab === 'performance' ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card title="Total Revenue" value={`₹${metrics.totalRevenue.toLocaleString()}`} icon={DollarSign} change="Based on filtered view" changeType="increase" />
                        <Card title="Total Shipments" value={metrics.totalShipments.toString()} icon={Package} />
                        <Card title="Total Profit" value={`₹${metrics.totalProfit.toLocaleString()}`} icon={TrendingUp} changeType="increase" />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Top 10 Destinations</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={metrics.countryData} layout="vertical" margin={{ left: 20 }}>
                                    <XAxis type="number" stroke="rgb(107 114 128)" />
                                    <YAxis dataKey="name" type="category" stroke="rgb(107 114 128)" width={100} tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgb(31 41 55)', border: 'none', color: '#fff' }} cursor={{fill: 'rgba(107, 114, 128, 0.1)'}}/>
                                    <Bar dataKey="value" name="Shipments" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Shipments by Partner</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={metrics.courierData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                                        {metrics.courierData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </>
            ) : (
                /* --- GST REPORT VIEW --- */
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-blue-500">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total Taxable Value</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{gstReportData.totalTaxable.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-green-500">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total CGST + SGST</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{(gstReportData.totalCGST + gstReportData.totalSGST).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-purple-500">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total IGST</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{gstReportData.totalIGST.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border-l-4 border-gray-500">
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Total Tax Liability</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{(gstReportData.totalCGST + gstReportData.totalSGST + gstReportData.totalIGST).toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
                        </div>
                    </div>

                    {/* Detailed GST Table */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed GST Output Register</h3>
                                <p className="text-xs text-gray-500">HSN 9968 (Courier) | Rate {taxRate}% | Place of Supply Logic Applied</p>
                            </div>
                            <div className="text-sm font-mono bg-blue-100 text-blue-800 px-3 py-1 rounded">
                                {gstReportData.rows.length} Invoices
                            </div>
                        </div>
                        <div className="overflow-x-auto max-h-[600px]">
                            <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-200 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 border-r dark:border-gray-600">Date</th>
                                        <th className="px-4 py-3 border-r dark:border-gray-600">Inv #</th>
                                        <th className="px-4 py-3 border-r dark:border-gray-600 w-48">Customer Name</th>
                                        <th className="px-4 py-3 border-r dark:border-gray-600">Place of Supply</th>
                                        <th className="px-4 py-3 border-r dark:border-gray-600 text-center">HSN</th>
                                        <th className="px-4 py-3 border-r dark:border-gray-600 text-right">Taxable Val</th>
                                        <th className="px-4 py-3 border-r dark:border-gray-600 text-right">CGST</th>
                                        <th className="px-4 py-3 border-r dark:border-gray-600 text-right">SGST</th>
                                        <th className="px-4 py-3 border-r dark:border-gray-600 text-right">IGST</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700 font-mono">
                                    {gstReportData.rows.length > 0 ? (
                                        gstReportData.rows.map((row, index) => (
                                            <tr key={index} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-4 py-2 border-r dark:border-gray-700">{row.date}</td>
                                                <td className="px-4 py-2 border-r dark:border-gray-700 font-bold text-blue-600">{row.gstInvoice}</td>
                                                <td className="px-4 py-2 border-r dark:border-gray-700 truncate max-w-[150px]" title={row.receiverName}>{row.receiverName}</td>
                                                <td className="px-4 py-2 border-r dark:border-gray-700">
                                                    {row.country}
                                                    <span className="block text-[10px] text-gray-400">{row.taxType}</span>
                                                </td>
                                                <td className="px-4 py-2 border-r dark:border-gray-700 text-center">{row.hsn}</td>
                                                <td className="px-4 py-2 border-r dark:border-gray-700 text-right font-medium text-gray-800 dark:text-gray-200">
                                                    {row.taxableValue.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-2 border-r dark:border-gray-700 text-right text-gray-600">
                                                    {row.cgst > 0 ? row.cgst.toFixed(2) : '-'}
                                                </td>
                                                <td className="px-4 py-2 border-r dark:border-gray-700 text-right text-gray-600">
                                                    {row.sgst > 0 ? row.sgst.toFixed(2) : '-'}
                                                </td>
                                                <td className="px-4 py-2 border-r dark:border-gray-700 text-right text-gray-600">
                                                    {row.igst > 0 ? row.igst.toFixed(2) : '-'}
                                                </td>
                                                <td className="px-4 py-2 text-right font-bold text-gray-900 dark:text-white">
                                                    {row.totalInvValue.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={10} className="px-6 py-8 text-center text-gray-500">No records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot className="bg-gray-100 dark:bg-gray-700 font-bold text-xs uppercase sticky bottom-0">
                                    <tr>
                                        <td colSpan={5} className="px-4 py-3 text-right">Totals:</td>
                                        <td className="px-4 py-3 text-right">{gstReportData.totalTaxable.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">{gstReportData.totalCGST.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">{gstReportData.totalSGST.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">{gstReportData.totalIGST.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right">
                                            {(gstReportData.totalTaxable + gstReportData.totalCGST + gstReportData.totalSGST + gstReportData.totalIGST).toFixed(2)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* Detailed Table for Performance Tab */}
            {activeTab === 'performance' && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed Shipment Log</h3>
                        <span className="text-sm text-gray-500">Showing {filteredData.length} records</span>
                    </div>
                    <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Ref #</th>
                                    <th className="px-6 py-3">Customer</th>
                                    <th className="px-6 py-3">Country</th>
                                    <th className="px-6 py-3">Partner</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredData.length > 0 ? (
                                    filteredData.map((item, index) => (
                                        <tr key={index} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <td className="px-6 py-4 whitespace-nowrap">{item.date}</td>
                                            <td className="px-6 py-4 font-medium text-blue-600 dark:text-blue-400">{item.refNumber}</td>
                                            <td className="px-6 py-4">{item.receiverName}</td>
                                            <td className="px-6 py-4">{item.country}</td>
                                            <td className="px-6 py-4">{item.shippingPartner}</td>
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                                {item.receivedAmt ? `₹${item.receivedAmt.toLocaleString()}` : '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                    item.status?.toLowerCase().includes('deliver') ? 'bg-green-100 text-green-800' : 
                                                    item.status?.toLowerCase().includes('transit') ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {item.status || 'Unknown'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No records match your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
