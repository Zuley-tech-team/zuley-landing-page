import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import {
    getMe,
    logoutApi,
    type AuthUser,
} from '../api/auth';

type AuthModalMode = 'signin' | null;

interface AuthContextType {
    user: AuthUser | null;
    isLoggedIn: boolean;
    isLoading: boolean;
    login: (user: AuthUser) => void;
    logout: () => Promise<void>;
    // Modal control - any component can trigger the login modal
    authModalOpen: boolean;
    authModalMode: AuthModalMode;
    openAuthModal: (mode?: AuthModalMode) => void;
    closeAuthModal: () => void;
    // Callback to run after successful login (e.g. proceed to checkout)
    postLoginCallback: (() => void) | null;
    setPostLoginCallback: (cb: (() => void) | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('signin');
    const [postLoginCallback, setPostLoginCallback] = useState<(() => void) | null>(null);

    // On mount - try to restore session from token
    useEffect(() => {
        const restore = async () => {
            try {
                const data = await getMe();
                if (data.success && data.user) {
                    setUser(data.user);
                }
            } catch {
                // No valid session
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        restore();
    }, []);

    const login = useCallback((userData: AuthUser) => {
        setUser(userData);
    }, []);

    const logout = useCallback(async () => {
        await logoutApi();
        setUser(null);
    }, []);

    const openAuthModal = useCallback((mode: AuthModalMode = 'signin') => {
        setAuthModalMode(mode);
        setAuthModalOpen(true);
    }, []);

    const closeAuthModal = useCallback(() => {
        setAuthModalOpen(false);
        setPostLoginCallback(null);
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoggedIn: !!user,
                isLoading,
                login,
                logout,
                authModalOpen,
                authModalMode,
                openAuthModal,
                closeAuthModal,
                postLoginCallback,
                setPostLoginCallback,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
