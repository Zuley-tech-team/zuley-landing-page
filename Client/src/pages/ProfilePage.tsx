import { useState, useEffect } from 'react';
import { User, Mail, Phone, ShieldCheck, CheckCircle } from 'lucide-react';
import { Navbar } from '../components/common';
import { Footer } from '../components/home';
import { useAuth } from '../contexts/AuthContext';
import { completeProfile } from '../api/auth';
import { useToast } from '../contexts/ToastContext';

export function ProfilePage() {
    const { user, isLoggedIn, isLoading: authLoading, openAuthModal } = useAuth();
    const { showToast } = useToast();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Initialize state from user context
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setPhone(user.phone || '');
        }
    }, [user]);

    // Handle authentication state
    if (!authLoading && !isLoggedIn) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-pearl pt-32 pb-20 flex flex-col items-center justify-center">
                    <ShieldCheck className="w-16 h-16 text-charcoal/20 mb-6" />
                    <h1 className="font-heading text-2xl font-bold text-charcoal mb-4">
                        Secure Access
                    </h1>
                    <p className="font-body text-charcoal/60 text-center max-w-md mb-8">
                        Please sign in to view and manage your profile details, track your orders, and more.
                    </p>
                    <button
                        onClick={() => openAuthModal()}
                        className="bg-charcoal text-pearl px-8 py-3 rounded-full font-body font-semibold hover:bg-graphite transition-all hover:-translate-y-0.5"
                    >
                        Sign In / Sign Up
                    </button>
                </main>
                <Footer />
            </>
        );
    }

    if (authLoading || !user) {
        return (
            <>
                <Navbar />
                <main className="min-h-screen bg-pearl pt-32 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-charcoal/30 border-t-charcoal rounded-full animate-spin" />
                </main>
            </>
        );
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        const trimmedPhone = phone.trim().replace(/\D/g, '');

        if (!trimmedName) {
            showToast('Please enter your full name', 'error');
            return;
        }

        if (trimmedPhone && !/^[6-9]\d{9}$/.test(trimmedPhone)) {
            showToast('Please enter a valid 10-digit Indian mobile number', 'error');
            return;
        }

        setIsSaving(true);
        try {
            await completeProfile(trimmedName, trimmedPhone);
            setIsEditing(false);
            showToast('Profile updated successfully!', 'success');
        } catch (error: any) {
            showToast(error.message || 'Failed to update profile', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-pearl pt-24 pb-20">
                <div className="max-w-3xl mx-auto px-4 sm:px-6">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="font-heading text-3xl md:text-4xl font-bold text-charcoal">
                            My Profile
                        </h1>
                        <p className="font-body text-charcoal/60 mt-2">
                            Manage your personal information and account settings.
                        </p>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-white border border-charcoal/10 rounded-2xl p-6 md:p-8 shadow-soft">
                        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-charcoal/10">
                            <div className="w-20 h-20 bg-charcoal text-pearl rounded-full flex items-center justify-center font-heading text-2xl font-bold">
                                {user.name ? user.name.slice(0, 2).toUpperCase() : user.email.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="font-heading text-2xl font-bold text-charcoal">
                                    {user.name || 'Zuley Member'}
                                </h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-success/10 text-success text-xs font-semibold rounded-full">
                                        <CheckCircle className="w-3 h-3" />
                                        Verified
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Details Form */}
                        <form onSubmit={handleSave} className="space-y-6">
                            {/* Email (Read Only) */}
                            <div>
                                <label className="block font-body text-sm font-semibold text-charcoal/80 uppercase tracking-wider mb-2">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-charcoal/40" />
                                    </div>
                                    <input
                                        type="email"
                                        value={user.email}
                                        disabled
                                        className="w-full pl-11 pr-4 py-3 bg-pearl border border-charcoal/10 rounded-xl font-body text-charcoal/70 cursor-not-allowed"
                                    />
                                </div>
                                <p className="font-body text-xs text-charcoal/50 mt-2">
                                    Email addresses cannot be changed as they are used for login.
                                </p>
                            </div>

                            {/* Full Name */}
                            <div>
                                <label className="block font-body text-sm font-semibold text-charcoal/80 uppercase tracking-wider mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <User className="h-5 w-5 text-charcoal/40" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={!isEditing || isSaving}
                                        className={`w-full pl-11 pr-4 py-3 rounded-xl font-body text-charcoal transition-colors ${
                                            isEditing
                                                ? 'bg-white border-2 border-charcoal focus:outline-none'
                                                : 'bg-pearl border border-charcoal/10 cursor-default'
                                        }`}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="block font-body text-sm font-semibold text-charcoal/80 uppercase tracking-wider mb-2">
                                    Mobile Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Phone className="h-5 w-5 text-charcoal/40" />
                                    </div>
                                    <div className="absolute inset-y-0 left-10 pl-2 flex items-center pointer-events-none">
                                        <span className="text-charcoal/60 font-body font-medium">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        disabled={!isEditing || isSaving}
                                        className={`w-full pl-20 pr-4 py-3 rounded-xl font-body text-charcoal transition-colors ${
                                            isEditing
                                                ? 'bg-white border-2 border-charcoal focus:outline-none'
                                                : 'bg-pearl border border-charcoal/10 cursor-default'
                                        }`}
                                        placeholder="98765 43210"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-6 border-t border-charcoal/10 flex justify-end gap-4">
                                {isEditing ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                setName(user.name || '');
                                                setPhone(user.phone || '');
                                            }}
                                            disabled={isSaving}
                                            className="px-6 py-2.5 font-body font-semibold text-charcoal/60 hover:text-charcoal transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSaving}
                                            className="bg-charcoal text-pearl px-8 py-2.5 rounded-full font-body font-semibold hover:bg-graphite transition-all flex items-center gap-2"
                                        >
                                            {isSaving && (
                                                <div className="w-4 h-4 border-2 border-pearl/30 border-t-pearl rounded-full animate-spin" />
                                            )}
                                            Save Changes
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(true)}
                                        className="border-2 border-charcoal text-charcoal px-8 py-2.5 rounded-full font-body font-semibold hover:bg-charcoal/5 transition-all"
                                    >
                                        Edit Profile
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}

export default ProfilePage;
