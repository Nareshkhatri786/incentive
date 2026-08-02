import React, { useState } from 'react';
import Layout from '../../Layouts/Layout';
import { useForm, Link } from '@inertiajs/react';

interface Collection { id: number; amount: number; payment_date: string; notes?: string; }
interface Incentive { id: number; employee_name: string; rule_description: string; amount: number; status: string; }
interface BookingDetails {
    id: number; customer_name: string; customer_mobile?: string;
    unit_number: string; basic_amount: number; total_collected: number;
    pending_balance: number; status: string; booking_date: string;
    bana_khat_date?: string; sale_deed_date?: string; project_name: string;
    assignments: { id: number; name: string }[];
    collections: Collection[]; incentives: Incentive[];
}
interface Props { booking: BookingDetails; }

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);
const statusConfig: Record<string, string> = {
    'Booking Done': 'badge-blue', 'Bana Khat': 'badge-amber',
    'Sale Deed': 'badge-emerald', 'Cancelled': 'badge-red',
};

export default function BookingShow({ booking }: Props) {
    const statusForm = useForm({ status: booking.status });
    const [showStatusModal, setShowStatusModal] = useState(false);

    const handleUpdateStatus = (e: React.FormEvent) => {
        e.preventDefault();
        statusForm.post(route('bookings.status.update', { booking: booking.id }), {
            onSuccess: () => setShowStatusModal(false),
        });
    };

    const collectPct = booking.basic_amount > 0
        ? Math.round((booking.total_collected / booking.basic_amount) * 100) : 0;

    return (
        <Layout title={`Booking — ${booking.customer_name}`} subtitle={`${booking.project_name} · Unit ${booking.unit_number}`}>
            {/* Back */}
            <Link href={route('bookings.index')} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.25rem', display: 'inline-flex' }}>
                ← Back to Bookings
            </Link>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.25rem', alignItems: 'start' }}>
                {/* Left Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {/* Booking Summary Card */}
                    <div className="card">
                        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>{booking.customer_name}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                    {booking.project_name} · Unit {booking.unit_number}
                                    {booking.customer_mobile && ` · 📞 ${booking.customer_mobile}`}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className={`badge ${statusConfig[booking.status] || 'badge-slate'}`}>{booking.status}</span>
                                <button onClick={() => setShowStatusModal(true)} className="btn btn-secondary btn-sm">Change Status</button>
                            </div>
                        </div>

                        {/* Financial Summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
                            {[
                                { label: 'Basic Cost', value: `₹${fmt(booking.basic_amount)}`, color: 'var(--text-primary)' },
                                { label: 'Collected', value: `₹${fmt(booking.total_collected)}`, color: '#34d399' },
                                { label: 'Pending Balance', value: `₹${fmt(booking.pending_balance)}`, color: '#f87171' },
                            ].map((m, i) => (
                                <div key={i} style={{ padding: '1rem 1.25rem', borderRight: i < 2 ? '1px solid var(--border)' : 'none', textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{m.label}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Collection Progress */}
                        <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>Collection Progress</span>
                                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#60a5fa' }}>{collectPct}%</span>
                            </div>
                            <div style={{ height: '5px', background: 'rgba(99,130,200,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${collectPct}%`, background: 'linear-gradient(90deg,#3b82f6,#10b981)', borderRadius: 99 }} />
                            </div>
                        </div>

                        {/* Milestones & Assignments */}
                        <div style={{ padding: '0.875rem 1.25rem', borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Milestones</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>📅 Booking: {booking.booking_date}</div>
                                {booking.bana_khat_date && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 3 }}>📝 Bana Khat: {booking.bana_khat_date}</div>}
                                {booking.sale_deed_date && <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 3 }}>✅ Sale Deed: {booking.sale_deed_date}</div>}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>Assigned Staff</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                    {booking.assignments.map(a => <span key={a.id} className="badge badge-blue">{a.name}</span>)}
                                    {booking.assignments.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>None assigned</span>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Collection History */}
                    <div className="card">
                        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div className="section-title">Payment History</div>
                            <span className="badge badge-emerald">{booking.collections.length} payments</span>
                        </div>
                        <div className="table-container">
                            <table className="data-table">
                                <thead><tr><th>#</th><th>Date</th><th>Amount</th><th>Notes</th></tr></thead>
                                <tbody>
                                    {booking.collections.length === 0 ? (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No payments recorded yet.</td></tr>
                                    ) : booking.collections.map((c, i) => (
                                        <tr key={c.id}>
                                            <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>#{i + 1}</td>
                                            <td>{c.payment_date}</td>
                                            <td style={{ fontWeight: 800, color: '#34d399' }}>₹{fmt(c.amount)}</td>
                                            <td style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>{c.notes || '—'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Incentives */}
                <div className="card" style={{ height: 'fit-content' }}>
                    <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="section-title">Incentives</div>
                        <span className="badge badge-amber">{booking.incentives.length}</span>
                    </div>
                    {booking.incentives.length === 0 ? (
                        <div className="empty-state"><div className="empty-state-icon">⭐</div><div className="empty-state-text">No incentives generated</div></div>
                    ) : booking.incentives.map((inc) => (
                        <div key={inc.id} style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-primary)' }}>{inc.employee_name}</div>
                                <span className={`badge ${inc.status === 'paid' ? 'badge-emerald' : 'badge-amber'}`}>{inc.status}</span>
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginBottom: 4 }}>{inc.rule_description}</div>
                            <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '0.9rem' }}>₹{fmt(inc.amount)}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Status Modal */}
            {showStatusModal && (
                <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
                    <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Update Booking Status</div>
                            <button onClick={() => setShowStatusModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateStatus}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">New Status</label>
                                    <select className="form-input" value={statusForm.data.status} onChange={e => statusForm.setData('status', e.target.value)}>
                                        <option value="Booking Done">Booking Done</option>
                                        <option value="Bana Khat">Bana Khat</option>
                                        <option value="Sale Deed">Sale Deed</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowStatusModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={statusForm.processing}>
                                    {statusForm.processing ? 'Saving...' : 'Update Status'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
