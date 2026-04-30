import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    Warehouse,
    Inbox,
    LogOut,
    Menu,
    X,
    Loader2
} from 'lucide-react';
import { useEffect, useState } from 'react';

const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { to: '/admin/inventory', icon: Warehouse, label: 'Inventory' },
    { to: '/admin/leads', icon: Inbox, label: 'Leads' },
];

export function AdminLayout() {
    const { admin, logout, isLoading } = useAdmin();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
        const previousHref = favicon?.href || '/favicon.svg';

        document.title = 'ADMIN | Zuley';

        if (favicon) {
            favicon.href = '/admin-favicon.svg';
        }

        return () => {
            if (favicon) {
                favicon.href = previousHref;
            }
        };
    }, []);

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full w-64 bg-charcoal text-white transform transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                    <h1 className="font-heading text-xl font-bold">Zuley Admin</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 hover:bg-white/10 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    isActive
                                        ? 'bg-white/20 text-white'
                                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }`
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-body">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                            <span className="font-heading font-bold text-lg">
                                {admin?.name?.charAt(0) || 'A'}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-body text-sm font-medium truncate">
                                {admin?.name || 'Admin'}
                            </p>
                            <p className="font-body text-xs text-white/60 truncate">
                                {admin?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-white/70 hover:bg-white/10 hover:text-white rounded-lg transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-body">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:ml-64">
                {/* Top bar */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
                    <div className="flex items-center justify-between px-4 py-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex-1" />
                        <div className="text-sm text-gray-500">
                            Welcome, {admin?.name}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
