import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { Button } from '../common';
import { Cake, Heart, GraduationCap, Briefcase, ArrowRight, Download } from 'lucide-react';

const occasions = [
    {
        icon: Cake,
        title: 'Birthdays & Milestones',
        description: 'Celebrate another year with a gift they\'ll treasure forever',
        gradient: 'from-rose-100 via-rose-50 to-white',
        iconBg: 'bg-rose-100',
        iconColor: 'text-rose-500',
        image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&q=80',
    },
    {
        icon: Heart,
        title: 'Anniversaries & Weddings',
        description: 'Mark your love story with silver that shines as bright as your bond',
        gradient: 'from-pink-100 via-pink-50 to-white',
        iconBg: 'bg-pink-100',
        iconColor: 'text-pink-500',
        image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&q=80',
    },
    {
        icon: GraduationCap,
        title: 'Graduations & Achievements',
        description: 'Honor their success with a symbol of their hard work',
        gradient: 'from-blue-100 via-blue-50 to-white',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-500',
        image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&q=80',
    },
    {
        icon: Briefcase,
        title: 'Corporate Gifts & Awards',
        description: 'Recognize excellence with premium branded silver gifts',
        gradient: 'from-slate-100 via-slate-50 to-white',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-600',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80',
    },
];

export function GiftingSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

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

            // Cards stagger animation
            const cards = cardsRef.current?.querySelectorAll('.occasion-card');
            if (cards && cards.length > 0) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, y: 40, scale: 0.95 },
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,
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
            className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-pearl to-white overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div ref={headerRef} className="text-center mb-12 md:mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-rose-100 rounded-full font-body text-sm text-rose-600 uppercase tracking-wider">
                        <Heart className="w-4 h-4" />
                        Meaningful Gifting
                    </span>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-4">
                        Gifts That Last Longer Than Moments
                    </h2>
                    <p className="font-body text-lg md:text-xl text-charcoal/70 max-w-2xl mx-auto">
                        Perfect for life's most meaningful occasions
                    </p>
                </div>

                {/* Occasion Cards Grid */}
                <div
                    ref={cardsRef}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {occasions.map((occasion, index) => {
                        const IconComponent = occasion.icon;
                        return (
                            <div
                                key={index}
                                className="occasion-card group relative rounded-3xl overflow-hidden shadow-soft hover:shadow-luxury transition-all duration-500 hover:-translate-y-3"
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0">
                                    <img
                                        src={occasion.image}
                                        alt={occasion.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent opacity-80" />
                                </div>

                                {/* Content */}
                                <div className="relative p-6 md:p-8 min-h-[320px] flex flex-col">
                                    {/* Icon */}
                                    <div
                                        className={`w-16 h-16 mb-6 rounded-2xl ${occasion.iconBg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-soft`}
                                    >
                                        <IconComponent className={`w-8 h-8 ${occasion.iconColor}`} strokeWidth={1.5} />
                                    </div>

                                    {/* Spacer */}
                                    <div className="flex-1" />

                                    {/* Text */}
                                    <h3 className="font-heading text-xl font-bold text-pearl mb-2">
                                        {occasion.title}
                                    </h3>
                                    <p className="font-body text-sm text-pearl/80 leading-relaxed mb-4">
                                        {occasion.description}
                                    </p>

                                    {/* Link */}
                                    <button className="inline-flex items-center gap-2 font-body text-sm font-medium text-pearl/90 hover:text-pearl transition-colors group/link">
                                        Shop for {occasion.title.split(' ')[0]}
                                        <ArrowRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 md:mt-16">
                    <Button variant="primary" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                        Explore Gift Collection
                    </Button>
                    <Button variant="ghost" size="lg" icon={<Download className="w-5 h-5" />} iconPosition="left">
                        Download Gift Guide
                    </Button>
                </div>
            </div>
        </section>
    );
}

export default GiftingSection;
