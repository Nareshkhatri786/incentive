import React, { useState } from 'react';
import Layout from '../../Layouts/Layout';

interface Collection {
    id: number; amount: number; payment_mode: string;
    payment_date: string; reference_number?: string; notes?: string;
    booking: { customer_name: string; unit_number: string; project?: { name: string }; };
}
interface Props { collections: Collection[]; }

const fmt = (n: number | string | undefined | null) => {
    const num = Number(n);
    return new Intl.NumberFormat('en-IN').format(isNaN(num) ? 0 : num);
};
const modeColors: Record<string, string> = {
    'Cash': 'badge-amber', 'Cheque': 'badge-blue',
    'Bank Transfer': 'badge-emerald', 'NEFT': 'badge-emerald',
    'RTGS': 'badge-purple', 'UPI': 'badge-indigo',
};

export default function CollectionsIndex({ collections }: Props) {
    const [search, setSearch] = useState('');
    const total = collections.reduce((s, c) => s + (Number(c.amount) || 0), 0);

    const filtered = collections.filter(c =>
        c.booking?.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.booking?.unit_number?.toLowerCase().includes(search.toLowerCase()) ||
        c.booking?.project?.name?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout title="Collections Ledger" subtitle="All payment receipts from clients">
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Collections', value: collections.length, color: '#60a5fa', icon: '📑' },
                    { label: 'Total Amount Received', value: `₹${fmt(total)}`, color: '#34d399', icon: '💰' },
                    { label: 'This Month', value: `₹${fmt(collections.filter(c => c.payment_date?.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, c) => s + c.amount, 0))}`, color: '#fbbf24', icon: '📅' },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{ fontSize: '1.5rem', opacity: 0.7 }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input type="text" className="search-input" placeholder="Search client, unit, project..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{filtered.length} records</span>
            </div>

            {/* Table */}
            <div className="card table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Customer / Unit</th>
                            <th>Project</th>
                            <th>Amount Received</th>
                            <th>Payment Mode</th>
                            <th>Date</th>
                            <th>Reference / Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No collection records found.</td></tr>
                        ) : filtered.map((c) => (
                            <tr key={c.id}>
                                <td>
                                    <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{c.booking?.customer_name}</div>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>Unit: {c.booking?.unit_number}</div>
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{c.booking?.project?.name || '—'}</td>
                                <td style={{ fontWeight: 800, color: '#34d399', fontSize: '0.85rem' }}>₹{fmt(c.amount)}</td>
                                <td>
                                    <span className={`badge ${modeColors[c.payment_mode] || 'badge-slate'}`}>{c.payment_mode}</span>
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{c.payment_date}</td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontStyle: 'italic' }}>
                                    {c.reference_number || c.notes || '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}
