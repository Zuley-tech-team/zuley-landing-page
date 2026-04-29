import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { X, Mail, ArrowRight, RotateCcw, User, Phone, CheckCircle } from 'lucide-react';
import { sendOtp, verifyOtp, completeProfile } from '../../api/auth';
import { useAuth } from '../../contexts/AuthContext';

type Step = 'email' | 'otp' | 'profile' | 'success';

const OTP_RESEND_SECONDS = 60;

export function AuthModal() {
    const { authModalOpen, closeAuthModal, login, postLoginCallback } = useAuth();

    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isNewUser, setIsNewUser] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Reset on open
    useEffect(() => {
        if (authModalOpen) {
            setStep('email');
            setEmail('');
            setOtp(['', '', '', '', '', '']);
            setName('');
            setPhone('');
            setIsLoading(false);
            setError('');
            setResendTimer(0);
        }
    }, [authModalOpen]);

    // Countdown timer
    useEffect(() => {
        if (resendTimer > 0) {
            timerRef.current = setInterval(() => {
                setResendTimer(t => {
                    if (t <= 1) {
                        clearInterval(timerRef.current!);
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [resendTimer]);

    // Lock body scroll
    useEffect(() => {
        if (authModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [authModalOpen]);

    if (!authModalOpen) return null;

    // Focus first OTP input when entering that step
    function focusFirstOtp() {
        setTimeout(() => otpRefs.current[0]?.focus(), 50);
    }

    async function handleSendOtp(e?: React.FormEvent) {
        e?.preventDefault();
        setError('');
        const trimmed = email.trim().toLowerCase();
        if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
            setError('Please enter a valid email address.');
            return;
        }
        setIsLoading(true);
        try {
            const data = await sendOtp(trimmed);
            setIsNewUser(data.is_new_user);
            setStep('otp');
            setResendTimer(OTP_RESEND_SECONDS);
            focusFirstOtp();
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    function handleOtpInput(index: number, value: string) {
        if (!/^\d*$/.test(value)) return; // only digits
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // take last digit
        setOtp(newOtp);
        setError('');
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
        // Auto-verify when all 6 digits entered
        if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
            handleVerifyOtp(newOtp.join(''));
        }
    }

    function handleOtpKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
        if (e.key === 'Enter' && otp.join('').length === 6) {
            handleVerifyOtp(otp.join(''));
        }
    }

    function handleOtpPaste(e: React.ClipboardEvent) {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            const newOtp = pasted.split('');
            setOtp(newOtp);
            otpRefs.current[5]?.focus();
            handleVerifyOtp(pasted);
        }
    }

    async function handleVerifyOtp(otpValue?: string) {
        const code = otpValue ?? otp.join('');
        if (code.length !== 6) {
            setError('Please enter the complete 6-digit OTP.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const data = await verifyOtp(email.trim().toLowerCase(), code);
            login(data.user);
            if (data.needs_profile) {
                setStep('profile');
            } else {
                setStep('success');
                setTimeout(() => {
                    closeAuthModal();
                    postLoginCallback?.();
                }, 1500);
            }
        } catch (err: any) {
            setError(err.message || 'Incorrect OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            setTimeout(() => otpRefs.current[0]?.focus(), 50);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCompleteProfile(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        const trimmedName = name.trim();
        const trimmedPhone = phone.trim().replace(/\s/g, '');
        if (!trimmedName || trimmedName.length < 2) {
            setError('Please enter your full name (at least 2 characters).');
            return;
        }
        if (!trimmedPhone || !/^[6-9]\d{9}$/.test(trimmedPhone)) {
            setError('Please enter a valid 10-digit Indian mobile number.');
            return;
        }
        setIsLoading(true);
        try {
            const data = await completeProfile(trimmedName, trimmedPhone);
            login(data.user);
            setStep('success');
            setTimeout(() => {
                closeAuthModal();
                postLoginCallback?.();
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to save profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div
            className="auth-modal-overlay"
            onClick={(e) => { if (e.target === e.currentTarget) closeAuthModal(); }}
        >
            <div className="auth-modal-card" role="dialog" aria-modal="true" aria-label="Sign In">
                {/* Close Button */}
                <button
                    onClick={closeAuthModal}
                    className="auth-modal-close"
                    aria-label="Close"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Step: Email */}
                {step === 'email' && (
                    <form onSubmit={handleSendOtp} className="auth-modal-content">
                        <div className="auth-modal-icon">
                            <Mail className="w-6 h-6 text-charcoal" />
                        </div>
                        <h2 className="auth-modal-title">Sign in to Zuley</h2>
                        <p className="auth-modal-subtitle">
                            Enter your email and we'll send you a one-time password.
                            No account needed — we'll create one automatically.
                        </p>
                        <div className="auth-field">
                            <label htmlFor="auth-email" className="auth-field-label">Email address</label>
                            <input
                                id="auth-email"
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); setError(''); }}
                                placeholder="you@example.com"
                                className="auth-field-input"
                                autoComplete="email"
                                autoFocus
                                disabled={isLoading}
                            />
                        </div>
                        {error && <p className="auth-error">{error}</p>}
                        <button
                            type="submit"
                            className="auth-btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="auth-spinner" />
                            ) : (
                                <>Send OTP <ArrowRight className="w-4 h-4 ml-2" /></>
                            )}
                        </button>
                        <p className="auth-legal">
                            By continuing, you agree to our{' '}
                            <a href="/terms" className="auth-link" onClick={closeAuthModal}>Terms</a>
                            {' '}and{' '}
                            <a href="/privacy-policy" className="auth-link" onClick={closeAuthModal}>Privacy Policy</a>.
                        </p>
                    </form>
                )}

                {/* Step: OTP */}
                {step === 'otp' && (
                    <div className="auth-modal-content">
                        <div className="auth-modal-icon">
                            <Mail className="w-6 h-6 text-charcoal" />
                        </div>
                        <h2 className="auth-modal-title">
                            {isNewUser ? 'Create your account' : 'Welcome back!'}
                        </h2>
                        <p className="auth-modal-subtitle">
                            We've sent a 6-digit OTP to <strong>{email}</strong>.
                            Check your inbox (and spam folder).
                        </p>
                        {/* OTP Input Grid */}
                        <div className="auth-otp-grid" onPaste={handleOtpPaste}>
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => { otpRefs.current[i] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleOtpInput(i, e.target.value)}
                                    onKeyDown={e => handleOtpKeyDown(i, e)}
                                    className={`auth-otp-box ${error ? 'auth-otp-box--error' : ''} ${isLoading ? 'auth-otp-box--loading' : ''}`}
                                    disabled={isLoading}
                                    aria-label={`OTP digit ${i + 1}`}
                                />
                            ))}
                        </div>
                        {error && <p className="auth-error">{error}</p>}

                        {isLoading && (
                            <div className="auth-verifying">
                                <span className="auth-spinner" />
                                <span>Verifying…</span>
                            </div>
                        )}

                        <button
                            type="button"
                            className="auth-btn-primary"
                            onClick={() => handleVerifyOtp()}
                            disabled={isLoading || otp.join('').length !== 6}
                        >
                            {isLoading ? <span className="auth-spinner" /> : 'Verify OTP'}
                        </button>

                        {/* Resend OTP */}
                        <div className="auth-resend">
                            {resendTimer > 0 ? (
                                <span className="auth-resend-timer">
                                    Resend in {resendTimer}s
                                </span>
                            ) : (
                                <button
                                    type="button"
                                    className="auth-resend-btn"
                                    onClick={() => handleSendOtp()}
                                    disabled={isLoading}
                                >
                                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                                    Resend OTP
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            className="auth-back-btn"
                            onClick={() => { setStep('email'); setError(''); setOtp(['', '', '', '', '', '']); }}
                        >
                            ← Change email
                        </button>
                    </div>
                )}

                {/* Step: Profile Completion */}
                {step === 'profile' && (
                    <form onSubmit={handleCompleteProfile} className="auth-modal-content">
                        <div className="auth-modal-icon">
                            <User className="w-6 h-6 text-charcoal" />
                        </div>
                        <h2 className="auth-modal-title">Complete your profile</h2>
                        <p className="auth-modal-subtitle">
                            Just a few details to personalize your experience and enable order tracking.
                        </p>
                        <div className="auth-field">
                            <label htmlFor="auth-name" className="auth-field-label">Full name</label>
                            <input
                                id="auth-name"
                                type="text"
                                value={name}
                                onChange={e => { setName(e.target.value); setError(''); }}
                                placeholder="Your full name"
                                className="auth-field-input"
                                autoComplete="name"
                                autoFocus
                                disabled={isLoading}
                            />
                        </div>
                        <div className="auth-field">
                            <label htmlFor="auth-phone" className="auth-field-label">
                                <Phone className="w-3.5 h-3.5 inline mr-1" />
                                Mobile number
                            </label>
                            <div className="auth-phone-wrap">
                                <span className="auth-phone-prefix">+91</span>
                                <input
                                    id="auth-phone"
                                    type="tel"
                                    value={phone}
                                    onChange={e => { setPhone(e.target.value.replace(/\D/g, '')); setError(''); }}
                                    placeholder="98765 43210"
                                    className="auth-field-input auth-field-input--phone"
                                    autoComplete="tel"
                                    maxLength={10}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        {error && <p className="auth-error">{error}</p>}
                        <button
                            type="submit"
                            className="auth-btn-primary"
                            disabled={isLoading}
                        >
                            {isLoading ? <span className="auth-spinner" /> : 'Save & Continue'}
                        </button>
                        <button
                            type="button"
                            className="auth-skip-btn"
                            onClick={() => {
                                setStep('success');
                                setTimeout(() => { closeAuthModal(); postLoginCallback?.(); }, 1500);
                            }}
                            disabled={isLoading}
                        >
                            Skip for now
                        </button>
                    </form>
                )}

                {/* Step: Success */}
                {step === 'success' && (
                    <div className="auth-modal-content auth-modal-content--center">
                        <div className="auth-success-icon">
                            <CheckCircle className="w-10 h-10 text-success" />
                        </div>
                        <h2 className="auth-modal-title">You're in!</h2>
                        <p className="auth-modal-subtitle">
                            Welcome to Zuley. Redirecting you…
                        </p>
                    </div>
                )}

                {/* Progress dots */}
                {step !== 'success' && (
                    <div className="auth-steps">
                        {(['email', 'otp', 'profile'] as Step[]).map((s, i) => (
                            <span
                                key={s}
                                className={`auth-step-dot ${step === s ? 'auth-step-dot--active' : ''} ${
                                    (['email', 'otp', 'profile'] as Step[]).indexOf(step) > i
                                        ? 'auth-step-dot--done'
                                        : ''
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default AuthModal;
