import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import {
    Search,
    Eye,
    Loader2,
    X,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    Download
} from 'lucide-react';

interface Order {
    _id: string;
    order_id: string;
    customer_details: {
        name: string;
        email: string;
        phone: string;
    };
    items: Array<{
        sku: string;
        name: string;
        quantity: number;
        price: number;
    }>;
    total_amount: number;
    items_count: number;
    status: string;
    payment_method?: 'razorpay' | 'cod';
    payment_status?: string;
    shipping_address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        pincode: string;
    };
    shipping_details?: {
        courier_name?: string;
        tracking_number?: string;
        tracking_url?: string;
    };
    history: Array<{
        status: string;
        changed_by: string;
        reason?: string;
        timestamp: string;
    }>;
    createdAt: string;
    invoice?: {
        invoiceNumber: string;
        totalAmount: number;
        status: string;
    } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    created: { label: 'Placed', color: 'bg-amber-100 text-amber-700', icon: Clock },
    paid: { label: 'Paid', color: 'bg-blue-100 text-blue-700', icon: Clock },
    shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-700', icon: Truck },
    delivered: { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: CheckCircle },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-700', icon: XCircle },
};

export function AdminOrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, total: 1, count: 0 });

    useEffect(() => {
        loadOrders();
    }, [statusFilter]);

    const loadOrders = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getOrders({
                page,
                limit: 20,
                status: statusFilter === 'All' ? undefined : statusFilter,
            });
            setOrders(response.data);
            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            loadOrders();
            return;
        }
        setIsLoading(true);
        try {
            const response = await adminAPI.getOrders({
                search: searchTerm,
                status: statusFilter === 'All' ? undefined : statusFilter,
            });
            setOrders(response.data);
            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string, note?: string) => {
        setIsUpdating(true);
        try {
            await adminAPI.updateOrderStatus(orderId, newStatus, note);
            loadOrders(pagination.current);
            if (selectedOrder?.order_id === orderId) {
                const response = await adminAPI.getOrder(orderId);
                setSelectedOrder(response.data);
            }
        } catch (error: any) {
            alert(error.message || 'Failed to update order status');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleShipOrder = async (
        orderId: string,
        courierName: string,
        trackingNumber: string,
        trackingUrl?: string,
        notes?: string
    ) => {
        setIsUpdating(true);
        try {
            const currentOrder = selectedOrder?.order_id === orderId ? selectedOrder : null;
            if (currentOrder?.status === 'shipped') {
                await adminAPI.updateShipment({ orderId, courierName, trackingNumber, trackingUrl, notes });
            } else {
                await adminAPI.shipOrder({ orderId, courierName, trackingNumber, trackingUrl, notes });
            }
            loadOrders(pagination.current);
            const response = await adminAPI.getOrder(orderId);
            setSelectedOrder(response.data);
        } catch (error: any) {
            alert(error.message || 'Failed to ship order');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleMarkDelivered = async (orderId: string, notes?: string) => {
        setIsUpdating(true);
        try {
            await adminAPI.markDelivered(orderId, notes);
            loadOrders(pagination.current);
            const response = await adminAPI.getOrder(orderId);
            setSelectedOrder(response.data);
        } catch (error: any) {
            alert(error.message || 'Failed to mark order as delivered');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOpenOrder = async (order: Order) => {
        setSelectedOrder(order);
        try {
            const response = await adminAPI.getOrder(order.order_id);
            setSelectedOrder(response.data);
        } catch (error) {
            console.error('Failed to load order details:', error);
        }
    };

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount / 100);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-heading text-2xl font-bold text-gray-900">Orders</h1>
                <p className="font-body text-gray-500">
                    {pagination.count} orders total
                </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by order ID, name, email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent"
                    >
                        <option value="All">All Status</option>
                        <option value="created">Placed</option>
                        <option value="paid">Paid</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                    </select>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        No orders found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.map((order) => {
                                    const config = statusConfig[order.status] || {
                                        label: order.status,
                                        color: 'bg-gray-100 text-gray-700',
                                        icon: Package,
                                    };
                                    const StatusIcon = config.icon;

                                    return (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="font-body font-medium text-gray-900">
                                                    {order.order_id}
                                                </p>
                                                <p className="font-body text-sm text-gray-500">
                                                    {order.items_count} item{order.items_count > 1 ? 's' : ''}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="font-body text-gray-900">
                                                    {order.customer_details.name}
                                                </p>
                                                <p className="font-body text-sm text-gray-500">
                                                    {order.customer_details.email}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="font-body font-semibold text-gray-900">
                                                    {formatPrice(order.total_amount)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
                                                >
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    {config.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="font-body text-sm text-gray-500">
                                                    {formatDate(order.createdAt)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleOpenOrder(order)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-charcoal hover:bg-gray-100 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {pagination.total > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            Page {pagination.current} of {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => loadOrders(pagination.current - 1)}
                                disabled={pagination.current === 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => loadOrders(pagination.current + 1)}
                                disabled={pagination.current === pagination.total}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdateStatus={handleUpdateStatus}
                    onShipOrder={handleShipOrder}
                    onMarkDelivered={handleMarkDelivered}
                    isUpdating={isUpdating}
                />
            )}
        </div>
    );
}

interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
    onUpdateStatus: (orderId: string, status: string, note?: string) => void;
    onShipOrder: (orderId: string, courierName: string, trackingNumber: string, trackingUrl?: string, notes?: string) => void;
    onMarkDelivered: (orderId: string, notes?: string) => void;
    isUpdating: boolean;
}

function OrderDetailModal({ order, onClose, onUpdateStatus, onShipOrder, onMarkDelivered, isUpdating }: OrderDetailModalProps) {
    const [newStatus, setNewStatus] = useState(order.status);
    const [statusNote, setStatusNote] = useState('');
    const [courierName, setCourierName] = useState(order.shipping_details?.courier_name || '');
    const [trackingNumber, setTrackingNumber] = useState(order.shipping_details?.tracking_number || '');
    const [trackingUrl, setTrackingUrl] = useState(order.shipping_details?.tracking_url || '');
    const [shippingNotes, setShippingNotes] = useState('');

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount / 100);
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleStatusUpdate = () => {
        if (newStatus !== order.status) {
            onUpdateStatus(order.order_id, newStatus, statusNote.trim() || undefined);
        }
    };

    const handleShipSubmit = () => {
        if (!courierName.trim() || !trackingNumber.trim()) {
            alert('Courier name and tracking number are required.');
            return;
        }

        onShipOrder(
            order.order_id,
            courierName.trim(),
            trackingNumber.trim(),
            trackingUrl.trim() || undefined,
            shippingNotes.trim() || undefined
        );
    };

    const config = statusConfig[order.status] || {
        label: order.status,
        color: 'bg-gray-100 text-gray-700',
        icon: Package,
    };
    const StatusIcon = config.icon;
    const invoiceUrl = adminAPI.getOrderInvoiceDownloadUrl(order.order_id);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                    <div>
                        <h2 className="font-heading text-xl font-bold text-gray-900">
                            Order {order.order_id}
                        </h2>
                        <p className="font-body text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Status & Actions */}
                    <div className="flex flex-wrap items-center gap-4">
                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${config.color}`}
                        >
                            <StatusIcon className="w-4 h-4" />
                            {config.label}
                        </span>

                        <div className="flex items-center gap-2 ml-auto">
	                            <select
	                                value={newStatus}
	                                onChange={(e) => setNewStatus(e.target.value)}
	                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-charcoal focus:border-transparent"
	                            >
	                                <option value="created">Placed</option>
	                                <option value="paid">Paid</option>
	                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="refunded">Refunded</option>
                            </select>
	                            <button
	                                onClick={handleStatusUpdate}
                                disabled={newStatus === order.status || isUpdating}
                                className="px-4 py-2 bg-charcoal text-white text-sm rounded-lg hover:bg-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed"
	                            >
	                                {isUpdating ? 'Updating...' : 'Update'}
	                            </button>
	                            <a
	                                href={invoiceUrl}
	                                target="_blank"
	                                rel="noreferrer"
	                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
	                            >
	                                <Download className="w-4 h-4" />
	                                Invoice
	                            </a>
	                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <h3 className="font-heading font-semibold text-gray-900 mb-3">
                                Customer
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="text-gray-500">Name:</span> {order.customer_details.name}</p>
                                <p><span className="text-gray-500">Email:</span> {order.customer_details.email}</p>
                                <p><span className="text-gray-500">Phone:</span> {order.customer_details.phone}</p>
                            </div>
                        </div>

	                        <div className="bg-gray-50 rounded-xl p-4">
	                            <h3 className="font-heading font-semibold text-gray-900 mb-3">
	                                Shipping Address
                            </h3>
                            <div className="text-sm text-gray-600">
                                <p>{order.shipping_address.line1}</p>
                                {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                                <p>
                                    {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}
	                                </p>
	                            </div>
	                        </div>

	                        <div className="bg-gray-50 rounded-xl p-4 md:col-span-2">
	                            <h3 className="font-heading font-semibold text-gray-900 mb-3">
	                                Payment
	                            </h3>
	                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
	                                <p><span className="text-gray-500">Method:</span> {order.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
	                                <p><span className="text-gray-500">Status:</span> {order.payment_status || order.status}</p>
	                                <p><span className="text-gray-500">Invoice:</span> {order.invoice?.invoiceNumber || 'Generated on download'}</p>
	                            </div>
	                        </div>
	                        <input
	                            value={statusNote}
	                            onChange={(event) => setStatusNote(event.target.value)}
	                            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-lg text-sm"
	                            placeholder="Status note (optional)"
	                        />
	                    </div>

	                    <div className="bg-gray-50 rounded-xl p-4">
	                        <h3 className="font-heading font-semibold text-gray-900 mb-3">
	                            Shipping
	                        </h3>
	                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
	                            <input
	                                value={courierName}
	                                onChange={(event) => setCourierName(event.target.value)}
	                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
	                                placeholder="Courier name"
	                            />
	                            <input
	                                value={trackingNumber}
	                                onChange={(event) => setTrackingNumber(event.target.value)}
	                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
	                                placeholder="Tracking number"
	                            />
	                            <input
	                                value={trackingUrl}
	                                onChange={(event) => setTrackingUrl(event.target.value)}
	                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm md:col-span-2"
	                                placeholder="Tracking URL (optional)"
	                            />
	                            <input
	                                value={shippingNotes}
	                                onChange={(event) => setShippingNotes(event.target.value)}
	                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm md:col-span-2"
	                                placeholder="Shipping notes (optional)"
	                            />
	                        </div>
	                        <button
	                            onClick={handleShipSubmit}
	                            disabled={isUpdating || order.status === 'delivered'}
	                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-charcoal text-white text-sm rounded-lg hover:bg-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed"
	                        >
	                            <Truck className="w-4 h-4" />
	                            {order.status === 'shipped' ? 'Update Shipment' : 'Mark Shipped'}
	                        </button>
	                        {order.status === 'shipped' && (
	                            <button
	                                onClick={() => onMarkDelivered(order.order_id, shippingNotes.trim() || undefined)}
	                                disabled={isUpdating}
	                                className="mt-3 ml-2 inline-flex items-center gap-2 px-4 py-2 border border-green-300 bg-green-50 text-green-700 text-sm rounded-lg hover:bg-green-100 disabled:opacity-50"
	                            >
	                                <CheckCircle className="w-4 h-4" />
	                                Mark Delivered
	                            </button>
	                        )}
	                    </div>

	                    {/* Items */}
                    <div>
                        <h3 className="font-heading font-semibold text-gray-900 mb-3">
                            Items ({order.items_count})
                        </h3>
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                            Product
                                        </th>
                                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">
                                            Qty
                                        </th>
                                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                            Price
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {order.items.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900">{item.name}</p>
                                                <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                                            </td>
                                            <td className="px-4 py-3 text-center text-gray-600">
                                                {item.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium text-gray-900">
                                                {formatPrice(item.price * item.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50">
                                    <tr>
                                        <td colSpan={2} className="px-4 py-3 text-right font-semibold text-gray-900">
                                            Total
                                        </td>
                                        <td className="px-4 py-3 text-right font-bold text-gray-900 text-lg">
                                            {formatPrice(order.total_amount)}
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>

                    {/* Order History */}
                    <div>
                        <h3 className="font-heading font-semibold text-gray-900 mb-3">
                            Order History
                        </h3>
                        <div className="space-y-3">
                            {order.history.map((event, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-3 text-sm"
                                >
                                    <div className="w-2 h-2 mt-1.5 rounded-full bg-gray-400" />
                                    <div className="flex-1">
                                        <p className="text-gray-900">
                                            <span className="font-medium capitalize">{event.status}</span>
                                            {event.reason && <span className="text-gray-500"> - {event.reason}</span>}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {event.changed_by} · {formatDate(event.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminOrdersPage;
