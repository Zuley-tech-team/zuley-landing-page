import { useState } from 'react';
import { Button } from '../common';
import {
    Mail,
    ArrowUp,
    Instagram,
    Facebook,
    MessageCircle,
    CreditCard,
    Shield,
    Truck,
    Send,
    MapPin,
    Phone
} from 'lucide-react';

const footerLinks = {
    shop: [
        { label: 'Silver Pens', href: '/products/pens' },
        { label: 'Keychains', href: '/products/keychains' },
        { label: 'Phone Covers', href: '/products/covers' },
        { label: 'All Products', href: '/products' },
    ],
    customize: [
        { label: 'Personalization Guide', href: '/customize' },
        { label: 'Font Options', href: '/fonts' },
        { label: 'Corporate Gifting', href: '/corporate' },
        { label: 'Bulk Orders', href: '/bulk' },
    ],
    about: [
        { label: 'Our Story', href: '/about' },
        { label: 'Craftsmanship', href: '/craftsmanship' },
        { label: 'Quality Promise', href: '/quality' },
        { label: 'Reviews', href: '/reviews' },
    ],
    support: [
        { label: 'Contact Us', href: '/contact' },
        { label: 'Shipping Policy', href: '/shipping' },
        { label: 'Returns & Refunds', href: '/returns' },
        { label: 'FAQs', href: '/faq' },
        { label: 'Track Order', href: '/track' },
    ],
};

const socialLinks = [
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: MessageCircle, href: '#', label: 'WhatsApp' },
];

export function Footer() {
    const [email, setEmail] = useState('');

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Subscribe:', email);
        setEmail('');
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="bg-charcoal text-pearl">
            {/* Brand Story Section */}
            <div className="border-b border-pearl/10">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Brand Logo & Story */}
                        <div className="text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                                    <span className="font-heading text-2xl font-bold text-charcoal">A</span>
                                </div>
                                <span className="font-heading text-3xl font-bold text-pearl">Zuley</span>
                            </div>
                            <h3 className="font-heading text-xl md:text-2xl font-semibold mb-4">
                                Redefining Silver Beyond Jewellery
                            </h3>
                            <p className="font-body text-pearl/70 leading-relaxed">
                                We believe silver belongs in your everyday life—in the tools you use,
                                the accessories you carry, and the gifts you give. Each piece we create
                                is a blend of timeless craftsmanship and personal meaning.
                            </p>
                        </div>

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="flex items-start gap-4 p-6 rounded-2xl bg-graphite/30 border border-pearl/10">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-2">Visit Us</h4>
                                    <p className="font-body text-sm text-pearl/60">
                                        Mumbai, Maharashtra<br />India
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-6 rounded-2xl bg-graphite/30 border border-pearl/10">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-2">Call Us</h4>
                                    <p className="font-body text-sm text-pearl/60">
                                        +91 98765 43210<br />
                                        Mon-Sat, 10am-7pm
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Newsletter Section */}
            <div className="border-b border-pearl/10 bg-graphite/30">
                <div className="max-w-4xl mx-auto px-6 py-12 md:py-16">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-primary/10 rounded-full">
                            <Mail className="w-4 h-4 text-primary" />
                            <span className="font-body text-sm text-primary uppercase tracking-wider">Newsletter</span>
                        </div>
                        <h3 className="font-heading text-2xl md:text-3xl font-semibold mb-2">
                            Join Our Silver Circle
                        </h3>
                        <p className="font-body text-pearl/60">
                            Get exclusive offers, gifting ideas, and new product launches
                        </p>
                    </div>

                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                        <div className="flex-1 relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pearl/40" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full pl-12 pr-4 py-4 bg-charcoal border border-pearl/20 rounded-xl font-body text-pearl placeholder:text-pearl/40 focus:outline-none focus:border-primary transition-colors"
                                required
                            />
                        </div>
                        <Button type="submit" variant="accent" size="lg" icon={<Send className="w-5 h-5" />}>
                            Subscribe
                        </Button>
                    </form>

                    <p className="font-body text-xs text-pearl/40 text-center mt-4">
                        We respect your privacy. Unsubscribe anytime.
                    </p>
                </div>
            </div>

            {/* Links Section */}
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
                    {/* Shop */}
                    <div>
                        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 text-primary">Shop</h4>
                        <ul className="space-y-3">
                            {footerLinks.shop.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="font-body text-sm text-pearl/60 hover:text-pearl transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Customize */}
                    <div>
                        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 text-primary">Customize</h4>
                        <ul className="space-y-3">
                            {footerLinks.customize.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="font-body text-sm text-pearl/60 hover:text-pearl transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* About */}
                    <div>
                        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 text-primary">About</h4>
                        <ul className="space-y-3">
                            {footerLinks.about.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="font-body text-sm text-pearl/60 hover:text-pearl transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-heading text-sm font-semibold uppercase tracking-wider mb-4 text-primary">Support</h4>
                        <ul className="space-y-3">
                            {footerLinks.support.map((link) => (
                                <li key={link.label}>
                                    <a
                                        href={link.href}
                                        className="font-body text-sm text-pearl/60 hover:text-pearl transition-colors"
                                    >
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-pearl/10">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        {/* Copyright */}
                        <p className="font-body text-sm text-pearl/50 text-center md:text-left">
                            © 2026 Zuley. All rights reserved.
                        </p>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-6">
                            <div className="flex items-center gap-2 text-pearl/50">
                                <Shield className="w-5 h-5" />
                                <span className="font-body text-sm">Secure Checkout</span>
                            </div>
                            <div className="flex items-center gap-2 text-pearl/50">
                                <CreditCard className="w-5 h-5" />
                                <span className="font-body text-sm">All Cards Accepted</span>
                            </div>
                            <div className="flex items-center gap-2 text-pearl/50">
                                <Truck className="w-5 h-5" />
                                <span className="font-body text-sm">Pan India Delivery</span>
                            </div>
                        </div>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => {
                                const IconComponent = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        className="w-11 h-11 rounded-full bg-graphite/50 border border-pearl/10 flex items-center justify-center text-pearl/60 hover:text-pearl hover:border-primary hover:bg-primary/10 transition-all"
                                        aria-label={social.label}
                                    >
                                        <IconComponent className="w-5 h-5" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll to Top Button */}
            <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-primary text-charcoal flex items-center justify-center shadow-luxury hover:scale-110 transition-transform z-50"
                aria-label="Scroll to top"
            >
                <ArrowUp className="w-5 h-5" />
            </button>
        </footer>
    );
}

export default Footer;
