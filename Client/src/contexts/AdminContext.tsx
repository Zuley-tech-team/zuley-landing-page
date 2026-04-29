import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { adminAPI } from '../api/admin';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AdminContextType {
    admin: AdminUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuth = async () => {
        try {
            const response = await adminAPI.getMe();
            if (response.success && response.admin) {
                setAdmin(response.admin);
            } else {
                setAdmin(null);
            }
        } catch {
            setAdmin(null);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await adminAPI.login(email, password);
        if (response.success && response.admin) {
            setAdmin(response.admin);
        } else {
            throw new Error('Login failed');
        }
    };

    const logout = async () => {
        await adminAPI.logout();
        setAdmin(null);
    };

    return (
        <AdminContext.Provider
            value={{
                admin,
                isLoading,
                isAuthenticated: !!admin,
                login,
                logout,
                checkAuth,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}
