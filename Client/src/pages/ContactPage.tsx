import { useState, type FormEvent } from 'react';
import { Mail, Clock, MessageCircle, Building2 } from 'lucide-react';
import { Navbar } from '../components/common';
import { Footer } from '../components/home';
import { useToast } from '../contexts/ToastContext';
import { submitContactInquiry } from '../api/engagement';

const faqItems = [
    {
        q: 'How long does delivery take?',
        a: 'Standard products take 5 to 7 business days depending on your location.',
    },
    {
        q: 'Do you offer personalization or engraving?',
        a: 'Not at the moment. We focus on handcrafted silver pieces and will announce personalization if it returns.',
    },
    {
        q: 'Do you support bulk corporate orders?',
        a: 'Yes. We provide branding support and tiered pricing for corporate and bulk gifting.',
    },
    {
        q: 'What is your return policy?',
        a: 'Returns are accepted for eligible items in unused condition. Contact support within 48 hours of delivery for help.',
    },
    {
        q: 'How can I track my shipped order?',
        a: 'Use the Track Order page with your order ID. Shipping updates are shown once dispatch is completed.',
    },
];

export function ContactPage() {
    const { showToast } = useToast();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [inquiryType, setInquiryType] = useState<'general' | 'product' | 'order' | 'personalization' | 'corporate' | 'complaint' | 'other'>('general');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setIsSubmitting(true);
            const response = await submitContactInquiry({
                full_name: name,
                email,
                phone: phone || undefined,
                inquiry_type: inquiryType,
                message,
                source_page: 'contact',
            });

            showToast(response.message || 'Message received. We will get back to you shortly.', 'success');
            setName('');
            setEmail('');
            setPhone('');
            setInquiryType('general');
            setMessage('');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unable to submit right now. Please try again.';
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-20">
                <section className="bg-white border-b border-charcoal/10">
                    <div className="max-w-7xl mx-auto px-6 py-16 md:py-22">
                        <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-charcoal">We Are Here to Help</h1>
                        <p className="font-body text-lg text-charcoal/70 mt-5 max-w-2xl">
                            Reach out for product help, order support, personalization guidance, or corporate gifting conversations.
                        </p>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-14 md:py-18">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        <a href="mailto:support@zuley.in" className="bg-white rounded-2xl p-6 border border-charcoal/10 shadow-soft">
                            <Mail className="w-6 h-6 text-charcoal mb-3" />
                            <h2 className="font-heading text-xl text-charcoal font-semibold">Email</h2>
                            <p className="font-body text-charcoal/65 mt-2">support@zuley.in</p>
                        </a>
                        <div className="bg-white rounded-2xl p-6 border border-charcoal/10 shadow-soft">
                            <Clock className="w-6 h-6 text-charcoal mb-3" />
                            <h2 className="font-heading text-xl text-charcoal font-semibold">Hours</h2>
                            <p className="font-body text-charcoal/65 mt-2">Mon-Sat, 10am-7pm IST</p>
                        </div>
                        <a href="mailto:support@zuley.in?subject=WhatsApp%20support%20request" className="bg-white rounded-2xl p-6 border border-charcoal/10 shadow-soft">
                            <MessageCircle className="w-6 h-6 text-charcoal mb-3" />
                            <h2 className="font-heading text-xl text-charcoal font-semibold">Priority Support</h2>
                            <p className="font-body text-charcoal/65 mt-2">Email us for urgent order help</p>
                        </a>
                        <a href="/corporate" className="bg-white rounded-2xl p-6 border border-charcoal/10 shadow-soft">
                            <Building2 className="w-6 h-6 text-charcoal mb-3" />
                            <h2 className="font-heading text-xl text-charcoal font-semibold">Corporate</h2>
                            <p className="font-body text-charcoal/65 mt-2">Bulk and branded gifting enquiries</p>
                        </a>
                    </div>
                </section>

                <section className="bg-white border-y border-charcoal/10">
                    <div className="max-w-7xl mx-auto px-6 py-14 md:py-18 grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <article className="bg-pearl rounded-2xl p-8 border border-charcoal/10">
                            <h2 className="font-heading text-3xl font-semibold text-charcoal mb-5">Send a Message</h2>
                            <form className="space-y-4" onSubmit={handleSubmit}>
                                <input
                                    value={name}
                                    onChange={(event) => setName(event.target.value)}
                                    className="w-full rounded-xl border border-charcoal/20 px-4 py-3 font-body"
                                    placeholder="Your name"
                                    required
                                />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(event) => setEmail(event.target.value)}
                                    className="w-full rounded-xl border border-charcoal/20 px-4 py-3 font-body"
                                    placeholder="Your email"
                                    required
                                />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(event) => setPhone(event.target.value)}
                                    className="w-full rounded-xl border border-charcoal/20 px-4 py-3 font-body"
                                    placeholder="Your phone (optional)"
                                />
                                <select
                                    value={inquiryType}
                                    onChange={(event) => setInquiryType(event.target.value as 'general' | 'product' | 'order' | 'personalization' | 'corporate' | 'complaint' | 'other')}
                                    className="w-full rounded-xl border border-charcoal/20 px-4 py-3 font-body bg-white"
                                >
                                    <option value="general">General enquiry</option>
                                    <option value="product">Product query</option>
                                    <option value="order">Order support</option>
                                    <option value="personalization">Personalization help</option>
                                    <option value="corporate">Corporate gifting</option>
                                    <option value="complaint">Complaint</option>
                                    <option value="other">Other</option>
                                </select>
                                <textarea
                                    value={message}
                                    onChange={(event) => setMessage(event.target.value)}
                                    className="w-full rounded-xl border border-charcoal/20 px-4 py-3 min-h-32 font-body"
                                    placeholder="How can we help?"
                                    required
                                />
                                <button type="submit" disabled={isSubmitting} className="rounded-xl bg-charcoal text-pearl px-6 py-3 font-body hover:bg-graphite transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        </article>

                        <article>
                            <h2 className="font-heading text-3xl font-semibold text-charcoal mb-5">FAQs</h2>
                            <div className="space-y-4">
                                {faqItems.map((item) => (
                                    <details key={item.q} className="bg-pearl rounded-xl p-5 border border-charcoal/10">
                                        <summary className="font-body font-semibold text-charcoal cursor-pointer">{item.q}</summary>
                                        <p className="font-body text-charcoal/70 mt-3">{item.a}</p>
                                    </details>
                                ))}
                            </div>
                        </article>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-6 py-14 md:py-18">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <article className="rounded-2xl bg-white p-7 border border-charcoal/10 shadow-soft">
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">Business Hours</h2>
                            <div className="space-y-2 font-body text-charcoal/70">
                                <p>Monday - Saturday: 10:00 AM - 7:00 PM IST</p>
                                <p>Sunday: Closed</p>
                                <p>Workshop visits by appointment only.</p>
                            </div>
                        </article>
                        <article className="rounded-2xl bg-charcoal text-pearl p-7">
                            <h3 className="font-heading text-2xl font-semibold mb-4">Location</h3>
                            <p className="font-body text-pearl/75">Zuley, Lunwa, Nawa, Nagaur District, Rajasthan, India - 341509</p>
                            <p className="font-body text-pearl/60 mt-3">For corporate appointments and workshop meetings, contact us in advance.</p>
                        </article>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}

export default ContactPage;
