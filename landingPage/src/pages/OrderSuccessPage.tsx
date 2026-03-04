import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../components/common';
import { Footer } from '../components/home';
import { Button } from '../components/common';
import { CheckCircle2, Package, ArrowRight, Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

export function OrderSuccessPage() {
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get('payment_id') || '';
    const orderId = searchParams.get('order_id') || '';
    const productName = searchParams.get('product') || '';
    const amount = searchParams.get('amount') || '';
    const [copied, setCopied] = useState(false);
    const [showContent, setShowContent] = useState(false);

    // Animate in after mount
    useEffect(() => {
        const timer = setTimeout(() => setShowContent(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const formatPrice = (price: string) => {
        const num = Number(price);
        if (isNaN(num)) return price;
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(num);
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-20">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 md:py-20">
                    <div
                        className={`text-center transition-all duration-700 ease-out ${showContent
                                ? 'opacity-100 translate-y-0'
                                : 'opacity-0 translate-y-8'
                            }`}
                    >
                        {/* Success Icon */}
                        <div className="relative inline-flex items-center justify-center mb-8">
                            <div className="absolute inset-0 w-24 h-24 rounded-full bg-success/10 animate-ping" style={{ animationDuration: '2s' }} />
                            <div className="relative w-24 h-24 rounded-full bg-success/15 flex items-center justify-center">
                                <CheckCircle2 className="w-12 h-12 text-success" />
                            </div>
                        </div>

                        {/* Heading */}
                        <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-3">
                            Payment Successful!
                        </h1>
                        <p className="font-body text-charcoal/60 text-lg mb-10 max-w-md mx-auto">
                            Thank you for your purchase. Your order is being processed and you'll receive a confirmation email shortly.
                        </p>

                        {/* Order Details Card */}
                        <div className="bg-white rounded-2xl shadow-card p-6 md:p-8 text-left space-y-5 mb-8">
                            <div className="flex items-center gap-3 pb-4 border-b border-charcoal/10">
                                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <h2 className="font-heading text-lg font-semibold text-charcoal">
                                        Order Details
                                    </h2>
                                    <p className="font-body text-xs text-charcoal/50">
                                        Keep this information for your records
                                    </p>
                                </div>
                            </div>

                            {/* Detail Rows */}
                            <div className="space-y-4">
                                {paymentId && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-body text-sm text-charcoal/60">
                                            Payment ID
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="font-body text-sm font-medium text-charcoal font-mono">
                                                {paymentId}
                                            </span>
                                            <button
                                                onClick={() => handleCopy(paymentId)}
                                                className="p-1.5 rounded-lg hover:bg-charcoal/5 transition-colors cursor-pointer"
                                                title="Copy"
                                            >
                                                {copied ? (
                                                    <Check className="w-3.5 h-3.5 text-success" />
                                                ) : (
                                                    <Copy className="w-3.5 h-3.5 text-charcoal/40" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {orderId && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-body text-sm text-charcoal/60">
                                            Order ID
                                        </span>
                                        <span className="font-body text-sm font-medium text-charcoal">
                                            {orderId}
                                        </span>
                                    </div>
                                )}

                                {productName && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-body text-sm text-charcoal/60">
                                            Item
                                        </span>
                                        <span className="font-body text-sm font-medium text-charcoal">
                                            {decodeURIComponent(productName)}
                                        </span>
                                    </div>
                                )}

                                {amount && (
                                    <div className="flex items-center justify-between pt-3 border-t border-charcoal/10">
                                        <span className="font-body text-sm font-medium text-charcoal/70">
                                            Amount Paid
                                        </span>
                                        <span className="font-heading text-xl font-bold text-charcoal">
                                            {formatPrice(amount)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Banner */}
                        <div className="bg-primary-light/40 rounded-xl p-4 mb-8 text-left">
                            <p className="font-body text-sm text-charcoal/60">
                                📧 A confirmation email with your invoice will be sent to your registered email address.
                                If you don't receive it within 15 minutes, please check your spam folder.
                            </p>
                        </div>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link to="/products">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    icon={<ArrowRight className="w-5 h-5" />}
                                    iconPosition="right"
                                >
                                    Continue Shopping
                                </Button>
                            </Link>
                            <Link to="/">
                                <Button variant="secondary" size="lg">
                                    Back to Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        </>
    );
}

export default OrderSuccessPage;
