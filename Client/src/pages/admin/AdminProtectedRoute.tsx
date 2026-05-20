import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

export function AdminProtectedRoute() {
    const { isLoading, isAuthenticated } = useAdmin();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/adminofz/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}

export default AdminProtectedRoute;
