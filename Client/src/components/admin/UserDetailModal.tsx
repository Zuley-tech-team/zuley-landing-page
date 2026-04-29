import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Calendar, MapPin, ShoppingBag, Clock, Loader2, ArrowRight } from 'lucide-react';
import { adminAPI } from '../../api/admin';
import { useNavigate } from 'react-router-dom';

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | null;
}

export function UserDetailModal({ isOpen, onClose, userId }: UserDetailModalProps) {
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && userId) {
            loadUserDetails();
        } else {
            setData(null);
            setError(null);
        }
    }, [isOpen, userId]);

    const loadUserDetails = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await adminAPI.getUserDetails(userId!);
            setData(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load user details');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price / 100);
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end bg-charcoal/40 backdrop-blur-sm transition-all">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={onClose} />
            
            <div className="relative w-full max-w-xl h-full bg-pearl shadow-2xl flex flex-col animate-slide-in-right overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-charcoal/10 bg-white">
                    <h2 className="font-heading text-xl font-bold text-charcoal flex items-center gap-2">
                        <User className="w-5 h-5 text-charcoal/60" /> User Profile
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-charcoal/5 transition-colors"
                    >
                        <X className="w-5 h-5 text-charcoal/60" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-charcoal/40">
                            <Loader2 className="w-8 h-8 animate-spin mb-4" />
                            <p className="font-body text-sm font-medium">Loading user details...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-error/10 text-error p-4 rounded-xl border border-error/20">
                            <p className="font-body text-sm font-medium">{error}</p>
                            <button onClick={loadUserDetails} className="mt-2 text-xs underline font-semibold">Try Again</button>
                        </div>
                    ) : data && data.user ? (
                        <>
                            {/* Header Card */}
                            <div className="bg-white p-6 rounded-2xl border border-charcoal/10 shadow-sm flex items-start gap-4">
                                <div className="w-16 h-16 bg-charcoal text-pearl rounded-full flex items-center justify-center font-heading text-2xl font-bold flex-shrink-0">
                                    {data.user.name ? data.user.name.slice(0, 2).toUpperCase() : data.user.email.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-heading text-xl font-bold text-charcoal truncate">
                                        {data.user.name || 'Anonymous User'}
                                    </h3>
                                    <div className="mt-2 space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-charcoal/60 font-body">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="truncate">{data.user.email}</span>
                                        </div>
                                        {data.user.phone && (
                                            <div className="flex items-center gap-2 text-sm text-charcoal/60 font-body">
                                                <Phone className="w-3.5 h-3.5" />
                                                <span>+91 {data.user.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-charcoal/60 font-body">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Joined {formatDate(data.user.created_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white p-4 rounded-xl border border-charcoal/10 shadow-sm">
                                    <p className="font-body text-xs font-semibold text-charcoal/50 uppercase tracking-wider mb-1">Total Orders</p>
                                    <p className="font-heading text-2xl font-bold text-charcoal">{data.order_count}</p>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-charcoal/10 shadow-sm">
                                    <p className="font-body text-xs font-semibold text-charcoal/50 uppercase tracking-wider mb-1">Total Spent</p>
                                    <p className="font-heading text-2xl font-bold text-success">{formatPrice(data.total_spent)}</p>
                                </div>
                            </div>

                            {/* Recent Shipping Address */}
                            <div className="bg-white p-6 rounded-2xl border border-charcoal/10 shadow-sm">
                                <h4 className="font-heading text-sm font-bold text-charcoal uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-charcoal/40" /> Most Recent Address
                                </h4>
                                {data.recent_address ? (
                                    <div className="font-body text-sm text-charcoal/80 space-y-1">
                                        <p className="font-semibold text-charcoal">{data.orders[0]?.customer_details?.name}</p>
                                        <p>{data.recent_address.line1}</p>
                                        {data.recent_address.line2 && <p>{data.recent_address.line2}</p>}
                                        <p>{data.recent_address.city}, {data.recent_address.state} {data.recent_address.pincode}</p>
                                        {data.orders[0]?.customer_details?.phone && (
                                            <p className="mt-2 text-charcoal/60">+91 {data.orders[0].customer_details.phone}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="font-body text-sm text-charcoal/40 italic">No address on file yet (No orders placed).</p>
                                )}
                            </div>

                            {/* Orders History */}
                            <div className="bg-white p-6 rounded-2xl border border-charcoal/10 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-heading text-sm font-bold text-charcoal uppercase tracking-wider flex items-center gap-2">
                                        <ShoppingBag className="w-4 h-4 text-charcoal/40" /> Order History
                                    </h4>
                                    {data.orders?.length > 0 && (
                                        <button 
                                            onClick={() => {
                                                navigate(`/admin/orders?search=${data.user.email}`);
                                                onClose();
                                            }}
                                            className="text-xs font-semibold text-charcoal/60 hover:text-charcoal flex items-center gap-1 transition-colors"
                                        >
                                            View in Orders <ArrowRight className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                
                                {data.orders?.length > 0 ? (
                                    <div className="space-y-3">
                                        {data.orders.slice(0, 3).map((order: any) => (
                                            <div key={order._id} className="flex items-center justify-between p-3 rounded-xl border border-charcoal/5 bg-charcoal/5 hover:bg-charcoal/10 transition-colors">
                                                <div>
                                                    <p className="font-body text-sm font-bold text-charcoal">{order.order_id}</p>
                                                    <p className="font-body text-xs text-charcoal/60">{formatDate(order.createdAt)}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-body text-sm font-bold text-charcoal">{formatPrice(order.total_amount)}</p>
                                                    <span className={`inline-block px-2 py-0.5 mt-1 text-[10px] uppercase tracking-wider font-bold rounded-sm ${
                                                        order.status === 'delivered' ? 'bg-success/20 text-success' :
                                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                        order.status === 'cancelled' ? 'bg-danger/20 text-danger' :
                                                        'bg-warning/20 text-warning-dark'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                        {data.orders.length > 3 && (
                                            <p className="text-center font-body text-xs text-charcoal/40 pt-2">
                                                + {data.orders.length - 3} more orders
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="font-body text-sm text-charcoal/40 italic">User hasn't placed any orders yet.</p>
                                )}
                            </div>

                            {/* Login History */}
                            <div className="bg-white p-6 rounded-2xl border border-charcoal/10 shadow-sm">
                                <h4 className="font-heading text-sm font-bold text-charcoal uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-charcoal/40" /> Login Log
                                </h4>
                                <div className="space-y-4 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                    {data.user.login_history && data.user.login_history.length > 0 ? (
                                        // Show latest first
                                        [...data.user.login_history].reverse().map((date: string, index: number) => (
                                            <div key={index} className="flex gap-4">
                                                <div className="relative flex flex-col items-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-success ring-4 ring-success/20 z-10" />
                                                    {index !== data.user.login_history.length - 1 && (
                                                        <div className="w-px h-full bg-charcoal/10 absolute top-2.5 bottom-[-16px]" />
                                                    )}
                                                </div>
                                                <div className="pb-4">
                                                    <p className="font-body text-sm font-semibold text-charcoal">Logged in</p>
                                                    <p className="font-body text-xs text-charcoal/60">{formatDate(date)}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="font-body text-sm text-charcoal/40 italic">No login history recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
