import { useState, useEffect } from 'react';
import { Navbar } from '../components/common';
import { Footer } from '../components/home';
import { useAuth } from '../contexts/AuthContext';
import { getMyOrders, downloadMyInvoice, type CustomerOrder } from '../api/auth';
import {
    Package,
    MapPin,
    ExternalLink,
    ShoppingBag,
    Clock,
    CheckCircle,
    Truck,
    XCircle,
    AlertCircle,
    RotateCcw,
    ArrowRight,
    Loader2,
    Download,
} from 'lucide-react';

function formatDate(dateStr: string) {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(dateStr));
}

function formatPrice(amount: number) {
    // amount is stored in paise on the server
    const inRupees = amount / 100;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(inRupees);
}

type StatusConfig = {
    label: string;
    color: string;
    bg: string;
    icon: React.ReactNode;
};

function getStatusConfig(status: string): StatusConfig {
    switch (status) {
        case 'paid':
            return { label: 'Paid', color: 'text-success', bg: 'bg-success/10', icon: <CheckCircle className="w-3.5 h-3.5" /> };
        case 'confirmed':
            return { label: 'Confirmed', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: <CheckCircle className="w-3.5 h-3.5" /> };
        case 'shipped':
            return { label: 'Shipped', color: 'text-blue-600', bg: 'bg-blue-50', icon: <Truck className="w-3.5 h-3.5" /> };
        case 'delivered':
            return { label: 'Delivered', color: 'text-success', bg: 'bg-success/10', icon: <CheckCircle className="w-3.5 h-3.5" /> };
        case 'cancelled':
            return { label: 'Cancelled', color: 'text-error', bg: 'bg-error/10', icon: <XCircle className="w-3.5 h-3.5" /> };
        case 'refunded':
            return { label: 'Refunded', color: 'text-charcoal/60', bg: 'bg-charcoal/5', icon: <RotateCcw className="w-3.5 h-3.5" /> };
        case 'failed':
            return { label: 'Failed', color: 'text-error', bg: 'bg-error/10', icon: <AlertCircle className="w-3.5 h-3.5" /> };
        case 'created':
        default:
            return { label: 'Processing', color: 'text-warning', bg: 'bg-warning/10', icon: <Clock className="w-3.5 h-3.5" /> };
    }
}

