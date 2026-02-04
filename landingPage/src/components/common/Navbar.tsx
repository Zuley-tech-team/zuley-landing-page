import { useState, useEffect } from 'react';
import { Menu, X, ShoppingBag, Heart } from 'lucide-react';
import logoLight from "../../assets/logo-light-transparent.webp"

const navLinks = [
    { label: 'Silver Pens', href: '/products?category=silver-pens' },
    { label: 'Silver Phone Covers', href: '/products?category=silver-phone-covers' },
    { label: 'Customize', href: '/customize' },
    { label: 'Corporate', href: '/corporate' },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <a href="/" className="flex justify-center items-center flex-shrink-0">
                            <img src={logoLight} className='w-25 mt-2' alt="Zuley Logo" />
                        </a>

                        {/* Desktop Navigation - Product Categories */}
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
                        </div>

                        {/* Desktop Actions - Wishlist & Cart */}
                        <div className="hidden md:flex items-center gap-2">
                            {/* Wishlist */}
                            <button
                                className="relative w-10 h-10 rounded-full flex items-center justify-center text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 transition-colors"
                                aria-label="Wishlist"
                            >
                                <Heart className="w-5 h-5" />
                            </button>
                            {/* Cart */}
                            <button
                                className="relative w-10 h-10 rounded-full flex items-center justify-center text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 transition-colors"
                                aria-label="Shopping Cart"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-charcoal text-pearl text-xs flex items-center justify-center font-body">
                                    0
                                </span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden w-10 h-10 rounded-full flex items-center justify-center text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 transition-colors"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <div
                    className={`md:hidden absolute top-full left-0 right-0 bg-pearl/95 backdrop-blur-md border-t border-charcoal/10 transition-all duration-300 ${isMobileMenuOpen
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible -translate-y-4'
                        }`}
                >
                    <div className="max-w-7xl mx-auto px-6 py-6">
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
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t border-charcoal/10">
                            {/* Wishlist */}
                            <button
                                className="w-10 h-10 rounded-full flex items-center justify-center text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 transition-colors"
                                aria-label="Wishlist"
                            >
                                <Heart className="w-5 h-5" />
                            </button>
                            {/* Cart */}
                            <button
                                className="relative w-10 h-10 rounded-full flex items-center justify-center text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 transition-colors"
                                aria-label="Shopping Cart"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-charcoal text-pearl text-xs flex items-center justify-center font-body">
                                    0
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Spacer for fixed navbar */}
            <div className="h-0" />
        </>
    );
}

export default Navbar;
