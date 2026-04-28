import { Navbar } from '../../components/common';
import { Footer } from '../../components/home';

export function TermsConditionsPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-32 pb-24 px-6">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-luxury">
                    <h1 className="font-heading text-4xl font-bold text-charcoal mb-4">Terms & Conditions</h1>
                    <p className="font-body text-charcoal/60 italic mb-10">*Last updated: 17 April, 2026*</p>

                    <div className="space-y-8 font-body text-charcoal/80 leading-relaxed">
                        <section>
                            <p className="mb-4">
                                These Terms & Conditions (“Terms”) govern your access to and use of <strong>zuley.in</strong> (“Website”) operated by <strong>Zuley</strong>, a sole proprietorship based in India (“we”, “our”, “us”).
                            </p>
                            <p>
                                By accessing, browsing, or purchasing from our Website, you agree to be bound by these Terms. If you do not agree, please do not use the Website.
                            </p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">1. Eligibility</h2>
                            <p className="mb-4">By using this Website, you confirm that:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>You are legally capable of entering into a binding contract under Indian law</li>
                                <li>You will provide accurate and complete information during checkout and account creation</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">2. Products & Services</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>We sell <strong>physical silver lifestyle accessories</strong> through the Website.</li>
                                <li>Product images are for <strong>illustration purposes</strong>. Minor variations may occur.</li>
                                <li>We reserve the right to <strong>modify or discontinue products</strong> at any time without notice.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">3. Pricing & Availability</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>All prices are listed in <strong>Indian Rupees (INR)</strong> and are inclusive/exclusive of taxes as displayed.</li>
                                <li>Prices may change at any time without prior notice.</li>
                                <li>Product availability is not guaranteed.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">4. Orders & Acceptance</h2>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Placing an order does not constitute acceptance.</li>
                                <li>An order is considered <strong>accepted only after confirmation</strong> via email/SMS.</li>
                                <li>We reserve the right to <strong>cancel or refuse orders</strong> due to:
                                    <ul className="list-[circle] pl-6 mt-2 space-y-1 text-charcoal/70">
                                        <li>Stock unavailability</li>
                                        <li>Pricing or listing errors</li>
                                        <li>Suspected fraud or misuse</li>
                                        <li>Operational issues</li>
                                    </ul>
                                </li>
                            </ul>
                            <p>If payment has been made, refunds will be processed as per applicable timelines.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">5. Payments</h2>
                            <p className="mb-4">We accept:</p>
                            <ul className="list-disc pl-6 mb-6 space-y-2">
                                <li>Online payments via <strong>a Secured Payment Gateway</strong></li>
                                <li>Cash on Delivery (COD), where available</li>
                            </ul>
                            <p className="mb-4">For online payments:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Zuley does not store or process card, UPI, or banking details.</li>
                                <li>Refunds (if applicable) will be issued to the <strong>original payment method</strong> as per our payment gateway policies.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">6. Shipping & Delivery</h2>
                            <ul className="list-disc pl-6 mb-6 space-y-2">
                                <li>Orders are shipped through third-party logistics partners.</li>
                                <li>Delivery timelines are <strong>estimates</strong> and may vary.</li>
                                <li><strong>Risk of loss transfers to the customer upon successful delivery.</strong></li>
                            </ul>
                            <p className="mb-4">We are not liable for delays caused by:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-2 text-charcoal/70">
                                <li>Courier issues</li>
                                <li>Weather conditions</li>
                                <li>Strikes</li>
                                <li>Government actions</li>
                                <li>Force majeure events</li>
                            </ul>
                            <p className="text-sm italic">(Shipping & Delivery details are governed by a separate policy.)</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">7. Cancellations, Returns & Refunds</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Cancellation, return, and refund rules are governed by our <strong>Refund & Cancellation Policy</strong>.</li>
                                <li>Customised/personalised products are <strong>non-returnable and non-refundable</strong>, unless defective.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">8. User Accounts & Conduct</h2>
                            <ul className="list-disc pl-6 mb-6 space-y-2">
                                <li>Users may create accounts using OTP-based authentication.</li>
                                <li>You agree not to:
                                    <ul className="list-[circle] pl-6 mt-2 space-y-1 text-charcoal/70">
                                        <li>Misuse the Website</li>
                                        <li>Provide false information</li>
                                        <li>Attempt unauthorised access</li>
                                        <li>Engage in fraudulent or abusive behaviour</li>
                                    </ul>
                                </li>
                            </ul>
                            <p>We reserve the right to <strong>suspend or terminate accounts</strong> at our discretion.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">9. Intellectual Property</h2>
                            <p className="mb-4">All content on the Website, including:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-1">
                                <li>Logos</li>
                                <li>Product images</li>
                                <li>Designs</li>
                                <li>Text</li>
                                <li>Graphics</li>
                            </ul>
                            <p>are the <strong>exclusive intellectual property of Zuley</strong> and may not be used without written permission.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">10. Disclaimer of Warranties</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Products are sold on an <strong>“as is”</strong> basis, except for manufacturing defects.</li>
                                <li>We do not guarantee uninterrupted or error-free operation of the Website.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">11. Limitation of Liability</h2>
                            <p className="mb-4">To the maximum extent permitted by law:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Zuley shall not be liable for indirect, incidental, or consequential damages.</li>
                                <li>Total liability, if any, shall <strong>not exceed the value of the order</strong> placed by you.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">12. Indemnification</h2>
                            <p className="mb-4">You agree to indemnify and hold Zuley harmless against any claims arising from:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Violation of these Terms</li>
                                <li>Misuse of the Website</li>
                                <li>Breach of applicable laws</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">13. Governing Law & Dispute Resolution</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>These Terms shall be governed by <strong>Indian law</strong>.</li>
                                <li>Any dispute shall first be resolved through <strong>arbitration</strong> in Rajasthan.</li>
                                <li>Courts in <strong>Rajasthan</strong> shall have exclusive jurisdiction.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">14. Notices & Communication</h2>
                            <p className="mb-4">Legal notices and communications may be sent via:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Email</li>
                                <li>Registered post</li>
                            </ul>
                            <p>Email communication shall be considered valid notice.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">15. Changes to Terms</h2>
                            <p>We may update these Terms at any time. Continued use of the Website constitutes acceptance of the updated Terms.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">16. Contact Information</h2>
                            <div className="bg-pearl/30 p-4 rounded-xl space-y-2">
                                <p><strong>Email:</strong> support@zuley.in</p>
                                <p><strong>Address:</strong> Balaji Ka Chowk, Sunaro Ka Mohalla, Lunwa Village, Nawa City, Didwana Kuchaman District, Rajasthan – 341509</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default TermsConditionsPage;
