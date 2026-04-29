import { useState, useRef, useEffect } from 'react';
import { LogOut, ShoppingBag, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function getInitials(name?: string, email?: string): string {
    if (name && name.trim()) {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return parts[0].slice(0, 2).toUpperCase();
    }
    // Fallback to email
    if (email) {
        return email.slice(0, 2).toUpperCase();
    }
    return 'ME';
}

export function UserMenu() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) return null;

    const initials = getInitials(user.name, user.email);

    const handleLogout = async () => {
        setIsOpen(false);
        await logout();
    };

    return (
        <div className="user-menu-wrap" ref={menuRef}>
            <button
                onClick={() => setIsOpen(o => !o)}
                className="user-menu-trigger"
                aria-label="Account menu"
                aria-expanded={isOpen}
            >
                <span className="user-menu-avatar">{initials}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-charcoal/60 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="user-menu-dropdown" role="menu">
                    {/* User info header */}
                    <div className="user-menu-header">
                        <div className="user-menu-avatar user-menu-avatar--lg">{initials}</div>
                        <div className="user-menu-info">
                            <p className="user-menu-name">{user.name || 'My Account'}</p>
                            <p className="user-menu-email">{user.email}</p>
                        </div>
                    </div>
                    <div className="user-menu-divider" />
                    <a
                        href="/orders"
                        className="user-menu-item"
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                    >
                        <ShoppingBag className="w-4 h-4" />
                        My Orders
                    </a>
                    <a
                        href="/profile"
                        className="user-menu-item"
                        role="menuitem"
                        onClick={() => setIsOpen(false)}
                    >
                        <User className="w-4 h-4" />
                        My Profile
                    </a>
                    <div className="user-menu-divider" />
                    <button
                        onClick={handleLogout}
                        className="user-menu-item user-menu-item--danger"
                        role="menuitem"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            )}
        </div>
    );
}

export default UserMenu;
