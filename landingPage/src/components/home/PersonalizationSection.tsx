import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { Button } from '../common';
import { Type, Calendar, Quote, Building2, MessageSquare, Sparkles } from 'lucide-react';

const engravingOptions = [
    { icon: Type, text: 'Personal Names & Initials' },
    { icon: Calendar, text: 'Important Dates & Anniversaries' },
    { icon: Quote, text: 'Inspirational Quotes' },
    { icon: Building2, text: 'Corporate Logos & Branding' },
    { icon: MessageSquare, text: 'Custom Messages (up to 50 characters)' },
];

const steps = [
    {
        number: '01',
        title: 'Choose Your Product',
        description: 'Select from our collection of silver pens, keychains, or covers',
    },
    {
        number: '02',
        title: 'Add Your Personal Touch',
        description: 'Enter your text, choose font style, and preview the engraving',
    },
    {
        number: '03',
        title: 'We Craft & Deliver',
        description: 'Expert engraving and premium packaging, delivered to your door',
    },
];

export function PersonalizationSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headingRef = useRef<HTMLDivElement>(null);
    const leftColRef = useRef<HTMLDivElement>(null);
    const stepsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ScrollTrigger.refresh();

        const ctx = gsap.context(() => {
            // Heading animation
            gsap.fromTo(
                headingRef.current,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: headingRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // Left column animation
            gsap.fromTo(
                leftColRef.current,
                { opacity: 0, x: -30 },
                {
                    opacity: 1,
                    x: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: leftColRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );

            // Steps animation
            const stepCards = stepsRef.current?.querySelectorAll('.step-card');
            if (stepCards && stepCards.length > 0) {
                gsap.fromTo(
                    stepCards,
                    { opacity: 0, x: 30 },
                    {
                        opacity: 1,
                        x: 0,
                        stagger: 0.2,
                        duration: 0.6,
                        ease: 'power3.out',
                        scrollTrigger: {
                            trigger: stepsRef.current,
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
            className="py-16 md:py-24 lg:py-32 bg-charcoal text-pearl overflow-hidden relative"
        >
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <div ref={headingRef} className="text-center mb-12 md:mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-primary/10 rounded-full font-body text-sm text-primary uppercase tracking-wider">
                        <Sparkles className="w-4 h-4" />
                        Personalization
                    </span>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                        Not Just Silver.{' '}
                        <span className="text-primary">Your Identity in Silver.</span>
                    </h2>
                    <p className="font-body text-lg md:text-xl text-pearl/70 max-w-2xl mx-auto">
                        Every piece tells a story. Make it yours with custom engraving.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Left Column - What We Engrave + Preview */}
                    <div ref={leftColRef}>
                        <h3 className="font-heading text-xl md:text-2xl font-semibold mb-6">
                            What We Engrave
                        </h3>
                        <ul className="space-y-4 mb-8">
                            {engravingOptions.map((option, index) => {
                                const IconComponent = option.icon;
                                return (
                                    <li
                                        key={index}
                                        className="flex items-center gap-4 font-body text-pearl/80 group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-graphite flex items-center justify-center group-hover:bg-primary/20 transition-colors duration-300">
                                            <IconComponent className="w-5 h-5 text-primary" strokeWidth={1.5} />
                                        </div>
                                        <span className="group-hover:text-pearl transition-colors">{option.text}</span>
                                    </li>
                                );
                            })}
                        </ul>

                        {/* Visual Preview with Image */}
                        <div className="relative rounded-3xl overflow-hidden">
                            <img
                                src="https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80"
                                alt="Engraving process"
                                className="w-full h-64 object-cover"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-transparent" />

                            {/* Content */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                                <p className="font-heading text-2xl md:text-3xl text-primary italic tracking-wide">
                                    "Your Name Here"
                                </p>
                                <p className="font-body text-sm text-pearl/60 mt-2 uppercase tracking-wider">
                                    Engraving Preview
                                </p>
                            </div>

                            {/* Corner decoration */}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <div className="w-2 h-2 rounded-full bg-primary/40" />
                                <div className="w-2 h-2 rounded-full bg-primary/60" />
                                <div className="w-2 h-2 rounded-full bg-primary/80" />
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Engraving Process Steps */}
                    <div ref={stepsRef}>
                        <h3 className="font-heading text-xl md:text-2xl font-semibold mb-6">
                            How It Works
                        </h3>
                        <div className="space-y-6">
                            {steps.map((step, index) => (
                                <div
                                    key={index}
                                    className="step-card group relative flex gap-6 p-6 md:p-8 rounded-2xl bg-graphite/50 border border-primary/10 hover:border-primary/30 transition-all duration-300 hover:bg-graphite/70"
                                >
                                    {/* Step number */}
                                    <div className="flex-shrink-0 relative">
                                        <span className="font-heading text-4xl md:text-5xl font-bold text-primary/30 group-hover:text-primary/50 transition-colors">
                                            {step.number}
                                        </span>
                                        {/* Connecting line */}
                                        {index < steps.length - 1 && (
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 w-px h-6 bg-gradient-to-b from-primary/30 to-transparent" />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div>
                                        <h4 className="font-heading text-lg md:text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                                            {step.title}
                                        </h4>
                                        <p className="font-body text-pearl/60 leading-relaxed">
                                            {step.description}
                                        </p>
                                    </div>

                                    {/* Hover glow */}
                                    <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <div className="mt-10">
                            <Button variant="accent" size="lg" fullWidth icon={<Sparkles className="w-5 h-5" />}>
                                Personalize Your Product
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default PersonalizationSection;
