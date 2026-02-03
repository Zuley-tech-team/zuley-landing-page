import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { Button } from '../common';
import { Pen, Smartphone, ArrowRight } from 'lucide-react';
import { getCategorySlug } from '../../data/products';

const categories = [
    {
        title: 'Silver Pens',
        description: 'The art of writing, elevated in sterling silver',
        cta: 'Shop Pens',
        icon: Pen,
        images: [
            'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=600&q=80',
            'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=80',
            'https://images.unsplash.com/photo-1518674660708-0e2c0473e68e?w=600&q=80',
        ],
    },
    // {
    //     title: 'Silver Keychains',
    //     description: 'Carry your identity with you, every day',
    //     cta: 'Shop Keychains',
    //     icon: Key,
    //     images: [
    //         'https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&q=80',
    //         'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=600&q=80',
    //         'https://images.unsplash.com/photo-1609709295948-17d77cb2a69b?w=600&q=80',
    //     ],
    // },
    {
        title: 'Silver Phone Covers',
        description: 'Protect your device in premium silver style',
        cta: 'Shop Covers',
        icon: Smartphone,
        images: [
            'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80',
            'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=600&q=80',
            'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80',
        ],
    },
];

export function CategorySection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);
    const [activeImages, setActiveImages] = useState<number[]>([0, 0, 0]);

    // Store interval IDs in a ref to persist across re-renders
    const hoverIntervalsRef = useRef<(ReturnType<typeof setInterval> | null)[]>([null, null, null]);

    // Cycle images on hover
    const handleMouseEnter = (cardIndex: number) => {
        // Clear any existing interval for this card first
        if (hoverIntervalsRef.current[cardIndex]) {
            clearInterval(hoverIntervalsRef.current[cardIndex]!);
        }

        const interval = setInterval(() => {
            setActiveImages((prev) => {
                const newImages = [...prev];
                newImages[cardIndex] = (newImages[cardIndex] + 1) % categories[cardIndex].images.length;
                return newImages;
            });
        }, 800);

        hoverIntervalsRef.current[cardIndex] = interval;
    };

    const handleMouseLeave = (cardIndex: number) => {
        if (hoverIntervalsRef.current[cardIndex]) {
            clearInterval(hoverIntervalsRef.current[cardIndex]!);
            hoverIntervalsRef.current[cardIndex] = null;
        }
        setActiveImages((prev) => {
            const newImages = [...prev];
            newImages[cardIndex] = 0;
            return newImages;
        });
    };

    useEffect(() => {
        ScrollTrigger.refresh();

        const ctx = gsap.context(() => {
            // Header animation
            gsap.fromTo(
                headerRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.7,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: headerRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // Cards animation
            const cards = cardsRef.current?.querySelectorAll('.category-card');
            if (cards && cards.length > 0) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.15,
                        duration: 0.6,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: cardsRef.current,
                            start: 'top 85%',
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
            className="py-12 md:py-16 lg:py-20 bg-pearl"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Section Header */}
                <div ref={headerRef} className="text-center mb-10 md:mb-12">
                    <span className="inline-block px-3 py-1 mb-3 bg-charcoal/5 rounded-full font-body text-xs text-charcoal/60 uppercase tracking-wider">
                        Our Collection
                    </span>
                    <h2 className="font-heading text-2xl md:text-3xl lg:text-4xl font-bold text-charcoal mb-3">
                        Explore Our Silver Collection
                    </h2>
                    <p className="font-body text-sm md:text-base text-charcoal/60 max-w-lg mx-auto">
                        Premium accessories designed for everyday elegance
                    </p>
                </div>

                {/* Category Cards Grid - Equal Width */}
                <div
                    ref={cardsRef}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto"
                >
                    {categories.map((category, index) => {
                        const IconComponent = category.icon;
                        const categorySlug = getCategorySlug(category.title);

                        return (
                            <Link
                                key={index}
                                to={`/products?category=${categorySlug}`}
                                className="category-card group bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-luxury transition-all duration-500 cursor-pointer block"
                                onMouseEnter={() => handleMouseEnter(index)}
                                onMouseLeave={() => handleMouseLeave(index)}
                            >
                                {/* Image Area - Separate from background */}
                                <div className="relative aspect-video overflow-hidden">
                                    {category.images.map((img, imgIndex) => (
                                        <img
                                            key={imgIndex}
                                            src={img}
                                            alt={`${category.title} variant ${imgIndex + 1}`}
                                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imgIndex === activeImages[index] ? 'opacity-100' : 'opacity-0'
                                                }`}
                                            loading="lazy"
                                        />
                                    ))}

                                    {/* Subtle overlay on hover */}
                                    <div className="absolute inset-0 bg-charcoal/0 group-hover:bg-charcoal/10 transition-colors duration-300" />

                                    {/* Badge */}
                                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm shadow-sm">
                                        <span className="font-body text-[10px] uppercase tracking-wider font-medium text-charcoal/70">
                                            Personalizable
                                        </span>
                                    </div>

                                    {/* Image indicators */}
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        {category.images.map((_, imgIndex) => (
                                            <span
                                                key={imgIndex}
                                                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${imgIndex === activeImages[index]
                                                    ? 'bg-white'
                                                    : 'bg-white/50'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-4 md:p-5">
                                    {/* Icon + Title row */}
                                    <div className="flex items-center gap-2.5 mb-2.5">
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-light to-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                            <IconComponent className="w-4.5 h-4.5 text-charcoal" strokeWidth={1.5} />
                                        </div>
                                        <h3 className="font-heading text-lg md:text-xl font-semibold text-charcoal">
                                            {category.title}
                                        </h3>
                                    </div>

                                    {/* Description */}
                                    <p className="font-body text-sm text-charcoal/60 leading-relaxed mb-3">
                                        {category.description}
                                    </p>

                                    {/* CTA */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        icon={<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                        className="text-charcoal hover:text-charcoal p-0 hover:bg-transparent"
                                    >
                                        {category.cta}
                                    </Button>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default CategorySection;
