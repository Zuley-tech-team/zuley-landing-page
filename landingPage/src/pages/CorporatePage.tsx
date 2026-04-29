import { useState, type FormEvent } from 'react';
import { Building2, BadgeCheck, Handshake, Package, CalendarClock } from 'lucide-react';
import { Navbar } from '../components/common';
import { Footer } from '../components/home';
import { useToast } from '../contexts/ToastContext';
import { submitCorporateLead } from '../api/engagement';

const reasons = [
    '925 sterling silver with hallmark quality',
    'Precision logo engraving for brand consistency',
    'Bulk pricing tiers and custom quote support',
    'Dedicated account assistance and timeline updates',
];

const products = [
    {
        name: 'Executive Silver Pens',
        fromPrice: 'From Rs. 3,999 per piece',
        summary: 'Ideal for recognition awards, leadership gifting, and client appreciation.',
    },
    {
        name: 'Personalized Silver Covers',
        fromPrice: 'From Rs. 2,999 per piece',
        summary: 'Modern premium gifting for tech teams, founders, and high-value clients.',
    },
    {
        name: 'Premium Silver Phone Covers',
        fromPrice: 'From Rs. 2,999 per piece',
        summary: 'Modern gifting option for tech teams and high-value clients.',
    },
];

const pricingTiers = [
    { range: '10 - 24 units', discount: '10% off' },
    { range: '25 - 49 units', discount: '15% off' },
    { range: '50 - 99 units', discount: '20% off' },
    { range: '100+ units', discount: '25% off + custom commercial terms' },
];

const caseStudies = [
    {
        client: 'TechVision Solutions',
        outcome: '50 personalized pens delivered on-time for annual recognition awards.',
    },
    {
        client: 'Sharma and Associates',
        outcome: '100 premium client-gifting pens with custom branding and inserts.',
    },
    {
        client: 'Global Finance Corp',
        outcome: '200 engraved silver covers delivered ahead of timeline.',
    },
];

const faqItems = [
    {
        q: 'What is the minimum order quantity for corporate gifting?',
        a: 'MOQ typically starts at 10 units. Final MOQ depends on product and branding complexity.',
    },
    {
        q: 'Can we add our logo and custom message cards?',
        a: 'Yes. We support logo engraving and branded packaging inserts for corporate orders.',
    },
    {
        q: 'How long do bulk orders usually take?',
        a: 'Typical turnaround is 2 to 4 weeks depending on quantity and customization requirements.',
    },
];

