import { useEffect, useRef, useState, useCallback, type TouchEvent } from 'react';
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
    const touchStartXRef = useRef<number | null>(null);
    const touchEndXRef = useRef<number | null>(null);

    const [pens, setPens] = useState<Product[]>(FALLBACK_PENS);
    const [activeIndex, setActiveIndex] = useState(0);
    const [trackIndex, setTrackIndex] = useState(1);
    const [transitionEnabled, setTransitionEnabled] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
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

    useEffect(() => {
        setActiveIndex(0);
        setTrackIndex(pens.length > 1 ? 1 : 0);
        setTransitionEnabled(false);
        const frame = requestAnimationFrame(() => setTransitionEnabled(true));
        return () => cancelAnimationFrame(frame);
    }, [pens.length]);

    const goTo = useCallback((index: number, manual = true) => {
        if (isAnimating || pens.length === 0) return;
        if (manual) {
            setIsAutoPlaying(false);
        }

        const normalizedIndex = (index + pens.length) % pens.length;
        setIsAnimating(true);
        setTransitionEnabled(true);
        setActiveIndex(normalizedIndex);
        setTrackIndex(normalizedIndex + 1);
        setTimeout(() => setIsAnimating(false), 500);
    }, [isAnimating, pens.length]);

    const goNext = useCallback((manual = true) => {
        if (isAnimating || pens.length === 0) return;
        if (manual) {
            setIsAutoPlaying(false);
        }

        setIsAnimating(true);
        setTransitionEnabled(true);

        if (activeIndex === pens.length - 1 && pens.length > 1) {
            setTrackIndex(pens.length + 1);
            setActiveIndex(0);
        } else {
            setTrackIndex((current) => current + 1);
            setActiveIndex((current) => (current + 1) % pens.length);
        }

        setTimeout(() => setIsAnimating(false), 500);
    }, [activeIndex, isAnimating, pens.length]);

    const goPrev = useCallback((manual = true) => {
        if (isAnimating || pens.length === 0) return;
        if (manual) {
            setIsAutoPlaying(false);
        }

        setIsAnimating(true);
        setTransitionEnabled(true);

        if (activeIndex === 0 && pens.length > 1) {
            setTrackIndex(0);
            setActiveIndex(pens.length - 1);
        } else {
            setTrackIndex((current) => current - 1);
            setActiveIndex((current) => (current - 1 + pens.length) % pens.length);
        }

        setTimeout(() => setIsAnimating(false), 500);
    }, [activeIndex, isAnimating, pens.length]);

    const handleTouchStart = useCallback((event: TouchEvent<HTMLDivElement>) => {
        touchStartXRef.current = event.touches[0]?.clientX ?? null;
        touchEndXRef.current = null;
    }, []);

    const handleTouchMove = useCallback((event: TouchEvent<HTMLDivElement>) => {
        touchEndXRef.current = event.touches[0]?.clientX ?? null;
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (touchStartXRef.current === null || touchEndXRef.current === null) return;

        const swipeDistance = touchStartXRef.current - touchEndXRef.current;
        const minSwipeDistance = 50;

        if (Math.abs(swipeDistance) >= minSwipeDistance) {
            if (swipeDistance > 0) {
                goNext(true);
            } else {
                goPrev(true);
            }
        }

        touchStartXRef.current = null;
        touchEndXRef.current = null;
    }, [goNext, goPrev]);

    // Auto-slide
    useEffect(() => {
        if (isHovered || !isAutoPlaying || pens.length <= 1) {
            if (autoSlideRef.current) clearInterval(autoSlideRef.current);
            return;
        }
        autoSlideRef.current = setInterval(() => goNext(false), AUTO_SLIDE_INTERVAL);
        return () => {
            if (autoSlideRef.current) clearInterval(autoSlideRef.current);
        };
    }, [goNext, isAutoPlaying, isHovered, pens.length]);

    const handleTransitionEnd = useCallback(() => {
        if (pens.length <= 1) {
            return;
        }

        if (trackIndex === pens.length + 1) {
            setTransitionEnabled(false);
            setTrackIndex(1);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setTransitionEnabled(true));
            });
        } else if (trackIndex === 0) {
            setTransitionEnabled(false);
            setTrackIndex(pens.length);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setTransitionEnabled(true));
            });
        }
    }, [pens.length, trackIndex]);

    const visiblePens = pens.length > 1
        ? [pens[pens.length - 1], ...pens, pens[0]]
        : pens;

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
                    className="relative max-w-5xl mx-auto md:px-14"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <button
                        onClick={() => goPrev(true)}
                        aria-label="Previous pen"
                        className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-charcoal/10 bg-white/96 text-charcoal shadow-soft transition-all duration-300 hover:border-charcoal/20 hover:bg-white md:flex"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div
                        className="overflow-hidden rounded-3xl border border-charcoal/5 bg-white shadow-luxury touch-pan-y"
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <div
                            className={`flex items-stretch ease-out ${transitionEnabled ? 'transition-transform duration-500' : ''}`}
                            style={{ transform: `translateX(-${trackIndex * 100}%)` }}
                            onTransitionEnd={handleTransitionEnd}
                        >
                            {visiblePens.map((pen, idx) => (
                                <article
                                    key={`${pen._id}-${idx}`}
                                    className="w-full shrink-0"
                                    aria-hidden={idx !== trackIndex}
                                >
                                    <div className="grid h-full grid-cols-1 md:grid-cols-2 md:min-h-[480px]">
                                        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-primary-light/20 to-pearl sm:h-64 md:h-full">
                                            <img
                                                src={pen.image}
                                                alt={pen.name}
                                                className="h-full w-full object-cover"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 md:to-white/5" />

                                            {pen.badge && (
                                                <div className="absolute top-5 left-5">
                                                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold font-body ${pen.badge === 'Bestseller'
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : pen.badge === 'New'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-primary/20 text-charcoal'
                                                        }`}>
                                                        <Sparkles className="w-3 h-3" />
                                                        {pen.badge}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex h-full flex-col justify-between p-8 md:p-10">
                                            <div className="flex items-center justify-between mb-6">
                                                <span className="font-body text-xs uppercase tracking-widest text-charcoal/40">
                                                    Silver Pens
                                                </span>
                                                <span className="font-body text-xs text-charcoal/40">
                                                    {activeIndex + 1} / {pens.length}
                                                </span>
                                            </div>

                                            <div className="flex-1">
                                                <h3 className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-3">
                                                    {pen.name}
                                                </h3>
                                                <p className="font-body text-sm md:text-base text-charcoal/60 leading-relaxed mb-6">
                                                    {pen.description}
                                                </p>

                                                <div className="flex items-baseline gap-3 mb-8">
                                                    <span className="font-heading text-2xl md:text-3xl font-bold text-charcoal">
                                                        {formatPrice(pen.price)}
                                                    </span>
                                                    {pen.originalPrice && (
                                                        <span className="font-body text-sm text-charcoal/40 line-through">
                                                            {formatPrice(pen.originalPrice)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <Link
                                                to={`/products/${pen.sku}`}
                                                className="inline-flex items-center gap-2 self-start px-6 py-3 bg-charcoal text-pearl rounded-xl font-body text-sm font-semibold hover:bg-graphite transition-colors group"
                                            >
                                                View Details
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={() => goNext(true)}
                        aria-label="Next pen"
                        className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-charcoal/10 bg-white/96 text-charcoal shadow-soft transition-all duration-300 hover:border-charcoal/20 hover:bg-white md:flex"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Dot Indicators */}
                    <div className="flex items-center justify-center gap-2 mt-6">
                        {pens.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => goTo(idx, true)}
                                aria-label={`Go to slide ${idx + 1}`}
                                className={`transition-all duration-300 rounded-full ${idx === activeIndex
                                        ? 'w-8 h-2.5 bg-charcoal'
                                        : 'w-2.5 h-2.5 bg-charcoal/20 hover:bg-charcoal/40'
                                    }`}
                            />
                        ))}
                    </div>

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
