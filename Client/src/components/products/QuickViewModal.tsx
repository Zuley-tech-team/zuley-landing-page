import { useEffect, useMemo, useState } from 'react';
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

    const imageList = useMemo(() => {
        if (product.images && product.images.length > 0) {
            return product.images;
        }
        return [product.image];
    }, [product.images, product.image]);

    const [activeImage, setActiveImage] = useState(imageList[0]);

    useEffect(() => {
        setActiveImage(imageList[0]);
    }, [imageList]);

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

            <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-luxury border border-charcoal/10">
                <button
                    type="button"
                    className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-white/90 border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-pearl transition-colors"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="relative bg-gradient-to-br from-pearl via-white to-primary-light/30 p-5 md:p-6">
                        <div className="relative aspect-[4/3] md:aspect-[5/6] rounded-2xl overflow-hidden bg-pearl shadow-soft">
                            <img
                                src={activeImage}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {product.badge && (
                            <span className="absolute top-6 left-6 px-3 py-1 rounded-full bg-charcoal text-pearl text-xs uppercase tracking-wide font-medium">
                                {product.badge}
                            </span>
                        )}
                        {imageList.length > 1 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {imageList.map((image, index) => (
                                    <button
                                        key={`${image}-${index}`}
                                        type="button"
                                        className={`h-16 w-16 overflow-hidden rounded-xl border transition-all ${image === activeImage
                                                ? 'border-charcoal shadow-soft'
                                                : 'border-transparent opacity-70 hover:opacity-100'
                                            }`}
                                        onClick={() => setActiveImage(image)}
                                        aria-label={`View image ${index + 1}`}
                                    >
                                        <img src={image} alt={`${product.name} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6 md:p-8">
                        <p className="font-body text-xs uppercase tracking-wider text-charcoal/50 mb-2">
                            {product.categoryLabel}
                        </p>
                        <h3 className="font-heading text-2xl md:text-3xl font-semibold text-charcoal mb-3">
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

                        <div className="rounded-2xl bg-pearl p-4 mb-6">
                            <div className="grid gap-2">
                                <p className="font-body text-sm text-charcoal/75 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Hand-finished craftsmanship in silver coating
                                </p>
                                <p className="font-body text-sm text-charcoal/65 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-success" />
                                    Premium gift-ready packaging included
                                </p>
                                <p className="font-body text-sm text-charcoal/65 flex items-center gap-2">
                                    <Check className="w-4 h-4 text-success" />
                                    Ships in 5 to 7 business days
                                </p>
                            </div>
                        </div>

                        {product.features && product.features.length > 0 && (
                            <div className="mb-6">
                                <p className="font-body text-sm uppercase tracking-wider text-charcoal/50 mb-3">Highlights</p>
                                <ul className="grid gap-2">
                                    {product.features.slice(0, 4).map((feature) => (
                                        <li key={feature} className="font-body text-sm text-charcoal/70 flex items-start gap-2">
                                            <Check className="w-4 h-4 text-success mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div className="rounded-2xl border border-charcoal/10 bg-white p-4 mb-6">
                                <p className="font-body text-sm uppercase tracking-wider text-charcoal/50 mb-3">Specifications</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {Object.entries(product.specifications).map(([label, value]) => (
                                        value ? (
                                            <div key={label} className="text-sm">
                                                <p className="font-body text-charcoal/50 capitalize">{label.replace(/_/g, ' ')}</p>
                                                <p className="font-body text-charcoal/80 font-medium">{value}</p>
                                            </div>
                                        ) : null
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3">
                            <Link to={`/products/${product._id}`} className="flex-1" onClick={onClose}>
                                <Button variant="primary" fullWidth>
                                    View Full Details
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
