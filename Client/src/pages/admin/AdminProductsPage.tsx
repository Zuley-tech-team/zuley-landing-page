import { useState, useEffect } from 'react';
import { adminAPI } from '../../api/admin';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    EyeOff,
    Loader2,
    X,
    Save,
    Upload,
    Image as ImageIcon,
    Star,
    ArrowUp,
    ArrowDown,
    Trash
} from 'lucide-react';

interface Product {
    _id: string;
    sku: string;
    name: string;
    category: string;
    categoryLabel: string;
    price: number;
    originalPrice?: number;
    image: string;
    images?: string[];
    description: string;
    longDescription?: string;
    badge?: string;
    features?: string[];
    specifications?: Record<string, string>;
    isActive: boolean;
    createdAt: string;
}

type ProductFormPayload = Partial<Product> & {
    initialStock?: number;
    lowStockThreshold?: number;
};

export function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, total: 1, count: 0 });

    useEffect(() => {
        if (!isModalOpen) {
            return;
        }

        const previousBodyOverflow = document.body.style.overflow;
        const previousHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        return () => {
            document.body.style.overflow = previousBodyOverflow;
            document.documentElement.style.overflow = previousHtmlOverflow;
        };
    }, [isModalOpen]);

    useEffect(() => {
        loadProducts();
    }, [statusFilter]);

    const loadProducts = async (page = 1) => {
        setIsLoading(true);
        try {
            const response = await adminAPI.getProducts({
                page,
                limit: 20,
                status: statusFilter === 'all' ? undefined : statusFilter,
            });
            setProducts(response.data);
            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            loadProducts();
            return;
        }
        setIsLoading(true);
        try {
            const response = await adminAPI.getProducts({
                search: searchTerm,
                status: statusFilter === 'all' ? undefined : statusFilter,
            });
            setProducts(response.data);
            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleStatus = async (product: Product) => {
        try {
            await adminAPI.toggleProductStatus(product.sku);
            loadProducts(pagination.current);
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const handleDelete = async (product: Product) => {
        if (!confirm(`Are you sure you want to delete "${product.name}"?`)) return;
        try {
            await adminAPI.deleteProduct(product.sku);
            loadProducts(pagination.current);
        } catch (error) {
            console.error('Failed to delete product:', error);
        }
    };

    const handleSave = async (data: ProductFormPayload) => {
        setIsSaving(true);
        try {
            const sanitizedSku = typeof data.sku === 'string' ? data.sku.trim() : data.sku;
            const sanitizedName = typeof data.name === 'string' ? data.name.trim() : data.name;
            const sanitizedCategory = typeof data.category === 'string' ? data.category.trim() : data.category;
            const sanitizedDescription = typeof data.description === 'string' ? data.description.trim() : data.description;
            const sanitizedLongDescription = typeof data.longDescription === 'string' ? data.longDescription.trim() : data.longDescription;
            const sanitizedBadge = typeof data.badge === 'string' ? data.badge.trim() : data.badge;
            const normalizedImages = Array.from(
                new Set(
                    [data.image, ...(data.images || [])]
                        .filter((item): item is string => typeof item === 'string')
                        .map((item) => item.trim())
                        .filter((item) => item.length > 0)
                )
            );

            if (normalizedImages.length === 0) {
                alert('Upload at least one image first.');
                setIsSaving(false);
                return;
            }

            const payload = {
                ...data,
                sku: sanitizedSku,
                name: sanitizedName,
                category: sanitizedCategory,
                description: sanitizedDescription,
                longDescription: sanitizedLongDescription,
                badge: sanitizedBadge,
                image: normalizedImages[0],
                images: normalizedImages,
            };

            if (editingProduct?._id) {
                await adminAPI.updateProduct(editingProduct.sku.trim(), payload);
            } else {
                await adminAPI.createProduct(payload);
            }
            setIsModalOpen(false);
            setEditingProduct(null);
            loadProducts(pagination.current);
        } catch (error: any) {
            alert(error.message || 'Failed to save product');
        } finally {
            setIsSaving(false);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-gray-900">Products</h1>
                    <p className="font-body text-gray-500">
                        {pagination.count} products total
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
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

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        No products found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-12 h-12 rounded-lg object-cover"
                                                />
                                                <div>
                                                    <p className="font-body font-medium text-gray-900 whitespace-normal break-words max-w-xs">
                                                        {product.name}
                                                    </p>
                                                    <p className="font-body text-sm text-gray-500">
                                                        SKU: {product.sku}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                                                {product.categoryLabel}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="font-body font-semibold text-gray-900">
                                                {formatPrice(product.price)}
                                            </p>
                                            {product.originalPrice && (
                                                <p className="font-body text-sm text-gray-400 line-through">
                                                    {formatPrice(product.originalPrice)}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    product.isActive
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-gray-100 text-gray-600'
                                                }`}
                                            >
                                                <span
                                                    className={`w-1.5 h-1.5 rounded-full ${
                                                        product.isActive ? 'bg-green-500' : 'bg-gray-400'
                                                    }`}
                                                />
                                                {product.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(product)}
                                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title={product.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    {product.isActive ? (
                                                        <EyeOff className="w-4 h-4" />
                                                    ) : (
                                                        <Eye className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingProduct(product);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
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
                                onClick={() => loadProducts(pagination.current - 1)}
                                disabled={pagination.current === 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => loadProducts(pagination.current + 1)}
                                disabled={pagination.current === pagination.total}
                                className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Product Edit Modal */}
            {isModalOpen && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingProduct(null);
                    }}
                    onSave={handleSave}
                    isSaving={isSaving}
                />
            )}
        </div>
    );
}

interface ProductModalProps {
    product: Product | null;
    onClose: () => void;
    onSave: (data: ProductFormPayload) => void;
    isSaving: boolean;
}

function ProductModal({ product, onClose, onSave, isSaving }: ProductModalProps) {
    const initialImages = product?.images?.length
        ? product.images
        : product?.image
            ? [product.image]
            : [];

    const [formData, setFormData] = useState({
        sku: product?.sku || '',
        name: product?.name || '',
        category: product?.category || 'silver-pens',
        price: product?.price || 0,
        originalPrice: product?.originalPrice || 0,
        image: product?.image || '',
        images: initialImages,
        description: product?.description || '',
        longDescription: product?.longDescription || '',
        badge: product?.badge || '',
        initialStock: 0,
        lowStockThreshold: 5,
    });
    const [formError, setFormError] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<string | null>(null);
    const [featuresText, setFeaturesText] = useState((product?.features || []).join('\n'));
    const [specText, setSpecText] = useState(
        product?.specifications
            ? Object.entries(product.specifications)
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n')
            : ''
    );

    const previewImages = formData.images.length > 0
        ? formData.images
        : formData.image
            ? [formData.image]
            : [];

    const moveImage = (url: string, direction: 'up' | 'down') => {
        setFormData((current) => {
            const nextImages = [...current.images];
            const currentIndex = nextImages.indexOf(url);

            if (currentIndex === -1) {
                return current;
            }

            const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
            if (targetIndex < 0 || targetIndex >= nextImages.length) {
                return current;
            }

            [nextImages[currentIndex], nextImages[targetIndex]] = [nextImages[targetIndex], nextImages[currentIndex]];

            return {
                ...current,
                image: nextImages[0] || current.image,
                images: nextImages,
            };
        });
    };

    const handleUploadSelectedFiles = async () => {
        if (selectedFiles.length === 0) {
            setUploadMessage('Choose one or more files first.');
            return;
        }

        setIsUploadingImages(true);
        setUploadMessage(null);

        try {
            const response = await adminAPI.uploadProductImages(selectedFiles);
            const uploadedUrls = response.data.map((item) => item.url);

            setFormData((current) => {
                const mergedImages = Array.from(new Set([
                    ...current.images,
                    ...uploadedUrls,
                ].filter(Boolean)));

                return {
                    ...current,
                    image: current.image || mergedImages[0] || '',
                    images: mergedImages,
                };
            });
            setSelectedFiles([]);
            setUploadMessage(`${uploadedUrls.length} image(s) uploaded to Cloudinary.`);
        } catch (error: any) {
            setUploadMessage(error.message || 'Failed to upload images');
        } finally {
            setIsUploadingImages(false);
        }
    };

    const handleRemoveImage = (url: string) => {
        setFormData((current) => {
            const remainingImages = current.images.filter((item) => item !== url);
            const nextPrimary = current.image === url ? remainingImages[0] || '' : current.image;

            return {
                ...current,
                image: nextPrimary,
                images: remainingImages,
            };
        });
    };

    const handleSetPrimaryImage = (url: string) => {
        setFormData((current) => {
            const remainingImages = current.images.filter((item) => item !== url);
            return {
                ...current,
                image: url,
                images: [url, ...remainingImages],
            };
        });
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedFiles(Array.from(event.target.files || []));
        setUploadMessage(null);
    };

    const parseFeatures = () => {
        return featuresText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);
    };

    const parseSpecifications = () => {
        const entries = specText
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
            .map((line) => {
                const [key, ...rest] = line.split(':');
                return [key?.trim(), rest.join(':').trim()];
            })
            .filter(([key, value]) => Boolean(key) && Boolean(value));

        return Object.fromEntries(entries as Array<[string, string]>);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        const normalizedImages = Array.from(new Set([
            formData.image,
            ...formData.images,
        ].filter(Boolean)));

        if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{2,63}$/.test(formData.sku.trim())) {
            setFormError('SKU must be 3-64 characters and can use letters, numbers, hyphen, or underscore.');
            return;
        }

        if (Number(formData.price) <= 0) {
            setFormError('Price must be greater than zero.');
            return;
        }

        if (formData.originalPrice && Number(formData.originalPrice) <= Number(formData.price)) {
            setFormError('Original price should be higher than selling price.');
            return;
        }

        if (normalizedImages.length === 0) {
            setFormError('Upload at least one product image and set a primary image.');
            return;
        }

        if (!product && (Number(formData.initialStock) < 0 || Number(formData.lowStockThreshold) < 0)) {
            setFormError('Initial stock and low stock threshold cannot be negative.');
            return;
        }

        onSave({
            ...formData,
            price: Number(formData.price),
            originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
            initialStock: Number(formData.initialStock),
            lowStockThreshold: Number(formData.lowStockThreshold),
            image: normalizedImages[0] || formData.image,
            images: normalizedImages,
            features: parseFeatures(),
            specifications: parseSpecifications(),
            categoryLabel: formData.category
                .split('-')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' '),
        });
    };

    return (
        <div className="fixed inset-0 z-50">
            <button
                type="button"
                aria-label="Close product editor"
                onClick={onClose}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <aside className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white shadow-2xl flex flex-col">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
                    <h2 className="font-heading text-xl font-bold text-gray-900">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {formError && (
                        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {formError}
                        </div>
                    )}

                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">SKU *</label>
                            <input
                                type="text"
                                value={formData.sku}
                                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                disabled={!!product}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent disabled:bg-gray-100"
                                placeholder="pen-001"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent"
                            >
                                <option value="silver-pens">Silver Pens</option>
                            </select>
                        </div>
                    </section>

                    <section>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent"
                            placeholder="Executive Signature Pen"
                        />
                    </section>

                    <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (INR) *</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                required
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Original Price</label>
                            <input
                                type="number"
                                value={formData.originalPrice}
                                onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Badge</label>
                            <select
                                value={formData.badge}
                                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent"
                            >
                                <option value="">None</option>
                                <option value="Bestseller">Bestseller</option>
                                <option value="New">New</option>
                                <option value="Limited Edition">Limited Edition</option>
                            </select>
                        </div>
                    </section>

                    <section className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 space-y-4">
                        <div>
                            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                                <Upload className="w-4 h-4" /> Upload Product Images
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-charcoal file:px-4 file:py-2 file:text-white hover:file:bg-charcoal/90"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Upload multiple files and they will be stored in Cloudinary.
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={handleUploadSelectedFiles}
                                disabled={isUploadingImages || selectedFiles.length === 0}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors disabled:opacity-50"
                            >
                                {isUploadingImages ? 'Uploading...' : 'Upload Selected Images'}
                            </button>
                            {selectedFiles.length > 0 && (
                                <span className="inline-flex items-center px-3 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600">
                                    {selectedFiles.length} file(s) selected
                                </span>
                            )}
                        </div>

                        {uploadMessage && <p className="text-sm text-gray-600">{uploadMessage}</p>}

                        {previewImages.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <ImageIcon className="w-4 h-4" />
                                    Gallery Preview
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {previewImages.map((imageUrl, index) => (
                                        <div key={`${imageUrl}-${index}`} className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                                            <img
                                                src={imageUrl}
                                                alt={`Product preview ${index + 1}`}
                                                className="h-36 w-full object-cover"
                                            />
                                            <div className="flex items-center justify-between gap-2 p-3">
                                                <div className="min-w-0">
                                                    <p className="font-body text-sm font-medium text-gray-900 truncate">
                                                        {index === 0 ? 'Primary image' : `Carousel image ${index}`}
                                                    </p>
                                                    <p className="font-body text-xs text-gray-500 truncate">Cloudinary</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => moveImage(imageUrl, 'up')}
                                                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                                                            title="Move up"
                                                        >
                                                            <ArrowUp className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {index < previewImages.length - 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => moveImage(imageUrl, 'down')}
                                                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                                                            title="Move down"
                                                        >
                                                            <ArrowDown className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {index !== 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleSetPrimaryImage(imageUrl)}
                                                            className="p-2 rounded-lg hover:bg-amber-50 text-amber-700"
                                                            title="Make primary"
                                                        >
                                                            <Star className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveImage(imageUrl)}
                                                        className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                                                        title="Remove image"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500">
                                    The first image is used as the primary product image. You can upload more, reorder, or remove them here.
                                </p>
                            </div>
                        )}
                    </section>

                    <section>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Short Description *</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent resize-none"
                        />
                    </section>

                    <section>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Long Description</label>
                        <textarea
                            value={formData.longDescription}
                            onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                            rows={5}
                            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent resize-none"
                        />
                    </section>

                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Features</label>
                            <textarea
                                value={featuresText}
                                onChange={(e) => setFeaturesText(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent resize-none"
                                placeholder="One feature per line"
                            />
                            <p className="mt-1 text-xs text-gray-500">Use one feature per line.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Specifications</label>
                            <textarea
                                value={specText}
                                onChange={(e) => setSpecText(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent resize-none"
                                placeholder="material: silver coating"
                            />
                            <p className="mt-1 text-xs text-gray-500">Use key: value on each line.</p>
                        </div>
                    </section>

                    {!product && (
                        <section className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Initial Stock</label>
                                <input
                                    type="number"
                                    value={formData.initialStock}
                                    onChange={(e) => setFormData({ ...formData, initialStock: Number(e.target.value) })}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Low Stock Alert</label>
                                <input
                                    type="number"
                                    value={formData.lowStockThreshold}
                                    onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number(e.target.value) })}
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent"
                                />
                            </div>
                        </section>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white rounded-xl hover:bg-charcoal/90 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Product
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </aside>
        </div>
    );
}

export default AdminProductsPage;
