import { BadgeCheck, FlaskConical, Factory, Sparkles, Shield } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/home';

const process = [
    'Design and prototyping',
    'Silver-coating preparation and finish checks',
    'Precision shaping and forming',
    'Assembly and finishing',
    'Laser engraving when personalized',
    'Final quality inspection and certification verification',
];

const checkpoints = [
    'Raw material quality verification',
    'Dimensional and finish checks during production',
    'Engraving clarity and alignment validation',
    'Functional testing for product mechanics',
    'Final packaging and dispatch approval',
];

const careTips = [
    'Store in a dry pouch away from humidity when not in use.',
    'Clean with a soft silver polishing cloth regularly.',
    'Avoid harsh chemicals and perfumes directly on the surface.',
    'For deep cleaning, use approved silver-care solutions only.',
];

export function CraftsmanshipPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-20">
                <section className="bg-charcoal text-pearl">
                    <div className="max-w-7xl mx-auto px-6 py-16 md:py-22">
                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold max-w-3xl leading-tight">
                            Crafted to Perfection. Built to Last.
                        </h1>
                        <p className="font-body text-lg text-pearl/70 mt-6 max-w-3xl leading-relaxed">
                            We combine traditional silversmithing discipline with modern precision so every product looks exceptional and performs reliably.
                        </p>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-14 md:py-18">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <article>
                            <h2 className="font-heading text-3xl font-semibold text-charcoal mb-4">The Silver-Coated Standard</h2>
                            <p className="font-body text-charcoal/70 leading-relaxed">
                                Our products use premium silver coating, balancing refined finish with durability for everyday usage.
                                Each piece is quality-tested to confirm consistency.
                            </p>
                            <div className="mt-6 space-y-3 font-body text-charcoal/70">
                                <p className="flex items-center gap-2"><FlaskConical className="w-4 h-4" /> Premium silver-coated finish for everyday elegance</p>
                                <p className="flex items-center gap-2"><Factory className="w-4 h-4" /> Durable material engineering for long-term strength</p>
                                <p className="flex items-center gap-2"><BadgeCheck className="w-4 h-4" /> Rigorous multi-stage quality assurance</p>
                            </div>
                        </article>
                        <article className="bg-white rounded-2xl p-8 shadow-soft border border-charcoal/10">
                            <h3 className="font-heading text-2xl font-semibold text-charcoal mb-4">Making Process</h3>
                            <ol className="space-y-3 font-body text-charcoal/70">
                                {process.map((step, index) => (
                                    <li key={step} className="flex items-start gap-3">
                                        <span className="w-6 h-6 rounded-full bg-charcoal text-pearl text-xs inline-flex items-center justify-center mt-0.5">{index + 1}</span>
                                        <span>{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </article>
                    </div>
                </section>

                <section className="bg-white border-y border-charcoal/10">
                    <div className="max-w-7xl mx-auto px-6 py-14 md:py-18">
                        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-charcoal text-center mb-10">Quality Control Framework</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {checkpoints.map((checkpoint) => (
                                <article key={checkpoint} className="rounded-2xl bg-pearl p-6 border border-charcoal/10">
                                    <p className="font-body text-charcoal/75 flex items-start gap-2">
                                        <Shield className="w-4 h-4 mt-0.5 text-charcoal" />
                                        {checkpoint}
                                    </p>
                                </article>
                            ))}
                        </div>
                        <p className="text-center font-body text-charcoal/60 mt-8">
                            Products that do not pass quality checks are reworked or rejected. We do not ship seconds.
                        </p>
                        <div className="flex justify-center mt-6">
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-charcoal text-pearl text-sm">
                                <Sparkles className="w-4 h-4" /> Lifetime craftsmanship intent
                            </span>
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-14 md:py-18 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <article className="rounded-2xl bg-white p-8 border border-charcoal/10 shadow-soft">
                        <h2 className="font-heading text-3xl font-semibold text-charcoal mb-4">Engraving Technology</h2>
                        <p className="font-body text-charcoal/70 leading-relaxed mb-4">
                            We use precision laser engraving for clear, durable, and consistent personalization across text and logo requests.
                        </p>
                        <ul className="space-y-2 font-body text-charcoal/70">
                            <li>Supports names, initials, dates, and brand logos</li>
                            <li>Micron-level alignment checks before final run</li>
                            <li>Every engraved piece is inspected before packaging</li>
                        </ul>
                    </article>

                    <article className="rounded-2xl bg-charcoal text-pearl p-8">
                        <h3 className="font-heading text-2xl font-semibold mb-4">Silver Care Guidance</h3>
                        <ul className="space-y-3 font-body text-pearl/75">
                            {careTips.map((tip) => (
                                <li key={tip} className="flex items-start gap-2">
                                    <Sparkles className="w-4 h-4 mt-1 text-primary" />
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </article>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default CraftsmanshipPage;
