
import { Customer, Shipment, Quotation, Invoice, ReportData, ShipmentStatus, QuoteStatus, PaymentStatus, User, Notification } from './types';

// Mock Customers
export const mockCustomers: Customer[] = [
    { 
        id: 'CUST001', userId: 'USR001', // Owned by Admin
        name: 'John Doe', 
        email: 'john.doe@example.com', 
        phone: '123-456-7890', 
        address: '123 Main St, New York, USA', 
        billingAddress: '123 Main St, New York, USA',
        shippingAddress: '456 Warehouse Blvd, New Jersey, USA',
        country: 'USA', 
        joinDate: '2023-01-15' 
    },
    { 
        id: 'CUST002', userId: 'USR002', // Owned by Sales (Sarah)
        name: 'Priya Sharma', 
        email: 'priya.sharma@example.com', 
        phone: '987-654-3210', 
        address: '456 MG Road, Mumbai, India', 
        billingAddress: '456 MG Road, Mumbai, India',
        shippingAddress: '456 MG Road, Mumbai, India',
        country: 'India', 
        joinDate: '2023-02-20' 
    },
    { 
        id: 'CUST003', userId: 'USR002', // Owned by Sales (Sarah)
        name: 'Fatima Al Fassi', 
        email: 'fatima.fassi@example.com', 
        phone: '555-123-4567', 
        address: '789 Sheikh Zayed Rd, Dubai, UAE', 
        billingAddress: '789 Sheikh Zayed Rd, Dubai, UAE',
        shippingAddress: 'P.O. Box 12345, Dubai, UAE',
        country: 'UAE', 
        joinDate: '2023-03-10' 
    },
    { 
        id: 'CUST004', userId: 'USR001', // Owned by Admin
        name: 'Hans Müller', 
        email: 'hans.muller@example.com', 
        phone: '444-555-6666', 
        address: '10 Kurfürstendamm, Berlin, Germany', 
        billingAddress: '10 Kurfürstendamm, Berlin, Germany',
        shippingAddress: 'Logistics Center 5, Hamburg, Germany',
        country: 'Germany', 
        joinDate: '2023-04-05' 
    },
];

// Mock Shipments
export const mockShipments: Shipment[] = [
    { id: 'SHP001', userId: 'USR001', invoiceNumber: 'INV001', awb: '1Z999AA10123456784', customer: mockCustomers[0], origin: 'USA', destination: 'India', courier: 'FedEx', status: ShipmentStatus.Delivered, lastUpdate: '2023-10-26', weight: 2.5, trackingUrl: 'https://www.fedex.com/fedextrack/?trknbr=1Z999AA10123456784' },
    { id: 'SHP002', userId: 'USR002', invoiceNumber: 'INV002', awb: '1Z999AA10123456785', customer: mockCustomers[1], origin: 'India', destination: 'UAE', courier: 'DHL', status: ShipmentStatus.InTransit, lastUpdate: '2023-10-28', weight: 1.8 },
];

