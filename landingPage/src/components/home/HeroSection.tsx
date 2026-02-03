import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Button } from '../common';
import {
    ArrowRight,
    Sparkles,
    Star,
    Shield,
    Truck,
    Award
} from 'lucide-react';

export function HeroSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Create master timeline
            const tl = gsap.timeline({ delay: 0.2 });

            // Content animations
            tl.fromTo(
                '.hero-badge',
                { opacity: 0, y: 20, scale: 0.9 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }
            )
                .fromTo(
                    '.hero-title-line',
                    { opacity: 0, y: 40, rotateX: -20 },
                    { opacity: 1, y: 0, rotateX: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' },
                    '-=0.3'
                )
                .fromTo(
                    '.hero-subtitle',
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
                    '-=0.4'
                )
                .fromTo(
                    '.hero-cta',
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' },
                    '-=0.3'
                )
                .fromTo(
                    '.hero-trust',
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' },
                    '-=0.2'
                );

            // Image animations
            tl.fromTo(
                imageRef.current,
                { opacity: 0, scale: 0.9, x: 50 },
                { opacity: 1, scale: 1, x: 0, duration: 1, ease: 'power3.out' },
                '-=1'
            );

            // Stats animations
            tl.fromTo(
                '.hero-stat',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power3.out' },
                '-=0.5'
            );

            // Scroll indicator
            tl.fromTo(
                scrollRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.5 },
                '-=0.2'
            );

            // Floating animation for image
            gsap.to(imageRef.current, {
                y: -15,
                duration: 3,
                ease: 'power1.inOut',
                repeat: -1,
                yoyo: true,
                delay: 1.5,
            });

            // Scroll indicator bounce
            gsap.to(scrollRef.current, {
                y: 10,
                duration: 1.5,
                ease: 'power1.inOut',
                repeat: -1,
                yoyo: true,
                delay: 2,
            });

            // Parallax on background elements
            gsap.to('.hero-bg-shape', {
                y: -30,
                duration: 6,
                ease: 'power1.inOut',
                repeat: -1,
                yoyo: true,
                stagger: 0.5,
            });

        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative min-h-screen flex items-center overflow-hidden"
        >
            {/* ===== BACKGROUND LAYERS ===== */}

            {/* Base gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-pearl via-white to-primary-light/30" />

            {/* Animated blob shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="hero-bg-shape absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/20 to-primary-light/40 blur-3xl" />
                <div className="hero-bg-shape absolute top-1/2 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-accent/10 to-primary/20 blur-3xl" />
                <div className="hero-bg-shape absolute -bottom-32 right-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-t from-primary-light/30 to-transparent blur-3xl" />
            </div>

            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(var(--color-charcoal) 1px, transparent 1px),
                           linear-gradient(90deg, var(--color-charcoal) 1px, transparent 1px)`,
                    backgroundSize: '60px 60px',
                }}
            />

            {/* ===== MAIN CONTENT ===== */}
            <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-24 pb-16 md:pt-32 md:pb-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">

                    {/* ===== LEFT COLUMN - TEXT CONTENT ===== */}
                    <div ref={contentRef} className="order-2 lg:order-1">
                        {/* Badge */}
                        <div className="hero-badge inline-flex items-center gap-2 px-4 py-2 mb-8 bg-charcoal text-pearl rounded-full">
                            <Sparkles className="w-4 h-4 text-primary" />
                            <span className="font-body text-sm font-medium tracking-wide">
                                India's Premium Silver Brand
                            </span>
                            <div className="w-px h-4 bg-pearl/20" />
                            <div className="flex items-center gap-1">
                                <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                                <span className="font-body text-xs">4.9</span>
                            </div>
                        </div>

                        {/* Headline */}
                        <h1 className="mb-6">
                            <span className="hero-title-line block font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-charcoal leading-[1.1]">
                                Everyday Silver.
                            </span>
                            <span className="hero-title-line block font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mt-2">
                                <span className="bg-gradient-to-r from-charcoal via-graphite to-accent-dark bg-clip-text text-transparent">
                                    Made Personal.
                                </span>
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="hero-subtitle font-body text-lg md:text-xl text-charcoal/70 max-w-lg mb-10 leading-relaxed">
                            Premium 925 sterling silver pens, keychains & accessories —
                            personalized with your name, message, or logo. Crafted for those
                            who appreciate the finer things.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-10">
                            <Button
                                variant="primary"
                                size="lg"
                                icon={<ArrowRight className="w-5 h-5" />}
                                className="hero-cta"
                            >
                                Shop Collection
                            </Button>
                            <Button
                                variant="secondary"
                                size="lg"
                                icon={<Sparkles className="w-5 h-5" />}
                                iconPosition="left"
                                className="hero-cta"
                            >
                                Personalize Now
                            </Button>
                        </div>

                        {/* Trust Indicators */}
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="hero-trust flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-charcoal/5 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-charcoal" />
                                </div>
                                <div>
                                    <p className="font-body text-xs text-charcoal/50 uppercase tracking-wider">Certified</p>
                                    <p className="font-body text-sm font-medium text-charcoal">925 Sterling</p>
                                </div>
                            </div>
                            <div className="hero-trust flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-charcoal/5 flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-charcoal" />
                                </div>
                                <div>
                                    <p className="font-body text-xs text-charcoal/50 uppercase tracking-wider">Delivery</p>
                                    <p className="font-body text-sm font-medium text-charcoal">Free Shipping</p>
                                </div>
                            </div>
                            <div className="hero-trust flex items-center gap-2">
                                <div className="w-10 h-10 rounded-xl bg-charcoal/5 flex items-center justify-center">
                                    <Award className="w-5 h-5 text-charcoal" />
                                </div>
                                <div>
                                    <p className="font-body text-xs text-charcoal/50 uppercase tracking-wider">Quality</p>
                                    <p className="font-body text-sm font-medium text-charcoal">Hallmarked</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== RIGHT COLUMN - HERO IMAGE ===== */}
                    <div ref={imageRef} className="order-1 lg:order-2 relative">
                        {/* Main Image Container */}
                        <div className="relative">
                            {/* Glow effect behind image */}
                            <div className="absolute -inset-8 bg-gradient-to-br from-primary/30 via-primary-light/50 to-accent/20 rounded-[3rem] blur-3xl opacity-60" />

                            {/* Image wrapper */}
                            <div className="relative rounded-[2rem] overflow-hidden shadow-luxury border border-white/50">
                                <img
                                    src="https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80"
                                    alt="Premium Silver Pen"
                                    className="w-full aspect-[4/5] object-cover"
                                />

                                {/* Gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />

                                {/* Image content overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="font-heading text-2xl md:text-3xl text-primary italic mb-1">
                                                "Your Name"
                                            </p>
                                            <p className="font-body text-sm text-pearl/70">
                                                Laser engraved with precision
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-heading text-4xl md:text-5xl font-bold text-primary">925</p>
                                            <p className="font-body text-xs text-pearl/60 uppercase tracking-wider">Sterling</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Cards */}
                            <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6 px-5 py-3 bg-white rounded-2xl shadow-card border border-charcoal/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                        <Star className="w-5 h-5 text-amber-500" fill="currentColor" />
                                    </div>
                                    <div>
                                        <p className="font-heading text-lg font-bold text-charcoal">500+</p>
                                        <p className="font-body text-xs text-charcoal/60">5-Star Reviews</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -bottom-4 -left-4 md:-bottom-6 md:-left-6 px-5 py-3 bg-charcoal rounded-2xl shadow-card">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-heading text-lg font-bold text-pearl">Bestseller</p>
                                        <p className="font-body text-xs text-pearl/60">Classic Pen</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== BOTTOM STATS BAR ===== */}
                <div ref={statsRef} className="mt-16 md:mt-24 pt-8 border-t border-charcoal/10">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div className="hero-stat text-center md:text-left">
                            <p className="font-heading text-3xl md:text-4xl font-bold text-charcoal">10K+</p>
                            <p className="font-body text-sm text-charcoal/60 mt-1">Happy Customers</p>
                        </div>
                        <div className="hero-stat text-center md:text-left">
                            <p className="font-heading text-3xl md:text-4xl font-bold text-charcoal">50+</p>
                            <p className="font-body text-sm text-charcoal/60 mt-1">Product Designs</p>
                        </div>
                        <div className="hero-stat text-center md:text-left">
                            <p className="font-heading text-3xl md:text-4xl font-bold text-charcoal">100+</p>
                            <p className="font-body text-sm text-charcoal/60 mt-1">Corporate Clients</p>
                        </div>
                        <div className="hero-stat text-center md:text-left">
                            <p className="font-heading text-3xl md:text-4xl font-bold text-charcoal">4.9★</p>
                            <p className="font-body text-sm text-charcoal/60 mt-1">Average Rating</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
