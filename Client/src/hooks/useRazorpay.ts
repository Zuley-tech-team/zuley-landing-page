import { useState, useCallback } from 'react';
import { createPaymentOrder, verifyPayment } from '../api/payment';
import type { Product } from '../api/products';

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
    items: { product: Product; quantity: number }[];
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
            items,
            customerInfo,
            shippingAddress,
            onSuccess,
            onFailure,
        }: UseRazorpayParams) => {
            setIsLoading(true);
            setError(null);

            try {
                // Prepare item data that the backend webhook will parse from notes
                const backendItems = items.map(item => ({
                    sku: item.product.sku,
                    name: item.product.name,
                    price: item.product.price * 100, // paise
                    quantity: item.quantity,
                    total_price: item.product.price * item.quantity * 100,
                }));

                const totalAmountPaise = backendItems.reduce((acc, curr) => acc + curr.total_price, 0);

                // Create order via backend
                const orderData = await createPaymentOrder({
                    amount: totalAmountPaise,
                    currency: 'INR',
                    receipt: `rcpt_${Date.now()}`,
                    notes: {
                        items: JSON.stringify(backendItems),
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
                const description = backendItems.length === 1 
                    ? `${backendItems[0].name}${backendItems[0].quantity > 1 ? ` × ${backendItems[0].quantity}` : ''}` 
                    : `${backendItems.length} items`;
                    
                const options = {
                    key: orderData.key_id,
                    amount: orderData.amount,
                    currency: orderData.currency,
                    name: 'Zuley',
                    description,
                    order_id: orderData.order_id,
                    prefill: {
                        name: customerInfo.name,
                        email: customerInfo.email,
                        contact: `+91${customerInfo.phone}`,
                    },
                    theme: {
                        color: '#1c1e23', // charcoal from design system
                    },
                    handler: async function (response: any) {
                        // Verify signature with backend before confirming success
                        try {
                            const verifyRes = await verifyPayment({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            });
                            // Pass back the Zuley order details from verify response
                            onSuccess({ 
                                ...response, 
                                zuley_order_id: verifyRes.order_id, 
                                zuley_invoice: verifyRes.invoice 
                            });
                        } catch (err: any) {
                            const msg = err.message || 'Payment verification failed. Please contact support.';
                            setError(msg);
                            onFailure(msg);
                            setIsLoading(false);
                        }
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

    const clearError = useCallback(() => setError(null), []);
    return { initiatePayment, isLoading, error, clearError };
}