// Mock Quotations
export const mockQuotations: Quotation[] = [
    { id: 'QT001', userId: 'USR001', customer: mockCustomers[0], medicines: [{ name: 'Metformin 500mg', quantity: 90, rate: 132.28, hsCode: '3004.90', gstRate: 12, weight: 0.9 }], weight: 0.9, origin: 'USA', destination: 'India', billingState: 'Kerala', totalCost: 12500, status: QuoteStatus.Converted, createdDate: '2023-10-01', validity: '2023-10-15', purpose: 'Personal Use', deliveryCharges: 500, remoteAreaCharges: 0, pickupCharges: 100 },
    { id: 'QT002', userId: 'USR002', customer: mockCustomers[1], medicines: [{ name: 'Aspirin 81mg', quantity: 120, rate: 47.62, hsCode: '3004.50', gstRate: 5, weight: 0.6 }], weight: 0.6, origin: 'India', destination: 'UAE', billingState: 'Maharashtra', totalCost: 6000, status: QuoteStatus.Accepted, createdDate: '2023-10-05', validity: '2023-10-20', purpose: 'Commercial Sample', deliveryCharges: 250, remoteAreaCharges: 0, pickupCharges: 0 },
    { id: 'QT003', userId: 'USR002', customer: mockCustomers[2], medicines: [{ name: 'Lipitor 20mg', quantity: 60, rate: 150, hsCode: '3004.90', gstRate: 18, weight: 1.2 }, { name: 'Ibuprofen 200mg', quantity: 100, rate: 80, hsCode: '3004.50', gstRate: 12, weight: 1.0 }], weight: 2.2, origin: 'UAE', destination: 'Germany', billingState: 'Delhi', totalCost: 18250, status: QuoteStatus.Sent, createdDate: '2023-10-12', validity: '2023-10-27', purpose: 'Personal Medical Use', deliveryCharges: 1000, remoteAreaCharges: 500, pickupCharges: 200 },
    { id: 'QT004', userId: 'USR001', customer: mockCustomers[3], medicines: [{ name: 'Amoxicillin 250mg', quantity: 30, rate: 142.85, hsCode: '3004.10', gstRate: 5, weight: 0.45 }], weight: 0.45, origin: 'Germany', destination: 'USA', billingState: 'Karnataka', totalCost: 4500, status: QuoteStatus.Draft, createdDate: '2023-10-20', validity: '2023-11-04', purpose: 'Research', deliveryCharges: 200, remoteAreaCharges: 0, pickupCharges: 0 },
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
    { id: 'INV001', userId: 'USR001', quoteId: 'QT001', customer: mockCustomers[0], totalAmount: 12500, currency: 'INR', paymentStatus: PaymentStatus.Paid, issueDate: '2023-10-02', dueDate: '2023-10-17', purpose: 'Personal Use', deliveryCharges: 500, pickupCharges: 100, billingState: 'Kerala' },
    { id: 'INV002', userId: 'USR002', quoteId: 'QT002', customer: mockCustomers[1], totalAmount: 6000, currency: 'INR', paymentStatus: PaymentStatus.Paid, issueDate: '2023-10-06', dueDate: '2023-10-21', purpose: 'Commercial Sample', deliveryCharges: 250, billingState: 'Maharashtra' },
    { id: 'INV003', userId: 'USR002', quoteId: 'QT003', customer: mockCustomers[2], totalAmount: 18250, currency: 'INR', paymentStatus: PaymentStatus.Unpaid, issueDate: '2023-10-13', dueDate: '2023-10-28', purpose: 'Personal Medical Use', deliveryCharges: 1000, remoteAreaCharges: 500, pickupCharges: 200, billingState: 'Delhi' },
];

// Mock Users
export const mockUsers: User[] = [
    { id: 'USR001', name: 'Admin User', email: 'admin@example.com', role: 'Admin', status: 'Active', lastLogin: '2023-10-25 09:00 AM', password: 'admin' },
    { id: 'USR002', name: 'Sarah Sales', email: 'sales@example.com', role: 'Sales', status: 'Active', lastLogin: '2023-10-25 10:15 AM', password: 'sales' },
    { id: 'USR003', name: 'Mike Ops', email: 'ops@example.com', role: 'Operations', status: 'Active', lastLogin: '2023-10-24 04:45 PM', password: 'ops' },
    { id: 'USR004', name: 'Fiona Finance', email: 'finance@example.com', role: 'Finance', status: 'Active', lastLogin: '2023-10-25 08:30 AM', password: 'finance' },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
    {
        id: 'NOT001',
        title: 'New Quotation Request',
        message: 'Customer John Doe requested a quote for Metformin.',
        type: 'info',
        timestamp: '2023-10-26T10:30:00',
        isRead: false,
        link: '/quotations'
    },
    {
        id: 'NOT002',
        title: 'Shipment Delivered',
        message: 'Shipment #SHP001 has been delivered to India.',
        type: 'success',
        timestamp: '2023-10-26T09:15:00',
        isRead: false,
        link: '/shipments'
    },
    {
        id: 'NOT003',
        title: 'Invoice Overdue',
        message: 'Invoice #INV003 for Fatima Al Fassi is overdue.',
        type: 'warning',
        timestamp: '2023-10-25T14:00:00',
        isRead: true,
        link: '/invoices'
    },
     {
        id: 'NOT004',
        title: 'System Update',
        message: 'System maintenance scheduled for tonight at 2 AM.',
        type: 'info',
        timestamp: '2023-10-24T18:00:00',
        isRead: true,
    }
];

