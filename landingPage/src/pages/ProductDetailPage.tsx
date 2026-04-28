import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navbar } from '../components/common';
import { Footer } from '../components/home';
import { ProductsGrid } from '../components/products';
import { CheckoutModal } from '../components/checkout';
import { fetchProductBySku, fetchRelatedProducts, type Product } from '../api/products';
import { ChevronRight, Check, ShoppingCart, ArrowLeft, Loader2, Star, X, Sparkles } from 'lucide-react';
import { Button } from '../components/common';
import { useStockStatus } from '../hooks/useStockStatus';
import { useToast } from '../contexts/ToastContext';

const staticReviews = [
    {
        name: 'Priya Sharma',
        rating: 5,
        comment: 'Exceptional finishing and smooth daily use. Engraving looked premium and precise.',
    },
    {
        name: 'Amit Verma',
        rating: 5,
        comment: 'Gifted this for an anniversary and it felt truly meaningful. Packaging was impressive.',
    },
    {
        name: 'Ritika Mehta',
        rating: 4,
        comment: 'Elegant design and good weight balance. Would definitely recommend for corporate gifting.',
    },
];

export function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    const [engravingText, setEngravingText] = useState('');
    const [engravingFont, setEngravingFont] = useState('Classic Serif');
    const [engravingPlacement, setEngravingPlacement] = useState('Main Body');
    const { inStock, lowStock } = useStockStatus(product?.sku || '');
    const { showToast } = useToast();

    useEffect(() => {
        let cancelled = false;

        async function loadProduct() {
            if (!id) return;

            setIsLoading(true);
            setSelectedImage(0);

            try {
                const [productData, related] = await Promise.all([
                    fetchProductBySku(id),
                    fetchRelatedProducts(id, 4),
                ]);

                if (!cancelled) {
                    setProduct(productData);
                    setRelatedProducts(related);
                }
            } catch (error) {
                console.error('Failed to load product:', error);
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadProduct();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    if (isLoading) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-pearl pt-20">
                    <div className="flex items-center justify-center py-32">
                        <Loader2 className="w-8 h-8 animate-spin text-charcoal/40" />
                    </div>
                    <Footer />
                </main>
            </>
        );
    }

    if (!product) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-pearl pt-20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
                        <div className="text-center">
                            <h1 className="font-heading text-3xl font-bold text-charcoal mb-4">
                                Product Not Found
                            </h1>
                            <p className="font-body text-charcoal/60 mb-8">
                                The product you're looking for doesn't exist or has been removed.
                            </p>
                            <Link to="/products">
                                <Button variant="primary" icon={<ArrowLeft className="w-4 h-4" />} iconPosition="left">
                                    Back to Products
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <Footer />
                </main>
            </>
        );
    }

    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
        : 0;

    const images = product.images && product.images.length > 0 ? product.images : [product.image];
    const averageRating = (staticReviews.reduce((acc, item) => acc + item.rating, 0) / staticReviews.length).toFixed(1);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-20">
                {/* Breadcrumb */}
                <div className="bg-white border-b border-charcoal/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                        <nav className="flex items-center gap-2 text-sm font-body">
                            <Link to="/" className="text-charcoal/60 hover:text-charcoal transition-colors">
                                Home
                            </Link>
                            <ChevronRight className="w-4 h-4 text-charcoal/40" />
                            <Link to="/products" className="text-charcoal/60 hover:text-charcoal transition-colors">
                                Products
                            </Link>
                            <ChevronRight className="w-4 h-4 text-charcoal/40" />
                            <Link
                                to={`/products?category=${product.category}`}
                                className="text-charcoal/60 hover:text-charcoal transition-colors"
                            >
                                {product.categoryLabel}
                            </Link>
                            <ChevronRight className="w-4 h-4 text-charcoal/40" />
                            <span className="text-charcoal font-medium truncate max-w-[200px]">
                                {product.name}
                            </span>
                        </nav>
                    </div>
                </div>

                {/* Product Hero Section */}
                <section className="py-8 md:py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                            {/* Image Gallery */}
                            <div className="space-y-4">
                                {/* Main Image */}
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-soft">
                                    <img
                                        src={images[selectedImage]}
                                        alt={product.name}
                                        className="w-full h-full object-cover cursor-zoom-in"
                                        onClick={() => setShowLightbox(true)}
                                    />
                                    {/* Badge */}
                                    {product.badge && (
                                        <div className="absolute top-4 left-4">
                                            <span
                                                className={`px-4 py-2 rounded-full text-sm font-medium uppercase tracking-wide ${product.badge === 'Bestseller'
                                                    ? 'bg-success text-white'
                                                    : product.badge === 'New'
                                                        ? 'bg-charcoal text-pearl'
                                                        : 'bg-warning text-charcoal'
                                                    }`}
                                            >
                                                {product.badge}
                                            </span>
                                        </div>
                                    )}
                                    {/* Discount Badge */}
                                    {hasDiscount && (
                                        <div className="absolute top-4 right-4">
                                            <span className="px-3 py-1.5 rounded-full bg-error text-white text-sm font-medium">
                                                -{discountPercent}% OFF
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Gallery */}
                                {images.length > 1 && (
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {images.map((img, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(index)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${selectedImage === index
                                                    ? 'border-charcoal shadow-soft'
                                                    : 'border-transparent hover:border-charcoal/30'
                                                    }`}
                                            >
                                                <img
                                                    src={img}
                                                    alt={`${product.name} view ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="space-y-6">
                                {/* Category */}
                                <span className="inline-block px-3 py-1 bg-primary-light/50 rounded-full text-xs font-medium text-charcoal/70 uppercase tracking-wide">
                                    {product.categoryLabel}
                                </span>

                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((index) => (
                                            <Star key={index} className="w-4 h-4 text-amber-500" fill="currentColor" />
                                        ))}
                                    </div>
                                    <span className="font-body text-sm text-charcoal/60">{averageRating}/5 ({staticReviews.length * 37}+ reviews)</span>
                                </div>

                                {/* Title */}
                                <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal">
                                    {product.name}
                                </h1>

                                {/* Price */}
                                <div className="flex items-baseline gap-3">
                                    <span className="font-heading text-3xl font-bold text-charcoal">
                                        {formatPrice(product.price)}
                                    </span>
                                    {hasDiscount && (
                                        <>
                                            <span className="font-body text-lg text-charcoal/40 line-through">
                                                {formatPrice(product.originalPrice!)}
                                            </span>
                                            <span className="px-2 py-0.5 bg-error/10 text-error text-sm font-medium rounded">
                                                Save {formatPrice(product.originalPrice! - product.price)}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Stock Status Badge */}
                                <div className="flex items-center gap-2">
                                    {!inStock ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-error/10 text-error text-sm font-medium">
                                            <span className="w-2 h-2 rounded-full bg-error" />
                                            Out of Stock
                                        </span>
                                    ) : lowStock ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/10 text-warning text-sm font-medium">
                                            <span className="w-2 h-2 rounded-full bg-warning" />
                                            Low Stock — Order Soon
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                                            <span className="w-2 h-2 rounded-full bg-success" />
                                            In Stock
                                        </span>
                                    )}
                                </div>

                                {/* Description */}
                                <p className="font-body text-charcoal/70 leading-relaxed">
                                    {product.longDescription || product.description}
                                </p>

                                {/* Features */}
                                {product.features && product.features.length > 0 && (
                                    <div className="space-y-3">
                                        <h3 className="font-heading text-lg font-semibold text-charcoal">
                                            Key Features
                                        </h3>
                                        <ul className="space-y-2">
                                            {product.features.map((feature, index) => (
                                                <li key={index} className="flex items-start gap-3">
                                                    <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                                                    <span className="font-body text-charcoal/70">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        icon={<ShoppingCart className="w-5 h-5" />}
                                        iconPosition="left"
                                        className="flex-1"
                                        onClick={() =>
                                            showToast('Cart is currently disabled. Use Buy Now to checkout instantly.', 'info')
                                        }
                                        disabled={!inStock}
                                    >
                                        Add to Cart
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="flex-1"
                                        onClick={() => setShowCheckout(true)}
                                        disabled={!inStock}
                                    >
                                        {inStock ? 'Buy Now' : 'Out of Stock'}
                                    </Button>
                                </div>

                                {/* Trust Badges */}
                                <div className="flex flex-wrap gap-4 pt-4 border-t border-charcoal/10">
                                    <div className="flex items-center gap-2 text-sm text-charcoal/60">
                                        <span className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-success" />
                                        </span>
                                        Free Shipping
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-charcoal/60">
                                        <span className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-success" />
                                        </span>
                                        Hallmark Certified
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-charcoal/60">
                                        <span className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                                            <Check className="w-4 h-4 text-success" />
                                        </span>
                                        Secure Payment
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-8 md:py-12 bg-white border-y border-charcoal/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h2 className="font-heading text-2xl font-bold text-charcoal mb-3">Make It Personal</h2>
                                <p className="font-body text-charcoal/65 mb-6">
                                    Add a name, initials, date, or short message. Preview settings before checkout.
                                </p>

                                <label className="block font-body text-sm text-charcoal/70 mb-2">Engraving text (max 20 chars)</label>
                                <input
                                    type="text"
                                    value={engravingText}
                                    maxLength={20}
                                    onChange={(event) => setEngravingText(event.target.value)}
                                    className="w-full rounded-xl border border-charcoal/20 px-4 py-3 mb-4 font-body"
                                    placeholder="e.g. A. Sharma"
                                />

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-body text-sm text-charcoal/70 mb-2">Font style</label>
                                        <select
                                            value={engravingFont}
                                            onChange={(event) => setEngravingFont(event.target.value)}
                                            className="w-full rounded-xl border border-charcoal/20 px-3 py-3 font-body"
                                        >
                                            <option>Classic Serif</option>
                                            <option>Modern Sans</option>
                                            <option>Elegant Script</option>
                                            <option>Monogram</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-body text-sm text-charcoal/70 mb-2">Placement</label>
                                        <select
                                            value={engravingPlacement}
                                            onChange={(event) => setEngravingPlacement(event.target.value)}
                                            className="w-full rounded-xl border border-charcoal/20 px-3 py-3 font-body"
                                        >
                                            <option>Main Body</option>
                                            <option>Cap</option>
                                            <option>Clip Side</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl bg-pearl p-6 border border-charcoal/10">
                                <h3 className="font-heading text-xl font-semibold text-charcoal mb-3">Preview Snapshot</h3>
                                <p className="font-body text-charcoal/65 mb-5">
                                    This is a reference preview. Final engraving is laser-aligned on production.
                                </p>
                                <div className="rounded-xl bg-white border border-charcoal/10 p-5">
                                    <p className="font-body text-xs uppercase tracking-wider text-charcoal/50 mb-3">
                                        {engravingPlacement} · {engravingFont}
                                    </p>
                                    <p className="font-heading text-2xl text-charcoal italic">
                                        {engravingText || 'Your Personal Text'}
                                    </p>
                                    <p className="font-body text-xs text-charcoal/50 mt-4 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" />
                                        Personalized products are final-sale unless defective.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Specifications Section */}
                {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <section className="py-8 md:py-12 bg-white">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <h2 className="font-heading text-2xl font-bold text-charcoal mb-6">
                                Specifications
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.entries(product.specifications).map(([key, value]) => (
                                    value && (
                                        <div
                                            key={key}
                                            className="flex justify-between py-3 px-4 bg-pearl rounded-xl"
                                        >
                                            <span className="font-body text-charcoal/60 capitalize">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <span className="font-body font-medium text-charcoal">
                                                {value}
                                            </span>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <section className="py-10 md:py-14">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <article className="rounded-2xl bg-white p-6 border border-charcoal/10 shadow-soft lg:col-span-2">
                            <h2 className="font-heading text-2xl font-bold text-charcoal mb-3">Product Story</h2>
                            <p className="font-body text-charcoal/70 leading-relaxed">
                                This piece is designed for milestone moments and everyday excellence. From boardroom signatures
                                to thoughtful gifting, it combines utility with timeless silver craftsmanship.
                            </p>
                        </article>
                        <article className="rounded-2xl bg-charcoal text-pearl p-6">
                            <h3 className="font-heading text-xl font-semibold mb-3">Packaging and Care</h3>
                            <ul className="space-y-2 font-body text-pearl/75 text-sm">
                                <li>Luxury gift box included</li>
                                <li>Hallmark authenticity support card</li>
                                <li>Care cloth and storage guidance</li>
                                <li>Dispatch timeline shared after checkout</li>
                            </ul>
                        </article>
                    </div>
                </section>

                <section className="py-10 md:py-14 bg-white border-y border-charcoal/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-6">Customer Reviews</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {staticReviews.map((review) => (
                                <article key={review.name} className="rounded-xl bg-pearl p-5 border border-charcoal/10">
                                    <div className="flex items-center gap-1 mb-3">
                                        {[1, 2, 3, 4, 5].map((index) => (
                                            <Star
                                                key={index}
                                                className={`w-4 h-4 ${index <= review.rating ? 'text-amber-500' : 'text-charcoal/20'}`}
                                                fill={index <= review.rating ? 'currentColor' : 'none'}
                                            />
                                        ))}
                                    </div>
                                    <p className="font-body text-charcoal/70 text-sm leading-relaxed">{review.comment}</p>
                                    <p className="font-heading text-charcoal text-sm font-semibold mt-4">{review.name}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="py-12 md:py-16">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="font-heading text-2xl font-bold text-charcoal">
                                    You May Also Like
                                </h2>
                                <Link
                                    to={`/products?category=${product.category}`}
                                    className="font-body text-sm text-charcoal/60 hover:text-charcoal transition-colors flex items-center gap-1"
                                >
                                    View All <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                            <ProductsGrid products={relatedProducts} />
                        </div>
                    </section>
                )}

                <Footer />

                {/* Checkout Modal */}
                <CheckoutModal
                    product={product}
                    isOpen={showCheckout}
                    onClose={() => setShowCheckout(false)}
                />

                {showLightbox && (
                    <div className="fixed inset-0 z-[80] bg-charcoal/90 p-4 flex items-center justify-center">
                        <button
                            type="button"
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-pearl hover:bg-white/20 flex items-center justify-center"
                            aria-label="Close image preview"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img
                            src={images[selectedImage]}
                            alt={`${product.name} enlarged view`}
                            className="max-w-full max-h-full object-contain rounded-xl"
                        />
                    </div>
                )}
            </main>
        </>
    );
}

export default ProductDetailPage;
