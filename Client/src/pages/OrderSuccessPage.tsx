import { useSearchParams, Link } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/home';
import { Button } from '../components/common/Button';
import { CheckCircle2, Package, ArrowRight, Copy, Check, Download, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { fetchAndDownloadInvoice } from '../api/orders';

export function OrderSuccessPage() {
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get('payment_id') || '';
    const orderId = searchParams.get('order_id') || '';
    const productName = searchParams.get('product') || '';
    const itemsSummary = searchParams.get('items') || '';
    const model = searchParams.get('model') || '';
    const amount = searchParams.get('amount') || '';
    const method = searchParams.get('method') || '';
    const invoice = searchParams.get('invoice') || '';
    const [copied, setCopied] = useState(false);
    const [showContent, setShowContent] = useState(false);
    const [invoiceLoading, setInvoiceLoading] = useState(false);

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

    const handleDownloadInvoice = async () => {
        if (!orderId || invoiceLoading) return;
        setInvoiceLoading(true);
        try {
            await fetchAndDownloadInvoice(orderId, invoice || null);
        } catch (err: any) {
            alert(err.message || 'Failed to download invoice. Please try from My Orders.');
        } finally {
            setInvoiceLoading(false);
        }
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
                            {method === 'cod' ? 'Order Placed Successfully!' : 'Payment Successful!'}
                        </h1>
                        <p className="font-body text-charcoal/60 text-lg mb-10 max-w-md mx-auto">
                            {method === 'cod'
                                ? 'Thank you for your purchase. Your order is confirmed and payment will be collected on delivery.'
                                : "Thank you for your purchase. Your order is being processed and you'll receive a confirmation email shortly."}
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
                                        <div className="flex items-center gap-2">
                                            <span className="font-body text-sm font-medium text-charcoal">
                                                {orderId}
                                            </span>
                                            <button
                                                onClick={() => handleCopy(orderId)}
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

                                {method && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-body text-sm text-charcoal/60">
                                            Payment Method
                                        </span>
                                        <span className="font-body text-sm font-medium text-charcoal">
                                            {method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                        </span>
                                    </div>
                                )}

                                {method === 'cod' && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-body text-sm text-charcoal/60">
                                            Payment Status
                                        </span>
                                        <span className="font-body text-sm font-medium text-charcoal">
                                            Payment on Delivery
                                        </span>
                                    </div>
                                )}

                                {invoice && (
                                    <div className="flex items-center justify-between">
                                        <span className="font-body text-sm text-charcoal/60">
                                            Invoice
                                        </span>
                                        <span className="font-body text-sm font-medium text-charcoal">
                                            {invoice}
                                        </span>
                                    </div>
                                )}

                                {(itemsSummary || productName) && (
                                    <div className="flex items-start justify-between gap-4">
                                        <span className="font-body text-sm text-charcoal/60 shrink-0">
                                            Items
                                        </span>
                                        <span className="font-body text-sm font-medium text-charcoal text-right break-words">
                                            {decodeURIComponent(itemsSummary || productName)}
                                        </span>
                                    </div>
                                )}

                                {model && (
                                    <div className="flex items-start justify-between gap-4">
                                        <span className="font-body text-sm text-charcoal/60 shrink-0">
                                            Phone Model
                                        </span>
                                        <span className="font-body text-sm font-medium text-charcoal text-right break-words">
                                            {decodeURIComponent(model)}
                                        </span>
                                    </div>
                                )}

                                {amount && (
                                    <div className="flex items-center justify-between pt-3 border-t border-charcoal/10">
                                        <span className="font-body text-sm font-medium text-charcoal/70">
                                            {method === 'cod' ? 'Amount Due on Delivery' : 'Amount Paid'}
                                        </span>
                                        <span className="font-heading text-xl font-bold text-charcoal">
                                            {formatPrice(amount)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* CTAs */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-3xl mx-auto">
                            {orderId && (
                                <Link to={`/track-order?orderId=${encodeURIComponent(orderId)}`} className="w-full">
                                    <Button variant="secondary" size="lg" className="w-full h-14 !py-0 !text-base !rounded-xl !font-semibold">
                                        Track Order
                                    </Button>
                                </Link>
                            )}
                            {invoice && orderId && (
                                <Button
                                    variant="accent"
                                    size="lg"
                                    icon={invoiceLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                    iconPosition="left"
                                    className="w-full h-14 !py-0 !text-base !rounded-xl !font-semibold shadow-sm hover:shadow-md"
                                    onClick={handleDownloadInvoice}
                                    disabled={invoiceLoading}
                                >
                                    {invoiceLoading ? 'Loading...' : 'Download Invoice'}
                                </Button>
                            )}
                            <Link to="/products" className="w-full">
                                <Button
                                    variant="primary"
                                    size="lg"
                                    icon={<ArrowRight className="w-5 h-5" />}
                                    iconPosition="right"
                                    className="w-full h-14 !py-0 !text-base !rounded-xl !font-semibold shadow-sm hover:shadow-md"
                                >
                                    Continue Shopping
                                </Button>
                            </Link>
                            {!orderId && <Link to="/" className="w-full">
                                <Button variant="secondary" size="lg" className="w-full h-14 !py-0 !text-base !rounded-xl !font-semibold">
                                    Back to Home
                                </Button>
                            </Link>}
                        </div>
                    </div>
                </div>
                <Footer />
            </main>
        </>
    );
}

export default OrderSuccessPage;
