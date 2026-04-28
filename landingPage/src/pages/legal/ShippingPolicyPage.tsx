import { Navbar } from '../../components/common';
import { Footer } from '../../components/home';

export function ShippingPolicyPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-32 pb-24 px-6">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-luxury">
                    <h1 className="font-heading text-4xl font-bold text-charcoal mb-4">Shipping & Delivery Policy</h1>
                    <p className="font-body text-charcoal/60 italic mb-10">*Last updated: 17 April, 2026*</p>

                    <div className="space-y-8 font-body text-charcoal/80 leading-relaxed">
                        <section>
                            <p className="mb-4">
                                This Shipping & Delivery Policy applies to all orders placed on <strong>zuley.in</strong>, operated by <strong>Zuley</strong>, a sole proprietorship based in India (“we”, “our”, “us”).
                            </p>
                            <p>
                                By placing an order, you agree to the terms outlined below.
                            </p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">1. Order Processing</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Orders are generally processed within <strong>1–3 business days</strong> after order confirmation.</li>
                                <li>Orders placed on weekends or public holidays will be processed on the next working day.</li>
                                <li>Processing times may vary during high-demand periods, sales, or due to operational constraints.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">2. Shipping & Delivery Timelines</h2>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>Once dispatched, delivery timelines depend on your location and courier serviceability.</li>
                                <li>Estimated delivery timelines are <strong>indicative only</strong> and not guaranteed.</li>
                                <li>Delays may occur due to factors beyond our control, including:
                                    <ul className="list-[circle] pl-6 mt-2 space-y-1 text-charcoal/70">
                                        <li>Courier delays</li>
                                        <li>Weather conditions</li>
                                        <li>Strikes or disruptions</li>
                                        <li>Regulatory or governmental actions</li>
                                        <li>Force majeure events</li>
                                    </ul>
                                </li>
                            </ul>
                            <p>Zuley shall not be held liable for delivery delays caused by such factors.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">3. Shipping Charges</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Shipping charges, if applicable, will be displayed at checkout.</li>
                                <li>Any free-shipping offers are subject to conditions and may change without prior notice.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">4. Order Tracking</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Once an order is shipped, tracking details will be shared via <strong>email and/or SMS</strong>.</li>
                                <li>Customers are responsible for tracking their shipment using the provided details.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">5. Split Shipments</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>In some cases, orders containing multiple items may be shipped in <strong>separate packages</strong>.</li>
                                <li>There will be no additional shipping cost charged for split shipments unless explicitly stated.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">6. Delivery Attempts & Address Accuracy</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Orders will be delivered to the address provided at checkout.</li>
                                <li>Customers are responsible for ensuring address and contact details are accurate and complete.</li>
                                <li>Failed delivery attempts due to incorrect information or unavailability may result in:
                                    <ul className="list-[circle] pl-6 mt-2 space-y-1 text-charcoal/70">
                                        <li>Delayed delivery</li>
                                        <li>Order cancellation</li>
                                        <li>Additional shipping charges</li>
                                    </ul>
                                </li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">7. Cash on Delivery (COD)</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>COD is available for selected pin codes and order values.</li>
                                <li>Repeated refusal of COD orders may result in restriction or removal of COD option for future orders.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">8. Risk of Loss</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Risk of loss or damage to products transfers to the customer <strong>upon successful delivery</strong>.</li>
                                <li>Customers are advised to inspect packages at the time of delivery.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">9. Damaged, Missing, or Incorrect Items</h2>
                            <ul className="list-disc pl-6 mb-4 space-y-2">
                                <li>If you receive a damaged, defective, or incorrect product, please contact <strong>support@zuley.in</strong> within <strong>48 hours of delivery</strong>.</li>
                                <li>Supporting evidence such as photos or videos may be required for verification.</li>
                                <li>Claims raised after the specified timeframe may not be accepted.</li>
                            </ul>
                            <p>Zuley reserves the right to take the final decision on all such claims.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">10. Non-Serviceable Areas</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Certain pin codes may be partially serviceable (forward-only delivery).</li>
                                <li>In such cases, we may request customers to return products via an alternate courier service.</li>
                                <li>Reasonable return shipping costs may be reimbursed as per our Refund & Cancellation Policy.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">11. International Shipping</h2>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>Currently, we <strong>do not offer international shipping</strong>, unless explicitly stated otherwise.</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">12. Policy Updates</h2>
                            <p>We reserve the right to modify this Shipping & Delivery Policy at any time. Updates will be posted on the Website with a revised date.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">13. Contact Information</h2>
                            <p className="mb-4">For shipping-related queries, please contact:</p>
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

export default ShippingPolicyPage;
