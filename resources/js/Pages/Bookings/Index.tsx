import React, { useState } from 'react';
import Layout from '../../Layouts/Layout';
import { useForm, Link } from '@inertiajs/react';

interface Booking {
    id: number; project_name: string; project_id: number;
    customer_name: string; unit_number: string;
    basic_amount: number; total_collected: number;
    pending_balance: number; status: string;
    booking_date: string; assignments: string[];
}
interface Project { id: number; name: string; }
interface Employee { id: number; name: string; }
interface Props { bookings: Booking[]; projects: Project[]; employees: Employee[]; }

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);

const statusConfig: Record<string, { cls: string; dot: string }> = {
    'Booking Done': { cls: 'badge-blue', dot: 'blue' },
    'Bana Khat': { cls: 'badge-amber', dot: 'amber' },
    'Sale Deed': { cls: 'badge-emerald', dot: 'green' },
    'Cancelled': { cls: 'badge-red', dot: 'red' },
};

export default function BookingsIndex({ bookings, projects, employees }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [search, setSearch] = useState('');

    const form = useForm({
        project_id: '', customer_name: '', unit_number: '',
        basic_amount: 0, booking_date: new Date().toISOString().split('T')[0],
        status: 'Booking Done', assignments: [] as { employee_id: number }[],
    });

    const handleAddAssignment = () => form.setData('assignments', [...form.data.assignments, { employee_id: 0 }]);
    const handleAssignmentChange = (i: number, empId: number) => {
        const updated = [...form.data.assignments];
        updated[i].employee_id = empId;
        form.setData('assignments', updated);
    };
    const handleRemoveAssignment = (i: number) => form.setData('assignments', form.data.assignments.filter((_, idx) => idx !== i));

    const handleCreateBooking = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('bookings.store'), {
            onSuccess: () => { setShowCreateModal(false); form.reset(); },
        });
    };

    const filtered = bookings.filter(b =>
        b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
        b.unit_number.toLowerCase().includes(search.toLowerCase())
    );

    const totalCollected = bookings.reduce((s, b) => s + b.total_collected, 0);
    const totalPending = bookings.reduce((s, b) => s + b.pending_balance, 0);

    return (
        <Layout title="Bookings & Sales" subtitle="Unit bookings and assignment management">
            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Bookings', value: bookings.length, color: '#60a5fa', icon: '📑' },
                    { label: 'Total Collected', value: `₹${fmt(totalCollected)}`, color: '#34d399', icon: '💰' },
                    { label: 'Total Pending', value: `₹${fmt(totalPending)}`, color: '#f87171', icon: '⏳' },
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
                    <input
                        type="text" className="search-input"
                        placeholder="Search client or unit..."
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{filtered.length} of {bookings.length} bookings</span>
                    <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
                        + New Booking
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Client / Unit</th>
                            <th>Project</th>
                            <th>Basic Amount</th>
                            <th>Collected</th>
                            <th>Pending</th>
                            <th>Assigned Staff</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    {search ? 'No bookings match your search.' : 'No bookings yet.'}
                                </td>
                            </tr>
                        ) : filtered.map((b) => {
                            const sc = statusConfig[b.status] || { cls: 'badge-slate', dot: '' };
                            const collectPct = b.basic_amount > 0 ? Math.round((b.total_collected / b.basic_amount) * 100) : 0;
                            return (
                                <tr key={b.id}>
                                    <td>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{b.customer_name}</div>
                                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 1 }}>Unit: {b.unit_number}</div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{b.project_name}</td>
                                    <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.8rem' }}>₹{fmt(b.basic_amount)}</td>
                                    <td>
                                        <div style={{ fontWeight: 700, color: '#34d399', fontSize: '0.8rem' }}>₹{fmt(b.total_collected)}</div>
                                        <div style={{ marginTop: 3 }}>
                                            <div style={{ height: '3px', background: 'rgba(99,130,200,0.1)', borderRadius: 99, width: 60 }}>
                                                <div style={{ height: '100%', width: `${collectPct}%`, background: '#10b981', borderRadius: 99 }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 700, color: '#f87171', fontSize: '0.8rem' }}>₹{fmt(b.pending_balance)}</td>
                                    <td>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                                            {b.assignments.map((name, i) => (
                                                <span key={i} className="badge badge-slate">{name}</span>
                                            ))}
                                            {b.assignments.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>—</span>}
                                        </div>
                                    </td>
                                    <td><span className={`badge ${sc.cls}`}>{b.status}</span></td>
                                    <td>
                                        <Link href={route('bookings.show', { booking: b.id })} className="btn btn-secondary btn-sm">
                                            View →
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Modal: New Booking */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">New Unit Booking</div>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleCreateBooking}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Project *</label>
                                        <select className="form-input" value={form.data.project_id} onChange={e => form.setData('project_id', e.target.value)} required>
                                            <option value="">— Select Project —</option>
                                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Unit Number *</label>
                                        <input type="text" className="form-input" value={form.data.unit_number} onChange={e => form.setData('unit_number', e.target.value)} placeholder="e.g. A-102" required />
                                    </div>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Customer Name *</label>
                                    <input type="text" className="form-input" value={form.data.customer_name} onChange={e => form.setData('customer_name', e.target.value)} placeholder="Full name" required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Basic Amount (₹) *</label>
                                        <input type="number" className="form-input" value={form.data.basic_amount} onChange={e => form.setData('basic_amount', parseFloat(e.target.value) || 0)} required />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Booking Date *</label>
                                        <input type="date" className="form-input" value={form.data.booking_date} onChange={e => form.setData('booking_date', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Sales Assignments</label>
                                    {form.data.assignments.map((asgn, i) => (
                                        <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.375rem' }}>
                                            <select className="form-input" value={asgn.employee_id} onChange={e => handleAssignmentChange(i, parseInt(e.target.value))} style={{ flex: 1 }}>
                                                <option value={0}>— Select Employee —</option>
                                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                            </select>
                                            <button type="button" onClick={() => handleRemoveAssignment(i)} className="btn btn-danger btn-sm btn-icon">✕</button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={handleAddAssignment}
                                        style={{ width: '100%', padding: '0.4rem', border: '1px dashed var(--border)', borderRadius: 8, background: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', transition: 'all 0.15s' }}>
                                        + Add Employee
                                    </button>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={form.processing}>
                                    {form.processing ? 'Saving...' : 'Create Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
