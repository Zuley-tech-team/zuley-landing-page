"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCodOrder = void 0;
const customer_model_1 = require("../models/customer.model");
const order_model_1 = require("../models/order.model");
const payment_model_1 = require("../models/payment.model");
const product_model_1 = require("../models/product.model");
const inventory_service_1 = require("../modules/inventory/inventory.service");
const orderIdGenerator_1 = require("../utils/orderIdGenerator");
const invoice_service_1 = require("./invoice.service");
const normalizePhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length > 10 && digits.startsWith("91") ? digits.slice(2) : digits;
};
const validateCodInput = (input) => {
    var _a, _b, _c, _d, _e;
    if (!Array.isArray(input.items) || input.items.length === 0) {
        throw new Error("At least one item is required");
    }
    if (!((_b = (_a = input.customer) === null || _a === void 0 ? void 0 : _a.name) === null || _b === void 0 ? void 0 : _b.trim())) {
        throw new Error("Customer name is required");
    }
    if (!/^\S+@\S+\.\S+$/.test(input.customer.email || "")) {
        throw new Error("Valid email is required");
    }
    const phone = normalizePhone(input.customer.phone || "");
    if (!/^[6-9]\d{9}$/.test(phone)) {
        throw new Error("Valid 10-digit Indian mobile number is required");
    }
    const address = input.shipping_address;
    if (!((_c = address === null || address === void 0 ? void 0 : address.line1) === null || _c === void 0 ? void 0 : _c.trim()) || !((_d = address.city) === null || _d === void 0 ? void 0 : _d.trim()) || !((_e = address.state) === null || _e === void 0 ? void 0 : _e.trim())) {
        throw new Error("Complete shipping address is required");
    }
    if (!/^[1-9]\d{5}$/.test(address.pincode || "")) {
        throw new Error("Valid 6-digit pincode is required");
    }
};
const createCodOrder = (input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    validateCodInput(input);
    const reservedItems = [];
    try {
        const orderItems = [];
        for (const item of input.items) {
            const sku = String(item.sku || "").trim();
            const quantity = Number(item.quantity || 0);
            if (!sku || !Number.isInteger(quantity) || quantity < 1) {
                throw new Error("Each item must have a valid SKU and quantity");
            }
            const product = yield product_model_1.Product.findOne({ sku, isActive: true });
            if (!product) {
                throw new Error(`Product ${sku} is not available`);
            }
            const reserved = yield (0, inventory_service_1.reserveStock)(sku, quantity);
            if (!reserved) {
                const stockError = new Error(`${product.name} is out of stock`);
                stockError.statusCode = 409;
                throw stockError;
            }
            reservedItems.push({ sku, quantity });
            const unitPricePaise = Math.round(product.price * 100);
            orderItems.push({
                product_id: product._id,
                sku: product.sku,
                name: product.name,
                variant_info: item.variant_info,
                quantity,
                price: unitPricePaise,
                total_price: unitPricePaise * quantity,
                gst_rate: 3,
                gst_amount: 0,
            });
        }
        const totalAmount = orderItems.reduce((sum, item) => sum + item.total_price, 0);
        const itemsCount = orderItems.reduce((sum, item) => sum + item.quantity, 0);
        const orderId = yield (0, orderIdGenerator_1.generateOrderId)();
        const phone = normalizePhone(input.customer.phone);
        const customerDoc = yield customer_model_1.Customer.create({
            full_name: input.customer.name.trim(),
            email: input.customer.email.trim().toLowerCase(),
            phone,
            address_line1: input.shipping_address.line1.trim(),
            address_line2: ((_a = input.shipping_address.line2) === null || _a === void 0 ? void 0 : _a.trim()) || "",
            city: input.shipping_address.city.trim(),
            state: input.shipping_address.state.trim(),
            pincode: input.shipping_address.pincode.trim(),
        });
        const payment = yield payment_model_1.Payment.create({
            gateway_payment_id: `cod_${orderId}`,
            gateway_order_id: orderId,
            amount: totalAmount,
            currency: "INR",
            status: "cod_pending",
            method: "cash_on_delivery",
            payment_method: "cod",
            gateway_response: {
                source: "cash_on_delivery",
                created_from: "website_checkout",
            },
        });
        const order = yield order_model_1.Order.create({
            order_id: orderId,
            customer_details: {
                name: customerDoc.full_name,
                email: customerDoc.email,
                phone: customerDoc.phone,
                customer_id: customerDoc._id,
            },
            items: orderItems,
            total_amount: totalAmount,
            items_count: itemsCount,
            status: "created",
            payment_method: "cod",
            payment_status: "cod_pending",
            payment_id: payment._id,
            shipping_address: {
                line1: input.shipping_address.line1.trim(),
                line2: ((_b = input.shipping_address.line2) === null || _b === void 0 ? void 0 : _b.trim()) || "",
                city: input.shipping_address.city.trim(),
                state: input.shipping_address.state.trim(),
                pincode: input.shipping_address.pincode.trim(),
                country: input.shipping_address.country || "India",
            },
            shipping_details: {},
            history: [
                {
                    status: "created",
                    changed_by: "system",
                    reason: "Cash on Delivery order placed",
                },
            ],
        });
        payment.order_id = order._id;
        yield payment.save();
        customerDoc.order_id = order._id;
        yield customerDoc.save();
        let invoice = null;
        try {
            invoice = yield invoice_service_1.InvoiceService.createInvoice(order, customerDoc);
            yield invoice.save();
        }
        catch (invoiceError) {
            console.error("Invoice/email generation failed for COD order", order.order_id, invoiceError);
        }
        return {
            order,
            invoice,
        };
    }
    catch (error) {
        yield Promise.allSettled(reservedItems.map((item) => (0, inventory_service_1.restoreStock)(item.sku, item.quantity, "cod_order_failed")));
        throw error;
    }
});
exports.createCodOrder = createCodOrder;
