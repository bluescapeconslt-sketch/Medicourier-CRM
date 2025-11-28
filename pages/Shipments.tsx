
import React, { useState, useEffect } from 'react';
import { mockShipments } from '../constants';
import { ShipmentStatus, Shipment } from '../types';
import { Search, ChevronDown, Paperclip, Plus, Link, ExternalLink, Filter } from 'lucide-react';
import DocumentPreviewModal from '../components/DocumentPreviewModal';
import AddShipmentDocumentModal from '../components/AddShipmentDocumentModal';
import EditTrackingUrlModal from '../components/EditTrackingUrlModal';

const statusStyles = {
    green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800',
    blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600',
};

const getStatusColorKey = (status: ShipmentStatus): keyof typeof statusStyles => {
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

const Shipments: React.FC = () => {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [courierFilter, setCourierFilter] = useState('');
    
    const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    
    // Add Document State
    const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
    const [shipmentForDocs, setShipmentForDocs] = useState<Shipment | null>(null);

    // Edit Tracking URL State
    const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
    const [shipmentForTracking, setShipmentForTracking] = useState<Shipment | null>(null);

    useEffect(() => {
        const storedShipments = localStorage.getItem('crm_shipments');
        if (storedShipments) {
            setShipments(JSON.parse(storedShipments));
        } else {
            setShipments(mockShipments);
            localStorage.setItem('crm_shipments', JSON.stringify(mockShipments));
        }
    }, []);

    const handleStatusChange = (id: string, newStatus: ShipmentStatus) => {
        const updatedShipments = shipments.map(s => 
            s.id === id ? { ...s, status: newStatus } : s
        );
        setShipments(updatedShipments);
        localStorage.setItem('crm_shipments', JSON.stringify(updatedShipments));
    };

    const handleCourierChange = (id: string, newCourier: string) => {
        const updatedShipments = shipments.map(s => 
            s.id === id ? { ...s, courier: newCourier as any } : s
        );
        setShipments(updatedShipments);
        localStorage.setItem('crm_shipments', JSON.stringify(updatedShipments));
    };

    const handleViewDocument = (docUrl: string) => {
        setSelectedDoc(docUrl);
        setIsPreviewOpen(true);
    };

    const handleOpenAddDocModal = (shipment: Shipment) => {
        setShipmentForDocs(shipment);
        setIsAddDocModalOpen(true);
    };

    const handleOpenTrackingModal = (shipment: Shipment) => {
        setShipmentForTracking(shipment);
        setIsTrackingModalOpen(true);
    };

    const handleUpdateTrackingUrl = (shipmentId: string, url: string) => {
        const updatedShipments = shipments.map(s => 
            s.id === shipmentId ? { ...s, trackingUrl: url } : s
        );
        setShipments(updatedShipments);
        localStorage.setItem('crm_shipments', JSON.stringify(updatedShipments));
    };

    const handleAddDocuments = (shipmentId: string, newDocuments: string[]) => {
        const updatedShipments = shipments.map(s => {
            if (s.id === shipmentId) {
                const existingDocs = s.documents || [];
                return { ...s, documents: [...existingDocs, ...newDocuments] };
            }
            return s;
        });

        try {
            localStorage.setItem('crm_shipments', JSON.stringify(updatedShipments));
            setShipments(updatedShipments);
        } catch (error) {
            console.error("Local Storage Error:", error);
            if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                 alert("Storage Limit Exceeded: Browser storage is full. Please delete some old shipments or use smaller files.");
            } else {
                 alert("An error occurred while saving documents.");
            }
        }
    };

    const filteredShipments = shipments.filter(s => {
        const matchesSearch = s.awb.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              s.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter ? s.status === statusFilter : true;
        const matchesCourier = courierFilter ? s.courier === courierFilter : true;
        
        return matchesSearch && matchesStatus && matchesCourier;
    });

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Shipments</h2>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full xl:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Search by AWB or Customer..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-40">
                             <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full appearance-none pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-200"
                            >
                                <option value="">All Statuses</option>
                                {Object.values(ShipmentStatus).map((status) => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <Filter size={14} />
                            </div>
                        </div>

                        <div className="relative w-full sm:w-40">
                            <select
                                value={courierFilter}
                                onChange={(e) => setCourierFilter(e.target.value)}
                                className="w-full appearance-none pl-3 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700 dark:text-gray-200"
                            >
                                <option value="">All Couriers</option>
                                <option value="DHL">DHL</option>
                                <option value="FedEx">FedEx</option>
                                <option value="Aramex">Aramex</option>
                                <option value="UPS">UPS</option>
                                <option value="India Post">India Post</option>
                                <option value="EMS">EMS</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">AWB</th>
                            <th scope="col" className="px-6 py-3">Customer</th>
                            <th scope="col" className="px-6 py-3">Courier</th>
                            <th scope="col" className="px-6 py-3">Origin</th>
                            <th scope="col" className="px-6 py-3">Destination</th>
                            <th scope="col" className="px-6 py-3">Documents</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Last Update</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredShipments.length > 0 ? (
                            filteredShipments.map(shipment => (
                                <tr key={shipment.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {shipment.trackingUrl ? (
                                                <a 
                                                    href={shipment.trackingUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                    title="Open Tracking URL"
                                                >
                                                    {shipment.awb}
                                                    <ExternalLink size={12} />
                                                </a>
                                            ) : (
                                                <span className="font-medium text-gray-900 dark:text-white">{shipment.awb}</span>
                                            )}
                                            <button 
                                                onClick={() => handleOpenTrackingModal(shipment)}
                                                className="text-gray-400 hover:text-blue-600 transition-colors p-1"
                                                title="Edit Tracking URL"
                                            >
                                                <Link size={14} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{shipment.customer.name}</td>
                                    <td className="px-6 py-4">
                                        <div className="relative min-w-[120px]">
                                            <select
                                                value={shipment.courier}
                                                onChange={(e) => handleCourierChange(shipment.id, e.target.value)}
                                                className="appearance-none block w-full pl-3 pr-8 py-1.5 text-xs font-semibold rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 bg-white text-gray-900 dark:bg-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
                                            >
                                                <option value="DHL">DHL</option>
                                                <option value="FedEx">FedEx</option>
                                                <option value="Aramex">Aramex</option>
                                                <option value="UPS">UPS</option>
                                                <option value="India Post">India Post</option>
                                                <option value="EMS">EMS</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600 dark:text-gray-300">
                                                <ChevronDown size={12} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{shipment.origin}</td>
                                    <td className="px-6 py-4">{shipment.destination}</td>
                                    <td className="px-6 py-4">
                                         <div className="flex items-center gap-2">
                                            {shipment.documents && shipment.documents.length > 0 ? (
                                                <div className="flex flex-wrap gap-1">
                                                    {shipment.documents.map((doc, idx) => (
                                                        <button 
                                                            key={idx} 
                                                            onClick={() => handleViewDocument(doc)}
                                                            className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 dark:bg-gray-700 text-blue-600 rounded hover:bg-blue-100 transition-colors" 
                                                            title={`View Document ${idx + 1}`}
                                                        >
                                                            <Paperclip size={12} />
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400 mr-2">-</span>
                                            )}
                                            <button 
                                                onClick={() => handleOpenAddDocModal(shipment)}
                                                className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors p-1"
                                                title="Add Document"
                                            >
                                                <Plus size={16} />
                                            </button>
                                         </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="relative min-w-[160px]">
                                            <select
                                                value={shipment.status}
                                                onChange={(e) => handleStatusChange(shipment.id, e.target.value as ShipmentStatus)}
                                                className={`appearance-none block w-full pl-3 pr-8 py-1.5 text-xs font-semibold rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 ${statusStyles[getStatusColorKey(shipment.status)]}`}
                                            >
                                                {Object.values(ShipmentStatus).map((status) => (
                                                    <option key={status} value={status} className="bg-white text-gray-900 dark:bg-gray-800 dark:text-white">
                                                        {status}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-600 dark:text-gray-300">
                                                <ChevronDown size={12} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{shipment.lastUpdate}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={8} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                                    No shipments found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <DocumentPreviewModal
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                documentUrl={selectedDoc}
            />
            <AddShipmentDocumentModal
                isOpen={isAddDocModalOpen}
                onClose={() => setIsAddDocModalOpen(false)}
                shipment={shipmentForDocs}
                onAdd={handleAddDocuments}
            />
            <EditTrackingUrlModal
                isOpen={isTrackingModalOpen}
                onClose={() => setIsTrackingModalOpen(false)}
                shipment={shipmentForTracking}
                onUpdate={handleUpdateTrackingUrl}
            />
        </div>
    );
};

export default Shipments;
