import React, { useState } from 'react';
import Layout from '../../Layouts/Layout';
import { useForm } from '@inertiajs/react';

interface EmployeeStatement {
    employee: { id: number; name: string; role: string };
    incentives_earned: number; incentives_paid: number;
    active_advances: number; payments_made: number;
    monthly_visits: number; visit_bonus: number; net_payable: number;
}
interface LedgerEntry {
    id: number; employee: { name: string }; entry_type: string;
    amount: number; status: string; transaction_date: string; description: string;
}
interface Employee { id: number; name: string; }
interface Props { statements: EmployeeStatement[]; employees: Employee[]; ledgerEntries: LedgerEntry[]; }

const fmt = (n: number | string | undefined | null) => {
    const num = Number(n);
    return new Intl.NumberFormat('en-IN').format(isNaN(num) ? 0 : num);
};
const entryTypeConfig: Record<string, string> = {
    'INCENTIVE_CREDIT': 'badge-emerald', 'INCENTIVE_PAID': 'badge-blue',
    'ADVANCE_DEBIT': 'badge-red', 'SALARY_PAID': 'badge-purple',
    'ADVANCE_RECOVERY': 'badge-amber',
};

export default function EmployeeLedgerIndex({ statements, employees, ledgerEntries }: Props) {
    const [showAdvanceModal, setShowAdvanceModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'statements' | 'ledger'>('statements');

    const [showSalaryAdjustmentModal, setShowSalaryAdjustmentModal] = useState(false);

    const advanceForm = useForm({
        employee_id: '', amount: 0,
        advance_date: new Date().toISOString().split('T')[0],
        description: 'On Account Advance',
    });

    const salaryForm = useForm({
        employee_id: '', amount: 0,
        transaction_date: new Date().toISOString().split('T')[0],
        entry_type: 'SALARY_PAID',
        description: 'Monthly Salary Payment',
    });

    const handleGiveAdvance = (e: React.FormEvent) => {
        e.preventDefault();
        advanceForm.post(route('payroll.advance'), {
            onSuccess: () => { setShowAdvanceModal(false); advanceForm.reset(); },
        });
    };

    const handleSalaryAdjustment = (e: React.FormEvent) => {
        e.preventDefault();
        salaryForm.post(route('payroll.salary.adjust'), {
            onSuccess: () => { setShowSalaryAdjustmentModal(false); salaryForm.reset(); },
        });
    };

    const totalNetPayable = statements.reduce((s, st) => s + (Number(st.net_payable) || 0), 0);
    const totalAdvances = statements.reduce((s, st) => s + (Number(st.active_advances) || 0), 0);
    const totalIncentives = statements.reduce((s, st) => s + (Number(st.incentives_earned) || 0), 0);

    return (
        <Layout title="Payroll & On-Account" subtitle="Employee ledger, advances and net settlement">
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Incentives Earned', value: `₹${fmt(totalIncentives)}`, color: '#34d399', icon: '⭐' },
                    { label: 'Active Advances', value: `₹${fmt(totalAdvances)}`, color: '#f87171', icon: '💳' },
                    { label: 'Net Settlement Payable', value: `₹${fmt(totalNetPayable)}`, color: '#60a5fa', icon: '🧾' },
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div className="tab-bar">
                    <button className={`tab-item ${activeTab === 'statements' ? 'active' : ''}`} onClick={() => setActiveTab('statements')}>
                        Employee Statements
                    </button>
                    <button className={`tab-item ${activeTab === 'ledger' ? 'active' : ''}`} onClick={() => setActiveTab('ledger')}>
                        Ledger Transactions
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => setShowSalaryAdjustmentModal(true)} className="btn btn-secondary btn-sm">
                        ± Adjust Salary / Deduction
                    </button>
                    <button onClick={() => setShowAdvanceModal(true)} className="btn btn-primary btn-sm">
                        + Issue Advance
                    </button>
                </div>
            </div>

            {/* Statements Tab */}
            {activeTab === 'statements' && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                    {statements.length === 0 ? (
                        <div className="card" style={{ padding: '3rem', textAlign: 'center', gridColumn: '1/-1' }}>
                            <div style={{ fontSize: '2rem', opacity: 0.3, marginBottom: 8 }}>👥</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No employee statements available.</div>
                        </div>
                    ) : statements.map((st) => (
                        <div key={st.employee.id} className="card" style={{ overflow: 'hidden' }}>
                            {/* Header */}
                            <div style={{ padding: '1rem 1.125rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                    <div style={{
                                        width: 32, height: 32, borderRadius: '50%',
                                        background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.7rem', fontWeight: 800, color: 'white', flexShrink: 0,
                                    }}>
                                        {st.employee.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>{st.employee.name}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{st.employee.role}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600 }}>NET PAYABLE</div>
                                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#60a5fa' }}>₹{fmt(st.net_payable)}</div>
                                </div>
                            </div>

                            {/* Metrics Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                                {[
                                    { label: 'Incentives Earned', value: `₹${fmt(st.incentives_earned)}`, color: '#34d399' },
                                    { label: 'Active Advances', value: `₹${fmt(st.active_advances)}`, color: '#f87171' },
                                    { label: 'Monthly Visits', value: `${st.monthly_visits}`, color: '#fbbf24' },
                                    { label: 'Visit Bonus', value: `₹${fmt(st.visit_bonus)}`, color: '#fbbf24' },
                                ].map((m, i) => (
                                    <div key={i} style={{
                                        padding: '0.625rem 1rem',
                                        borderRight: i % 2 === 0 ? '1px solid var(--border)' : 'none',
                                        borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                                    }}>
                                        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>{m.label}</div>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Ledger Tab */}
            {activeTab === 'ledger' && (
                <div className="card table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ledgerEntries.length === 0 ? (
                                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No ledger transactions.</td></tr>
                            ) : ledgerEntries.map((entry) => (
                                <tr key={entry.id}>
                                    <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{entry.employee?.name}</td>
                                    <td>
                                        <span className={`badge ${entryTypeConfig[entry.entry_type] || 'badge-slate'}`}>
                                            {entry.entry_type.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 800, color: entry.entry_type.includes('CREDIT') || entry.entry_type.includes('PAID') ? '#34d399' : '#f87171', fontSize: '0.85rem' }}>
                                        ₹{fmt(entry.amount)}
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{entry.transaction_date}</td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{entry.description}</td>
                                    <td>
                                        <span className={`badge ${entry.status === 'paid' ? 'badge-emerald' : entry.status === 'active' ? 'badge-amber' : 'badge-slate'}`}>
                                            {entry.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal: Issue Advance */}
            {showAdvanceModal && (
                <div className="modal-overlay" onClick={() => setShowAdvanceModal(false)}>
                    <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Issue On-Account Advance</div>
                            <button onClick={() => setShowAdvanceModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleGiveAdvance}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Employee *</label>
                                    <select className="form-input" value={advanceForm.data.employee_id} onChange={e => advanceForm.setData('employee_id', e.target.value)} required>
                                        <option value="">— Select Employee —</option>
                                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Amount (₹) *</label>
                                        <input type="number" className="form-input" value={advanceForm.data.amount} onChange={e => advanceForm.setData('amount', parseFloat(e.target.value) || 0)} required />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Date *</label>
                                        <input type="date" className="form-input" value={advanceForm.data.advance_date} onChange={e => advanceForm.setData('advance_date', e.target.value)} required />
                                    </div>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Description</label>
                                    <input type="text" className="form-input" value={advanceForm.data.description} onChange={e => advanceForm.setData('description', e.target.value)} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowAdvanceModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={advanceForm.processing}>
                                    {advanceForm.processing ? 'Saving...' : 'Issue Advance'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Salary Adjustment */}
            {showSalaryAdjustmentModal && (
                <div className="modal-overlay" onClick={() => setShowSalaryAdjustmentModal(false)}>
                    <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Salary Adjustment / Deduction</div>
                            <button onClick={() => setShowSalaryAdjustmentModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleSalaryAdjustment}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Employee *</label>
                                    <select className="form-input" value={salaryForm.data.employee_id} onChange={e => salaryForm.setData('employee_id', e.target.value)} required>
                                        <option value="">— Select Employee —</option>
                                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Type *</label>
                                        <select className="form-input" value={salaryForm.data.entry_type} onChange={e => salaryForm.setData('entry_type', e.target.value)}>
                                            <option value="SALARY_PAID">Salary Payment (Paid)</option>
                                            <option value="SALARY_DEDUCTION">Deduction (-)</option>
                                            <option value="SALARY_BONUS">Extra Bonus (+)</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Amount (₹) *</label>
                                        <input type="number" step="0.01" className="form-input" value={salaryForm.data.amount} onChange={e => salaryForm.setData('amount', parseFloat(e.target.value) || 0)} required />
                                    </div>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Transaction Date *</label>
                                    <input type="date" className="form-input" value={salaryForm.data.transaction_date} onChange={e => salaryForm.setData('transaction_date', e.target.value)} required />
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Reason / Remarks *</label>
                                    <input type="text" className="form-input" value={salaryForm.data.description} onChange={e => salaryForm.setData('description', e.target.value)} placeholder="e.g. Leave deduction, Performance bonus" required />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowSalaryAdjustmentModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={salaryForm.processing}>
                                    {salaryForm.processing ? 'Saving...' : 'Save Adjustment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
