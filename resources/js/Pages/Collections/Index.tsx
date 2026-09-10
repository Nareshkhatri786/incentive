import React, { useState } from 'react';
import Layout from '../../Layouts/Layout';
import { useForm } from '@inertiajs/react';

interface Collection {
    id: number; amount: number; payment_mode: string;
    payment_date: string; reference_number?: string; notes?: string;
    booking: { customer_name: string; unit_number: string; project?: { name: string }; };
}

interface BookingOption {
    id: number;
    customer_name: string;
    unit_number: string;
    project_name: string;
    basic_amount: number;
    total_collected: number;
    pending_balance: number;
}

interface Props {
    collections: Collection[];
    bookings?: BookingOption[];
}

const fmt = (n: number | string | undefined | null) => {
    const num = Number(n);
    return new Intl.NumberFormat('en-IN').format(isNaN(num) ? 0 : num);
};

const modeColors: Record<string, string> = {
    'Cash': 'badge-amber', 'Cheque': 'badge-blue',
    'Bank Transfer': 'badge-emerald', 'NEFT_RTGS': 'badge-purple',
    'RTGS': 'badge-purple', 'UPI': 'badge-indigo',
};

export default function CollectionsIndex({ collections, bookings = [] }: Props) {
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);

    const form = useForm({
        booking_id: bookings.length > 0 ? bookings[0].id : '',
        amount: '',
        payment_mode: 'NEFT_RTGS',
        payment_date: new Date().toISOString().split('T')[0],
        reference_number: '',
        notes: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('collections.store'), {
            onSuccess: () => {
                setShowModal(false);
                form.reset();
            },
        });
    };

    const selectedBooking = bookings.find(b => String(b.id) === String(form.data.booking_id));

    const total = collections.reduce((s, c) => s + (Number(c.amount) || 0), 0);

    const filtered = collections.filter(c =>
        c.booking?.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.booking?.unit_number?.toLowerCase().includes(search.toLowerCase()) ||
        c.booking?.project?.name?.toLowerCase().includes(search.toLowerCase()) ||
        (c.reference_number || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout title="Collections Ledger" subtitle="All payment receipts from clients">
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Collections', value: collections.length, color: '#60a5fa', icon: '📑' },
                    { label: 'Total Amount Received', value: `₹${fmt(total)}`, color: '#34d399', icon: '💰' },
                    { label: 'This Month', value: `₹${fmt(collections.filter(c => c.payment_date?.startsWith(new Date().toISOString().slice(0, 7))).reduce((s, c) => s + Number(c.amount), 0))}`, color: '#fbbf24', icon: '📅' },
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search client, unit, project, ref..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{filtered.length} records</span>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn btn-primary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <span>💰</span> + Receive Payment
                    </button>
                </div>
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
                                    <span className={`badge ${modeColors[c.payment_mode] || 'badge-slate'}`}>{c.payment_mode.replace('_', ' / ')}</span>
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{c.payment_date}</td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontStyle: 'italic' }}>
                                    {c.reference_number ? `Ref: ${c.reference_number}` : ''} {c.notes || ''}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal: Receive Payment */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Record Client Payment (Collection)</div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Select Client / Booking *</label>
                                    <select
                                        className="form-input"
                                        value={form.data.booking_id}
                                        onChange={e => form.setData('booking_id', e.target.value)}
                                        required
                                    >
                                        <option value="">— Select Booking —</option>
                                        {bookings.map(b => (
                                            <option key={b.id} value={b.id}>
                                                {b.customer_name} · Unit {b.unit_number} ({b.project_name}) — Due: ₹{fmt(b.pending_balance)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedBooking && (
                                    <div style={{ padding: '0.625rem 0.875rem', background: 'rgba(59,130,246,0.06)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                        <div>Total Cost: <b>₹{fmt(selectedBooking.basic_amount)}</b></div>
                                        <div>Collected: <b style={{ color: '#34d399' }}>₹{fmt(selectedBooking.total_collected)}</b></div>
                                        <div>Pending: <b style={{ color: '#f87171' }}>₹{fmt(selectedBooking.pending_balance)}</b></div>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Amount Received (₹) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-input"
                                            placeholder="e.g. 50000"
                                            value={form.data.amount}
                                            onChange={e => form.setData('amount', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Payment Mode *</label>
                                        <select
                                            className="form-input"
                                            value={form.data.payment_mode}
                                            onChange={e => form.setData('payment_mode', e.target.value)}
                                            required
                                        >
                                            <option value="NEFT_RTGS">NEFT / RTGS</option>
                                            <option value="Cheque">Cheque</option>
                                            <option value="UPI">UPI</option>
                                            <option value="Cash">Cash</option>
                                        </select>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Payment Date *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={form.data.payment_date}
                                            onChange={e => form.setData('payment_date', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Cheque / UTR / Ref No.</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g. UTR123456"
                                            value={form.data.reference_number}
                                            onChange={e => form.setData('reference_number', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Notes / Remarks</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. 1st instalment against booking"
                                        value={form.data.notes}
                                        onChange={e => form.setData('notes', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={form.processing}>
                                    {form.processing ? 'Recording...' : 'Record Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}

