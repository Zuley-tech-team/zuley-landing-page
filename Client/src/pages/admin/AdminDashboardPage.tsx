import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import {
    Package,
    ShoppingCart,
    Warehouse,
    IndianRupee,
    AlertTriangle,
    TrendingUp,
    Loader2,
    Inbox
} from 'lucide-react';

interface DashboardStats {
    products: { total: number };
    orders: { total: number; pending: number; shipped: number; delivered: number };
    revenue: number;
    lowStockAlerts: Array<{ sku: string; quantity: number; threshold: number }>;
    recentOrders: Array<{
        order_id: string;
        total_amount: number;
        status: string;
        createdAt: string;
        customer_details?: { name?: string };
    }>;
}

export function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const response = await adminAPI.getDashboardStats();
            setStats(response.data);
        } catch (err: any) {
            setError(err.message || 'Failed to load dashboard stats');
        } finally {
            setIsLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-red-600">{error}</p>
                <button
                    onClick={loadStats}
                    className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                    Retry
                </button>
            </div>
        );
    }

    const statCards = [
        {
            title: 'Total Products',
            value: stats?.products.total || 0,
            subtitle: 'Live catalog items',
            icon: Package,
            color: 'bg-blue-500',
            link: '/admin/products',
        },
        {
            title: 'Total Orders',
            value: stats?.orders.total || 0,
            subtitle: `${stats?.orders.pending || 0} pending fulfillment`,
            icon: ShoppingCart,
            color: 'bg-green-500',
            link: '/admin/orders',
        },
        {
            title: 'Total Revenue',
            value: formatCurrency(stats?.revenue || 0),
            subtitle: 'All time',
            icon: IndianRupee,
            color: 'bg-purple-500',
            link: '/admin/orders',
        },
        {
            title: 'Inventory Alerts',
            value: stats?.lowStockAlerts.length || 0,
            subtitle: 'Low stock SKUs',
            icon: Warehouse,
            color: (stats?.lowStockAlerts.length || 0) > 0 ? 'bg-red-500' : 'bg-orange-500',
            link: '/admin/inventory',
        },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="font-heading text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="font-body text-gray-500">Overview of your store</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((card, index) => (
                    <Link
                        key={index}
                        to={card.link}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="font-body text-sm text-gray-500">{card.title}</p>
                                <p className="font-heading text-2xl font-bold text-gray-900 mt-1">
                                    {card.value}
                                </p>
                                <p className="font-body text-xs text-gray-400 mt-1">
                                    {card.subtitle}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl ${card.color}`}>
                                <card.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="font-heading text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Link
                        to="/admin/products"
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <Package className="w-5 h-5 text-blue-500" />
                        <span className="font-body text-gray-700">Add New Product</span>
                    </Link>
                    <Link
                        to="/admin/orders"
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <ShoppingCart className="w-5 h-5 text-green-500" />
                        <span className="font-body text-gray-700">View Orders</span>
                    </Link>
                    <Link
                        to="/admin/inventory"
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <Warehouse className="w-5 h-5 text-orange-500" />
                        <span className="font-body text-gray-700">Manage Stock</span>
                    </Link>
                    <Link
                        to="/admin/leads"
                        className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <Inbox className="w-5 h-5 text-purple-500" />
                        <span className="font-body text-gray-700">Review Leads</span>
                    </Link>
                </div>
            </div>

            {/* Alerts Section */}
            {(stats?.lowStockAlerts.length || 0) > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        <h2 className="font-heading text-lg font-semibold text-yellow-800">
                            Inventory Alerts
                        </h2>
                    </div>
                    <div className="space-y-2 text-yellow-700">
                        {stats?.lowStockAlerts.slice(0, 4).map((alert) => (
                            <p key={alert.sku} className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-orange-500" />
                                {alert.sku}: {alert.quantity} left (threshold {alert.threshold})
                            </p>
                        ))}
                    </div>
                    <Link
                        to="/admin/inventory?status=low_stock"
                        className="inline-block mt-4 text-sm text-yellow-700 hover:text-yellow-800 font-medium"
                    >
                        View inventory alerts →
                    </Link>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-gray-400" />
                    <h2 className="font-heading text-lg font-semibold text-gray-900">
                        Recent Orders
                    </h2>
                </div>
                {stats?.recentOrders.length ? (
                    <div className="space-y-3">
                        {stats.recentOrders.map((order) => (
                            <div
                                key={order.order_id}
                                className="flex items-center justify-between rounded-xl bg-gray-50 px-4 py-3"
                            >
                                <div>
                                    <p className="font-body font-medium text-gray-900">{order.order_id}</p>
                                    <p className="font-body text-sm text-gray-500">
                                        {order.customer_details?.name || 'Customer'} • {order.status}
                                    </p>
                                </div>
                                <p className="font-body font-semibold text-gray-900">
                                    {formatCurrency(order.total_amount / 100)}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-400">
                        <p>Recent orders will appear here once checkout starts generating sales.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboardPage;
