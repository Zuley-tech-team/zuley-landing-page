import { Gem, HeartHandshake, Hammer, ShieldCheck } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/home';

const values = [
    {
        title: 'Everyday Luxury',
        icon: Gem,
        description: 'Premium silver made to be used daily, not hidden away.',
    },
    {
        title: 'Meaningful Gifting',
        icon: HeartHandshake,
        description: 'Personalization transforms products into memories that last.',
    },
    {
        title: 'Timeless Craftsmanship',
        icon: Hammer,
        description: 'Traditional artisan skill refined with modern precision.',
    },
];

const milestones = [
    'Founded with a vision to bring silver into everyday essentials',
    'Launched signature silver pen collection',
    'Expanded into corporate and bulk gifting',
    'Delivered products across major Indian cities',
];

const impactStats = [
    { label: 'Happy customers', value: '100+' },
    { label: 'Average rating', value: '4.9/5' },
    { label: 'Cities served', value: '12+' },
    { label: 'Would recommend', value: '100%' },
];

export function AboutPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-20">
                <section className="bg-white border-b border-charcoal/10">
                    <div className="max-w-7xl mx-auto px-6 py-16 md:py-22">
                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal max-w-3xl leading-tight">
                            Redefining Silver Beyond Jewellery
                        </h1>
                        <p className="font-body text-lg text-charcoal/70 max-w-3xl mt-6 leading-relaxed">
                            We create premium silver accessories that belong in everyday life. Each piece blends utility, elegance,
                            and personal meaning so your daily essentials can carry your identity.
                        </p>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-14 md:py-18">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                        <article>
                            <h2 className="font-heading text-3xl font-semibold text-charcoal mb-4">Our Story</h2>
                            <p className="font-body text-charcoal/70 leading-relaxed mb-4">
                                Zuley began with a simple belief: silver should not be reserved only for occasions. It should be part
                                of your desk, your pocket, your routine, and your milestones.
                            </p>
                            <p className="font-body text-charcoal/70 leading-relaxed">
                                From our signature silver pen to personalized gifting collections, every product is designed to be used,
                                remembered, and eventually passed on.
                            </p>
                        </article>
                        <article className="bg-charcoal text-pearl rounded-2xl p-8">
                            <h3 className="font-heading text-2xl font-semibold mb-4">Quality Promise</h3>
                            <ul className="space-y-3 font-body text-pearl/75">
                                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Authentic 925 sterling silver</li>
                                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Hallmark backed confidence</li>
                                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Multi-stage quality checks</li>
                                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Crafted for long-term use</li>
                            </ul>
                        </article>
                    </div>
                </section>

                <section className="bg-white border-y border-charcoal/10">
                    <div className="max-w-7xl mx-auto px-6 py-14 md:py-18">
                        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-charcoal text-center mb-10">What We Stand For</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {values.map((value) => {
                                const Icon = value.icon;
                                return (
                                    <article key={value.title} className="rounded-2xl bg-pearl p-7 border border-charcoal/10">
                                        <div className="w-12 h-12 rounded-xl bg-charcoal/8 flex items-center justify-center mb-5">
                                            <Icon className="w-6 h-6 text-charcoal" />
                                        </div>
                                        <h3 className="font-heading text-xl text-charcoal font-semibold mb-2">{value.title}</h3>
                                        <p className="font-body text-charcoal/65">{value.description}</p>
                                    </article>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-14 md:py-18 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <article className="rounded-2xl bg-white p-8 border border-charcoal/10 shadow-soft">
                        <h2 className="font-heading text-3xl font-semibold text-charcoal mb-5">Milestones</h2>
                        <ol className="space-y-3">
                            {milestones.map((milestone, index) => (
                                <li key={milestone} className="flex items-start gap-3 font-body text-charcoal/70">
                                    <span className="w-6 h-6 rounded-full bg-charcoal text-pearl text-xs inline-flex items-center justify-center mt-0.5">{index + 1}</span>
                                    <span>{milestone}</span>
                                </li>
                            ))}
                        </ol>
                    </article>

                    <article className="rounded-2xl bg-charcoal text-pearl p-8">
                        <h3 className="font-heading text-2xl font-semibold mb-5">Community Impact</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {impactStats.map((stat) => (
                                <div key={stat.label} className="rounded-xl bg-pearl/10 p-4 border border-pearl/15">
                                    <p className="font-heading text-3xl font-bold">{stat.value}</p>
                                    <p className="font-body text-sm text-pearl/70">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default AboutPage;
