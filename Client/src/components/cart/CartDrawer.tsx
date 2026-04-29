import { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { CheckoutModal } from '../checkout';
import { Button } from '../common';
import './CartDrawer.css';

export function CartDrawer() {
    const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
    const { isLoggedIn, openAuthModal, setPostLoginCallback } = useAuth();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // Prevent body scroll when cart is open
    useEffect(() => {
        if (isCartOpen && !isCheckoutOpen) {
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = '';
            };
        }
    }, [isCartOpen, isCheckoutOpen]);

    if (!isCartOpen && !isCheckoutOpen) return null;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const handleCheckout = () => {
        if (!isLoggedIn) {
            setIsCartOpen(false);
            setPostLoginCallback(() => () => setIsCheckoutOpen(true));
            openAuthModal();
        } else {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
        }
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsCartOpen(false);
            setIsClosing(false);
        }, 300); // Match the animation duration
    };

    return (
        <>
        {isCartOpen && (
            <div className={`cart-overlay ${isClosing ? 'closing' : ''}`}>
            <button
                type="button"
                className="absolute inset-0 bg-transparent"
                onClick={handleClose}
                aria-label="Close cart"
            />
            
            <div className={`cart-drawer ${isClosing ? 'closing' : ''}`}>
                <div className="flex items-center justify-between p-6 border-b border-charcoal/10">
                    <h2 className="font-heading text-xl font-bold text-charcoal flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" /> Your Cart
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 -mr-2 text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="cart-content-scroll p-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-charcoal/60">
                            <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
                            <p className="font-body">Your cart is currently empty.</p>
                            <Button variant="secondary" onClick={handleClose}>
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {items.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 bg-pearl rounded-2xl border border-charcoal/5">
                                    <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0">
                                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-heading font-semibold text-charcoal line-clamp-1">{item.product.name}</h3>
                                            <p className="font-body text-sm text-charcoal/60 mb-2">{formatPrice(item.product.price)}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center bg-white border border-charcoal/10 rounded-lg">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="p-1.5 text-charcoal/60 hover:text-charcoal"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="font-body font-medium w-8 text-center text-sm">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="p-1.5 text-charcoal/60 hover:text-charcoal"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <button 
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-xs font-body text-danger/80 hover:text-danger underline underline-offset-2"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-6 border-t border-charcoal/10 bg-pearl/50">
                        <div className="flex items-center justify-between mb-4 font-heading font-semibold text-charcoal text-lg">
                            <span>Subtotal</span>
                            <span>{formatPrice(cartTotal)}</span>
                        </div>
                        <p className="font-body text-xs text-charcoal/60 mb-6 text-center">
                            Shipping & taxes calculated at checkout
                        </p>
                        <Button 
                            variant="primary" 
                            fullWidth 
                            onClick={handleCheckout}
                        >
                            Proceed to Checkout
                        </Button>
                    </div>
                )}
            </div>
        </div>
        )}
        <CheckoutModal 
            isOpen={isCheckoutOpen} 
            onClose={() => setIsCheckoutOpen(false)} 
            items={items}
            onSuccess={clearCart}
        />
        </>
    );
}

export default CartDrawer;