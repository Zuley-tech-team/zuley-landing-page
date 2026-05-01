import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Truck, CreditCard, Loader2, AlertCircle, Minus, Plus } from 'lucide-react';
import { Button } from '../common';
import type { Product } from '../../api/products';
import type { CustomerInfo, ShippingAddress } from '../../hooks/useRazorpay';
import { useAuth } from '../../contexts/AuthContext';
import { completeProfile } from '../../api/auth';
import { placeCodOrder } from '../../api/orders';
import './CheckoutModal.css';

const PHONE_MODEL_OPTIONS = [
    {
        company: 'Samsung',
        models: ['S22 Ultra', 'S23 Ultra', 'S24', 'S24 Ultra', 'S25', 'S25 Ultra', 'S26', 'S26 Ultra'],
    },
    {
        company: 'iPhone',
        models: ['13', '14', '15', '15 Pro', '15 Pro Max', '16', '16 Pro', '16 Pro Max', '17', '17 Pro', '17 Pro Max'],
    },
] as const;

const isPhoneCoverProduct = (product: Product) => product.category === 'silver-phone-covers';

const INDIAN_STATES = [
    'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
    'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
    'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
    'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
    'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
    'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
];

interface CheckoutModalProps {
    items: { product: Product; quantity: number }[];
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}
type CheckoutItem = {
    product: Product;
    quantity: number;
};

type RemoveCandidate = {
    sku: string;
    name: string;
};

