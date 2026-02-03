import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/common';
import { Footer } from '../components/home';
import { ProductsGrid } from '../components/products';
import { getProductById, getRelatedProducts } from '../data/products';
import { ChevronRight, Check, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common';
import { useState } from 'react';

export function ProductDetailPage() {
    const { id } = useParams<{ id: string }>();
    const product = id ? getProductById(id) : undefined;
    const [selectedImage, setSelectedImage] = useState(0);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

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

    const images = product.images || [product.image];
    const relatedProducts = getRelatedProducts(product, 4);

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
                                        className="w-full h-full object-cover"
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
                                    >
                                        Add to Cart
                                    </Button>
                                    <Button variant="secondary" size="lg" className="flex-1">
                                        Buy Now
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

                {/* Specifications Section */}
                {product.specifications && (
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
            </main>
        </>
    );
}

export default ProductDetailPage;
