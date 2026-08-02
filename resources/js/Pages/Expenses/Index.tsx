import React, { useState } from 'react';
import Layout from '../../Layouts/Layout';
import { useForm } from '@inertiajs/react';

interface Expense {
    id: number; category: string; amount: number;
    expense_date: string; paid_to?: string; notes?: string;
}
interface Props { expenses: Expense[]; totalExpense: number; }

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);
const CATEGORIES = ['Office Rent', 'Utilities', 'Tea & Snacks', 'Marketing', 'Travel', 'Printing', 'Maintenance', 'Other'];

export default function ExpensesIndex({ expenses, totalExpense }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [search, setSearch] = useState('');

    const form = useForm({
        category: 'Office Rent', amount: 0,
        expense_date: new Date().toISOString().split('T')[0],
        paid_to: '', notes: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('expenses.store'), {
            onSuccess: () => { setShowCreateModal(false); form.reset(); },
        });
    };

    const filtered = expenses.filter(exp =>
        exp.category.toLowerCase().includes(search.toLowerCase()) ||
        (exp.paid_to || '').toLowerCase().includes(search.toLowerCase())
    );

    const thisMonth = expenses
        .filter(e => e.expense_date?.startsWith(new Date().toISOString().slice(0, 7)))
        .reduce((s, e) => s + e.amount, 0);

    return (
        <Layout title="Office Expenses" subtitle="Company overhead and operational expense tracking">
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Entries', value: expenses.length, color: '#60a5fa', icon: '📋' },
                    { label: 'Total Expenses', value: `₹${fmt(totalExpense)}`, color: '#f87171', icon: '💸' },
                    { label: 'This Month', value: `₹${fmt(thisMonth)}`, color: '#fbbf24', icon: '📅' },
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
                    <input type="text" className="search-input" placeholder="Search category or vendor..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
                    + Record Expense
                </button>
            </div>

            {/* Table */}
            <div className="card table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Amount</th>
                            <th>Date</th>
                            <th>Paid To</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No expense records found.</td></tr>
                        ) : filtered.map((exp) => (
                            <tr key={exp.id}>
                                <td>
                                    <span className="badge badge-slate">{exp.category}</span>
                                </td>
                                <td style={{ fontWeight: 800, color: '#f87171', fontSize: '0.85rem' }}>₹{fmt(exp.amount)}</td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{exp.expense_date}</td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{exp.paid_to || '—'}</td>
                                <td style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontStyle: 'italic' }}>{exp.notes || '—'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal: Create Expense */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Record Company Expense</div>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Category *</label>
                                    <select className="form-input" value={form.data.category} onChange={e => form.setData('category', e.target.value)} required>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Amount (₹) *</label>
                                        <input type="number" className="form-input" value={form.data.amount} onChange={e => form.setData('amount', parseFloat(e.target.value) || 0)} required />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Expense Date *</label>
                                        <input type="date" className="form-input" value={form.data.expense_date} onChange={e => form.setData('expense_date', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Paid To (Vendor/Person)</label>
                                    <input type="text" className="form-input" value={form.data.paid_to} onChange={e => form.setData('paid_to', e.target.value)} placeholder="e.g. Sharma Electricals" />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Notes</label>
                                    <input type="text" className="form-input" value={form.data.notes} onChange={e => form.setData('notes', e.target.value)} placeholder="Optional description" />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={form.processing}>
                                    {form.processing ? 'Saving...' : 'Save Expense'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
