import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, LogIn } from 'lucide-react';
import logoLight from "../../assets/logo-light-transparent.webp"
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { CartDrawer } from '../cart';
import { UserMenu } from '../auth';

const navLinks = [
    { label: 'Silver Pens', href: '/products?category=silver-pens' },
    { label: 'Silver Phone Covers', href: '/products?category=silver-phone-covers' },
    { label: 'About', href: '/about' },
    { label: 'Track Order', href: '/track-order' },
    { label: 'Corporate', href: '/corporate' },
    { label: 'Contact', href: '/contact' },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { cartCount, setIsCartOpen } = useCart();
    const { isLoggedIn, isLoading, openAuthModal } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                    ? 'bg-pearl/95 backdrop-blur-md shadow-soft py-3'
                    : 'bg-transparent py-5'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <a href="/" className="flex justify-center items-center flex-shrink-0">
                            <img src={logoLight} className='w-25 mt-2' alt="Zuley Logo" />
                        </a>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="font-body text-sm font-medium text-charcoal/70 hover:text-charcoal transition-colors relative group whitespace-nowrap"
                                >
                                    {link.label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-charcoal transition-all duration-300 group-hover:w-full" />
                                </a>
                            ))}

                            {/* Cart */}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 rounded-full transition-colors"
                                aria-label="Cart"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-charcoal text-pearl text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Auth: Sign In button or User Avatar */}
                            {!isLoading && (
                                isLoggedIn ? (
                                    <UserMenu />
                                ) : (
                                    <button
                                        id="navbar-signin-btn"
                                        onClick={() => openAuthModal()}
                                        className="navbar-signin-btn"
                                        aria-label="Sign in"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        <span>Sign In</span>
                                    </button>
                                )
                            )}
                        </div>

                        {/* Mobile Menu Button & Cart */}
                        <div className="md:hidden flex items-center gap-2">
                            {/* Auth button mobile */}
                            {!isLoading && (
                                isLoggedIn ? (
                                    <UserMenu />
                                ) : (
                                    <button
                                        onClick={() => openAuthModal()}
                                        className="navbar-signin-btn navbar-signin-btn--compact"
                                        aria-label="Sign in"
                                    >
                                        <LogIn className="w-4 h-4" />
                                    </button>
                                )
                            )}
                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative p-2 text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 rounded-full transition-colors"
                                aria-label="Cart"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-charcoal text-pearl text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 transition-colors"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden absolute top-full left-0 right-0 bg-pearl/95 backdrop-blur-md border-t border-charcoal/10 transition-all duration-300 ${isMobileMenuOpen
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible -translate-y-4'
                        }`}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                        {/* Nav Links */}
                        <div className="space-y-4 mb-6">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="block font-body text-lg font-medium text-charcoal/70 hover:text-charcoal transition-colors py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.label}
                                </a>
                            ))}
                            {!isLoading && !isLoggedIn && (
                                <button
                                    onClick={() => { setIsMobileMenuOpen(false); openAuthModal(); }}
                                    className="w-full text-left font-body text-lg font-medium text-charcoal/70 hover:text-charcoal transition-colors py-2 flex items-center gap-2"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Sign In / Sign Up
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Spacer for fixed navbar */}
            <div className="h-0" />

            <CartDrawer />
        </>
    );
}

export default Navbar;
