import { Check, Circle, Truck, Package, CreditCard } from 'lucide-react';

interface TimelineStep {
    label: string;
    status: 'completed' | 'current' | 'pending';
    timestamp?: string;
}

interface OrderTimelineProps {
    currentStatus: string;
    history: { status: string; timestamp: string; reason?: string }[];
}

const STATUS_ORDER = ['created', 'paid', 'shipped', 'delivered'];
const STATUS_LABELS: Record<string, string> = {
    created: 'Order Created',
    paid: 'Payment Confirmed',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    failed: 'Failed',
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    created: <Circle className="w-4 h-4" />,
    paid: <CreditCard className="w-4 h-4" />,
    shipped: <Truck className="w-4 h-4" />,
    delivered: <Package className="w-4 h-4" />,
};

export function OrderTimeline({ currentStatus, history }: OrderTimelineProps) {
    // For cancelled/refunded/failed — show a special state
    const isTerminal = ['cancelled', 'refunded', 'failed'].includes(currentStatus);

    const getTimestamp = (status: string): string | undefined => {
        const entry = [...history].reverse().find((h) => h.status === status);
        return entry?.timestamp;
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Build steps
    const steps: TimelineStep[] = STATUS_ORDER.map((status) => {
        const currentIdx = STATUS_ORDER.indexOf(currentStatus);
        const stepIdx = STATUS_ORDER.indexOf(status);

        let stepStatus: TimelineStep['status'] = 'pending';
        if (isTerminal) {
            // If cancelled/refunded, mark only up to where we got
            const historyStatuses = history.map((h) => h.status);
            if (historyStatuses.includes(status)) stepStatus = 'completed';
        } else if (stepIdx < currentIdx) {
            stepStatus = 'completed';
        } else if (stepIdx === currentIdx) {
            stepStatus = 'current';
        }

        return {
            label: STATUS_LABELS[status] || status,
            status: stepStatus,
            timestamp: getTimestamp(status),
        };
    });

    return (
        <div className="space-y-0">
            {steps.map((step, idx) => (
                <div key={idx} className="flex gap-4">
                    {/* Line + Dot */}
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${step.status === 'completed'
                                    ? 'bg-success text-white'
                                    : step.status === 'current'
                                        ? 'bg-charcoal text-pearl'
                                        : 'bg-charcoal/10 text-charcoal/30'
                                }`}
                        >
                            {step.status === 'completed' ? (
                                <Check className="w-4 h-4" />
                            ) : (
                                STATUS_ICONS[STATUS_ORDER[idx]] || <Circle className="w-3 h-3" />
                            )}
                        </div>
                        {idx < steps.length - 1 && (
                            <div
                                className={`w-0.5 h-12 ${step.status === 'completed' ? 'bg-success' : 'bg-charcoal/10'
                                    }`}
                            />
                        )}
                    </div>

                    {/* Content */}
                    <div className="pb-10">
                        <p
                            className={`font-body text-sm font-medium ${step.status === 'pending' ? 'text-charcoal/40' : 'text-charcoal'
                                }`}
                        >
                            {step.label}
                        </p>
                        {step.timestamp && (
                            <p className="font-body text-xs text-charcoal/50 mt-0.5">
                                {formatDate(step.timestamp)}
                            </p>
                        )}
                    </div>
                </div>
            ))}

            {/* Terminal status badge */}
            {isTerminal && (
                <div className="mt-2 px-4 py-2 rounded-xl bg-error/10 border border-error/20">
                    <p className="font-body text-sm font-medium text-error">
                        {STATUS_LABELS[currentStatus] || currentStatus}
                    </p>
                </div>
            )}
        </div>
    );
}

export default OrderTimeline;
