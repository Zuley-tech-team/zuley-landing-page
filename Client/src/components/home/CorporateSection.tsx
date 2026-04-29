import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { Button } from '../common';
import { Building2, Users, Package, ArrowRight, CheckCircle } from 'lucide-react';
import corporateHero from '../../assets/corporate-hero.webp';

const benefits = [
    { icon: Building2, text: 'Custom requests welcomed for bulk orders' },
    { icon: Package, text: 'Bulk pricing available' },
    { icon: Users, text: 'Dedicated account manager' },
];

export function CorporateSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ScrollTrigger.refresh();

        const ctx = gsap.context(() => {
            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: contentRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={sectionRef}
            id="corporate"
            className="py-12 md:py-16 lg:py-20 bg-pearl"
        >
            <div className="max-w-7xl mx-auto px-6">
                <div
                    ref={contentRef}
                    className="relative rounded-3xl overflow-hidden"
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left - Content */}
                        <div className="order-2 lg:order-1 relative z-10 p-8 md:p-12 lg:p-16 bg-gradient-to-br from-slate-100 via-white to-slate-50 flex flex-col justify-center">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 w-fit bg-charcoal/5 rounded-full font-body text-sm text-charcoal/70 uppercase tracking-wider">
                                <Building2 className="w-4 h-4" />
                                Corporate Solutions
                            </span>

                            <h2 className="font-heading text-3xl md:text-4xl font-bold text-charcoal mb-4">
                                Elevate Your Corporate Gifting
                            </h2>
                            <p className="font-body text-lg text-charcoal/70 mb-8 leading-relaxed">
                                Premium branded silver gifts for your team and clients. Perfect for
                                employee recognition, client appreciation, and corporate events.
                            </p>

                            {/* Benefits */}
                            <div className="space-y-4 mb-8">
                                {benefits.map((benefit, index) => {
                                    const IconComponent = benefit.icon;
                                    return (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-charcoal/5 flex items-center justify-center">
                                                <IconComponent className="w-5 h-5 text-charcoal" strokeWidth={1.5} />
                                            </div>
                                            <span className="font-body text-charcoal/80">{benefit.text}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Trust badge */}
                            <div className="flex items-center gap-2 mb-8 text-charcoal/60">
                                <CheckCircle className="w-5 h-5 text-success" />
                                <span className="font-body text-sm">Trusted by many companies</span>
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-row flex-wrap gap-3">
                                <Link to="/corporate">
                                    <Button variant="primary" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                                        Explore Corporate Gifts
                                    </Button>
                                </Link>
                                <Link to="/corporate#corporate-enquiry">
                                    <Button variant="secondary" size="sm">
                                        Request Quote
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Right - Image */}
                        <div className="order-1 lg:order-2 relative min-h-[300px] lg:min-h-[500px]">
                            <img
                                src={corporateHero}
                                alt="Corporate gifting"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-transparent to-transparent lg:from-white/50" />

                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default CorporateSection;
