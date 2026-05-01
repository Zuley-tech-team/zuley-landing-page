import { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/home';
import { useAuth } from '../contexts/AuthContext';
import { getMyOrders, downloadMyInvoice, submitReturnRequest, type CustomerOrder } from '../api/auth';
import { submitReview } from '../api/reviews';
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
    Mail,
    X,
    Star,
} from 'lucide-react';

const RETURN_REASONS = [
    'Damaged on arrival',
    'Wrong product delivered',
    'Quality issue',
    'Size/fit not as expected',
    'Changed my mind',
    'Other',
];

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
        case 'return_requested':
            return { label: 'Return Initiated', color: 'text-amber-700', bg: 'bg-amber-100', icon: <RotateCcw className="w-3.5 h-3.5" /> };
        case 'return_in_progress':
            return { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-100', icon: <RotateCcw className="w-3.5 h-3.5" /> };
        case 'return_rejected':
            return { label: 'Cancelled', color: 'text-error', bg: 'bg-error/10', icon: <XCircle className="w-3.5 h-3.5" /> };
        case 'replaced':
            return { label: 'Replaced', color: 'text-emerald-700', bg: 'bg-emerald-100', icon: <CheckCircle className="w-3.5 h-3.5" /> };
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

function OrderCard({
    order,
    onOpenReturn,
    onOpenReview,
}: {
    order: CustomerOrder;
    onOpenReturn: (order: CustomerOrder) => void;
    onOpenReview: (order: CustomerOrder, item: CustomerOrder['items'][0]) => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const statusConfig = getStatusConfig(order.status);
    const deliveredAt = order.shipping_details?.delivered_at;
    const returnDeadline = deliveredAt ? new Date(new Date(deliveredAt).getTime() + 48 * 60 * 60 * 1000) : null;
    const isReturnEligible = order.status === 'delivered' && returnDeadline ? new Date() <= returnDeadline : false;
    const isReturnExpired = order.status === 'delivered' && returnDeadline ? new Date() > returnDeadline : false;
    const isReviewEligible = order.status === 'delivered';

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
                {order.items.slice(0, isExpanded ? order.items.length : 2).map((item, i) => {
                    const itemSku = item.product_sku || item.sku;
                    const isReviewed = order.reviewed_items?.includes(itemSku);
                    return (
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
                                <p className="orders-item-variant">Phone model: {item.variant_info}</p>
                            )}
                            {isReviewEligible && (
                                <button
                                    type="button"
                                    className={`orders-review-btn ${isReviewed ? 'orders-review-btn--done' : ''}`}
                                    onClick={() => !isReviewed && onOpenReview(order, item)}
                                    disabled={isReviewed}
                                >
                                    <Star className="w-3.5 h-3.5" />
                                    {isReviewed ? 'Review Submitted' : 'Write Review'}
                                </button>
                            )}
                        </div>
                        <div className="orders-item-qty-price">
                            <span className="orders-item-qty">×{item.quantity}</span>
                            <span className="orders-item-price">{formatPrice(item.total_price)}</span>
                        </div>
                    </div>
                    );
                })}
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

                <div className="orders-support-row">
                    <a
                        href="mailto:support@zuley.in"
                        className="orders-help-btn"
                    >
                        <Mail className="w-3.5 h-3.5" />
                        Need help?
                    </a>
                    {order.status === 'delivered' && (
                        <button
                            type="button"
                            className="orders-return-btn"
                            disabled={!isReturnEligible}
                            onClick={() => onOpenReturn(order)}
                            title={isReturnExpired ? 'Return window closed' : undefined}
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Return Product
                        </button>
                    )}
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
    const [returnOrder, setReturnOrder] = useState<CustomerOrder | null>(null);
    const [returnType, setReturnType] = useState<'refund' | 'replace'>('refund');
    const [returnReason, setReturnReason] = useState('');
    const [returnNote, setReturnNote] = useState('');
    const [returnError, setReturnError] = useState('');
    const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
    const [reviewOrder, setReviewOrder] = useState<CustomerOrder | null>(null);
    const [reviewItem, setReviewItem] = useState<CustomerOrder['items'][0] | null>(null);
    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewImages, setReviewImages] = useState<File[]>([]);
    const [reviewUploadProgress, setReviewUploadProgress] = useState<number | null>(null);
    const [reviewError, setReviewError] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    useEffect(() => {
        if (!isLoggedIn && !authLoading) return;
        if (!isLoggedIn) return;

        setIsLoading(true);
        getMyOrders()
            .then(data => setOrders(data.orders))
            .catch(err => setError(err.message || 'Failed to load orders'))
            .finally(() => setIsLoading(false));
    }, [isLoggedIn, authLoading]);

    useEffect(() => {
        if (returnOrder || reviewOrder) {
            document.body.classList.add('modal-open');
        } else {
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.classList.remove('modal-open');
        };
    }, [returnOrder, reviewOrder]);

    const openReturnModal = (order: CustomerOrder) => {
        setReturnOrder(order);
        setReturnType('refund');
        setReturnReason('');
        setReturnNote('');
        setReturnError('');
    };

    const closeReturnModal = () => {
        setReturnOrder(null);
    };

    const openReviewModal = (order: CustomerOrder, item: CustomerOrder['items'][0]) => {
        setReviewOrder(order);
        setReviewItem(item);
        setReviewRating(0);
        setReviewComment('');
        setReviewImages([]);
        setReviewUploadProgress(null);
        setReviewError('');
    };

    const closeReviewModal = () => {
        setReviewOrder(null);
        setReviewItem(null);
        setReviewRating(0);
        setReviewComment('');
        setReviewImages([]);
        setReviewUploadProgress(null);
        setReviewError('');
    };

    const handleReviewImagesChange = (files: FileList | null) => {
        if (!files) {
            setReviewImages([]);
            return;
        }

        const next = Array.from(files).slice(0, 5);
        setReviewImages(next);
    };

    const handleSubmitReview = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!reviewOrder || !reviewItem) return;

        if (reviewRating < 1) {
            setReviewError('Please select a star rating.');
            return;
        }

        if (!reviewComment.trim()) {
            setReviewError('Please add a review.');
            return;
        }

        setIsSubmittingReview(true);
        setReviewError('');
        setReviewUploadProgress(reviewImages.length > 0 ? 0 : null);

        try {
            const sku = reviewItem.product_sku || reviewItem.sku;
            await submitReview({
                order_id: reviewOrder.order_id,
                product_sku: sku,
                rating: reviewRating,
                comment: reviewComment.trim(),
                images: reviewImages,
            }, (percent) => setReviewUploadProgress(percent));

            setOrders((current) =>
                current.map((order) =>
                    order.order_id === reviewOrder.order_id
                        ? {
                              ...order,
                              reviewed_items: Array.from(
                                  new Set([...(order.reviewed_items || []), sku])
                              ),
                          }
                        : order
                )
            );

            closeReviewModal();
        } catch (error: any) {
            setReviewError(error.message || 'Failed to submit review.');
        } finally {
            setIsSubmittingReview(false);
            setReviewUploadProgress(null);
        }
    };

    const handleSubmitReturn = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!returnOrder) return;

        if (!returnReason.trim()) {
            setReturnError('Please choose a reason.');
            return;
        }

        if (!returnNote.trim()) {
            setReturnError('Please add a note for your request.');
            return;
        }

        setIsSubmittingReturn(true);
        setReturnError('');

        try {
            const response = await submitReturnRequest(returnOrder.order_id, {
                type: returnType,
                reason: returnReason,
                note: returnNote,
            });

            setOrders((current) =>
                current.map((order) =>
                    order.order_id === response.data.order_id ? response.data : order
                )
            );
            closeReturnModal();
        } catch (error: any) {
            setReturnError(error.message || 'Failed to submit return request.');
        } finally {
            setIsSubmittingReturn(false);
        }
    };

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
                                <OrderCard
                                    key={order._id}
                                    order={order}
                                    onOpenReturn={openReturnModal}
                                    onOpenReview={openReviewModal}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {returnOrder && (
                    <div className="orders-return-overlay" onClick={(e) => e.target === e.currentTarget && closeReturnModal()}>
                        <div className="orders-return-modal">
                            <div className="orders-return-header">
                                <h3 className="orders-return-title">Return Request</h3>
                                <button type="button" onClick={closeReturnModal} className="orders-return-close">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <form className="orders-return-form" onSubmit={handleSubmitReturn}>
                                <label className="orders-return-label">
                                    Choose option
                                    <select
                                        value={returnType}
                                        onChange={(event) => setReturnType(event.target.value as 'refund' | 'replace')}
                                        className="orders-return-select"
                                    >
                                        <option value="refund">Refund</option>
                                        <option value="replace">Replace</option>
                                    </select>
                                </label>
                                <label className="orders-return-label">
                                    Reason
                                    <select
                                        value={returnReason}
                                        onChange={(event) => setReturnReason(event.target.value)}
                                        className="orders-return-select"
                                    >
                                        <option value="" disabled>
                                            Select a reason
                                        </option>
                                        {RETURN_REASONS.map((reason) => (
                                            <option key={reason} value={reason}>
                                                {reason}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                                <label className="orders-return-label">
                                    Note
                                    <textarea
                                        value={returnNote}
                                        onChange={(event) => setReturnNote(event.target.value)}
                                        className="orders-return-textarea"
                                        placeholder="Share more details about the issue"
                                    />
                                </label>
                                {returnError && <p className="orders-return-error">{returnError}</p>}
                                <div className="orders-return-actions">
                                    <button type="button" className="orders-return-cancel" onClick={closeReturnModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="orders-return-submit" disabled={isSubmittingReturn}>
                                        {isSubmittingReturn ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {reviewOrder && reviewItem && (
                    <div className="orders-review-overlay" onClick={(e) => e.target === e.currentTarget && closeReviewModal()}>
                        <div className="orders-review-modal">
                            <div className="orders-review-header">
                                <div>
                                    <h3 className="orders-review-title">Write a Review</h3>
                                    <p className="orders-review-subtitle">{reviewItem.name}</p>
                                </div>
                                <button type="button" onClick={closeReviewModal} className="orders-review-close">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                            <form className="orders-review-form" onSubmit={handleSubmitReview}>
                                <div className="orders-review-stars">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            className={`orders-review-star ${reviewRating >= star ? 'is-active' : ''}`}
                                            onClick={() => setReviewRating(star)}
                                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                        >
                                            <Star 
                                                className="w-5 h-5" 
                                                fill={reviewRating >= star ? 'currentColor' : 'none'} 
                                            />
                                        </button>
                                    ))}
                                    <span className="orders-review-score">
                                        {reviewRating ? `${reviewRating}/5` : 'Tap to rate'}
                                    </span>
                                </div>

                                <label className="orders-review-label">
                                    Share your experience
                                    <textarea
                                        value={reviewComment}
                                        onChange={(event) => setReviewComment(event.target.value)}
                                        className="orders-review-textarea"
                                        placeholder="Tell us what you loved (or what we can improve)"
                                    />
                                </label>

                                <label className="orders-review-label">
                                    Add photos (optional)
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(event) => handleReviewImagesChange(event.target.files)}
                                        className="orders-review-file"
                                    />
                                    <span className="orders-review-hint">Up to 5 images. JPG/PNG recommended.</span>
                                    {reviewImages.length > 0 && (
                                        <div className="orders-review-preview">
                                            {reviewImages.map((file, index) => (
                                                <span key={`${file.name}-${index}`} className="orders-review-preview-chip">
                                                    {file.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {reviewUploadProgress !== null && (
                                        <div className="orders-review-progress-wrap">
                                            <div className="orders-review-progress-bar">
                                                <div 
                                                    className="orders-review-progress-fill" 
                                                    style={{ width: `${reviewUploadProgress}%` }}
                                                />
                                            </div>
                                            <span className="orders-review-progress-text">
                                                Uploading photos... {reviewUploadProgress}%
                                            </span>
                                        </div>
                                    )}
                                </label>

                                {reviewError && <p className="orders-review-error">{reviewError}</p>}

                                <div className="orders-review-actions">
                                    <button type="button" className="orders-review-cancel" onClick={closeReviewModal}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="orders-review-submit" disabled={isSubmittingReview}>
                                        {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                <Footer />
            </main>
        </>
    );
}

export default OrdersPage;
