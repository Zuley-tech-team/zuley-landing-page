import { ExternalLink, Truck } from 'lucide-react';

interface ShippingCardProps {
    courierName: string;
    trackingNumber: string;
    trackingUrl: string;
    status: string;
    shippedAt: string;
    deliveredAt: string | null;
}

export function ShippingCard({
    courierName,
    trackingNumber,
    trackingUrl,
    status,
    shippedAt,
    deliveredAt,
}: ShippingCardProps) {
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const statusColors: Record<string, string> = {
        shipped: 'bg-warning/10 text-warning',
        in_transit: 'bg-accent/20 text-accent-dark',
        delivered: 'bg-success/10 text-success',
    };

    return (
        <div className="bg-white rounded-2xl shadow-soft p-5 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-charcoal/5 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-charcoal/60" />
                    </div>
                    <div>
                        <h3 className="font-heading text-sm font-semibold text-charcoal">
                            Shipping Details
                        </h3>
                        <p className="font-body text-xs text-charcoal/50">
                            via {courierName}
                        </p>
                    </div>
                </div>
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[status] || 'bg-charcoal/10 text-charcoal/60'
                        }`}
                >
                    {status.replace('_', ' ')}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                    <p className="font-body text-charcoal/50 text-xs">Tracking Number</p>
                    <p className="font-body font-medium text-charcoal font-mono">{trackingNumber}</p>
                </div>
                <div>
                    <p className="font-body text-charcoal/50 text-xs">Shipped On</p>
                    <p className="font-body font-medium text-charcoal">{formatDate(shippedAt)}</p>
                </div>
                {deliveredAt && (
                    <div>
                        <p className="font-body text-charcoal/50 text-xs">Delivered On</p>
                        <p className="font-body font-medium text-charcoal">{formatDate(deliveredAt)}</p>
                    </div>
                )}
            </div>

            {trackingUrl && (
                <a
                    href={trackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-charcoal text-pearl text-sm font-medium hover:bg-graphite transition-colors"
                >
                    Track Shipment
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            )}
        </div>
    );
}

export default ShippingCard;
