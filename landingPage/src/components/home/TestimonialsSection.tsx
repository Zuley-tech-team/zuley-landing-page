import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { Quote, Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
    {
        quote: "The silver pen I ordered for my father's retirement was absolutely perfect. The engraving was flawless, and the packaging made it feel so special. He was moved to tears. Thank you for helping me create such a meaningful gift.",
        name: 'Priya Sharma',
        location: 'Mumbai',
        product: 'Personalized Silver Pen',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    },
    {
        quote: "We ordered 50 silver keychains for our corporate event, each with our company logo. The quality exceeded our expectations, and our clients loved them. Professional service from start to finish.",
        name: 'Rajesh Kumar',
        title: 'CEO, TechVision',
        location: 'Bangalore',
        product: 'Corporate Keychains',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&q=80',
    },
    {
        quote: "Bought this as an anniversary gift for my wife. The engraving of our wedding date was beautifully done. It's not just a phone cover—it's a daily reminder of our love story.",
        name: 'Amit Patel',
        location: 'Bangalore',
        product: 'Engraved Phone Cover',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    },
    {
        quote: "The attention to detail is remarkable. I've purchased three pens now - for my graduation, my promotion, and my brother's wedding. Each one has been perfect.",
        name: 'Sneha Reddy',
        location: 'Hyderabad',
        product: 'Silver Pen Collection',
        rating: 5,
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
    },
];

export function TestimonialsSection() {
    const sectionRef = useRef<HTMLElement>(null);
    const headerRef = useRef<HTMLDivElement>(null);
    const sliderRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

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

            // Slider animation
            gsap.fromTo(
                sliderRef.current,
                { opacity: 0, y: 40 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: sliderRef.current,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            if (!isAnimating) {
                handleNext();
            }
        }, 6000);

        return () => clearInterval(interval);
    }, [currentIndex, isAnimating]);

    const handlePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
        setTimeout(() => setIsAnimating(false), 500);
    };

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1));
        setTimeout(() => setIsAnimating(false), 500);
    };

    return (
        <section
            ref={sectionRef}
            className="py-16 md:py-24 lg:py-32 bg-gradient-to-b from-white to-pearl overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div ref={headerRef} className="text-center mb-12 md:mb-16">
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-4 bg-amber-100 rounded-full font-body text-sm text-amber-700 uppercase tracking-wider">
                        <Star className="w-4 h-4" fill="currentColor" />
                        Customer Love
                    </span>
                    <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold text-charcoal mb-4">
                        Stories from Our Customers
                    </h2>
                    <p className="font-body text-lg md:text-xl text-charcoal/70">
                        Real gifts. Real moments. Real emotions.
                    </p>
                    {/* Overall rating */}
                    <div className="flex items-center justify-center gap-2 mt-4">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-5 h-5 text-amber-400" fill="currentColor" />
                            ))}
                        </div>
                        <span className="font-body text-charcoal/70">4.9/5 from 500+ reviews</span>
                    </div>
                </div>

                {/* Testimonial Slider */}
                <div ref={sliderRef} className="relative max-w-4xl mx-auto">
                    {/* Cards Container */}
                    <div className="relative overflow-hidden rounded-3xl">
                        <div
                            className="flex transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="w-full flex-shrink-0 p-4 md:p-8"
                                >
                                    <div className="relative bg-white rounded-3xl p-8 md:p-10 border border-primary/10 shadow-card">
                                        {/* Quote icon */}
                                        <div className="absolute -top-4 left-8 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-soft">
                                            <Quote className="w-6 h-6 text-charcoal" fill="currentColor" />
                                        </div>

                                        {/* Quote text */}
                                        <blockquote className="font-body text-lg md:text-xl text-charcoal/80 leading-relaxed mb-8 mt-4 italic">
                                            "{testimonial.quote}"
                                        </blockquote>

                                        {/* Author info */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                            {/* Avatar with real image */}
                                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/30 shadow-soft">
                                                <img
                                                    src={testimonial.image}
                                                    alt={testimonial.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div className="flex-1">
                                                {/* Stars */}
                                                <div className="flex gap-1 mb-1">
                                                    {[...Array(testimonial.rating)].map((_, i) => (
                                                        <Star key={i} className="w-4 h-4 text-amber-400" fill="currentColor" />
                                                    ))}
                                                </div>
                                                <p className="font-heading font-semibold text-charcoal text-lg">
                                                    {testimonial.name}
                                                </p>
                                                <p className="font-body text-sm text-charcoal/60">
                                                    {testimonial.title ? `${testimonial.title}, ` : ''}{testimonial.location}
                                                </p>
                                            </div>

                                            {/* Product tag */}
                                            <div className="px-4 py-2 bg-charcoal/5 rounded-full">
                                                <span className="font-body text-sm text-charcoal/70">{testimonial.product}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={handlePrev}
                            className="w-12 h-12 rounded-full bg-white border border-primary/20 flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 transition-colors shadow-soft"
                            aria-label="Previous testimonial"
                        >
                            <ChevronLeft className="w-5 h-5 text-charcoal" />
                        </button>

                        {/* Dots */}
                        <div className="flex gap-2">
                            {testimonials.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (!isAnimating) {
                                            setIsAnimating(true);
                                            setCurrentIndex(index);
                                            setTimeout(() => setIsAnimating(false), 500);
                                        }
                                    }}
                                    className={`h-3 rounded-full transition-all duration-300 ${index === currentIndex
                                            ? 'bg-charcoal w-8'
                                            : 'bg-charcoal/20 hover:bg-charcoal/40 w-3'
                                        }`}
                                    aria-label={`Go to testimonial ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleNext}
                            className="w-12 h-12 rounded-full bg-white border border-primary/20 flex items-center justify-center hover:bg-primary/10 hover:border-primary/40 transition-colors shadow-soft"
                            aria-label="Next testimonial"
                        >
                            <ChevronRight className="w-5 h-5 text-charcoal" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default TestimonialsSection;
