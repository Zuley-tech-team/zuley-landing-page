import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { fetchProducts, type Product } from '../../api/products';

const FALLBACK_PENS: Product[] = [
    {
        _id: 'pen-001',
        sku: 'pen-001',
        name: 'Executive Signature Pen',
        category: 'silver-pens',
        categoryLabel: 'Silver Pens',
        price: 12999,
        originalPrice: 15999,
        image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=800&q=80',
        description: 'Handcrafted silver coating pen with personalized engraving option',
        badge: 'Bestseller',
        isActive: true,
    },
    {
        _id: 'pen-002',
        sku: 'pen-002',
        name: 'Classic Fountain Pen',
        category: 'silver-pens',
        categoryLabel: 'Silver Pens',
        price: 9999,
        image: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80',
        description: 'Elegant fountain pen with smooth ink flow and premium silver finish',
        isActive: true,
    },
    {
        _id: 'pen-003',
        sku: 'pen-003',
        name: 'Premium Ballpoint',
        category: 'silver-pens',
        categoryLabel: 'Silver Pens',
        price: 7499,
        image: 'https://images.unsplash.com/photo-1518674660708-0e2c0473e68e?w=800&q=80',
        description: 'Refined ballpoint pen perfect for everyday professional use',
        badge: 'New',
        isActive: true,
    },
    {
        _id: 'pen-004',
        sku: 'pen-004',
        name: 'Heritage Collection Pen',
        category: 'silver-pens',
        categoryLabel: 'Silver Pens',
        price: 18999,
        originalPrice: 22999,
        image: 'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=800&q=80',
        description: 'Limited edition pen with intricate silver engravings and vintage design',
        badge: 'Limited Edition',
        isActive: true,
    },
    {
        _id: 'pen-005',
        sku: 'pen-005',
        name: 'Modern Minimalist Pen',
        category: 'silver-pens',
        categoryLabel: 'Silver Pens',
        price: 8499,
        image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80',
        description: 'Sleek contemporary design with brushed silver finish',
        isActive: true,
    },
];

