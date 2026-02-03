import { useState, useEffect } from 'react';
import { Button } from '../common';
import { Menu, X, ShoppingBag, Search, User } from 'lucide-react';

const navLinks = [
    { label: 'Shop', href: '/products' },
    { label: 'Customize', href: '/customize' },
    { label: 'Corporate', href: '/corporate' },
    { label: 'About', href: '/about' },
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
                        <a href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-charcoal flex items-center justify-center">
                                <span className="font-heading text-xl font-bold text-primary">A</span>
                            </div>
                            <span className="font-heading text-xl font-bold text-charcoal hidden sm:block">
                                Anekas
                            </span>
                        </a>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href={link.href}
                                    className="font-body text-sm font-medium text-charcoal/70 hover:text-charcoal transition-colors relative group"
                                >
                                    {link.label}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-charcoal transition-all duration-300 group-hover:w-full" />
                                </a>
                            ))}
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-4">
                            <button className="w-10 h-10 rounded-full flex items-center justify-center text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 transition-colors">
                                <Search className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-full flex items-center justify-center text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 transition-colors">
                                <User className="w-5 h-5" />
                            </button>
                            <button className="relative w-10 h-10 rounded-full flex items-center justify-center text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 transition-colors">
                                <ShoppingBag className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-charcoal text-pearl text-xs flex items-center justify-center font-body">
                                    0
                                </span>
                            </button>
                            <Button variant="primary" size="sm">
                                Shop Now
                            </Button>
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
                        <div className="flex items-center gap-4 pt-4 border-t border-charcoal/10">
                            <button className="w-10 h-10 rounded-full flex items-center justify-center text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 transition-colors">
                                <Search className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-full flex items-center justify-center text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 transition-colors">
                                <User className="w-5 h-5" />
                            </button>
                            <button className="relative w-10 h-10 rounded-full flex items-center justify-center text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 transition-colors">
                                <ShoppingBag className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-charcoal text-pearl text-xs flex items-center justify-center font-body">
                                    0
                                </span>
                            </button>
                            <Button variant="primary" size="sm" fullWidth className="ml-auto flex-1">
                                Shop Now
                            </Button>
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
