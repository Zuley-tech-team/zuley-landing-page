import { Link } from 'react-router-dom';
import { X, Sparkles, Check } from 'lucide-react';
import { type Product } from '../../api/products';
import { Button } from '../common';

interface QuickViewModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
}

export function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
    if (!isOpen || !product) {
        return null;
    }

    const hasDiscount = Boolean(product.originalPrice && product.originalPrice > product.price);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6">
            <button
                type="button"
                className="absolute inset-0 bg-charcoal/55 backdrop-blur-sm"
                onClick={onClose}
                aria-label="Close quick view"
            />

            <div className="relative z-10 w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-luxury border border-charcoal/10">
                <button
                    type="button"
                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-pearl transition-colors"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative aspect-[4/3] md:aspect-auto md:h-full bg-pearl">
                        <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                        />
                        {product.badge && (
                            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-charcoal text-pearl text-xs uppercase tracking-wide font-medium">
                                {product.badge}
                            </span>
                        )}
                    </div>

                    <div className="p-6 md:p-8">
                        <p className="font-body text-xs uppercase tracking-wider text-charcoal/50 mb-2">
                            {product.categoryLabel}
                        </p>
                        <h3 className="font-heading text-2xl font-semibold text-charcoal mb-3">
                            {product.name}
                        </h3>
                        <p className="font-body text-charcoal/65 leading-relaxed mb-4">
                            {product.longDescription || product.description}
                        </p>

                        <div className="flex items-baseline gap-3 mb-5">
                            <span className="font-heading text-2xl font-bold text-charcoal">
                                {formatPrice(product.price)}
                            </span>
                            {hasDiscount && product.originalPrice && (
                                <span className="font-body text-charcoal/40 line-through">
                                    {formatPrice(product.originalPrice)}
                                </span>
                            )}
                        </div>

                        <div className="rounded-xl bg-pearl p-4 mb-6">
                            <p className="font-body text-sm text-charcoal/75 flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4" />
                                Personalization available on this product
                            </p>
                            <p className="font-body text-sm text-charcoal/65 flex items-center gap-2">
                                <Check className="w-4 h-4 text-success" />
                                Premium gift-ready packaging included
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to={`/products/${product._id}`} className="flex-1" onClick={onClose}>
                                <Button variant="primary" fullWidth>
                                    View Full Details
                                </Button>
                            </Link>
                            <Link to={`/products/${product._id}`} className="flex-1" onClick={onClose}>
                                <Button variant="secondary" fullWidth>
                                    Customize
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default QuickViewModal;
