import mongoose from "mongoose";
import { Customer } from "../models/customer.model";
import { Order } from "../models/order.model";
import { Payment } from "../models/payment.model";
import { Product } from "../models/product.model";
import { reserveStock, restoreStock } from "../modules/inventory/inventory.service";
import { generateOrderId } from "../utils/orderIdGenerator";
import { InvoiceService } from "./invoice.service";
import { Coupon } from "../models/coupon.model";
import { findCouponByCode, validateCoupon } from "./coupon.service";
import { EmailService } from "./email.service";
import { EmailType } from "../models/email-queue.model";

type CheckoutItemInput = {
  sku: string;
  quantity: number;
  variant_info?: string;
};

type CustomerInput = {
  name: string;
  email: string;
  phone: string;
};

type ShippingAddressInput = {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
};

export type CodOrderInput = {
  items: CheckoutItemInput[];
  customer: CustomerInput;
  shipping_address: ShippingAddressInput;
  coupon_code?: string;
};

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, "");
  return digits.length > 10 && digits.startsWith("91") ? digits.slice(2) : digits;
};

const validateCodInput = (input: CodOrderInput) => {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new Error("At least one item is required");
  }

  if (!input.customer?.name?.trim()) {
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
  if (!address?.line1?.trim() || !address.city?.trim() || !address.state?.trim()) {
    throw new Error("Complete shipping address is required");
  }

  if (!/^[1-9]\d{5}$/.test(address.pincode || "")) {
    throw new Error("Valid 6-digit pincode is required");
  }
};

export const createCodOrder = async (input: CodOrderInput) => {
  validateCodInput(input);

  const reservedItems: Array<{ sku: string; quantity: number }> = [];

  try {
    const orderItems = [];

    for (const item of input.items) {
      const sku = String(item.sku || "").trim();
      const quantity = Number(item.quantity || 0);

      if (!sku || !Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Each item must have a valid SKU and quantity");
      }

      const product = await Product.findOne({ sku, isActive: true });
      if (!product) {
        throw new Error(`Product ${sku} is not available`);
      }

      const reserved = await reserveStock(sku, quantity);
      if (!reserved) {
        const stockError = new Error(`${product.name} is out of stock`);
        (stockError as any).statusCode = 409;
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
    const orderId = await generateOrderId();
    const phone = normalizePhone(input.customer.phone);

    let appliedCoupon: any = null;
    let discountAmount = 0;
    let couponDoc: any = null;

    if (input.coupon_code?.trim()) {
      couponDoc = await findCouponByCode(input.coupon_code);

      if (!couponDoc) {
        throw new Error("Invalid coupon code");
      }

      const couponItems = orderItems.map((item) => ({
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.price,
      }));

      const validation = validateCoupon(couponDoc, couponItems, totalAmount);
      if (!validation.isValid) {
        throw new Error(validation.reason || "Coupon cannot be applied");
      }

      discountAmount = validation.discountAmount;
      appliedCoupon = {
        code: couponDoc.code,
        name: couponDoc.name,
        discount_type: couponDoc.discount_type,
        discount_value: couponDoc.discount_value,
        discount_amount: discountAmount,
        min_order_value: couponDoc.min_order_value,
        max_discount: couponDoc.max_discount,
        applies_to_all: couponDoc.applies_to_all,
      };
    }

    const finalTotalAmount = Math.max(totalAmount - discountAmount, 0);

    const customerDoc = await Customer.create({
      full_name: input.customer.name.trim(),
      email: input.customer.email.trim().toLowerCase(),
      phone,
      address_line1: input.shipping_address.line1.trim(),
      address_line2: input.shipping_address.line2?.trim() || "",
      city: input.shipping_address.city.trim(),
      state: input.shipping_address.state.trim(),
      pincode: input.shipping_address.pincode.trim(),
    });

    const payment = await Payment.create({
      gateway_payment_id: `cod_${orderId}`,
      gateway_order_id: orderId,
      amount: finalTotalAmount,
      currency: "INR",
      status: "cod_pending",
      method: "cash_on_delivery",
      payment_method: "cod",
      gateway_response: {
        source: "cash_on_delivery",
        created_from: "website_checkout",
      },
    });

    const order = await Order.create({
      order_id: orderId,
      customer_details: {
        name: customerDoc.full_name,
        email: customerDoc.email,
        phone: customerDoc.phone,
        customer_id: customerDoc._id,
      },
      items: orderItems,
      total_amount: finalTotalAmount,
      coupon: appliedCoupon || undefined,
      items_count: itemsCount,
      status: "created",
      payment_method: "cod",
      payment_status: "cod_pending",
      payment_id: payment._id,
      shipping_address: {
        line1: input.shipping_address.line1.trim(),
        line2: input.shipping_address.line2?.trim() || "",
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
    await payment.save();

    customerDoc.order_id = order._id as mongoose.Types.ObjectId;
    await customerDoc.save();

    let invoice = null;
    try {
      invoice = await InvoiceService.createInvoice(order as any, customerDoc as any);
      await invoice.save();

      await EmailService.addToQueue(
        EmailType.INVOICE,
        customerDoc.email,
        order._id,
        {
          orderId: order.order_id,
          invoiceNumber: invoice.invoiceNumber,
          customerName: customerDoc.full_name,
          paymentMethod: order.payment_method,
          amount: order.total_amount / 100,
        }
      );
    } catch (invoiceError) {
      console.error("Invoice/email generation failed for COD order", order.order_id, invoiceError);
    }

    // Notify admin about the new order
    EmailService.queueAdminNewOrderNotification(order);

    if (couponDoc?._id) {
      await Coupon.findByIdAndUpdate(couponDoc._id, { $inc: { usage_count: 1 } });
    }

    return {
      order,
      invoice,
    };
  } catch (error) {
    await Promise.allSettled(
      reservedItems.map((item) =>
        restoreStock(item.sku, item.quantity, "cod_order_failed")
      )
    );

    throw error;
  }
};
