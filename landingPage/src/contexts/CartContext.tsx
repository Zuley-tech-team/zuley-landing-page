import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../api/products';

export interface CartItem {
    id: string; // sku
    product: Product;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    isCartOpen: boolean;
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (sku: string) => void;
    updateQuantity: (sku: string, quantity: number) => void;
    clearCart: () => void;
    setIsCartOpen: (isOpen: boolean) => void;
    cartCount: number;
    cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>(() => {
        try {
            const saved = localStorage.getItem('zuley_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    const [isCartOpen, setIsCartOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('zuley_cart', JSON.stringify(items));
    }, [items]);

    const addToCart = (product: Product, quantity = 1) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === product.sku);
            if (existing) {
                return prev.map(item =>
                    item.id === product.sku ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prev, { id: product.sku, product, quantity }];
        });
        setIsCartOpen(true);
    };

    const removeFromCart = (sku: string) => {
        setItems(prev => prev.filter(item => item.id !== sku));
    };

    const updateQuantity = (sku: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(sku);
            return;
        }
        setItems(prev => prev.map(item =>
            item.id === sku ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => setItems([]);

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{
            items,
            isCartOpen,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            setIsCartOpen,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
