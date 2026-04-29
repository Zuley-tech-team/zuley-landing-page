import { useEffect, useState } from 'react';
import { Search, Loader2, Package, AlertTriangle, Save } from 'lucide-react';
import { adminAPI } from '../../api/admin';

interface InventoryItem {
    _id?: string;
    sku: string;
    quantity: number;
    reserved: number;
    low_stock_threshold: number;
    last_updated?: string;
}

export function AdminInventoryPage() {
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [editingSku, setEditingSku] = useState<string | null>(null);
    const [draftQuantity, setDraftQuantity] = useState('');
    const [draftThreshold, setDraftThreshold] = useState('');
    const [pagination, setPagination] = useState({ current: 1, total: 1, count: 0 });

    useEffect(() => {
        loadInventory();
    }, [statusFilter]);

    async function loadInventory(page = 1) {
        setIsLoading(true);
        try {
            const response = await adminAPI.getInventory({
                page,
                limit: 20,
                search: searchTerm || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
            });

            setItems(response.data);
            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Failed to load inventory:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSave(item: InventoryItem) {
        const nextQuantity = Number(draftQuantity);
        if (Number.isNaN(nextQuantity) || nextQuantity < 0) {
            return;
        }
        const nextThreshold = Number(draftThreshold);
        if (Number.isNaN(nextThreshold) || nextThreshold < 0) {
            return;
        }

        try {
            await adminAPI.updateStock(item.sku, nextQuantity, 'Admin panel update', nextThreshold);
            setEditingSku(null);
            setDraftQuantity('');
            setDraftThreshold('');
            loadInventory(pagination.current);
        } catch (error) {
            console.error('Failed to update stock:', error);
        }
    }

    const lowStockCount = items.filter(
        (item) => item.quantity > 0 && item.quantity <= item.low_stock_threshold
    ).length;
    const outOfStockCount = items.filter((item) => item.quantity <= 0).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-2xl font-bold text-gray-900">Inventory</h1>
                <p className="font-body text-gray-500">
                    {pagination.count} SKUs tracked
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                    <p className="font-body text-sm text-gray-500">Tracked SKUs</p>
                    <p className="mt-2 font-heading text-2xl font-bold text-gray-900">
                        {pagination.count}
                    </p>
                </div>
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-5">
                    <p className="font-body text-sm text-orange-700">Low stock</p>
                    <p className="mt-2 font-heading text-2xl font-bold text-orange-900">
                        {lowStockCount}
                    </p>
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-5">
                    <p className="font-body text-sm text-red-700">Out of stock</p>
                    <p className="mt-2 font-heading text-2xl font-bold text-red-900">
                        {outOfStockCount}
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by SKU..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && loadInventory()}
                            className="w-full rounded-xl border border-gray-300 py-2 pl-10 pr-4 focus:border-transparent focus:ring-2 focus:ring-charcoal"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-xl border border-gray-300 px-4 py-2 focus:border-transparent focus:ring-2 focus:ring-charcoal"
                    >
                        <option value="all">All Stock</option>
                        <option value="low_stock">Low Stock</option>
                        <option value="out_of_stock">Out of Stock</option>
                    </select>
                </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">No inventory records found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        SKU
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Available
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Reserved
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Threshold
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {items.map((item) => {
                                    const isLow = item.quantity > 0 && item.quantity <= item.low_stock_threshold;
                                    const isOut = item.quantity <= 0;

                                    return (
                                        <tr key={item.sku} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="rounded-lg bg-gray-100 p-2">
                                                        <Package className="h-4 w-4 text-gray-500" />
                                                    </div>
                                                    <span className="font-body font-medium text-gray-900">
                                                        {item.sku}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-900">
                                                {editingSku === item.sku ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={draftQuantity}
                                                        onChange={(e) => setDraftQuantity(e.target.value)}
                                                        className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 focus:border-transparent focus:ring-2 focus:ring-charcoal"
                                                    />
                                                ) : (
                                                    item.quantity
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">{item.reserved}</td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {editingSku === item.sku ? (
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={draftThreshold}
                                                        onChange={(e) => setDraftThreshold(e.target.value)}
                                                        className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 focus:border-transparent focus:ring-2 focus:ring-charcoal"
                                                    />
                                                ) : (
                                                    item.low_stock_threshold
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium ${
                                                        isOut
                                                            ? 'bg-red-100 text-red-700'
                                                            : isLow
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : 'bg-green-100 text-green-700'
                                                    }`}
                                                >
                                                    {(isOut || isLow) && <AlertTriangle className="h-3.5 w-3.5" />}
                                                    {isOut ? 'Out of stock' : isLow ? 'Low stock' : 'Healthy'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {editingSku === item.sku ? (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingSku(null);
                                                                setDraftQuantity('');
                                                                setDraftThreshold('');
                                                            }}
                                                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleSave(item)}
                                                            className="inline-flex items-center gap-2 rounded-lg bg-charcoal px-3 py-1.5 text-sm text-white hover:bg-charcoal/90"
                                                        >
                                                            <Save className="h-4 w-4" />
                                                            Save
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setEditingSku(item.sku);
                                                            setDraftQuantity(String(item.quantity));
                                                            setDraftThreshold(String(item.low_stock_threshold));
                                                        }}
                                                        className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Update stock
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {pagination.total > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                        <p className="text-sm text-gray-500">
                            Page {pagination.current} of {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => loadInventory(pagination.current - 1)}
                                disabled={pagination.current === 1}
                                className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => loadInventory(pagination.current + 1)}
                                disabled={pagination.current === pagination.total}
                                className="rounded-lg border border-gray-300 px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
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

export default AdminInventoryPage;
