import { useEffect, useState } from 'react';
import { Building2, Inbox, Loader2, Mail, Search, Users } from 'lucide-react';
import { adminAPI, type Pagination } from '../../api/admin';

type Tab = 'contacts' | 'corporate' | 'newsletter';

const statusClass = (status: string) => {
    if (['new', 'subscribed'].includes(status)) return 'bg-green-100 text-green-700';
    if (['in_progress', 'contacted', 'qualified'].includes(status)) return 'bg-blue-100 text-blue-700';
    if (['resolved', 'closed'].includes(status)) return 'bg-gray-100 text-gray-700';
    return 'bg-amber-100 text-amber-700';
};

export function AdminLeadsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('contacts');
    const [items, setItems] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [pagination, setPagination] = useState<Pagination>({ current: 1, total: 1, count: 0 });
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState('');

    useEffect(() => {
        loadStats();
    }, []);

    useEffect(() => {
        loadItems(1);
    }, [activeTab, statusFilter]);

    async function loadStats() {
        try {
            const response = await adminAPI.getEngagementStats();
            setStats(response.data);
        } catch (error) {
            console.error('Failed to load engagement stats:', error);
        }
    }

    async function loadItems(page = 1) {
        setIsLoading(true);
        try {
            const params = {
                page,
                limit: 20,
                search: searchTerm || undefined,
                status: statusFilter === 'all' ? undefined : statusFilter,
            };

            const response =
                activeTab === 'contacts'
                    ? await adminAPI.getContactInquiries(params)
                    : activeTab === 'corporate'
                        ? await adminAPI.getCorporateLeads(params)
                        : await adminAPI.getNewsletterSubscribers(params);

            setItems(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Failed to load leads:', error);
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    }

    async function updateStatus(id: string, status: string) {
        setIsUpdating(id);
        try {
            if (activeTab === 'contacts') {
                await adminAPI.updateContactInquiryStatus(id, status);
            } else if (activeTab === 'corporate') {
                await adminAPI.updateCorporateLeadStatus(id, status);
            }
            await loadItems(pagination.current);
            await loadStats();
        } catch (error: any) {
            alert(error.message || 'Failed to update status');
        } finally {
            setIsUpdating('');
        }
    }

    const tabs = [
        { id: 'contacts' as const, label: 'Messages', icon: Inbox, count: stats?.openContactInquiries },
        { id: 'corporate' as const, label: 'Corporate', icon: Building2, count: stats?.openCorporateLeads },
        { id: 'newsletter' as const, label: 'Newsletter', icon: Users, count: stats?.activeSubscribers },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="font-heading text-2xl font-bold text-gray-900">Leads</h1>
                <p className="font-body text-gray-500">Manage customer messages, corporate enquiries, and subscribers</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => {
                            setActiveTab(tab.id);
                            setStatusFilter('all');
                            setSearchTerm('');
                        }}
                        className={`rounded-xl border p-5 text-left transition-colors ${activeTab === tab.id
                            ? 'border-charcoal bg-charcoal text-white'
                            : 'border-gray-200 bg-white text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <tab.icon className="w-5 h-5" />
                            <span className="font-heading text-2xl font-bold">{tab.count ?? '-'}</span>
                        </div>
                        <p className="mt-3 font-body text-sm opacity-80">{tab.label}</p>
                    </button>
                ))}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            onKeyDown={(event) => event.key === 'Enter' && loadItems(1)}
                            placeholder="Search leads..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent"
                        />
                    </div>
                    {activeTab !== 'newsletter' && (
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-charcoal focus:border-transparent"
                        >
                            {activeTab === 'contacts' ? (
                                <>
                                    <option value="all">All Status</option>
                                    <option value="new">New</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="resolved">Resolved</option>
                                </>
                            ) : (
                                <>
                                    <option value="all">All Status</option>
                                    <option value="new">New</option>
                                    <option value="contacted">Contacted</option>
                                    <option value="qualified">Qualified</option>
                                    <option value="closed">Closed</option>
                                </>
                            )}
                        </select>
                    )}
                    <button
                        onClick={() => loadItems(1)}
                        className="px-4 py-2 bg-charcoal text-white rounded-xl hover:bg-charcoal/90"
                    >
                        Search
                    </button>
                </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                    </div>
                ) : items.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">No records found</div>
                ) : activeTab === 'contacts' ? (
                    <ContactTable items={items} isUpdating={isUpdating} onStatusChange={updateStatus} />
                ) : activeTab === 'corporate' ? (
                    <CorporateTable items={items} isUpdating={isUpdating} onStatusChange={updateStatus} />
                ) : (
                    <NewsletterTable items={items} />
                )}

                {pagination.total > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                        <p className="text-sm text-gray-500">Page {pagination.current} of {pagination.total}</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => loadItems(pagination.current - 1)}
                                disabled={pagination.current === 1}
                                className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => loadItems(pagination.current + 1)}
                                disabled={pagination.current === pagination.total}
                                className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ContactTable({ items, isUpdating, onStatusChange }: { items: any[]; isUpdating: string; onStatusChange: (id: string, status: string) => void }) {
    return (
        <div className="divide-y divide-gray-200">
            {items.map((item) => (
                <article key={item._id} className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="font-body font-semibold text-gray-900">{item.full_name}</h2>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item.status)}`}>{item.status}</span>
                                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">{item.inquiry_type}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{item.email}{item.phone ? ` | ${item.phone}` : ''}</p>
                            {item.order_id && <p className="mt-1 text-sm text-gray-500">Order: {item.order_id}</p>}
                            <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{item.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <a href={`mailto:${item.email}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
                                <Mail className="w-4 h-4" />
                                Reply
                            </a>
                            <select
                                value={item.status}
                                disabled={isUpdating === item._id}
                                onChange={(event) => onStatusChange(item._id, event.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="new">New</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                            </select>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}

function CorporateTable({ items, isUpdating, onStatusChange }: { items: any[]; isUpdating: string; onStatusChange: (id: string, status: string) => void }) {
    return (
        <div className="divide-y divide-gray-200">
            {items.map((item) => (
                <article key={item._id} className="p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="font-body font-semibold text-gray-900">{item.company_name}</h2>
                                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item.status)}`}>{item.status}</span>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">{item.contact_name} | {item.email}{item.phone ? ` | ${item.phone}` : ''}</p>
                            <p className="mt-2 text-sm text-gray-700">Qty {item.quantity} | {item.product_type} {item.expected_timeline ? `| ${item.expected_timeline}` : ''}</p>
                            {item.message && <p className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{item.message}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                            <a href={`mailto:${item.email}`} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
                                <Mail className="w-4 h-4" />
                                Reply
                            </a>
                            <select
                                value={item.status}
                                disabled={isUpdating === item._id}
                                onChange={(event) => onStatusChange(item._id, event.target.value)}
                                className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                            >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="qualified">Qualified</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>
                </article>
            ))}
        </div>
    );
}

function NewsletterTable({ items }: { items: any[] }) {
    return (
        <div className="divide-y divide-gray-200">
            {items.map((item) => (
                <article key={item._id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="font-body font-semibold text-gray-900">{item.email}</p>
                        <p className="text-sm text-gray-500">Source: {item.source || 'footer'}</p>
                    </div>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item.status)}`}>{item.status}</span>
                </article>
            ))}
        </div>
    );
}

export default AdminLeadsPage;