const AUTO_SLIDE_INTERVAL = 4000;

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export function CategorySection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);

    const [pens, setPens] = useState<Product[]>(FALLBACK_PENS);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const autoSlideRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    // Load pens from API
    useEffect(() => {
        let cancelled = false;
        async function loadPens() {
            try {
                const data = await fetchProducts({ category: 'silver-pens' });
                if (!cancelled && data && data.length > 0) {
                    setPens(data);
                }
            } catch {
                // keep fallback
            }
        }
        loadPens();
        return () => { cancelled = true; };
    }, []);

    const goTo = useCallback((index: number) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setActiveIndex((index + pens.length) % pens.length);
        setTimeout(() => setIsAnimating(false), 500);
    }, [isAnimating, pens.length]);

    const goNext = useCallback(() => goTo(activeIndex + 1), [goTo, activeIndex]);
    const goPrev = useCallback(() => goTo(activeIndex - 1), [goTo, activeIndex]);

    // Auto-slide
    useEffect(() => {
        if (isHovered) {
            if (autoSlideRef.current) clearInterval(autoSlideRef.current);
            return;
        }
        autoSlideRef.current = setInterval(goNext, AUTO_SLIDE_INTERVAL);
        return () => {
            if (autoSlideRef.current) clearInterval(autoSlideRef.current);
        };
    }, [isHovered, goNext]);

    // GSAP entrance animations
    useEffect(() => {
        ScrollTrigger.refresh();
        const ctx = gsap.context(() => {
            gsap.fromTo(
                headerRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1, y: 0, duration: 0.7, ease: 'power3.out',
                    scrollTrigger: { trigger: headerRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
                }
            );
            gsap.fromTo(
                carouselRef.current,
                { opacity: 0, y: 40 },
                {
                    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
                    scrollTrigger: { trigger: carouselRef.current, start: 'top 85%', toggleActions: 'play none none reverse' },
                }
            );
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    const currentPen = pens[activeIndex];

    return (
        <section ref={sectionRef} className="py-12 md:py-16 lg:py-20 bg-pearl overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <div ref={headerRef} className="text-center mb-10 md:mb-12">
                    <span className="inline-block px-3 py-1 mb-3 bg-charcoal/5 rounded-full font-body text-xs text-charcoal/60 uppercase tracking-wider">
                        Our Collection
                    </span>
                    <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal mb-3">
                        Explore Our Silver Pen Collection
                    </h2>
                    <p className="font-body text-sm md:text-base text-charcoal/60 max-w-lg mx-auto">
                        Premium silver pens designed for everyday elegance
                    </p>
                </div>

                {/* Carousel */}
                <div
                    ref={carouselRef}
                    className="relative max-w-5xl mx-auto"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Main Card */}
                    <div className="relative bg-white rounded-3xl shadow-luxury overflow-hidden border border-charcoal/5">
                        <div className="grid grid-cols-1 md:grid-cols-2 md:min-h-[480px]">
                            {/* Image Panel */}
                            <div className="relative h-56 sm:h-64 md:h-full overflow-hidden bg-gradient-to-br from-primary-light/20 to-pearl order-1">
                                {pens.map((pen, idx) => (
                                    <img
                                        key={pen._id}
                                        src={pen.image}
                                        alt={pen.name}
                                        className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${idx === activeIndex
                                                ? 'opacity-100 scale-100'
                                                : 'opacity-0 scale-105'
                                            }`}
                                        loading="lazy"
                                    />
                                ))}
                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 md:to-white/5" />

                                {/* Badge */}
                                {currentPen.badge && (
                                    <div className="absolute top-5 left-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-body ${currentPen.badge === 'Bestseller'
                                                ? 'bg-amber-100 text-amber-800'
                                                : currentPen.badge === 'New'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : 'bg-primary/20 text-charcoal'
                                            }`}>
                                            <Sparkles className="w-3 h-3" />
                                            {currentPen.badge}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Content Panel */}
                            <div className="flex flex-col justify-between p-8 md:p-10 order-2">
                                {/* Counter indicator */}
                                <div className="flex items-center justify-between mb-6">
                                    <span className="font-body text-xs uppercase tracking-widest text-charcoal/40">
                                        Silver Pens
                                    </span>
                                    <span className="font-body text-xs text-charcoal/40">
                                        {activeIndex + 1} / {pens.length}
                                    </span>
                                </div>

                                {/* Text content */}
                                <div className="flex-1">
                                    <h3
                                        key={currentPen._id}
                                        className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-3 transition-all duration-300"
                                    >
                                        {currentPen.name}
                                    </h3>
                                    <p className="font-body text-sm md:text-base text-charcoal/60 leading-relaxed mb-6">
                                        {currentPen.description}
                                    </p>

                                    {/* Price */}
                                    <div className="flex items-baseline gap-3 mb-8">
                                        <span className="font-heading text-2xl md:text-3xl font-bold text-charcoal">
                                            {formatPrice(currentPen.price)}
                                        </span>
                                        {currentPen.originalPrice && (
                                            <span className="font-body text-sm text-charcoal/40 line-through">
                                                {formatPrice(currentPen.originalPrice)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* CTA */}
                                <Link
                                    to={`/products/${currentPen.sku}`}
                                    className="inline-flex items-center gap-2 self-start px-6 py-3 bg-charcoal text-pearl rounded-xl font-body text-sm font-semibold hover:bg-graphite transition-colors group"
                                >
                                    View Details
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={goPrev}
                        aria-label="Previous pen"
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-6 w-11 h-11 bg-white rounded-full shadow-card border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-pearl transition-all duration-300 hover:scale-110 z-10"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={goNext}
                        aria-label="Next pen"
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-6 w-11 h-11 bg-white rounded-full shadow-card border border-charcoal/10 flex items-center justify-center text-charcoal hover:bg-charcoal hover:text-pearl transition-all duration-300 hover:scale-110 z-10"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Dot Indicators */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {pens.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goTo(idx)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`transition-all duration-300 rounded-full ${idx === activeIndex
                                        ? 'w-8 h-2.5 bg-charcoal'
                                        : 'w-2.5 h-2.5 bg-charcoal/20 hover:bg-charcoal/40'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Auto-slide progress bar */}
                    {/* <div className="mt-3 max-w-xs mx-auto h-0.5 bg-charcoal/10 rounded-full overflow-hidden">
                        <div
                            key={`${activeIndex}-${isHovered}`}
                            className={`h-full bg-charcoal/40 rounded-full ${isHovered ? 'w-0' : 'w-full'}`}
                            style={{
                                transition: isHovered ? 'none' : `width ${AUTO_SLIDE_INTERVAL}ms linear`,
                                width: isHovered ? '0%' : '100%',
                            }}
                        />
                    </div> */}

                    {/* View All CTA */}
                    <div className="text-center mt-8">
                        <Link
                            to="/products?category=silver-pens"
                            className="inline-flex items-center gap-2 font-body text-sm font-medium text-charcoal/60 hover:text-charcoal transition-colors group"
                        >
                            View All Silver Pens
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CategorySection;
