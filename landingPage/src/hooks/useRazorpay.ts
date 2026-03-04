import { useState, useCallback } from 'react';
import { createPaymentOrder } from '../api/payment';
import type { Product } from '../data/products';

declare global {
    interface Window {
        Razorpay: any;
    }
}

export interface CustomerInfo {
    name: string;
    email: string;
    phone: string;
}

export interface ShippingAddress {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
}

interface UseRazorpayParams {
    product: Product;
    quantity: number;
    customerInfo: CustomerInfo;
    shippingAddress: ShippingAddress;
    onSuccess: (response: any) => void;
    onFailure: (error: string) => void;
}

export function useRazorpay() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const initiatePayment = useCallback(
        async ({
            product,
            quantity,
            customerInfo,
            shippingAddress,
            onSuccess,
            onFailure,
        }: UseRazorpayParams) => {
            setIsLoading(true);
            setError(null);

            try {
                // Prepare item data that the backend webhook will parse from notes
                const items = [
                    {
                        sku: product.id,
                        name: product.name,
                        price: product.price * 100, // paise
                        quantity,
                    },
                ];

                const totalAmountPaise = product.price * quantity * 100;

                // Create order via backend
                const orderData = await createPaymentOrder({
                    amount: totalAmountPaise,
                    currency: 'INR',
                    receipt: `rcpt_${product.id}_${Date.now()}`,
                    notes: {
                        items: JSON.stringify(items),
                        customer_name: customerInfo.name,
                        customer_email: customerInfo.email,
                        customer_phone: customerInfo.phone,
                        shipping_address: JSON.stringify({
                            line1: shippingAddress.line1,
                            line2: shippingAddress.line2,
                            city: shippingAddress.city,
                            state: shippingAddress.state,
                            pincode: shippingAddress.pincode,
                            country: 'India',
                        }),
                    },
                });

                // Open Razorpay checkout
                const options = {
                    key: orderData.key_id,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: 'Zuley',
                    description: `${product.name}${quantity > 1 ? ` × ${quantity}` : ''}`,
                    order_id: orderData.order_id,
                    prefill: {
                        name: customerInfo.name,
                        email: customerInfo.email,
                        contact: `+91${customerInfo.phone}`,
                    },
                    theme: {
                        color: '#1c1e23', // charcoal from design system
                    },
                    handler: function (response: any) {
                        // Payment successful on client side
                        // Backend webhook handles order creation automatically
                        onSuccess(response);
                    },
                    modal: {
                        ondismiss: function () {
                            setIsLoading(false);
                        },
                    },
                };

                if (typeof window.Razorpay === 'undefined') {
                    throw new Error(
                        'Razorpay SDK not loaded. Please check your internet connection and refresh.'
                    );
                }

                const rzp = new window.Razorpay(options);

                rzp.on('payment.failed', function (response: any) {
                    const msg =
                        response.error?.description || 'Payment failed. Please try again.';
                    setError(msg);
                    onFailure(msg);
                    setIsLoading(false);
                });

                rzp.open();
            } catch (err: any) {
                const msg = err.message || 'Something went wrong. Please try again.';
                setError(msg);
                onFailure(msg);
                setIsLoading(false);
            }
        },
        []
    );

    return { initiatePayment, isLoading, error, clearError: () => setError(null) };
}
