import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { Button } from '../common';
import { Award, PenTool, Gift, Package } from 'lucide-react';
import heroBelow from '../../assets/hero-below.webp';

const benefits = [
    {
        icon: Award,
        title: 'Silver-Coated Craftsmanship',
        description: 'Handcrafted from silver coating with precision engineering',
    },
    {
        icon: PenTool,
        title: 'Hand-Made',
        description: 'Hand-finished by skilled artisans, with careful attention to every detail',
    },
    {
        icon: Gift,
        title: 'Perfect for Gifting',
        description: 'Ideal for executives, graduates, and milestone celebrations',
    },
    {
        icon: Package,
        title: 'Luxury Packaging',
        description: 'Arrives in a premium gift box, ready to impress',
    },
];

export function ProductSpotlight() {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const benefitsRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Ensure ScrollTrigger refreshes after mount
        ScrollTrigger.refresh();

        const ctx = gsap.context(() => {
            // Content animation
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: contentRef.current,
                        start: 'top 85%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // Image animation
            gsap.fromTo(
                imageRef.current,
                { opacity: 0, scale: 0.95 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: imageRef.current,
                        start: 'top 85%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // Benefits stagger animation
            const benefitCards = benefitsRef.current?.querySelectorAll('.benefit-card');
            if (benefitCards && benefitCards.length > 0) {
                gsap.fromTo(
                    benefitCards,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.15,
                        duration: 0.6,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: benefitsRef.current,
                            start: 'top 85%',
                            end: 'bottom 20%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            }
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-16 md:py-24 lg:py-32 bg-pearl overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div ref={contentRef} className="text-center mb-12 md:mb-16">
                    <span className="inline-block px-4 py-1.5 mb-4 bg-charcoal/5 rounded-full font-body text-sm text-charcoal/60 uppercase tracking-wider">
                        Signature Collection
                    </span>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-4">
                        The Signature Pen.{' '}
                        <span className="text-accent-dark">Crafted in Silver-Coated.</span>
                    </h2>
                    <p className="font-body text-lg md:text-xl text-charcoal/70 max-w-3xl mx-auto leading-relaxed">
                        More than a writing instrument, our silver pen is a statement of refinement.
                        Each piece is meticulously crafted from silver coating, designed to be
                        passed down through generations.
                    </p>
                </div>

                {/* Product Display - Large Image */}
                <div
                    ref={imageRef}
                    className="relative hidden md:block mb-16 md:mb-20 rounded-[2rem] md:rounded-3xl overflow-hidden"
                >
                    {/* Main Image */}
                    <div className="relative aspect-[4/5] sm:aspect-[5/4] md:aspect-[21/9]">
                        <img
                            src={heroBelow}
                            alt="Signature silver pen"
                            className="w-full h-full object-cover"
                        />

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 hidden md:block bg-gradient-to-r from-charcoal/70 via-charcoal/30 to-transparent" />

                        {/* Content overlay */}
                        <div className="absolute inset-0 hidden md:flex items-center">
                            <div className="max-w-xl p-5 sm:p-6 md:p-12">
                                <div className="flex flex-col items-start gap-2 mb-3 md:mb-4 sm:flex-row sm:items-baseline sm:gap-2.5">
                                    <span className="font-heading text-2xl sm:text-3xl md:text-5xl font-bold text-primary leading-none">Silver-Coated</span>
                                    <span className="font-body text-[11px] sm:text-xs md:text-sm text-pearl/75 uppercase tracking-[0.2em] sm:tracking-wider">Premium Finish</span>
                                </div>
                                <p className="max-w-md font-body text-sm sm:text-base md:text-lg text-pearl/80 leading-relaxed">
                                    A premium standard for finish and durability. Each piece goes through
                                    strict quality checks before delivery.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Floating badges */}
                    <div className="absolute top-6 right-6 hidden md:flex flex-col gap-2">
                        <div className="px-3 py-2 md:px-4 md:py-2 bg-pearl/95 backdrop-blur-sm rounded-full shadow-card text-center sm:text-left">
                            <span className="font-body text-xs sm:text-sm font-medium text-charcoal">
                                ✨ Premium Quality
                            </span>
                        </div>
                        <div className="px-3 py-2 md:px-4 md:py-2 bg-charcoal/90 backdrop-blur-sm rounded-full text-center sm:text-left">
                            <span className="font-body text-xs sm:text-sm font-medium text-pearl">
                                Quality Certified
                            </span>
                        </div>
                    </div>
                </div>

                {/* Benefits Grid */}
                <div
                    ref={benefitsRef}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {benefits.map((benefit, index) => {
                        const IconComponent = benefit.icon;
                        return (
                            <div
                                key={index}
                                className="benefit-card group p-6 md:p-8 bg-white rounded-2xl shadow-soft hover:shadow-luxury transition-all duration-500 hover:-translate-y-2 border border-transparent hover:border-primary/20"
                            >
                                {/* Icon */}
                                <div className="w-14 h-14 mb-5 rounded-xl bg-gradient-to-br from-primary-light to-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                    <IconComponent className="w-7 h-7 text-charcoal" strokeWidth={1.5} />
                                </div>

                                <h3 className="font-heading text-lg font-semibold text-charcoal mb-2">
                                    {benefit.title}
                                </h3>
                                <p className="font-body text-sm text-charcoal/60 leading-relaxed">
                                    {benefit.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className="text-center mt-12 md:mt-16">
                    <Link to="/products?category=silver-pens">
                        <Button variant="primary" size="lg" icon={<PenTool className="w-5 h-5" />}>
                            Explore Silver Pens
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default ProductSpotlight;
