

export enum ShipmentStatus {
    PendingPickup = "Pending Pickup",
    PickedUp = "Picked Up",
    InTransit = "In Transit",
    ArrivedExport = "Arrived at Export Hub",
    CustomsClearance = "Customs Clearance",
    DepartedCountry = "Departed Country",
    ArrivedDestination = "Arrived Destination",
    OutForDelivery = "Out for Delivery",
    Delivered = "Delivered",
    Returned = "Returned / Failed Delivery",
    Destroyed = "Shipment Destroyed",
}

export enum QuoteStatus {
    Draft = "Draft",
    Sent = "Sent",
    Accepted = "Customer Accepted",
    Rejected = "Customer Rejected",
    Converted = "Converted to Invoice",
}

export enum PaymentStatus {
    Paid = "Paid",
    Unpaid = "Unpaid",
    PartiallyPaid = "Partially Paid",
}

export interface MedicineItem {
    name: string;
    quantity: number;
    rate: number;
    hsCode: string;
    gstRate: number; // 5, 12, or 18
    weight: number; // Total line weight in kg
}

export interface Customer {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    country: string;
    joinDate: string;
}

export interface Shipment {
    id: string;
    invoiceNumber: string;
    awb: string;
    customer: Customer;
    origin: string;
    destination: string;
    courier: 'DHL' | 'FedEx' | 'Aramex' | 'UPS' | 'India Post' | 'EMS';
    status: ShipmentStatus;
    lastUpdate: string;
    weight: number; // in kg
    documents?: string[]; // Array of Base64 strings for shipping docs
    trackingUrl?: string; // Custom tracking URL
}

export interface Quotation {
    id: string;
    customer: Customer;
    medicines: MedicineItem[];
    weight: number; // in kg
    origin: string;
    destination: string;
    totalCost: number;
    status: QuoteStatus;
    createdDate: string;
    validity: string;
    taxName?: string;
    taxRate?: number; // Kept for backward compatibility or global overrides if needed
    discount?: number; // in percentage
    purpose?: string;
    remoteAreaCharges?: number;
    deliveryCharges?: number;
    pickupCharges?: number;
}

export interface Invoice {
    id: string;
    quoteId: string;
    customer: Customer;
    totalAmount: number;
    currency: 'USD' | 'INR' | 'AED' | 'EUR';
    paymentStatus: PaymentStatus;
    issueDate: string;
    dueDate: string;
    taxName?: string;
    taxRate?: number;
    discount?: number; // in percentage
    purpose?: string;
    remoteAreaCharges?: number;
    deliveryCharges?: number;
    pickupCharges?: number;
    paymentProofs?: string[]; // Array of Base64 strings of the uploaded images
    amountPaid?: number; // The actual amount paid by customer
    balanceDue?: number; // The difference remaining
}

export interface ReportData {
    name: string;
    value: number;
}

export type UserRole = 'Admin' | 'Sales' | 'Operations' | 'Finance';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    status: 'Active' | 'Inactive';
    lastLogin: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    timestamp: string;
    isRead: boolean;
    link?: string;
}