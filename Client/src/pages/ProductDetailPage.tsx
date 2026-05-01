import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/home';
import { ProductsGrid } from '../components/products';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { CheckoutModal } from '../components/checkout/CheckoutModal';
import { fetchProductBySku, fetchRelatedProducts, type Product } from '../api/products';
import { fetchReviews, type ReviewItem } from '../api/reviews';
import { fetchAvailableCoupons, type PublicCoupon } from '../api/coupons';
import { ChevronRight, ChevronLeft, Check, ShoppingCart, ArrowLeft, Loader2, Star, X, RotateCcw, Award, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useStockStatus } from '../hooks/useStockStatus';
import { useToast } from '../contexts/ToastContext';

export function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);
    const [quantity] = useState(1);
    const [productReviews, setProductReviews] = useState<ReviewItem[]>([]);
    const [isReviewLoading, setIsReviewLoading] = useState(false);
    const [reviewIndex, setReviewIndex] = useState(0);
    const [isReviewAutoPlaying, setIsReviewAutoPlaying] = useState(true);
    const [reviewLightboxImage, setReviewLightboxImage] = useState<string | null>(null);
    const [availableCoupons, setAvailableCoupons] = useState<PublicCoupon[]>([]);
    const [showAllCoupons, setShowAllCoupons] = useState(false);
    const { inStock, lowStock } = useStockStatus(product?.sku || '');
    const { showToast } = useToast();
    const { addToCart } = useCart();
    const { isLoggedIn, openAuthModal, setPostLoginCallback } = useAuth();

    // Gate Buy Now behind login
    const handleBuyNow = () => {
        if (!isLoggedIn) {
            setPostLoginCallback(() => () => setShowCheckout(true));
            openAuthModal();
        } else {
            setShowCheckout(true);
        }
    };

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

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, [id]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const images = product?.images && product.images.length > 0
        ? product.images
        : product?.image
            ? [product.image]
            : [];

    const averageRating = productReviews.length
        ? (productReviews.reduce((acc, item) => acc + item.rating, 0) / productReviews.length).toFixed(1)
        : null;

    const handleSelectImage = (index: number, isManual = false) => {
        setSelectedImage(index);
        if (isManual) {
            setIsAutoPlaying(false);
        }
    };

    useEffect(() => {
        if (!isAutoPlaying || images.length <= 1) {
            return undefined;
        }

        const interval = setInterval(() => {
            setSelectedImage((prev) => (prev + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [images.length, isAutoPlaying]);



    useEffect(() => {
        if (images.length > 0 && selectedImage >= images.length) {
            setSelectedImage(0);
        }
    }, [images.length, selectedImage]);

    useEffect(() => {
        if (!product?.sku) {
            setProductReviews([]);
            return;
        }

        let active = true;
        const loadReviews = async () => {
            try {
                setIsReviewLoading(true);
                const response = await fetchReviews({ product_sku: product.sku, limit: 10 });
                if (active) {
                    setProductReviews(response.data || []);
                }
            } catch (error) {
                if (active) {
                    setProductReviews([]);
                }
            } finally {
                if (active) {
                    setIsReviewLoading(false);
                }
            }
        };

        loadReviews();

        return () => {
            active = false;
        };
    }, [product?.sku]);

    useEffect(() => {
        if (!product?.sku) {
            setAvailableCoupons([]);
            return;
        }

        let active = true;
        fetchAvailableCoupons([product.sku])
            .then((data) => {
                if (active) setAvailableCoupons(data);
            })
            .catch(() => {
                if (active) setAvailableCoupons([]);
            });

        return () => {
            active = false;
        };
    }, [product?.sku]);

    useEffect(() => {
        if (!isReviewAutoPlaying || productReviews.length <= (window.innerWidth >= 768 ? 2 : 1)) {
            return undefined;
        }

        const interval = setInterval(() => {
            setReviewIndex((prev) => {
                const visibleCount = window.innerWidth >= 768 ? 2 : 1;
                const maxIndex = Math.max(0, productReviews.length - visibleCount);
                return prev >= maxIndex ? 0 : prev + 1;
            });
        }, 3000);

        return () => clearInterval(interval);
    }, [productReviews.length, isReviewAutoPlaying]);

    const handlePrevReview = () => {
        setIsReviewAutoPlaying(false);
        setReviewIndex((prev) => Math.max(0, prev - 1));
    };

    const handleNextReview = () => {
        setIsReviewAutoPlaying(false);
        setReviewIndex((prev) => {
            const visibleCount = window.innerWidth >= 768 ? 2 : 1;
            const maxIndex = Math.max(0, productReviews.length - visibleCount);
            return prev >= maxIndex ? 0 : prev + 1;
        });
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
                                <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-soft product-gallery-frame">
                                    <img
                                        key={selectedImage}
                                        src={images[selectedImage]}
                                        alt={product.name}
                                        className="w-full h-full object-cover cursor-zoom-in product-gallery-image"
                                        onClick={() => {
                                            setIsAutoPlaying(false);
                                            setShowLightbox(true);
                                        }}
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
                                                onClick={() => handleSelectImage(index, true)}
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
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star 
                                                key={star} 
                                                className={`w-4 h-4 ${averageRating && star > Math.round(Number(averageRating)) ? 'text-charcoal/20' : 'text-amber-500'}`} 
                                                fill={averageRating && star > Math.round(Number(averageRating)) ? 'none' : 'currentColor'} 
                                            />
                                        ))}
                                    </div>
                                    <span className="font-body text-sm text-charcoal/60">
                                        {averageRating ? `${averageRating}/5` : 'No reviews yet'}
                                        {productReviews.length > 0
                                            ? ` (${productReviews.length} review${productReviews.length !== 1 ? 's' : ''})`
                                            : ''}
                                    </span>
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
                                            Low Stock - Order Soon
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium">
                                            <span className="w-2 h-2 rounded-full bg-success" />
                                            In Stock
                                        </span>
                                    )}
                                </div>

                                {/* Product Highlights Grid */}
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-6 border-y border-charcoal/10">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-charcoal/5 flex items-center justify-center flex-shrink-0">
                                            <RotateCcw className="w-5 h-5 text-charcoal/80" strokeWidth={2.5} />
                                         </div>
                                         <div className="flex flex-col">
                                             <span className="font-heading text-sm font-bold text-charcoal">Easy Returns</span>
                                             <span className="font-body text-[11px] text-charcoal/60 leading-tight">48 Hours Window</span>
                                         </div>
                                     </div>
                                     
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-charcoal/5 flex items-center justify-center flex-shrink-0">
                                             <Award className="w-5 h-5 text-charcoal/80" strokeWidth={2.5} />
                                         </div>
                                         <div className="flex flex-col">
                                             <span className="font-heading text-sm font-bold text-charcoal">Pure 925 Silver</span>
                                             <span className="font-body text-[11px] text-charcoal/60 leading-tight">Certified Quality</span>
                                         </div>
                                     </div>

                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-charcoal/5 flex items-center justify-center flex-shrink-0">
                                             {product.category === 'silver-phone-covers' ? <Sparkles className="w-5 h-5 text-charcoal/80" strokeWidth={2.5} /> : <ShieldCheck className="w-5 h-5 text-charcoal/80" strokeWidth={2.5} />}
                                         </div>
                                         <div className="flex flex-col">
                                             <span className="font-heading text-sm font-bold text-charcoal">
                                                 {product.category === 'silver-phone-covers' ? '3D Engraving' : '1 Year Warranty'}
                                             </span>
                                             <span className="font-body text-[11px] text-charcoal/60 leading-tight">
                                                 {product.category === 'silver-phone-covers' ? 'Premium Detail' : 'Full Protection'}
                                             </span>
                                         </div>
                                     </div>

                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-charcoal/5 flex items-center justify-center flex-shrink-0">
                                             <Truck className="w-5 h-5 text-charcoal/80" strokeWidth={2.5} />
                                         </div>
                                        <div className="flex flex-col">
                                            <span className="font-heading text-sm font-bold text-charcoal">Free Shipping</span>
                                            <span className="font-body text-[11px] text-charcoal/60 leading-tight">All Over India</span>
                                        </div>
                                    </div>
                                </div>

                                {availableCoupons.length > 0 && (
                                    <div className="rounded-2xl border border-charcoal/10 bg-white/90 p-4">
                                        <h3 className="font-heading text-sm font-semibold text-charcoal mb-3">
                                            Available Offers
                                        </h3>
                                        <div className="space-y-3">
                                            {(showAllCoupons ? availableCoupons : availableCoupons.slice(0, 1)).map((coupon) => (
                                                <div key={coupon.id} className="flex items-start justify-between gap-3 rounded-xl border border-charcoal/10 bg-pearl/70 p-3">
                                                    <div>
                                                        <p className="coupon-code text-sm text-charcoal">
                                                            {coupon.code}
                                                        </p>
                                                        <p className="font-body text-xs text-charcoal/60">
                                                            {coupon.discount_type === 'percentage'
                                                                ? `${coupon.discount_value}% off`
                                                                : `₹${Math.round(coupon.discount_value / 100)} off`}
                                                            {coupon.min_order_value ? ` on orders above ₹${Math.round(coupon.min_order_value / 100)}` : ''}
                                                        </p>
                                                        {coupon.description && (
                                                            <p className="font-body text-xs text-charcoal/50 mt-1">
                                                                {coupon.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="px-2 py-1 rounded-full bg-charcoal text-pearl text-[10px] font-semibold tracking-wide">
                                                        APPLY
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        {availableCoupons.length > 1 && (
                                            <button
                                                onClick={() => setShowAllCoupons(!showAllCoupons)}
                                                className="w-full mt-3 py-2 text-xs font-semibold text-charcoal/60 hover:text-charcoal border-t border-charcoal/5 transition-colors"
                                            >
                                                {showAllCoupons ? 'Show Less' : `+ ${availableCoupons.length - 1} more offer${availableCoupons.length > 2 ? 's' : ''} available`}
                                            </button>
                                        )}
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
                                        onClick={() => {
                                            addToCart(product, quantity);
                                            showToast('Item added to cart.', 'success');
                                        }}
                                        disabled={!inStock}
                                    >
                                        Add to Cart
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        className="flex-1"
                                        onClick={handleBuyNow}
                                        disabled={!inStock}
                                    >
                                        {inStock ? 'Buy Now' : 'Out of Stock'}
                                    </Button>
                                </div>

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
                                            className="flex justify-between items-start gap-4 py-3 px-4 bg-pearl rounded-xl"
                                        >
                                            <span className="font-body text-charcoal/60 capitalize shrink-0">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <span className="font-body font-medium text-charcoal text-right break-words">
                                                {value}
                                            </span>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                <section className="py-10 md:py-14 bg-white border-y border-charcoal/10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                            <div>
                                <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal">Customer Reviews</h2>
                                {averageRating && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`w-4 h-4 ${star <= Math.round(Number(averageRating)) ? 'text-amber-500' : 'text-charcoal/20'}`}
                                                    fill={star <= Math.round(Number(averageRating)) ? 'currentColor' : 'none'}
                                                />
                                            ))}
                                        </div>
                                        <span className="font-body text-sm text-charcoal/70">
                                            {averageRating} out of 5 ({productReviews.length} review{productReviews.length !== 1 ? 's' : ''})
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {isReviewLoading && (
                            <p className="font-body text-sm text-charcoal/60">Loading reviews...</p>
                        )}

                        {!isReviewLoading && productReviews.length === 0 && (
                            <div className="rounded-xl bg-pearl p-6 border border-charcoal/10">
                                <p className="font-body text-charcoal/70">No reviews yet. Be the first to review this product after delivery.</p>
                            </div>
                        )}

                        {!isReviewLoading && productReviews.length > 0 && (
                            <div className="relative group/reviews">
                                <div className="overflow-hidden mx-[-8px] md:mx-[-12px]">
                                    <div 
                                        className="flex transition-transform duration-500 ease-out"
                                        style={{ transform: `translateX(-${reviewIndex * (window.innerWidth >= 768 ? 50 : 100)}%)` }}
                                        onMouseEnter={() => setIsReviewAutoPlaying(false)}
                                        onMouseLeave={() => setIsReviewAutoPlaying(true)}
                                        onTouchStart={() => setIsReviewAutoPlaying(false)}
                                    >
                                        {productReviews.map((review) => (
                                            <div 
                                                key={review._id} 
                                                className="flex-shrink-0 w-full md:w-1/2 px-2 md:px-3"
                                            >
                                                <article className="h-full rounded-xl bg-pearl p-5 border border-charcoal/10 shadow-sm">
                                                    <div className="flex items-center gap-1 mb-3">
                                                        {[1, 2, 3, 4, 5].map((index) => (
                                                            <Star
                                                                key={index}
                                                                className={`w-4 h-4 ${index <= review.rating ? 'text-amber-500' : 'text-charcoal/20'}`}
                                                                fill={index <= review.rating ? 'currentColor' : 'none'}
                                                            />
                                                        ))}
                                                    </div>
                                                    <p className="font-body text-charcoal/70 text-sm leading-relaxed min-h-[3rem]">{review.comment}</p>
                                                    {review.images?.length > 0 && (
                                                        <div className="mt-4 grid grid-cols-3 gap-2">
                                                            {review.images.slice(0, 3).map((image) => (
                                                                <img
                                                                    key={image.public_id}
                                                                    src={image.url}
                                                                    alt={review.product_name}
                                                                    className="h-20 w-full rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                                                    loading="lazy"
                                                                    onClick={() => setReviewLightboxImage(image.url)}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}
                                                    <p className="font-heading text-charcoal text-sm font-semibold mt-4">
                                                        {review.customer_name}{review.customer_city ? `, ${review.customer_city}` : ''}
                                                    </p>
                                                </article>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {productReviews.length > (window.innerWidth >= 768 ? 2 : 1) && (
                                    <>
                                        <button
                                            onClick={handlePrevReview}
                                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-card flex items-center justify-center text-charcoal hover:bg-pearl transition-colors z-10 disabled:opacity-0"
                                            disabled={reviewIndex === 0}
                                        >
                                            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                        <button
                                            onClick={handleNextReview}
                                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 w-8 h-8 md:w-10 md:h-10 rounded-full bg-white shadow-card flex items-center justify-center text-charcoal hover:bg-pearl transition-colors z-10 disabled:opacity-0"
                                            disabled={reviewIndex >= productReviews.length - (window.innerWidth >= 768 ? 2 : 1)}
                                        >
                                            <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                        </button>
                                        
                                        {/* Dots for mobile */}
                                        <div className="flex justify-center gap-2 mt-6 md:hidden">
                                            {Array.from({ length: productReviews.length }).map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setIsReviewAutoPlaying(false);
                                                        setReviewIndex(i);
                                                    }}
                                                    className={`h-1.5 rounded-full transition-all duration-300 ${i === reviewIndex ? 'bg-charcoal w-6' : 'bg-charcoal/20 w-1.5'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
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
                    items={product ? [{ product, quantity }] : []}
                    isOpen={showCheckout}
                    onClose={() => setShowCheckout(false)}
                    onSuccess={undefined}
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
                {reviewLightboxImage && (
                    <div className="fixed inset-0 z-[80] bg-charcoal/90 p-4 flex items-center justify-center" onClick={() => setReviewLightboxImage(null)}>
                        <button
                            type="button"
                            onClick={() => setReviewLightboxImage(null)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-pearl hover:bg-white/20 flex items-center justify-center"
                            aria-label="Close review image preview"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <img
                            src={reviewLightboxImage}
                            alt="Review image enlarged"
                            className="max-w-full max-h-full object-contain rounded-xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                )}
            </main>
        </>
    );
}

export default ProductDetailPage;