export function CheckoutModal({ items, isOpen, onClose, onSuccess }: CheckoutModalProps) {
    const navigate = useNavigate();
    const modalRef = useRef<HTMLDivElement>(null);

    const { user, login } = useAuth();

    // Customer info
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');

    // Pre-fill user data when modal opens
    useEffect(() => {
        if (isOpen && user) {
            setName(prev => prev || user.name || '');
            setEmail(user.email || '');
            setPhone(prev => prev || user.phone || '');
        }
    }, [isOpen, user]);

    // Shipping address
    const [line1, setLine1] = useState('');
    const [line2, setLine2] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [pincode, setPincode] = useState('');
    const [isPincodeLookupLoading, setIsPincodeLookupLoading] = useState(false);
    const [pincodeLookupMessage, setPincodeLookupMessage] = useState<string | null>(null);
    const [variantSelections, setVariantSelections] = useState<Record<string, string>>({});
    const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>(items);
    const [removeCandidate, setRemoveCandidate] = useState<RemoveCandidate | null>(null);

    // Validation
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [codError, setCodError] = useState<string | null>(null);
    const [isPlacingCodOrder, setIsPlacingCodOrder] = useState(false);

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
            setCodError(null);
            setFormErrors({});
            setPincodeLookupMessage(null);
            setIsPincodeLookupLoading(false);
            setCheckoutItems(items);
            setRemoveCandidate(null);
            setVariantSelections(
                items.reduce<Record<string, string>>((acc, item) => {
                    if (isPhoneCoverProduct(item.product)) {
                        acc[item.product.sku] = '';
                    }

                    return acc;
                }, {})
            );
        }
    }, [isOpen]);

    useEffect(() => {
        const normalizedPincode = pincode.trim();

        if (normalizedPincode.length !== 6) {
            setIsPincodeLookupLoading(false);
            setPincodeLookupMessage(null);
            return;
        }

        const controller = new AbortController();
        const timeoutId = window.setTimeout(async () => {
            setIsPincodeLookupLoading(true);
            setPincodeLookupMessage(null);

            try {
                const response = await fetch(`https://api.postalpincode.in/pincode/${normalizedPincode}`, {
                    signal: controller.signal,
                });

                if (!response.ok) {
                    throw new Error('Unable to fetch address details.');
                }

                const data = await response.json();
                const result = Array.isArray(data) ? data[0] : null;
                const postOffice = result?.PostOffice?.[0];

                if (result?.Status !== 'Success' || !postOffice) {
                    throw new Error('No address details found for this pincode.');
                }

                const resolvedCity = postOffice.District || postOffice.Block || postOffice.Name || '';
                const resolvedState = postOffice.State || '';

                if (resolvedCity) {
                    setCity(resolvedCity);
                }

                if (resolvedState) {
                    setState(resolvedState);
                }
            } catch (error) {
                if (controller.signal.aborted) return;
                setPincodeLookupMessage('Could not auto-fill city and state for this pincode.');
            } finally {
                if (!controller.signal.aborted) {
                    setIsPincodeLookupLoading(false);
                }
            }
        }, 500);

        return () => {
            controller.abort();
            window.clearTimeout(timeoutId);
        };
    }, [pincode]);

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

        checkoutItems.forEach((item) => {
            if (!isPhoneCoverProduct(item.product)) {
                return;
            }

            if (!variantSelections[item.product.sku]) {
                errors[`variant_${item.product.sku}`] = 'Select a phone model';
            }
        });

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleQuantityChange = (sku: string, nextQuantity: number) => {
        const safeQuantity = Math.max(1, nextQuantity);

        setCheckoutItems((currentItems) =>
            currentItems
                .map((item) => (
                    item.product.sku === sku
                        ? { ...item, quantity: safeQuantity }
                        : item
                ))
        );
    };

    const handleRemoveItem = (sku: string, productName: string) => {
        setRemoveCandidate({ sku, name: productName });
    };

    const confirmRemoveItem = () => {
        if (!removeCandidate) {
            return;
        }

        setCheckoutItems((currentItems) =>
            currentItems.filter((item) => item.product.sku !== removeCandidate.sku)
        );
        setRemoveCandidate(null);
    };

    const cancelRemoveItem = () => {
        setRemoveCandidate(null);
    };

    useEffect(() => {
        if (isOpen && checkoutItems.length === 0) {
            onClose();
        }
    }, [checkoutItems.length, isOpen, onClose]);

    const handleSubmit = async (e: FormEvent) => {
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

        setIsPlacingCodOrder(true);
        setCodError(null);

        try {
            const response = await placeCodOrder({
                items: checkoutItems.map(item => ({
                    sku: item.product.sku,
                    quantity: item.quantity,
                    variant_info: isPhoneCoverProduct(item.product) ? variantSelections[item.product.sku] : undefined,
                })),
                customer: customerInfo,
                shipping_address: {
                    ...shippingAddress,
                    country: 'India',
                },
            });

            if (user && (!user.name || !user.phone)) {
                const profileResponse = await completeProfile(
                    user.name || customerInfo.name,
                    user.phone || customerInfo.phone
                );

                if (profileResponse.success && profileResponse.user) {
                    login(profileResponse.user);
                }
            }

            onClose();
            if (onSuccess) onSuccess();
            const productName = checkoutItems.length === 1 ? checkoutItems[0].product.name : 'Multiple Items';
            const itemsSummary = checkoutItems
                .map((item) => `${item.product.name}${item.quantity > 1 ? ` x${item.quantity}` : ''}`)
                .join(', ');
            const selectedModels = checkoutItems
                .filter((item) => isPhoneCoverProduct(item.product))
                .map((item) => variantSelections[item.product.sku])
                .filter(Boolean)
                .join(', ');
            const params = new URLSearchParams({
                order_id: response.data.order_id,
                product: productName,
                items: itemsSummary,
                amount: String(response.data.total_amount / 100),
                method: 'cod',
                invoice: response.data.invoice_number || '',
            });

            if (selectedModels) {
                params.set('model', selectedModels);
            }

            navigate(`/order-success?${params.toString()}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to place COD order.';
            setCodError(message);
        } finally {
            setIsPlacingCodOrder(false);
        }
    };

    if (!isOpen || checkoutItems.length === 0) return null;

    const totalPrice = checkoutItems.reduce((acc, curr) => acc + curr.product.price * curr.quantity, 0);

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
                        <div className="flex flex-col gap-4">
                            {checkoutItems.map((item) => (
                                <div key={item.product.sku} className="flex gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-white border border-charcoal/10 overflow-hidden flex-shrink-0">
                                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-2">
                                        <h3 className="font-heading font-semibold text-charcoal truncate">{item.product.name}</h3>
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-body text-sm text-charcoal/60">Qty: {item.quantity}</p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (item.quantity <= 1) {
                                                            handleRemoveItem(item.product.sku, item.product.name);
                                                            return;
                                                        }

                                                        handleQuantityChange(item.product.sku, item.quantity - 1);
                                                    }}
                                                    className="checkout-qty-btn"
                                                    aria-label={`Decrease quantity for ${item.product.name}`}
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="checkout-qty-value">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleQuantityChange(item.product.sku, item.quantity + 1)}
                                                    className="checkout-qty-btn"
                                                    aria-label={`Increase quantity for ${item.product.name}`}
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                        {isPhoneCoverProduct(item.product) && (
                                            <div>
                                                <select
                                                    value={variantSelections[item.product.sku] || ''}
                                                    onChange={(event) => {
                                                        const value = event.target.value;
                                                        setVariantSelections((prev) => ({
                                                            ...prev,
                                                            [item.product.sku]: value,
                                                        }));
                                                        setFormErrors((prev) => {
                                                            const next = { ...prev };
                                                            delete next[`variant_${item.product.sku}`];
                                                            return next;
                                                        });
                                                    }}
                                                    className={`checkout-input ${formErrors[`variant_${item.product.sku}`] ? 'checkout-input-error' : ''}`}
                                                    id={`checkout-variant-${item.product.sku}`}
                                                >
                                                    <option value="">Select phone model *</option>
                                                    {PHONE_MODEL_OPTIONS.map(({ company, models }) => (
                                                        <optgroup key={company} label={company}>
                                                            {models.map((model) => {
                                                                const optionValue = `${company} ${model}`;

                                                                return (
                                                                    <option key={optionValue} value={optionValue}>
                                                                        {optionValue}
                                                                    </option>
                                                                );
                                                            })}
                                                        </optgroup>
                                                    ))}
                                                </select>
                                                {formErrors[`variant_${item.product.sku}`] && (
                                                    <p className="checkout-field-error">{formErrors[`variant_${item.product.sku}`]}</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <p className="font-heading font-semibold text-charcoal">{formatPrice(item.product.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="px-6 py-5 space-y-5">
                        {/* Error Banner */}
                        {codError && (
                            <div className="flex items-start gap-3 p-3 bg-error/10 border border-error/20 rounded-xl">
                                <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                                <p className="font-body text-sm text-error">{codError}</p>
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
                                    disabled
                                    className={`checkout-input bg-charcoal/5 text-charcoal/70 cursor-not-allowed ${formErrors.email ? 'checkout-input-error' : ''}`}
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
                                        placeholder="Pincode *"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        className={`checkout-input ${formErrors.pincode ? 'checkout-input-error' : ''}`}
                                        id="checkout-pincode"
                                    />
                                    {isPincodeLookupLoading && (
                                        <p className="mt-1 font-body text-xs text-charcoal/50">
                                            Fetching city and state...
                                        </p>
                                    )}
                                    {pincodeLookupMessage && (
                                        <p className="checkout-field-error">{pincodeLookupMessage}</p>
                                    )}
                                    {formErrors.pincode && <p className="checkout-field-error">{formErrors.pincode}</p>}
                                </div>
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
                            disabled={isPlacingCodOrder}
                            icon={isPlacingCodOrder ? <Loader2 className="w-5 h-5 animate-spin" /> : <Truck className="w-5 h-5" />}
                            iconPosition="left"
                        >
                            {isPlacingCodOrder ? 'Processing...' : `Place COD Order ${formatPrice(totalPrice)}`}
                        </Button>
                        <p className="font-body text-xs text-charcoal/40 text-center mt-2">
                            Cash on delivery only for now.
                        </p>
                    </div>
                </form>

                {removeCandidate && (
                    <div className="checkout-confirm-overlay" role="dialog" aria-modal="true">
                        <div className="checkout-confirm-card">
                            <h3 className="checkout-confirm-title">Remove item?</h3>
                            <p className="checkout-confirm-text">
                                Remove {removeCandidate.name} from your checkout?
                            </p>
                            <div className="checkout-confirm-actions">
                                <button
                                    type="button"
                                    className="checkout-confirm-cancel"
                                    onClick={cancelRemoveItem}
                                >
                                    Keep
                                </button>
                                <button
                                    type="button"
                                    className="checkout-confirm-remove"
                                    onClick={confirmRemoveItem}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CheckoutModal;
