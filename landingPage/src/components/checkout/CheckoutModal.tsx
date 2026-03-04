import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Truck, CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../common';
import type { Product } from '../../data/products';
import { useRazorpay, type CustomerInfo, type ShippingAddress } from '../../hooks/useRazorpay';
import './CheckoutModal.css';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

interface CheckoutModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}


export function CheckoutModal({ product, isOpen, onClose }: CheckoutModalProps) {
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const modalRef = useRef<HTMLDivElement>(null);

    // Customer info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Shipping address
    const [line1, setLine1] = useState('');
    const [line2, setLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');

    // Validation
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const { initiatePayment, isLoading, error: paymentError, clearError } = useRazorpay();

    // Close on Escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            clearError();
            setFormErrors({});
        }
    }, [isOpen, clearError]);

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!name.trim()) errors.name = 'Name is required';
        if (!email.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Invalid email';

        if (!phone.trim()) errors.phone = 'Phone is required';
        else if (!/^\d{10}$/.test(phone)) errors.phone = 'Enter 10-digit phone number';

        if (!line1.trim()) errors.line1 = 'Address is required';
        if (!city.trim()) errors.city = 'City is required';
        if (!state) errors.state = 'State is required';
        if (!pincode.trim()) errors.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(pincode)) errors.pincode = 'Enter 6-digit pincode';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const customerInfo: CustomerInfo = { name: name.trim(), email: email.trim(), phone: phone.trim() };
        const shippingAddress: ShippingAddress = {
            line1: line1.trim(),
            line2: line2.trim(),
            city: city.trim(),
            state,
            pincode: pincode.trim(),
        };

        initiatePayment({
            product,
            quantity,
            customerInfo,
            shippingAddress,
            onSuccess: (response) => {
                onClose();
                const params = new URLSearchParams({
                    payment_id: response.razorpay_payment_id || '',
                    product: encodeURIComponent(product.name),
                    amount: String(product.price * quantity),
                });
                navigate(`/order-success?${params.toString()}`);
            },
            onFailure: () => {
                // Error is handled via paymentError state from the hook
            },
        });
    };

    if (!isOpen) return null;

    const totalPrice = product.price * quantity;

    return (
        <div className="checkout-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="checkout-modal" ref={modalRef}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-charcoal/10">
                    <h2 className="font-heading text-xl font-bold text-charcoal">
                        Checkout
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-charcoal/5 transition-colors cursor-pointer"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5 text-charcoal/60" />
                    </button>
                </div>

                {/* ─── Checkout Form ─── */}
                <form onSubmit={handleSubmit} className="checkout-form-body">
                    {/* Order Summary */}
                    <div className="px-6 py-4 bg-pearl/80 border-b border-charcoal/10">
                        <div className="flex gap-4 items-center">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-16 h-16 rounded-xl object-cover shadow-soft"
                            />
                            <div className="flex-1 min-w-0">
                                <h3 className="font-heading text-sm font-semibold text-charcoal truncate">
                                    {product.name}
                                </h3>
                                <p className="font-body text-xs text-charcoal/50">{product.categoryLabel}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-heading text-lg font-bold text-charcoal">
                                    {formatPrice(totalPrice)}
                                </p>
                            </div>
                        </div>

                        {/* Quantity */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-charcoal/5">
                            <span className="font-body text-sm text-charcoal/60">Quantity</span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-8 h-8 rounded-lg border border-charcoal/20 flex items-center justify-center hover:bg-charcoal/5 transition-colors cursor-pointer text-charcoal"
                                >
                                    −
                                </button>
                                <span className="font-body font-medium text-charcoal w-8 text-center">{quantity}</span>
                                <button
                                    type="button"
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-8 h-8 rounded-lg border border-charcoal/20 flex items-center justify-center hover:bg-charcoal/5 transition-colors cursor-pointer text-charcoal"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="px-6 py-5 space-y-5 overflow-y-auto checkout-form-scroll">
                        {/* Error Banner */}
                        {paymentError && (
                            <div className="flex items-start gap-3 p-3 bg-error/10 border border-error/20 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                                <p className="font-body text-sm text-error">{paymentError}</p>
                            </div>
                        )}

                        {/* Customer Info */}
                        <fieldset className="space-y-3">
                            <legend className="flex items-center gap-2 font-heading text-sm font-semibold text-charcoal mb-1">
                                <CreditCard className="w-4 h-4 text-charcoal/50" />
                                Customer Details
                            </legend>

                            <div>
                                <input
                                    type="text"
                                    placeholder="Full Name *"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={`checkout-input ${formErrors.name ? 'checkout-input-error' : ''}`}
                                    id="checkout-name"
                                />
                                {formErrors.name && <p className="checkout-field-error">{formErrors.name}</p>}
                            </div>

                            <div>
                                <input
                                    type="email"
                                    placeholder="Email Address *"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`checkout-input ${formErrors.email ? 'checkout-input-error' : ''}`}
                                    id="checkout-email"
                                />
                                {formErrors.email && <p className="checkout-field-error">{formErrors.email}</p>}
                            </div>

                            <div>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-charcoal/15 bg-charcoal/5 font-body text-sm text-charcoal/50">
                                        +91
                                    </span>
                                    <input
                                        type="tel"
                                        placeholder="Phone Number *"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        className={`checkout-input rounded-l-none ${formErrors.phone ? 'checkout-input-error' : ''}`}
                                        id="checkout-phone"
                                    />
                                </div>
                                {formErrors.phone && <p className="checkout-field-error">{formErrors.phone}</p>}
                            </div>
                        </fieldset>

                        {/* Shipping Address */}
                        <fieldset className="space-y-3">
                            <legend className="flex items-center gap-2 font-heading text-sm font-semibold text-charcoal mb-1">
                                <Truck className="w-4 h-4 text-charcoal/50" />
                                Shipping Address
                            </legend>

                            <div>
                                <input
                                    type="text"
                                    placeholder="Address Line 1 *"
                                    value={line1}
                                    onChange={(e) => setLine1(e.target.value)}
                                    className={`checkout-input ${formErrors.line1 ? 'checkout-input-error' : ''}`}
                                    id="checkout-address1"
                                />
                                {formErrors.line1 && <p className="checkout-field-error">{formErrors.line1}</p>}
                            </div>

                            <input
                                type="text"
                                placeholder="Address Line 2 (Optional)"
                                value={line2}
                                onChange={(e) => setLine2(e.target.value)}
                                className="checkout-input"
                                id="checkout-address2"
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="City *"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        className={`checkout-input ${formErrors.city ? 'checkout-input-error' : ''}`}
                                        id="checkout-city"
                                    />
                                    {formErrors.city && <p className="checkout-field-error">{formErrors.city}</p>}
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Pincode *"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className={`checkout-input ${formErrors.pincode ? 'checkout-input-error' : ''}`}
                                        id="checkout-pincode"
                                    />
                                    {formErrors.pincode && <p className="checkout-field-error">{formErrors.pincode}</p>}
                                </div>
                            </div>

                            <div>
                                <select
                                    value={state}
                                    onChange={(e) => setState(e.target.value)}
                                    className={`checkout-input ${!state ? 'text-charcoal/40' : ''} ${formErrors.state ? 'checkout-input-error' : ''}`}
                                    id="checkout-state"
                                >
                                    <option value="" disabled>
                                        Select State *
                                    </option>
                                    {INDIAN_STATES.map((s) => (
                                        <option key={s} value={s}>
                                            {s}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.state && <p className="checkout-field-error">{formErrors.state}</p>}
                            </div>
                        </fieldset>
                    </div>

                    {/* Footer / CTA */}
                    <div className="px-6 py-4 border-t border-charcoal/10 bg-white">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-body text-sm text-charcoal/60">Total</span>
                            <span className="font-heading text-xl font-bold text-charcoal">
                                {formatPrice(totalPrice)}
                            </span>
                        </div>
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            fullWidth
                            disabled={isLoading}
                            icon={
                                isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <CreditCard className="w-5 h-5" />
                                )
                            }
                            iconPosition="left"
                        >
                            {isLoading ? 'Processing...' : `Pay ${formatPrice(totalPrice)}`}
                        </Button>
                        <p className="font-body text-xs text-charcoal/40 text-center mt-2">
                            Secured by Razorpay · 256-bit SSL Encryption
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CheckoutModal;
