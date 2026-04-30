import { Navbar } from '../../components/common';
import { Footer } from '../../components/home';

export function PrivacyPolicyPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-32 pb-24 px-6">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-luxury">
                    <h1 className="font-heading text-4xl font-bold text-charcoal mb-4">Privacy Policy</h1>
                    <p className="font-body text-charcoal/60 italic mb-10">*Last updated: 17 April, 2026*</p>

                    <div className="space-y-8 font-body text-charcoal/80 leading-relaxed">
                        <section>
                            <p className="mb-4">
                                This Privacy Policy explains how Zuley, a sole proprietorship operating in India (“we”, “our”, “us”), collects, uses, stores, and protects personal data when you visit or make a purchase from <a href="https://zuley.in" className="text-primary hover:underline">zuley.in</a> (“Website”).
                            </p>
                            <p>
                                By using our Website, you agree to the collection and use of information in accordance with this Privacy Policy.
                            </p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">1. Information We Collect</h2>
                            <p className="mb-4">We collect only such personal data as is necessary to operate our e-commerce business and deliver products.</p>

                            <h3 className="font-semibold text-charcoal mb-2">a) Information You Provide</h3>
                            <ul className="list-disc pl-6 mb-4 space-y-1">
                                <li>Name</li>
                                <li>Mobile number (for OTP-based login and delivery)</li>
                                <li>Email address</li>
                                <li>Shipping address</li>
                                <li>Order and transaction details</li>
                                <li>Customer support communications</li>
                            </ul>
                            <p className="mb-6">We do <strong>not</strong> require users to create passwords. Authentication is performed via one-time passwords (OTP).</p>

                            <h3 className="font-semibold text-charcoal mb-2">b) Information Collected Automatically</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>IP address</li>
                                <li>Browser and device information</li>
                                <li>Pages visited and interaction data</li>
                                <li>Cookies and similar tracking technologies</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">2. Cookies & Tracking Technologies</h2>
                            <p className="mb-4">We use cookies and similar technologies for:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-1">
                                <li>Website functionality and session management</li>
                                <li>Analytics (e.g., Google Analytics)</li>
                                <li>Advertising and retargeting (e.g., Meta Ads Pixel)</li>
                            </ul>
                            <p>You can manage cookies through your browser settings. Disabling cookies may affect certain site features.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">3. Purpose of Data Use</h2>
                            <p className="mb-4">We use personal data to:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Process and fulfill orders</li>
                                <li>Arrange shipping and delivery</li>
                                <li>Send order confirmations and transactional emails</li>
                                <li>Provide customer support</li>
                                <li>Improve website performance and user experience</li>
                                <li>Conduct analytics and marketing campaigns</li>
                                <li>Prevent fraud and misuse</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">4. Payment Processing</h2>
                            <p className="mb-4">All payments are processed securely through <strong>a Secured Payment Gateway</strong>.</p>
                            <p>We do <strong>not</strong> collect, store, or process credit/debit card numbers, UPI IDs, or banking details.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">5. Data Sharing</h2>
                            <p className="mb-4">We share personal data <strong>only as required</strong> with:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-1">
                                <li>Logistics and delivery partners (limited to name, phone number, address)</li>
                                <li>Payment gateway providers</li>
                                <li>Email and communication service providers</li>
                                <li>Analytics and advertising platforms</li>
                            </ul>
                            <p>We do <strong>not sell</strong> personal data to third parties.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">6. Legal Basis for Processing</h2>
                            <p className="mb-4">Personal data is processed based on:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Your consent</li>
                                <li>Performance of a contract (order fulfillment)</li>
                                <li>Legitimate business interests</li>
                                <li>Compliance with Indian laws, including the Digital Personal Data Protection Act, 2023</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">7. Data Retention</h2>
                            <p className="mb-4">We retain personal data:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>While your account remains active</li>
                                <li>Until deletion is requested by you</li>
                                <li>As required under applicable tax, accounting, or legal obligations</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">8. Data Security</h2>
                            <p className="mb-4">We implement reasonable security practices including:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-1">
                                <li>HTTPS and SSL encryption</li>
                                <li>Encrypted databases</li>
                                <li>Restricted internal access</li>
                                <li>Secure third-party service providers</li>
                            </ul>
                            <p>Despite our efforts, no method of transmission or storage is completely secure.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">9. Your Rights</h2>
                            <p className="mb-4">You may:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-1">
                                <li>Request access to your personal data</li>
                                <li>Request correction or deletion</li>
                                <li>Withdraw consent for marketing communications</li>
                            </ul>
                            <p>Requests can be made by contacting us at the details below.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">10. Children’s Privacy</h2>
                            <p>We do not knowingly collect personal data from minors. Our Website is intended for general audiences.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">11. Grievance Officer</h2>
                            <p className="mb-4">In accordance with Indian law, grievance details are as follows:</p>
                            <div className="bg-pearl/30 p-4 rounded-xl space-y-2 mb-4">
                                <p><strong>Name:</strong> Vinay Kumar Soni</p>
                                <p><strong>Email:</strong> vinay.ofz@gmail.com</p>
                                <p><strong>Address:</strong> Lunwa, Nawa, Nagaur District, Rajasthan, India - 341509.</p>
                            </div>
                            <p>We will address grievances within the time prescribed by law.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">12. Updates to This Policy</h2>
                            <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">13. Contact Us</h2>
                            <p className="mb-4">For questions or concerns regarding this Privacy Policy:</p>
                            <div className="bg-pearl/30 p-4 rounded-xl space-y-2">
                                <p><strong>Email:</strong> support@zuley.in</p>
                                <p><strong>Address:</strong> Lunwa, Nawa, Nagaur District, Rajasthan, India - 341509.</p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default PrivacyPolicyPage;
