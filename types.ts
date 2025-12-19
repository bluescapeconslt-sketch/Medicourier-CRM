
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
    unitWeight?: number; // Weight per unit in kg
}

export interface Customer {
    id: string;
    userId?: string; // Owner ID
    name: string;
    email: string;
    phone: string;
    address: string;
    billingAddress?: string;
    shippingAddress?: string;
    country: string;
    joinDate: string;
}

export interface Shipment {
    id: string;
    userId?: string; // Owner ID
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
    userId?: string; // Owner ID
    customer: Customer;
    medicines: MedicineItem[];
    weight: number; // in kg
    origin: string;
    destination: string;
    billingState?: string; 
    totalCost: number;
    status: QuoteStatus;
    createdDate: string;
    validity: string;
    taxName?: string;
    taxRate?: number; 
    discount?: number; // in percentage
    purpose?: string;
    remoteAreaCharges?: number;
    deliveryCharges?: number;
    pickupCharges?: number;
}

export interface Invoice {
    id: string;
    userId?: string; // Owner ID
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
    billingState?: string; 
    paymentProofs?: string[]; // Array of Base64 strings of the uploaded images
    amountPaid?: number; // The actual amount paid by customer
    balanceDue?: number; // The difference remaining
    paymentSource?: string; // New field for Payment Source (Bank, Wallet, etc.)
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
    password?: string; 
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

// Interface for the imported CSV data report
export interface LegacyShipment {
    refNumber: string;
    date: string;
    gstInvoice: string;
    receiverName: string;
    country: string;
    shippingPartner: string;
    weight: string;
    waybillNumber: string;
    status: string;
    vendor: string;
    paymentMode: string;
    shippingCharge: number;
    productCost: number;
    receivedAmt: number;
    profit: number;
}
