import { useToast } from '../../contexts/ToastContext';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import './Toast.css';

const iconMap = {
    success: <CheckCircle2 className="w-5 h-5 text-success" />,
    error: <AlertCircle className="w-5 h-5 text-error" />,
    info: <Info className="w-5 h-5 text-accent-dark" />,
};

const borderMap = {
    success: 'border-success/30',
    error: 'border-error/30',
    info: 'border-accent/30',
};

export function ToastContainer() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`toast-item border ${borderMap[toast.type]}`}
                    role="alert"
                >
                    <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 mt-0.5">{iconMap[toast.type]}</span>
                        <p className="font-body text-sm text-charcoal flex-1">{toast.message}</p>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="flex-shrink-0 p-1 rounded-lg hover:bg-charcoal/5 transition-colors cursor-pointer"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4 text-charcoal/40" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ToastContainer;