// Mock Report Data
export const revenueByCountryData: ReportData[] = [
    { name: 'India', value: 4500 },
    { name: 'USA', value: 3000 },
    { name: 'UAE', value: 2400 },
    { name: 'Germany', value: 1800 },
    { name: 'UK', value: 1300 },
];

export const shipmentsByCourierData: ReportData[] = [
    { name: 'DHL', value: 40 },
    { name: 'FedEx', value: 30 },
    { name: 'Aramex', value: 18 },
    { name: 'EMS', value: 12 },
];

export const CRM_DOCUMENTATION = `
CRM Documentation for International Medicine Courier Company

Modules: Quotation • Invoice • Receipt • Shipment Management • Customer CRM • Admin Settings

1. System Overview

This CRM is designed to streamline the operations of an international medicine courier company. It supports:

Customer registration & KYC verification
Quotation creation with medicine details and customs handling
Invoice generation with auto-tax & currency conversion
Receipt issuance on payment
Shipment lifecycle tracking (pickup → customs → transit → delivery)
Document storage (prescriptions, invoices, export certificates)
Internal team collaboration (operations, finance, customer support)

2. User Roles
2.1 Admin
Manage users
Configure taxes, shipping zones, pricing rules
Approve high-value shipments

2.2 Sales Team
Create quotations
Convert quotations to invoices
Manage customer communication

2.3 Finance Team
Validate invoices
Issue receipts
Manage refunds & adjustments

2.4 Operations Team
Create shipment entries
Generate AWB (Air Waybill)
Update shipment status
Verify documents for customs

2.5 Customer
View quotes, invoices, and receipts
Track shipment
Upload required documents (prescription, ID proof, doctor letter)

3. CRM Modules
3.1 Customer Module
Features: Customer registration, Contact details (email, phone, address), Shipment history, Payment history.
Fields: Customer ID, Full Name, Email, Phone, Address, Country, Medical Documents, KYC Status, Special Notes.

3.2 Quotation Module
Used by sales team to provide pricing before a shipment is booked.
Workflow: Add customer, Add medicine and shipment details, Automatic calculation of charges, Approve and send quote, Customer accepts or rejects, Convert to invoice.
Fields: Quote Number, Customer ID, Medicine Name, Quantity, HS Code, Weight, Origin Country, Destination Country, Base Rate, Packaging Charges, Customs & Duties, Total Cost, Quote Validity.
Status: Draft, Sent, Customer Accepted, Customer Rejected, Converted to Invoice.

3.3 Invoice Module
Generated once the customer accepts a quotation.
Features: Auto-populates from quotation, Add custom charges, Tax calculation, Multi-currency support (USD, INR, AED, EUR), PDF download, Payment link.
Fields: Invoice Number, Quotation Number, Invoice Date, Currency, Itemized Charges, Taxes, Total Amount, Due Date, Payment Status.
Payment Status: Paid / Unpaid / Partially Paid.

3.4 Receipt Module
Issued after payment is confirmed.
Details: Receipt ID, Invoice Number, Payment Amount, Payment Method, Payment Date, Transaction ID, Currency.
Features: Auto-send via email, PDF download, Reconciliation.

3.5 Shipment Management Module
Core module of the CRM.
Workflow: Create shipment from invoice, Add package details, Upload export documents, Assign courier partner, Generate AWB, Update shipment status.
Fields: Shipment ID, Invoice Number, AWB Number, Package Weight, Package Dimensions, Addresses, Courier Partner, Tracking URL, Customs Documents.
Status Workflow: Pending Pickup, Picked Up, In Transit, Arrived at Export Hub, Customs Clearance, Departed Country, Arrived Destination, Out for Delivery, Delivered, Returned / Failed Delivery.

4. Notifications & Alerts
Email & SMS Alerts for: New quote, Invoice generated, Payment received, Shipment status updates, Documents missing.

5. Reporting Module
Reports: Daily shipments, Country-wise revenue, Invoice aging, Customer payment history, Medicine categories shipped, Profit margin.
Formats: PDF, Excel, CSV.

6. Admin Settings
Configurable: Tax rules, Currency rates, Shipping rates, User permissions, Email templates.

7. Integration Support
Integrations: Stripe/Razorpay, Twilio, DHL/FedEx/Aramex APIs, Google Drive/S3, Gmail SMTP.

8. Security & Compliance
Measures: HIPAA, GDPR, Encrypted storage, Role-based access control.
`;
