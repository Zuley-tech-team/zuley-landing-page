import { Link } from 'react-router-dom';
import { type Product } from '../../api/products';
import { Button } from '../common';
import { Eye } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, onQuickView }: ProductCardProps) {
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const discountPercent = hasDiscount
        ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
        : 0;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <article className="group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-luxury transition-all duration-500 hover:-translate-y-2 border border-transparent hover:border-primary/20">
            {/* Image Area */}
            <Link to={`/products/${product._id}`} className="block">
                <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                    />

                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-300" />

                    {/* Badge */}
                    {product.badge && (
                        <div className="absolute top-3 left-3">
                            <span
                                className={`px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${product.badge === 'Bestseller'
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
                        <div className="absolute top-3 right-3">
                            <span className="px-2 py-1 rounded-full bg-error text-white text-xs font-medium">
                                -{discountPercent}%
                            </span>
                        </div>
                    )}
                </div>
            </Link>

            {/* Content Area */}
            <div className="p-4 md:p-5">
                {/* Category Tag */}
                <span className="inline-block px-2 py-0.5 mb-2 bg-primary-light/50 rounded text-xs font-medium text-charcoal/70 uppercase tracking-wide">
                    {product.categoryLabel}
                </span>

                {/* Product Name */}
                <Link to={`/products/${product._id}`} className="block">
                    <h3 className="font-heading text-lg font-semibold text-charcoal mb-2 line-clamp-1 hover:text-charcoal/80 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {/* Description */}
                <p className="font-body text-sm text-charcoal/60 leading-relaxed mb-3 line-clamp-2">
                    {product.description}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-heading text-xl font-bold text-charcoal">
                        {formatPrice(product.price)}
                    </span>
                    {hasDiscount && (
                        <span className="font-body text-sm text-charcoal/40 line-through">
                            {formatPrice(product.originalPrice!)}
                        </span>
                    )}
                </div>

                {/* CTA Buttons */}
                <div className="grid grid-cols-2 gap-2">
                    <Link to={`/products/${product._id}`}>
                        <Button
                            variant="secondary"
                            size="sm"
                            fullWidth
                            icon={<Eye className="w-4 h-4" />}
                            iconPosition="left"
                        >
                            Details
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={() => onQuickView?.(product)}
                    >
                        Quick View
                    </Button>
                </div>
            </div>
        </article>
    );
}

export default ProductCard;
