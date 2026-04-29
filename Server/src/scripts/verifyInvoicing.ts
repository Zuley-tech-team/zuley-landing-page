import mongoose from 'mongoose';
import { InvoiceService } from '../services/invoice.service';
import { Customer } from '../models/customer.model';
import { Order } from '../models/order.model';
import { Counter } from '../models/counter.model';
import { Invoice } from '../models/invoice.model';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/zuley';

async function verifyInvoicing() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Reset Counter for clean test (Optional, but good for sequential check)
        // await Counter.deleteOne({ _id: 'invoice_2025' }); 
        // Commented out to test persistence

        // 2. Create Mock Order and Customer
        const mockCustomer = new Customer({
            full_name: "Test Customer",
            email: "test@example.com",
            phone: "9876543210",
            address_line1: "123 Test St",
            city: "Mumbai",
            state: "Maharashtra", // Intra-state (27)
            pincode: "400001"
        });
        // Don't save if not needed, but InvoiceService might expect saved docs with _id
        // Actually InvoiceService expects objects with _id.
        // Let's not save to DB to avoid pollution, just mock _id
        mockCustomer._id = new mongoose.Types.ObjectId();

        const mockOrder = new Order({
            order_id: "TEST-ORDER-001",
            customer_details: {
                name: mockCustomer.full_name,
                email: mockCustomer.email,
                phone: mockCustomer.phone,
                customer_id: mockCustomer._id
            },
            items: [
                {
                    sku: "SLV-RING-001",
                    name: "Silver Ring",
                    quantity: 1,
                    price: 1000,
                    total_price: 1000
                },
                {
                    sku: "SLV-COIN-001",
                    name: "Silver Coin",
                    quantity: 2,
                    price: 500,
                    total_price: 1000
                }
            ],
            total_amount: 2000,
            payment_id: new mongoose.Types.ObjectId(),
            shipping_address: {
                line1: "123 Test St",
                city: "Mumbai",
                state: "Maharashtra",
                pincode: "400001"
            }
        });
        mockOrder._id = new mongoose.Types.ObjectId();

        console.log('\n--- Scenario 1: Intra-state Invoice (MH to MH) ---');
        const invoice1 = await InvoiceService.createInvoice(mockOrder as any, mockCustomer as any);

        console.log('Invoice Generated:', invoice1.invoiceNumber);
        console.log('PDF Path:', invoice1.pdfPath);
        console.log('Tax Summary:', invoice1.taxSummary);

        if (invoice1.taxSummary.totalIGST === 0 && invoice1.taxSummary.totalCGST > 0) {
            console.log('SUCCESS: Intra-state tax split verified.');
        } else {
            console.error('FAILURE: Intra-state tax calculation incorrect.');
        }

        console.log('\n--- Scenario 2: Inter-state Invoice (MH to Delhi) ---');

        const delhiCustomer = new Customer({
            full_name: "Delhi Customer",
            email: "delhi@example.com",
            phone: "9876543211",
            address_line1: "456 Connaught Place",
            city: "New Delhi",
            state: "Delhi", // Inter-state (07)
            pincode: "110001"
        });
        delhiCustomer._id = new mongoose.Types.ObjectId();

        const delhiOrder = new Order({
            order_id: "TEST-ORDER-002",
            customer_details: {
                name: delhiCustomer.full_name,
                email: delhiCustomer.email,
                phone: delhiCustomer.phone,
                customer_id: delhiCustomer._id
            },
            items: [
                {
                    sku: "SLV-BAR-001",
                    name: "Silver Bar",
                    quantity: 1,
                    price: 10000,
                    total_price: 10000
                }
            ],
            total_amount: 10000,
            payment_id: new mongoose.Types.ObjectId(),
            shipping_address: {
                line1: "456 Connaught Place",
                city: "New Delhi",
                state: "Delhi",
                pincode: "110001"
            }
        });
        delhiOrder._id = new mongoose.Types.ObjectId();

        const invoice2 = await InvoiceService.createInvoice(delhiOrder as any, delhiCustomer as any);

        console.log('Invoice Generated:', invoice2.invoiceNumber);
        console.log('PDF Path:', invoice2.pdfPath);
        console.log('Tax Summary:', invoice2.taxSummary);

        if (invoice2.taxSummary.totalIGST > 0 && invoice2.taxSummary.totalCGST === 0) {
            console.log('SUCCESS: Inter-state tax verified.');
        } else {
            console.error('FAILURE: Inter-state tax calculation incorrect.');
        }

        // Cleanup
        // await Invoice.deleteMany({ _id: { $in: [invoice1._id, invoice2._id] } });

    } catch (error) {
        console.error('Verification failed:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyInvoicing();
