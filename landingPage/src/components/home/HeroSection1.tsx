import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { Button } from '../common';
import { ArrowRight, Sparkles } from 'lucide-react';

// Hero background images for subtle crossfade
const heroBackgrounds = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1585336261022-680e295ce3fe?w=1200&q=85',
        alt: 'Personalized silver pen with elegant engraving',
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1622434641406-a158123450f9?w=1200&q=85',
        alt: 'Luxury silver keychain with personal message',
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200&q=85',
        alt: 'Premium gift packaging with silver accessories',
    },
];

export function HeroSection1() {
    const sectionRef = useRef<HTMLElement>(null);
    const [currentBg, setCurrentBg] = useState(0);

    // Background crossfade
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % heroBackgrounds.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // GSAP entrance animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

            tl.fromTo(
                '.hero-content > *',
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }
            ).fromTo(
                '.hero-image-card',
                { opacity: 0, scale: 0.98 },
                { opacity: 1, scale: 1, duration: 0.8 },
                '-=0.4'
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="bg-pearl pt-20 md:pt-24 pb-12 md:pb-16"
            aria-label="Hero section"
        >
            <div className="max-w-8xl mx-auto px-4 sm:px-6">
                {/* Hero card with rounded corners and shadow */}
                <div className="hero-image-card relative overflow-hidden rounded-2xl md:rounded-3xl shadow-luxury">
                    {/* Background images with crossfade */}
                    <div className="relative aspect-[16/10] sm:aspect-[16/8] md:aspect-[16/7] lg:aspect-[16/6]">
                        {heroBackgrounds.map((bg, index) => (
                            <div
                                key={bg.id}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentBg ? 'opacity-100' : 'opacity-0'
                                    }`}
                            >
                                <img
                                    src={bg.image}
                                    alt={bg.alt}
                                    className="w-full h-full object-cover"
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                />
                            </div>
                        ))}

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/50 to-charcoal/30" />

                        {/* Content overlay */}
                        <div className="hero-content absolute inset-0 flex flex-col justify-center p-6 sm:p-8 md:p-12 lg:p-16 max-w-2xl">
                            {/* Trust badge */}
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-4 w-fit bg-white/15 backdrop-blur-sm rounded-full border border-white/20">
                                <div className="w-3.5 h-3.5 rounded-full bg-primary flex items-center justify-center">
                                    <span className="text-charcoal text-[8px] font-bold">✓</span>
                                </div>
                                <span className="font-body text-xs text-pearl/90 tracking-wide">
                                    BIS Hallmarked • 925 Silver
                                </span>
                            </div>

                            {/* Headline */}
                            <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-pearl leading-tight mb-3 md:mb-4">
                                Personalized Silver for{' '}
                                <span className="text-primary-light">Everyday Elegance</span>
                            </h1>

                            {/* Sub-headline */}
                            <p className="font-body text-sm sm:text-base md:text-lg text-pearl/75 leading-relaxed mb-5 md:mb-6 max-w-lg">
                                Premium engraved pens, keychains & accessories crafted in sterling silver.
                            </p>

                            {/* CTA buttons */}
                            <div className="flex flex-wrap items-center gap-3">
                                <Button
                                    variant="primary"
                                    size="md"
                                    icon={<ArrowRight className="w-4 h-4" />}
                                    className="bg-charcoal text-charcoal hover:bg-primary-light text-sm"
                                >
                                    Explore Collection
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="md"
                                    icon={<Sparkles className="w-4 h-4" />}
                                    iconPosition="left"
                                    className="text-pearl/90 border-pearl/30 hover:bg-white/10 text-sm"
                                >
                                    Personalize
                                </Button>
                            </div>
                        </div>

                        {/* Slide indicators */}
                        <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 flex items-center gap-1.5">
                            {heroBackgrounds.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentBg(index)}
                                    className={`h-1 rounded-full transition-all duration-300 ${index === currentBg
                                        ? 'w-6 bg-pearl'
                                        : 'w-1.5 bg-pearl/40 hover:bg-pearl/60'
                                        }`}
                                    aria-label={`View image ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Trust bar below hero */}
                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-6 md:mt-8">
                    <span className="flex items-center gap-2 font-body text-xs text-charcoal/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-charcoal/40" />
                        BIS Hallmarked
                    </span>
                    <span className="flex items-center gap-2 font-body text-xs text-charcoal/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-charcoal/40" />
                        925 Sterling Silver
                    </span>
                    <span className="flex items-center gap-2 font-body text-xs text-charcoal/70">
                        <span className="w-1.5 h-1.5 rounded-full bg-charcoal/40" />
                        Luxury Gift Packaging
                    </span>
                </div>
            </div>
        </section>
    );
}

export default HeroSection1;