export function CorporatePage() {
    const { showToast } = useToast();
    const [companyName, setCompanyName] = useState('');
    const [contactName, setContactName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [quantity, setQuantity] = useState(25);
    const [productType, setProductType] = useState<'silver-pens' | 'silver-phone-covers' | 'mixed'>('silver-pens');
    const [timeline, setTimeline] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setIsSubmitting(true);
            const response = await submitCorporateLead({
                company_name: companyName,
                contact_name: contactName,
                email,
                phone: phone || undefined,
                quantity,
                product_type: productType,
                expected_timeline: timeline || undefined,
                message: message || undefined,
                source_page: 'corporate',
            });

            showToast(response.message || 'Corporate enquiry submitted successfully.', 'success');
            setCompanyName('');
            setContactName('');
            setEmail('');
            setPhone('');
            setQuantity(25);
            setProductType('silver-pens');
            setTimeline('');
            setMessage('');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unable to submit enquiry. Please try again.';
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-20">
                <section className="bg-gradient-to-br from-charcoal via-graphite to-charcoal text-pearl">
                    <div className="max-w-7xl mx-auto px-6 py-16 md:py-24">
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-pearl/10 text-sm uppercase tracking-wider">
                            <Building2 className="w-4 h-4" />
                            Corporate and Bulk Gifting
                        </span>
                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold max-w-3xl leading-tight">
                            Premium Personalized Silver Gifts for Your Brand and People
                        </h1>
                        <p className="font-body text-lg text-pearl/70 max-w-2xl mt-5 leading-relaxed">
                            Elevate employee and client gifting with custom-branded silver accessories delivered with reliability at scale.
                        </p>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-14 md:py-18">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        <article className="bg-white rounded-2xl p-8 shadow-soft border border-charcoal/10">
                            <h2 className="font-heading text-3xl font-semibold text-charcoal mb-4">Why Teams Choose Zuley</h2>
                            <ul className="space-y-4">
                                {reasons.map((item) => (
                                    <li key={item} className="flex items-start gap-3 font-body text-charcoal/70">
                                        <BadgeCheck className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </article>
                        <article id="corporate-enquiry" className="bg-charcoal text-pearl rounded-2xl p-8 shadow-soft">
                            <h3 className="font-heading text-2xl font-semibold mb-4">Corporate Enquiry Snapshot</h3>
                            <div className="space-y-3 text-pearl/75 font-body">
                                <p className="flex items-center gap-2"><Handshake className="w-4 h-4" /> MOQ starts at 10 units</p>
                                <p className="flex items-center gap-2"><Package className="w-4 h-4" /> Branded packaging options available</p>
                                <p className="flex items-center gap-2"><CalendarClock className="w-4 h-4" /> Typical delivery 2 to 4 weeks for large batches</p>
                            </div>
                            <form className="mt-6 grid grid-cols-1 gap-3" onSubmit={handleLeadSubmit}>
                                <input
                                    value={companyName}
                                    onChange={(event) => setCompanyName(event.target.value)}
                                    className="w-full rounded-xl border border-pearl/20 bg-charcoal/40 px-4 py-2.5 font-body text-pearl placeholder:text-pearl/40"
                                    placeholder="Company name"
                                    required
                                />
                                <input
                                    value={contactName}
                                    onChange={(event) => setContactName(event.target.value)}
                                    className="w-full rounded-xl border border-pearl/20 bg-charcoal/40 px-4 py-2.5 font-body text-pearl placeholder:text-pearl/40"
                                    placeholder="Contact person"
                                    required
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="w-full rounded-xl border border-pearl/20 bg-charcoal/40 px-4 py-2.5 font-body text-pearl placeholder:text-pearl/40"
                                    placeholder="Business email"
                                    required
                                />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                    className="w-full rounded-xl border border-pearl/20 bg-charcoal/40 px-4 py-2.5 font-body text-pearl placeholder:text-pearl/40"
                                    placeholder="Phone (optional)"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        min={10}
                                        value={quantity}
                                        onChange={(event) => setQuantity(Number(event.target.value) || 10)}
                                        className="w-full rounded-xl border border-pearl/20 bg-charcoal/40 px-4 py-2.5 font-body text-pearl"
                                        placeholder="Qty"
                                        required
                                    />
                                    <select
                                        value={productType}
                                        onChange={(event) => setProductType(event.target.value as 'silver-pens' | 'silver-phone-covers' | 'mixed')}
                                        className="w-full rounded-xl border border-pearl/20 bg-charcoal/40 px-4 py-2.5 font-body text-pearl"
                                    >
                                        <option className="text-charcoal" value="silver-pens">Silver pens</option>
                                        <option className="text-charcoal" value="silver-phone-covers">Silver phone covers</option>
                                        <option className="text-charcoal" value="mixed">Mixed products</option>
                                    </select>
                                </div>
                                <input
                                    value={timeline}
                                    onChange={(event) => setTimeline(event.target.value)}
                                    className="w-full rounded-xl border border-pearl/20 bg-charcoal/40 px-4 py-2.5 font-body text-pearl placeholder:text-pearl/40"
                                    placeholder="Expected timeline (optional)"
                                />
                                <textarea
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    className="w-full rounded-xl border border-pearl/20 bg-charcoal/40 px-4 py-2.5 font-body text-pearl placeholder:text-pearl/40 min-h-24"
                                    placeholder="Branding and packaging notes (optional)"
                                />
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="rounded-xl bg-primary text-charcoal px-5 py-2.5 font-body font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Request Quote'}
                                </button>
                            </form>
                        </article>
                    </div>
                </section>

                <section className="bg-white border-y border-charcoal/10">
                    <div className="max-w-7xl mx-auto px-6 py-14 md:py-18">
                        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-charcoal text-center mb-10">Corporate Product Options</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {products.map((product) => (
                                <article key={product.name} className="rounded-2xl bg-pearl p-6 border border-charcoal/10">
                                    <h3 className="font-heading text-xl font-semibold text-charcoal mb-2">{product.name}</h3>
                                    <p className="font-body text-sm uppercase tracking-wider text-charcoal/60 mb-3">{product.fromPrice}</p>
                                    <p className="font-body text-charcoal/65">{product.summary}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-14 md:py-18 grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <article className="rounded-2xl bg-white p-8 border border-charcoal/10 shadow-soft">
                        <h2 className="font-heading text-3xl font-semibold text-charcoal mb-5">Volume Pricing Tiers</h2>
                        <ul className="space-y-3">
                            {pricingTiers.map((tier) => (
                                <li key={tier.range} className="flex items-center justify-between rounded-xl bg-pearl px-4 py-3 border border-charcoal/10">
                                    <span className="font-body text-charcoal/75">{tier.range}</span>
                                    <span className="font-body font-semibold text-charcoal">{tier.discount}</span>
                                </li>
                            ))}
                        </ul>
                    </article>
                    <article className="rounded-2xl bg-charcoal text-pearl p-8">
                        <h3 className="font-heading text-2xl font-semibold mb-5">Case Study Highlights</h3>
                        <div className="space-y-4">
                            {caseStudies.map((study) => (
                                <div key={study.client} className="rounded-xl bg-pearl/10 p-4 border border-pearl/15">
                                    <p className="font-heading text-lg font-semibold">{study.client}</p>
                                    <p className="font-body text-pearl/75 mt-1">{study.outcome}</p>
                                </div>
                            ))}
                        </div>
                    </article>
                </section>

                <section className="bg-white border-t border-charcoal/10">
                    <div className="max-w-4xl mx-auto px-6 py-14 md:py-18">
                        <h2 className="font-heading text-3xl md:text-4xl font-semibold text-charcoal text-center mb-8">Corporate FAQs</h2>
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

export default CorporatePage;
