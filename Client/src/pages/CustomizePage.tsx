import { Sparkles, PenTool, Type, Building2, CalendarDays, Gift } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/home';

const processSteps = [
    {
        title: 'Choose Your Silver',
        description: 'Select premium silver pens crafted in silver coating.',
        icon: PenTool,
    },
    {
        title: 'Design Your Engraving',
        description: 'Add names, initials, dates, messages, or logos with elegant font styles.',
        icon: Type,
    },
    {
        title: 'Crafted and Delivered',
        description: 'We laser-engrave, quality-check, and deliver in luxury packaging.',
        icon: Sparkles,
    },
];

const occasionCards = [
    {
        title: 'Birthdays and Milestones',
        icon: Gift,
        idea: 'Happy 30th, Aisha',
    },
    {
        title: 'Anniversaries and Weddings',
        icon: CalendarDays,
        idea: 'Always and Forever · 25.12.2022',
    },
    {
        title: 'Corporate Recognition',
        icon: Building2,
        idea: 'Employee of the Year · Acme Corp',
    },
];

const galleryExamples = [
    { text: 'Rajesh Kumar', style: 'Classic Serif', type: 'Silver Pen' },
    { text: 'Always and Forever', style: 'Elegant Script', type: 'Silver Pen' },
    { text: 'Class of 2026', style: 'Modern Sans', type: 'Heritage Pen' },
    { text: 'Acme Corp', style: 'Monogram', type: 'Corporate Pen' },
    { text: 'Dr. A. Sharma', style: 'Classic Serif', type: 'Executive Pen' },
    { text: '25.12.2024', style: 'Modern Sans', type: 'Fountain Pen' },
];

const faqItems = [
    {
        q: 'How many characters can be engraved?',
        a: 'Most products support up to 20 characters for optimal readability. Corporate logo engraving supports vector artwork.',
    },
    {
        q: 'Can I change engraving after placing order?',
        a: 'Changes are possible only in the early production window. Please contact support immediately after checkout.',
    },
    {
        q: 'Does personalization affect delivery timeline?',
        a: 'Yes, personalized items usually add 5 to 7 business days for engraving and final quality checks.',
    },
];

export function CustomizePage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-20">
                <section className="relative overflow-hidden bg-charcoal text-pearl">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(183,110,121,0.28),transparent_45%)]" />
                    <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-pearl/10 rounded-full text-sm uppercase tracking-wider">
                            <Sparkles className="w-4 h-4" />
                            Personalization Studio
                        </span>
                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-3xl">
                            Turn Silver Into Something Personal
                        </h1>
                        <p className="font-body text-lg text-pearl/70 max-w-2xl mt-5 leading-relaxed">
                            Every piece tells a story. Add names, dates, messages, or logos and make your gift one of one.
                        </p>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-14 md:py-18">
                    <div className="text-center mb-10">
                        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-charcoal">How It Works</h2>
                        <p className="font-body text-charcoal/65 mt-3">Simple, guided personalization from selection to delivery.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {processSteps.map((step) => {
                            const Icon = step.icon;
                            return (
                                <article key={step.title} className="bg-white rounded-2xl p-7 shadow-soft border border-charcoal/10">
                                    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-5">
                                        <Icon className="w-6 h-6 text-charcoal" />
                                    </div>
                                    <h3 className="font-heading text-xl text-charcoal font-semibold mb-2">{step.title}</h3>
                                    <p className="font-body text-charcoal/65">{step.description}</p>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section className="bg-white border-y border-charcoal/10">
                    <div className="max-w-7xl mx-auto px-6 py-14 md:py-18">
                        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-charcoal text-center mb-3">
                            Engraving Ideas by Occasion
                        </h2>
                        <p className="font-body text-charcoal/65 text-center mb-10">
                            Start with inspiration, then make it uniquely yours.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {occasionCards.map((card) => {
                                const Icon = card.icon;
                                return (
                                    <article key={card.title} className="rounded-2xl bg-pearl p-6 border border-charcoal/10">
                                        <div className="w-11 h-11 rounded-lg bg-charcoal/8 flex items-center justify-center mb-4">
                                            <Icon className="w-5 h-5 text-charcoal" />
                                        </div>
                                        <h3 className="font-heading text-xl text-charcoal font-semibold mb-2">{card.title}</h3>
                                        <p className="font-body text-charcoal/60">Sample engraving: {card.idea}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-14 md:py-18">
                    <h2 className="font-heading text-3xl md:text-4xl font-semibold text-charcoal text-center mb-3">
                        Inspiration Gallery
                    </h2>
                    <p className="font-body text-charcoal/65 text-center mb-10">
                        Real engraving ideas across personal gifting and corporate branding.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {galleryExamples.map((example) => (
                            <article key={`${example.text}-${example.type}`} className="rounded-2xl bg-white p-6 border border-charcoal/10 shadow-soft">
                                <p className="font-heading text-2xl text-charcoal italic mb-3">{example.text}</p>
                                <p className="font-body text-sm text-charcoal/65">Font: {example.style}</p>
                                <p className="font-body text-sm text-charcoal/65">Product: {example.type}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="bg-white border-t border-charcoal/10">
                    <div className="max-w-4xl mx-auto px-6 py-14 md:py-18">
                        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-charcoal text-center mb-8">
                            Personalization FAQs
                        </h2>
                        <div className="space-y-4">
                            {faqItems.map((item) => (
                                <details key={item.q} className="rounded-xl bg-pearl p-5 border border-charcoal/10">
                                    <summary className="font-body font-semibold text-charcoal cursor-pointer">{item.q}</summary>
                                    <p className="font-body text-charcoal/70 mt-3">{item.a}</p>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default CustomizePage;
