import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/home';
import { Button } from '../components/common/Button';
import { Loader2, AlertCircle, RefreshCcw } from 'lucide-react';
import { verifyPayment } from '../api/payment';

export function OrderStatusPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const merchantOrderId = searchParams.get('id') || '';

    const [status, setStatus] = useState<'verifying' | 'failed'>('verifying');
    const [error, setError] = useState<string | null>(null);
    const hasVerified = useRef(false);

    useEffect(() => {
        if (!merchantOrderId) {
            setStatus('failed');
            setError('Invalid payment reference.');
            return;
        }

        if (hasVerified.current) return;
        hasVerified.current = true;

        const verify = async () => {
            try {
                const res = await verifyPayment({ merchant_order_id: merchantOrderId });
                if (res.success && res.order_id) {
                    // Redirect to success page
                    const params = new URLSearchParams({
                        order_id: res.order_id,
                        method: 'phonepe',
                        invoice: res.invoice || '',
                    });
                    navigate(`/order-success?${params.toString()}`, { replace: true });
                } else {
                    setStatus('failed');
                    setError(res.message || 'Payment verification failed.');
                }
            } catch (err: any) {
                setStatus('failed');
                setError(err.message || 'Payment verification failed. Please check your orders or contact support.');
            }
        };

        verify();
    }, [merchantOrderId, navigate]);

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-20">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 md:py-20 text-center">
                    {status === 'verifying' ? (
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <Loader2 className="w-12 h-12 text-charcoal animate-spin" />
                            <h1 className="font-heading text-2xl font-bold text-charcoal">
                                Verifying your payment...
                            </h1>
                            <p className="font-body text-charcoal/60">
                                Please do not close or refresh this page.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center space-y-6">
                            <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center">
                                <AlertCircle className="w-10 h-10 text-error" />
                            </div>
                            <h1 className="font-heading text-2xl font-bold text-charcoal">
                                Payment Failed
                            </h1>
                            <p className="font-body text-charcoal/60 max-w-md">
                                {error}
                            </p>
                            <div className="flex gap-4 mt-6">
                                <Button 
                                    variant="secondary" 
                                    onClick={() => navigate('/products')}
                                    icon={<RefreshCcw className="w-4 h-4" />}
                                    iconPosition="left"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
                <Footer />
            </main>
        </>
    );
}

export default OrderStatusPage;