function OrderCard({ order }: { order: CustomerOrder }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const statusConfig = getStatusConfig(order.status);

    const handleDownloadInvoice = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            setIsDownloading(true);
            await downloadMyInvoice(order.order_id);
        } catch (error: any) {
            alert(error.message || 'Failed to download invoice');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <article className="orders-card">
            {/* Order Header */}
            <div className="orders-card-header">
                <div className="orders-card-meta">
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="orders-order-id">#{order.order_id}</span>
                        <span className={`orders-status-badge ${statusConfig.color} ${statusConfig.bg}`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                        </span>
                    </div>
                    <p className="orders-date">{formatDate(order.createdAt)}</p>
                </div>
                <div className="orders-card-right">
                    <p className="orders-total">{formatPrice(order.total_amount)}</p>
                    <p className="orders-item-count">{order.items_count} item{order.items_count !== 1 ? 's' : ''}</p>
                </div>
            </div>

            {/* Items Preview */}
            <div className="orders-items">
                {order.items.slice(0, isExpanded ? order.items.length : 2).map((item, i) => (
                    <div key={`${item.sku}-${i}`} className="orders-item-row">
                        {item.product_image ? (
                            <img
                                src={item.product_image}
                                alt={item.name}
                                className="orders-item-image"
                                loading="lazy"
                            />
                        ) : (
                            <div className="orders-item-icon">
                                <Package className="w-4 h-4 text-charcoal/40" />
                            </div>
                        )}
                        <div className="orders-item-info">
                            <a
                                href={`/products/${encodeURIComponent(item.product_sku || item.sku)}`}
                                className="orders-item-name-link"
                            >
                                {item.name}
                            </a>
                            {item.variant_info && (
                                <p className="orders-item-variant">{item.variant_info}</p>
                            )}
                        </div>
                        <div className="orders-item-qty-price">
                            <span className="orders-item-qty">×{item.quantity}</span>
                            <span className="orders-item-price">{formatPrice(item.total_price)}</span>
                        </div>
                    </div>
                ))}
                {!isExpanded && order.items.length > 2 && (
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="orders-show-more"
                    >
                        +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                    </button>
                )}
            </div>

            {/* Shipping & Tracking */}
            <div className="orders-card-footer">
                {/* Shipping Address */}
                <div className="orders-address">
                    <MapPin className="w-3.5 h-3.5 text-charcoal/40 flex-shrink-0 mt-0.5" />
                    <span className="orders-address-text">
                        {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
                    </span>
                </div>

                {/* Shipping Info */}
                {order.shipping_details?.tracking_number && (
                    <div className="orders-tracking-row">
                        <Truck className="w-3.5 h-3.5 text-charcoal/40 flex-shrink-0" />
                        <span className="orders-tracking-label">{order.shipping_details.courier_name}</span>
                        <span className="orders-tracking-number">{order.shipping_details.tracking_number}</span>
                        {order.shipping_details.tracking_url && (
                            <a
                                href={order.shipping_details.tracking_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="orders-track-link"
                            >
                                Track <ExternalLink className="w-3 h-3 ml-0.5" />
                            </a>
                        )}
                    </div>
                )}

                {/* Zuley generates invoices immediately upon order creation, so we can show it for all active statuses */}
                <div className="flex items-center gap-3">
                    {['created', 'confirmed', 'shipped', 'delivered', 'paid'].includes(order.status) && (
                        <button
                            onClick={handleDownloadInvoice}
                            disabled={isDownloading}
                            className="orders-track-btn !bg-white !text-charcoal border border-charcoal/20 hover:!bg-charcoal/5"
                        >
                            {isDownloading ? (
                                <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                            ) : (
                                <Download className="w-3.5 h-3.5 mr-1" />
                            )}
                            Invoice
                        </button>
                    )}
                    
                    <a
                        href={`/track-order?id=${order.order_id}`}
                        className="orders-track-btn"
                    >
                        Track Order <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </a>
                </div>
            </div>
        </article>
    );
}

export function OrdersPage() {
    const { isLoggedIn, isLoading: authLoading, openAuthModal } = useAuth();
    const [orders, setOrders] = useState<CustomerOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isLoggedIn && !authLoading) return;
        if (!isLoggedIn) return;

        setIsLoading(true);
        getMyOrders()
            .then(data => setOrders(data.orders))
            .catch(err => setError(err.message || 'Failed to load orders'))
            .finally(() => setIsLoading(false));
    }, [isLoggedIn, authLoading]);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
                    <div className="mb-8">
                        <h1 className="font-heading text-3xl font-bold text-charcoal">My Orders</h1>
                        <p className="font-body text-charcoal/60 mt-2">
                            View and track all your Zuley orders
                        </p>
                    </div>

                    {/* Not logged in */}
                    {!authLoading && !isLoggedIn && (
                        <div className="orders-empty">
                            <ShoppingBag className="w-12 h-12 text-charcoal/20 mb-4" />
                            <h2 className="font-heading text-xl font-semibold text-charcoal mb-2">
                                Sign in to view your orders
                            </h2>
                            <p className="font-body text-charcoal/60 mb-6 max-w-sm">
                                Sign in to your Zuley account to see your order history and tracking details.
                            </p>
                            <button
                                onClick={() => openAuthModal()}
                                className="orders-signin-btn"
                            >
                                Sign In / Sign Up
                            </button>
                        </div>
                    )}

                    {/* Loading */}
                    {(authLoading || isLoading) && (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-charcoal/40" />
                        </div>
                    )}

                    {/* Error */}
                    {error && !isLoading && (
                        <div className="orders-error">
                            <AlertCircle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Empty state (logged in, no orders) */}
                    {isLoggedIn && !isLoading && !error && orders.length === 0 && (
                        <div className="orders-empty">
                            <ShoppingBag className="w-12 h-12 text-charcoal/20 mb-4" />
                            <h2 className="font-heading text-xl font-semibold text-charcoal mb-2">
                                No orders yet
                            </h2>
                            <p className="font-body text-charcoal/60 mb-6">
                                Start shopping and your orders will appear here.
                            </p>
                            <a href="/products" className="orders-signin-btn">
                                Shop Now
                            </a>
                        </div>
                    )}

                    {/* Order list */}
                    {isLoggedIn && !isLoading && orders.length > 0 && (
                        <div className="orders-list">
                            {orders.map(order => (
                                <OrderCard key={order._id} order={order} />
                            ))}
                        </div>
                    )}
                </div>

                <Footer />
            </main>
        </>
    );
}

export default OrdersPage;
