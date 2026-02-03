import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { Gem, Hammer, CheckCircle, Award, Shield, Play } from 'lucide-react';

const pillars = [
    {
        icon: Gem,
        title: '925 Sterling Silver',
        subtitle: 'Pure Silver Standard',
        description: 'We use only 925 sterling silver, the international benchmark for quality and durability. Each piece is hallmarked for authenticity.',
    },
    {
        icon: Hammer,
        title: 'Handcrafted Precision',
        subtitle: 'Artisan Excellence',
        description: 'Skilled craftsmen shape each piece with meticulous attention to detail, combining traditional techniques with modern tools.',
    },
    {
        icon: CheckCircle,
        title: 'Quality Assurance',
        subtitle: 'Rigorous Testing',
        description: 'Every product passes through multiple quality checkpoints, ensuring flawless finish, smooth mechanics, and perfect engraving.',
    },
    {
        icon: Award,
        title: 'Hallmark Certified',
        subtitle: 'Guaranteed Authenticity',
        description: 'Official hallmark certification proves the purity and quality of our silver, giving you complete peace of mind.',
    },
];

export function CraftsmanshipSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const videoRef = useRef<HTMLDivElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const pillarsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ScrollTrigger.refresh();

        const ctx = gsap.context(() => {
            // Video section animation
            gsap.fromTo(
                videoRef.current,
                { opacity: 0, scale: 0.95 },
                {
                    opacity: 1,
                    scale: 1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: videoRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

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

            // Pillars animation
            const pillarCards = pillarsRef.current?.querySelectorAll('.pillar-card');
            if (pillarCards && pillarCards.length > 0) {
                gsap.fromTo(
                    pillarCards,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        stagger: 0.15,
                        duration: 0.7,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: pillarsRef.current,
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
            className="py-16 md:py-24 lg:py-32 bg-charcoal text-pearl overflow-hidden"
        >
            {/* Hero Video/Image Section */}
            <div className="relative mb-16 md:mb-24">
                <div
                    ref={videoRef}
                    className="relative max-w-7xl mx-auto px-6"
                >
                    <div className="relative aspect-video md:aspect-[21/9] rounded-3xl overflow-hidden">
                        {/* Background Image */}
                        <img
                            src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=1600&q=80"
                            alt="Craftsmanship"
                            className="w-full h-full object-cover"
                        />

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-charcoal/60" />

                        {/* Center content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                            {/* Play button */}
                            <button className="group w-20 h-20 md:w-24 md:h-24 rounded-full bg-pearl/10 backdrop-blur-sm border border-pearl/20 flex items-center justify-center hover:bg-pearl/20 hover:scale-110 transition-all duration-300">
                                <Play className="w-8 h-8 md:w-10 md:h-10 text-pearl ml-1" fill="currentColor" />
                            </button>
                            <p className="font-body text-sm text-pearl/60 mt-4">Watch Our Craftsmanship</p>
                        </div>

                        {/* Corner stats */}
                        <div className="absolute top-6 right-6 text-right">
                            <div className="flex items-baseline gap-1 justify-end">
                                <span className="font-heading text-5xl md:text-7xl font-bold text-primary">925</span>
                            </div>
                            <p className="font-body text-sm text-pearl/50 uppercase tracking-wider">Sterling Silver</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div ref={headerRef} className="text-center mb-12 md:mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-primary/10 rounded-full font-body text-sm text-primary uppercase tracking-wider">
                        <Shield className="w-4 h-4" />
                        Quality Promise
                    </span>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Crafted to Perfection.{' '}
                        <span className="text-primary">Built to Last.</span>
                    </h2>
                    <p className="font-body text-lg md:text-xl text-pearl/70 max-w-3xl mx-auto">
                        Every piece begins with 925 sterling silver—the highest standard of purity.
                        Our artisans combine traditional craftsmanship with modern precision.
                    </p>
                </div>

                {/* Pillars Grid */}
                <div
                    ref={pillarsRef}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {pillars.map((pillar, index) => {
                        const IconComponent = pillar.icon;
                        return (
                            <div
                                key={index}
                                className="pillar-card group p-6 md:p-8 rounded-2xl bg-graphite/50 border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:bg-graphite/70"
                            >
                                {/* Icon with glow */}
                                <div className="relative w-14 h-14 mb-6">
                                    {/* Glow effect */}
                                    <div className="absolute inset-0 rounded-xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="relative w-full h-full rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <IconComponent className="w-7 h-7 text-primary" strokeWidth={1.5} />
                                    </div>
                                </div>

                                {/* Content */}
                                <p className="font-body text-xs text-primary uppercase tracking-wider mb-2">
                                    {pillar.subtitle}
                                </p>
                                <h3 className="font-heading text-lg font-semibold mb-3 group-hover:text-primary transition-colors">
                                    {pillar.title}
                                </h3>
                                <p className="font-body text-sm text-pearl/60 leading-relaxed">
                                    {pillar.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Certification badges */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-12 md:mt-16 pt-12 border-t border-pearl/10">
                    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-graphite/50 border border-primary/20">
                        <Award className="w-5 h-5 text-primary" />
                        <span className="font-body text-sm text-pearl/70">BIS Hallmarked</span>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-graphite/50 border border-primary/20">
                        <Shield className="w-5 h-5 text-primary" />
                        <span className="font-body text-sm text-pearl/70">100% Authentic</span>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-graphite/50 border border-primary/20">
                        <CheckCircle className="w-5 h-5 text-primary" />
                        <span className="font-body text-sm text-pearl/70">Quality Tested</span>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CraftsmanshipSection;
