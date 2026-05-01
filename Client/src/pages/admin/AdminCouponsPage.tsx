import { useEffect, useState } from 'react';
import { adminAPI } from '../../api/admin';
import { Plus, Search, Edit2, Loader2, X, TicketPercent, Eye, EyeOff } from 'lucide-react';

interface Coupon {
    _id: string;
    code: string;
    name: string;
    description?: string;
    discount_type: 'percentage' | 'flat';
    discount_value: number;
    min_order_value?: number;
    max_discount?: number;
    applies_to_all: boolean;
    applicable_skus: string[];
    is_active: boolean;
    is_visible: boolean;
    usage_limit?: number;
    usage_count?: number;
    starts_at?: string;
    ends_at?: string;
}

interface ProductOption {
    sku: string;
    name: string;
}

type CouponFormState = {
    code: string;
    name: string;
    description: string;
    discount_type: 'percentage' | 'flat';
    discount_value: string;
    min_order_value: string;
    max_discount: string;
    applies_to_all: boolean;
    applicable_skus: string[];
    is_active: boolean;
    is_visible: boolean;
    usage_limit: string;
    starts_at: string;
    ends_at: string;
};

const emptyForm: CouponFormState = {
    code: '',
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '',
    max_discount: '',
    applies_to_all: true,
    applicable_skus: [],
    is_active: true,
    is_visible: false,
    usage_limit: '',
    starts_at: '',
    ends_at: '',
};

