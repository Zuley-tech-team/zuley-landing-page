import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../contexts/AdminContext';
import { Loader2, AlertCircle } from 'lucide-react';

export function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAdmin();
    const navigate = useNavigate();

    useEffect(() => {
        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
        const previousHref = favicon?.href || '/favicon.svg';

        document.title = 'ADMIN | Zuley';

        if (favicon) {
            favicon.href = '/admin-favicon.svg';
        }

        return () => {
            document.title = 'Zuley';
            if (favicon) {
                favicon.href = previousHref;
            }
        };
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/admin');
        } catch (err: any) {
            setError(err.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-charcoal to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="font-heading text-3xl font-bold text-charcoal mb-2">
                            Zuley Admin
                        </h1>
                        <p className="font-body text-gray-500">
                            Sign in to access the dashboard
                        </p>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 p-4 mb-6 bg-red-50 border border-red-200 rounded-xl text-red-600">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="font-body text-sm">{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="block font-body text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl font-body focus:ring-2 focus:ring-charcoal focus:border-transparent transition-all"
                                placeholder="admin@zuley.in"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block font-body text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl font-body focus:ring-2 focus:ring-charcoal focus:border-transparent transition-all"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-charcoal text-white font-body font-medium rounded-xl hover:bg-charcoal/90 focus:outline-none focus:ring-2 focus:ring-charcoal focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center font-body text-sm text-gray-500">
                        Contact support if you need access
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminLoginPage;
