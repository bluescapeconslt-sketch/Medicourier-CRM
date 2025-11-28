import React from 'react';
import Card from '../components/Card';
import { Truck, FileText, Users, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockShipments, mockQuotations, mockCustomers, mockInvoices, revenueByCountryData, shipmentsByCourierData } from '../constants';
import { Shipment, ShipmentStatus, QuoteStatus } from '../types';
import Badge from '../components/Badge';

const getStatusColor = (status: ShipmentStatus) => {
    switch (status) {
        case ShipmentStatus.Delivered: return 'green';
        case ShipmentStatus.InTransit:
        case ShipmentStatus.OutForDelivery: return 'blue';
        case ShipmentStatus.CustomsClearance:
        case ShipmentStatus.PendingPickup: return 'yellow';
        case ShipmentStatus.Returned: return 'red';
        default: return 'gray';
    }
};

const RecentShipmentsTable: React.FC<{ shipments: Shipment[] }> = ({ shipments }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Recent Shipments</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                        <th scope="col" className="px-6 py-3">AWB</th>
                        <th scope="col" className="px-6 py-3">Customer</th>
                        <th scope="col" className="px-6 py-3">Destination</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {shipments.slice(0, 5).map(shipment => (
                        <tr key={shipment.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{shipment.awb}</td>
                            <td className="px-6 py-4">{shipment.customer.name}</td>
                            <td className="px-6 py-4">{shipment.destination}</td>
                            <td className="px-6 py-4">
                                <Badge color={getStatusColor(shipment.status)}>{shipment.status}</Badge>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


const Dashboard: React.FC = () => {
    const totalRevenue = mockInvoices.reduce((acc, inv) => acc + inv.totalAmount, 0);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Total Shipments" value={mockShipments.length.toString()} icon={Truck} change="+5.2%" changeType="increase" />
                {/* FIX: Use QuoteStatus.Converted enum for type-safe comparison instead of a magic string. */}
                <Card title="Pending Quotes" value={mockQuotations.filter(q => q.status !== QuoteStatus.Converted).length.toString()} icon={FileText} change="-1.8%" changeType="decrease" />
                <Card title="Active Customers" value={mockCustomers.length.toString()} icon={Users} change="+12" changeType="increase" />
                <Card title="Total Revenue" value={`₹${(totalRevenue/1000).toFixed(1)}k`} icon={DollarSign} change="+12.5%" changeType="increase" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Revenue by Country</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueByCountryData}>
                            <XAxis dataKey="name" stroke="rgb(107 114 128)" />
                            <YAxis stroke="rgb(107 114 128)" />
                            <Tooltip contentStyle={{ backgroundColor: 'rgb(31 41 55)', border: 'none', color: '#fff' }} cursor={{fill: 'rgba(107, 114, 128, 0.1)'}}/>
                            <Legend />
                            <Bar dataKey="value" name="Revenue ($)" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                 <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Shipments by Courier</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={shipmentsByCourierData}>
                            <XAxis dataKey="name" stroke="rgb(107 114 128)" />
                            <YAxis stroke="rgb(107 114 128)"/>
                            <Tooltip contentStyle={{ backgroundColor: 'rgb(31 41 55)', border: 'none', color: '#fff' }} cursor={{fill: 'rgba(107, 114, 128, 0.1)'}}/>
                            <Legend />
                            <Bar dataKey="value" name="Shipments" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <RecentShipmentsTable shipments={mockShipments} />
        </div>
    );
};

export default Dashboard;