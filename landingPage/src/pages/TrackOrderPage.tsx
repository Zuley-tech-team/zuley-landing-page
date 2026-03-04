import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navbar } from '../components/common';
import { Footer } from '../components/home';
import { Button } from '../components/common';
import { OrderTimeline } from '../components/tracking';
import { ShippingCard } from '../components/tracking';
import { getOrderTracking, type OrderTrackingData } from '../api/orders';
import { Search, Package, Loader2, AlertCircle } from 'lucide-react';

export function TrackOrderPage() {
    const [searchParams] = useSearchParams();
    const initialOrderId = searchParams.get('id') || '';

    const [orderId, setOrderId] = useState(initialOrderId);
    const [orderData, setOrderData] = useState<OrderTrackingData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searched, setSearched] = useState(false);

    const formatPrice = (paise: number) =>
        new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(paise / 100);

    const handleSearch = async (e?: FormEvent) => {
        e?.preventDefault();
        const trimmed = orderId.trim();
        if (!trimmed) return;

        setIsLoading(true);
        setError(null);
        setSearched(true);

        try {
            const result = await getOrderTracking(trimmed);
            setOrderData(result.data);
        } catch (err: any) {
            setError(err.message || 'Failed to find order');
            setOrderData(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-16">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-14 h-14 mx-auto rounded-full bg-charcoal/5 flex items-center justify-center mb-4">
                            <Package className="w-7 h-7 text-charcoal/60" />
                        </div>
                        <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-2">
                            Track Your Order
                        </h1>
                        <p className="font-body text-charcoal/60">
                            Enter your order ID to check the current status
                        </p>
                    </div>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mb-10">
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    value={orderId}
                                    onChange={(e) => setOrderId(e.target.value.toUpperCase())}
                                    placeholder="e.g. ZUL-250213-0001"
                                    className="w-full px-4 py-3.5 pl-11 font-body text-sm text-charcoal border border-charcoal/15 rounded-xl bg-white outline-none focus:border-charcoal focus:ring-2 focus:ring-charcoal/5 transition-all font-mono"
                                    id="track-order-input"
                                />
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-charcoal/30" />
                            </div>
                            <Button
                                type="submit"
                                variant="primary"
                                size="lg"
                                disabled={isLoading || !orderId.trim()}
                                icon={
                                    isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Search className="w-5 h-5" />
                                    )
                                }
                                iconPosition="left"
                            >
                                {isLoading ? 'Searching...' : 'Track'}
                            </Button>
                        </div>
                    </form>

                    {/* Error */}
                    {error && searched && (
                        <div className="flex items-start gap-3 p-4 bg-error/10 border border-error/20 rounded-xl mb-8">
                            <AlertCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-body text-sm font-medium text-error">Order Not Found</p>
                                <p className="font-body text-xs text-error/70 mt-1">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {orderData && (
                        <div className="space-y-6 animate-in">
                            {/* Order Summary Card */}
                            <div className="bg-white rounded-2xl shadow-soft p-5 md:p-6">
                                <div className="flex items-center justify-between mb-5 pb-4 border-b border-charcoal/10">
                                    <div>
                                        <p className="font-body text-xs text-charcoal/50 uppercase tracking-wide">Order</p>
                                        <p className="font-heading text-lg font-bold text-charcoal font-mono">
                                            {orderData.order_id}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${orderData.status === 'delivered'
                                                ? 'bg-success/10 text-success'
                                                : orderData.status === 'shipped'
                                                    ? 'bg-warning/10 text-warning'
                                                    : orderData.status === 'paid'
                                                        ? 'bg-accent/10 text-accent-dark'
                                                        : orderData.status === 'cancelled' || orderData.status === 'refunded'
                                                            ? 'bg-error/10 text-error'
                                                            : 'bg-charcoal/10 text-charcoal/60'
                                            }`}
                                    >
                                        {orderData.status}
                                    </span>
                                </div>

                                {/* Items */}
                                <div className="space-y-3 mb-5">
                                    {orderData.items.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between">
                                            <div>
                                                <p className="font-body text-sm text-charcoal">{item.name}</p>
                                                <p className="font-body text-xs text-charcoal/50">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-body text-sm font-medium text-charcoal">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Total */}
                                <div className="flex items-center justify-between pt-4 border-t border-charcoal/10">
                                    <span className="font-body text-sm text-charcoal/60">Total</span>
                                    <span className="font-heading text-lg font-bold text-charcoal">
                                        {formatPrice(orderData.total_amount)}
                                    </span>
                                </div>

                                {/* Delivery address */}
                                <div className="mt-4 pt-4 border-t border-charcoal/10">
                                    <p className="font-body text-xs text-charcoal/50 mb-1">Delivering to</p>
                                    <p className="font-body text-sm text-charcoal">
                                        {orderData.shipping_address.city}, {orderData.shipping_address.state} — {orderData.shipping_address.pincode}
                                    </p>
                                </div>
                            </div>

                            {/* Timeline */}
                            <div className="bg-white rounded-2xl shadow-soft p-5 md:p-6">
                                <h2 className="font-heading text-lg font-semibold text-charcoal mb-5">
                                    Order Status
                                </h2>
                                <OrderTimeline
                                    currentStatus={orderData.status}
                                    history={orderData.history}
                                />
                            </div>

                            {/* Shipping Card */}
                            {orderData.shipping && (
                                <ShippingCard
                                    courierName={orderData.shipping.courierName}
                                    trackingNumber={orderData.shipping.trackingNumber}
                                    trackingUrl={orderData.shipping.trackingUrl}
                                    status={orderData.shipping.status}
                                    shippedAt={orderData.shipping.shippedAt}
                                    deliveredAt={orderData.shipping.deliveredAt}
                                />
                            )}
                        </div>
                    )}

                    {/* Empty state */}
                    {!orderData && !error && !isLoading && searched && (
                        <div className="text-center py-12">
                            <p className="font-body text-charcoal/40 text-sm">
                                No results found
                            </p>
                        </div>
                    )}
                </div>
                <Footer />
            </main>
        </>
    );
}

export default TrackOrderPage;
