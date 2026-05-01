import { useEffect, useState } from 'react';
import { Star, Search, Loader2, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import { adminAPI, type Pagination } from '../../api/admin';

interface ReviewItem {
    _id: string;
    order_id: string;
    product_sku: string;
    product_name: string;
    product_image?: string;
    customer_name: string;
    customer_email: string;
    customer_city?: string;
    rating: number;
    comment: string;
    images?: Array<{ url: string; public_id: string }>;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
}

const statusStyles: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
};

export function AdminReviewsPage() {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState('');
    const [pagination, setPagination] = useState<Pagination>({ current: 1, total: 1, count: 0 });

    useEffect(() => {
        loadReviews(1);
    }, [statusFilter]);

    const loadReviews = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getReviews({
                page,
                limit: 20,
                status: statusFilter === 'all' ? undefined : statusFilter,
                search: searchTerm || undefined,
            });
            setReviews(response.data);
            setPagination(response.pagination || { current: 1, total: 1, count: response.data.length });
        } catch (error) {
            console.error('Failed to load reviews:', error);
            setReviews([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setIsUpdating(id);
        try {
            await adminAPI.approveReview(id);
            await loadReviews(pagination.current);
        } catch (error: any) {
            alert(error.message || 'Failed to approve review');
        } finally {
            setIsUpdating('');
        }
    };

    const handleReject = async (id: string) => {
        setIsUpdating(id);
        try {
            await adminAPI.rejectReview(id);
            await loadReviews(pagination.current);
        } catch (error: any) {
            alert(error.message || 'Failed to reject review');
        } finally {
            setIsUpdating('');
        }
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-2xl font-bold text-gray-900">Reviews</h1>
                <p className="font-body text-gray-500">Approve or reject customer product reviews</p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            onKeyDown={(event) => event.key === 'Enter' && loadReviews(1)}
                            placeholder="Search by order, product, or customer..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent"
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                        <option value="all">All</option>
                    </select>
                    <button
                        onClick={() => loadReviews(1)}
                        className="px-4 py-2 bg-charcoal text-white rounded-xl hover:bg-charcoal/90"
                    >
                        Search
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">No reviews found</div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {reviews.map((review) => (
                            <div key={review._id} className="p-6 space-y-4">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[review.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {review.status}
                                            </span>
                                            <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                                        </div>
                                        <h3 className="font-heading text-lg font-semibold text-gray-900 mt-2">{review.product_name}</h3>
                                        <p className="text-sm text-gray-500">Order {review.order_id} · {review.product_sku}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-amber-500' : 'text-gray-200'}`} fill={star <= review.rating ? 'currentColor' : 'none'} />
                                        ))}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>

                                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                                    <span className="font-medium text-gray-900">{review.customer_name}</span>
                                    <span>{review.customer_email}</span>
                                    {review.customer_city && <span>{review.customer_city}</span>}
                                </div>

                                {review.images?.length ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        {review.images.map((image) => (
                                            <img
                                                key={image.public_id}
                                                src={image.url}
                                                alt={review.product_name}
                                                className="h-24 w-full rounded-lg object-cover"
                                                loading="lazy"
                                            />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs text-gray-400">
                                        <ImageIcon className="w-4 h-4" />
                                        No images attached
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleApprove(review._id)}
                                        disabled={isUpdating === review._id || review.status === 'approved'}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50"
                                    >
                                        <CheckCircle className="w-4 h-4" />
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleReject(review._id)}
                                        disabled={isUpdating === review._id || review.status === 'rejected'}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 disabled:opacity-50"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {pagination.total > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                        <p className="text-sm text-gray-500">Page {pagination.current} of {pagination.total}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => loadReviews(pagination.current - 1)}
                                disabled={pagination.current === 1}
                                className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => loadReviews(pagination.current + 1)}
                                disabled={pagination.current === pagination.total}
                                className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminReviewsPage;
