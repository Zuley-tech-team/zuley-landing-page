import { Navbar } from '../../components/common/Navbar';
import { Footer } from '../../components/home';

export function RefundPolicyPage() {
    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-32 pb-24 px-6">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-luxury">
                    <h1 className="font-heading text-4xl font-bold text-charcoal mb-4">Refund & Cancellation Policy</h1>
                    <p className="font-body text-charcoal/60 italic mb-10">*Last updated: 17 April, 2026*</p>

                    <div className="space-y-8 font-body text-charcoal/80 leading-relaxed">
                        <section>
                            <p className="mb-4">
                                This Refund & Cancellation Policy governs cancellations, returns, and refunds for purchases made on <strong>zuley.in</strong>, operated by <strong>Zuley</strong>, a sole proprietorship based in India (“we”, “our”, “us”).
                            </p>
                            <p>
                                By placing an order on our Website, you agree to this Policy.
                            </p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">1. Order Cancellation</h2>

                            <h3 className="font-semibold text-charcoal mb-2">a) Before Shipment</h3>
                            <ul className="list-disc pl-6 mb-6 space-y-1">
                                <li>Orders may be cancelled <strong>before they are shipped</strong>.</li>
                                <li>Cancellation requests must be raised by contacting <strong>support@zuley.in</strong>.</li>
                                <li>If the order has not been dispatched, a <strong>full refund</strong> will be processed.</li>
                            </ul>

                            <h3 className="font-semibold text-charcoal mb-2">b) After Shipment</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Orders <strong>cannot be cancelled</strong> once dispatched.</li>
                                <li>Customers may initiate a return after delivery (subject to eligibility below).</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">2. Returns</h2>
                            <p className="mb-4">We accept returns only under the following conditions:</p>

                            <h3 className="font-semibold text-charcoal mb-2">a) Eligible Returns</h3>
                            <p className="mb-2">A return may be accepted if:</p>
                            <ul className="list-disc pl-6 mb-6 space-y-1">
                                <li>The product is <strong>damaged</strong> during transit</li>
                                <li>The product received is <strong>defective</strong></li>
                                <li>The wrong product was delivered</li>
                            </ul>

                            <h3 className="font-semibold text-charcoal mb-2">b) Return Conditions</h3>
                            <ul className="list-disc pl-6 mb-4 space-y-1">
                                <li>Return requests must be raised within <strong>48 hours of delivery</strong></li>
                                <li>Product must be unused, unwashed, and in original packaging</li>
                                <li>Original invoice and tags must be intact</li>
                                <li>Proof (images/videos) may be required for verification</li>
                            </ul>
                            <p>Returns are subject to inspection and approval.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">3. Non-Returnable Items</h2>
                            <p className="mb-4">The following are <strong>not eligible for return or refund</strong>:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Customised or personalised products (present or future)</li>
                                <li>Products damaged due to misuse or mishandling</li>
                                <li>Normal wear and tear</li>
                                <li>Items returned without original packaging or invoice</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">4. Refunds</h2>

                            <h3 className="font-semibold text-charcoal mb-2">a) Refund Approval</h3>
                            <p className="mb-6">Once a return is approved and inspected, refunds will be initiated.</p>

                            <p className="mb-6">For replacement, exchange, or damaged products, we will process the exchange within 5 days of receiving the returned product. The replacement/exchange item will be delivered within 6 working days thereafter.</p>

                            <h3 className="font-semibold text-charcoal mb-2">b) Refund Method</h3>
                            <ul className="list-disc pl-6 mb-6 space-y-1">
                                <li>Refunds are processed via bank transfer or UPI (details to be provided by the customer).</li>
                                <li>The applicable refund mode is confirmed by support during refund approval.</li>
                            </ul>

                            <h3 className="font-semibold text-charcoal mb-2">c) Refund Timeline</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Refunds will be processed within <strong>7–10 business days</strong> after approval</li>
                                <li>Banking network delays are beyond our control</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">5. Shipping Charges</h2>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Shipping charges (if any) are <strong>non-refundable</strong>, unless the return is due to:
                                    <ul className="list-[circle] pl-6 mt-2 space-y-1 text-charcoal/70">
                                        <li>Damaged product</li>
                                        <li>Defective product</li>
                                        <li>Incorrect item delivered</li>
                                    </ul>
                                </li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">6. Failed or Refused Deliveries (COD)</h2>
                            <p className="mb-2">For COD orders:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>If delivery is refused or repeatedly failed, we reserve the right to:
                                    <ul className="list-[circle] pl-6 mt-2 space-y-1 text-charcoal/70">
                                        <li>Cancel the order</li>
                                        <li>Restrict future COD access for the user</li>
                                    </ul>
                                </li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">7. Partial Refunds</h2>
                            <p className="mb-2">Partial refunds may be issued in cases where:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-1">
                                <li>Part of an order is returned</li>
                                <li>Promotional discounts were applied</li>
                            </ul>
                            <p>Refund amounts will be adjusted accordingly.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">8. Cancellation by Zuley</h2>
                            <p className="mb-2">We reserve the right to cancel orders due to:</p>
                            <ul className="list-disc pl-6 mb-4 space-y-1">
                                <li>Stock unavailability</li>
                                <li>Pricing errors</li>
                                <li>Suspected fraudulent activity</li>
                                <li>Operational constraints</li>
                            </ul>
                            <p>In such cases, a <strong>full refund</strong> will be issued.</p>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">9. Contact for Returns & Refunds</h2>
                            <p className="mb-2">All requests must be raised via:</p>
                            <p className="mb-4"><strong>Email:</strong> support@zuley.in</p>
                            <p className="mb-2">Please include:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>Order ID</li>
                                <li>Reason for request</li>
                                <li>Supporting images/videos (if applicable)</li>
                            </ul>
                        </section>

                        <hr className="border-charcoal/10" />

                        <section>
                            <h2 className="font-heading text-2xl font-semibold text-charcoal mb-4">10. Policy Updates</h2>
                            <p>We reserve the right to update this Policy at any time. Changes will be effective upon posting on the Website.</p>
                        </section>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default RefundPolicyPage;