export function AdminCouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [products, setProducts] = useState<ProductOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [formState, setFormState] = useState<CouponFormState>(emptyForm);
    const [pagination, setPagination] = useState({ current: 1, total: 1, count: 0 });

    useEffect(() => {
        loadCoupons();
    }, [statusFilter]);

    useEffect(() => {
        if (!isModalOpen) {
            return;
        }

        const previousBodyOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousBodyOverflow;
        };
    }, [isModalOpen]);

    const loadCoupons = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getCoupons({
                page,
                limit: 20,
                status: statusFilter === 'all' ? undefined : statusFilter,
            });
            setCoupons(response.data || []);
            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Failed to load coupons:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const response = await adminAPI.getProducts({ page: 1, limit: 200, status: 'active' });
            const list = (response.data || []).map((item: any) => ({ sku: item.sku, name: item.name }));
            setProducts(list);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            loadCoupons();
            return;
        }
        setIsLoading(true);
        try {
            const response = await adminAPI.getCoupons({
                search: searchTerm,
                status: statusFilter === 'all' ? undefined : statusFilter,
            });
            setCoupons(response.data || []);
            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = async () => {
        setEditingCoupon(null);
        setFormState(emptyForm);
        await loadProducts();
        setIsModalOpen(true);
    };

    const openEditModal = async (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormState({
            code: coupon.code,
            name: coupon.name,
            description: coupon.description || '',
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_type === 'flat'
                ? String((coupon.discount_value || 0) / 100)
                : String(coupon.discount_value || ''),
            min_order_value: coupon.min_order_value ? String(coupon.min_order_value / 100) : '',
            max_discount: coupon.max_discount ? String(coupon.max_discount / 100) : '',
            applies_to_all: coupon.applies_to_all,
            applicable_skus: coupon.applicable_skus || [],
            is_active: coupon.is_active,
            is_visible: coupon.is_visible,
            usage_limit: coupon.usage_limit ? String(coupon.usage_limit) : '',
            starts_at: coupon.starts_at ? coupon.starts_at.split('T')[0] : '',
            ends_at: coupon.ends_at ? coupon.ends_at.split('T')[0] : '',
        });
        await loadProducts();
        setIsModalOpen(true);
    };

    const formatDiscount = (coupon: Coupon) => {
        if (coupon.discount_type === 'percentage') {
            return `${coupon.discount_value}% off`;
        }
        return `₹${Math.round((coupon.discount_value || 0) / 100)} off`;
    };

    const formatCurrency = (value?: number) => {
        if (!value) return '-';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(value / 100);
    };

    const toggleSku = (sku: string) => {
        setFormState((prev) => {
            if (prev.applicable_skus.includes(sku)) {
                return { ...prev, applicable_skus: prev.applicable_skus.filter((item) => item !== sku) };
            }
            return { ...prev, applicable_skus: [...prev.applicable_skus, sku] };
        });
    };

    const handleSave = async () => {
        if (!formState.code.trim() || !formState.name.trim()) {
            alert('Coupon code and name are required.');
            return;
        }

        if (!formState.discount_value.trim()) {
            alert('Discount value is required.');
            return;
        }

        const isFlat = formState.discount_type === 'flat';
        const discountValue = isFlat
            ? Math.round(Number(formState.discount_value) * 100)
            : Number(formState.discount_value);

        const payload = {
            code: formState.code.trim().toUpperCase(),
            name: formState.name.trim(),
            description: formState.description.trim() || undefined,
            discount_type: formState.discount_type,
            discount_value: discountValue,
            min_order_value: formState.min_order_value ? Math.round(Number(formState.min_order_value) * 100) : 0,
            max_discount: formState.max_discount ? Math.round(Number(formState.max_discount) * 100) : undefined,
            applies_to_all: formState.applies_to_all,
            applicable_skus: formState.applies_to_all ? [] : formState.applicable_skus,
            is_active: formState.is_active,
            is_visible: formState.is_visible,
            usage_limit: formState.usage_limit ? Number(formState.usage_limit) : 0,
            starts_at: formState.starts_at || undefined,
            ends_at: formState.ends_at || undefined,
        };

        setIsSaving(true);
        try {
            if (editingCoupon) {
                await adminAPI.updateCoupon(editingCoupon._id, payload);
            } else {
                await adminAPI.createCoupon(payload);
            }
            setIsModalOpen(false);
            setEditingCoupon(null);
            loadCoupons(pagination.current);
        } catch (error: any) {
            alert(error.message || 'Failed to save coupon');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-gray-900">Coupons</h1>
                    <p className="font-body text-gray-500">{pagination.count} coupons total</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Create Coupon
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by code or name..."
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
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : coupons.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">No coupons found</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applies To</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min Order</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visible</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {coupons.map((coupon) => (
                                    <tr key={coupon._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <TicketPercent className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="font-body font-semibold text-gray-900">{coupon.code}</p>
                                                    <p className="font-body text-xs text-gray-500">{coupon.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {formatDiscount(coupon)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {coupon.applies_to_all ? 'All Products' : `${coupon.applicable_skus.length} products`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {formatCurrency(coupon.min_order_value)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${coupon.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                                {coupon.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 text-sm ${coupon.is_visible ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                {coupon.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                {coupon.is_visible ? 'Shown' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                onClick={() => openEditModal(coupon)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-charcoal hover:bg-gray-100 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {pagination.total > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            Page {pagination.current} of {pagination.total}
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => loadCoupons(pagination.current - 1)}
                                disabled={pagination.current === 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => loadCoupons(pagination.current + 1)}
                                disabled={pagination.current === pagination.total}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 z-30 bg-white">
                            <div>
                                <h2 className="font-heading text-xl font-bold text-gray-900">
                                    {editingCoupon ? 'Edit Coupon' : 'Create Coupon'}
                                </h2>
                                <p className="font-body text-sm text-gray-500">
                                    {editingCoupon ? 'Update coupon details and visibility.' : 'Add a new discount code for customers.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Coupon Code</label>
                                    <input
                                        value={formState.code}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, code: e.target.value }))}
                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="ZULEY10"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Coupon Name</label>
                                    <input
                                        value={formState.name}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, name: e.target.value }))}
                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Welcome Offer"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Description</label>
                                    <input
                                        value={formState.description}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, description: e.target.value }))}
                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Shown to customers on product page"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Discount Type</label>
                                    <select
                                        value={formState.discount_type}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, discount_type: e.target.value as 'percentage' | 'flat' }))}
                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="percentage">Percentage</option>
                                        <option value="flat">Flat (INR)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Discount Value</label>
                                    <input
                                        value={formState.discount_value}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, discount_value: e.target.value }))}
                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder={formState.discount_type === 'percentage' ? '10' : '500'}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Max Discount (INR)</label>
                                    <input
                                        value={formState.max_discount}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, max_discount: e.target.value }))}
                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Min Order (INR)</label>
                                    <input
                                        value={formState.min_order_value}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, min_order_value: e.target.value }))}
                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Usage Limit</label>
                                    <input
                                        value={formState.usage_limit}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, usage_limit: e.target.value }))}
                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        placeholder="0 = unlimited"
                                    />
                                </div>
                                <div className="flex items-center gap-3 mt-7">
                                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={formState.is_active}
                                            onChange={(e) => setFormState((prev) => ({ ...prev, is_active: e.target.checked }))}
                                        />
                                        Active
                                    </label>
                                    <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                                        <input
                                            type="checkbox"
                                            checked={formState.is_visible}
                                            onChange={(e) => setFormState((prev) => ({ ...prev, is_visible: e.target.checked }))}
                                        />
                                        Show to customers
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        value={formState.starts_at}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, starts_at: e.target.value }))}
                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">End Date</label>
                                    <input
                                        type="date"
                                        value={formState.ends_at}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, ends_at: e.target.value }))}
                                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>

                            <div className="rounded-xl border border-gray-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-heading font-semibold text-gray-900">Applies to all products</p>
                                        <p className="text-sm text-gray-500">Disable to select specific products.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={formState.applies_to_all}
                                        onChange={(e) => setFormState((prev) => ({ ...prev, applies_to_all: e.target.checked }))}
                                    />
                                </div>

                                {!formState.applies_to_all && (
                                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto border border-gray-100 rounded-lg p-3">
                                        {products.map((product) => (
                                            <label key={product.sku} className="flex items-center gap-2 text-sm text-gray-700">
                                                <input
                                                    type="checkbox"
                                                    checked={formState.applicable_skus.includes(product.sku)}
                                                    onChange={() => toggleSku(product.sku)}
                                                />
                                                <span className="truncate">{product.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-4 py-2 bg-charcoal text-white text-sm rounded-lg hover:bg-charcoal/90 disabled:opacity-50"
                            >
                                {isSaving ? 'Saving...' : 'Save Coupon'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminCouponsPage;
