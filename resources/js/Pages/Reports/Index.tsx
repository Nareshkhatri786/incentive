import React from 'react';
import Layout from '../../Layouts/Layout';
import { router } from '@inertiajs/react';

interface Project { id: number; name: string; }
interface Employee { id: number; name: string; }
interface Filters {
    project_id?: string; employee_id?: string;
    start_date?: string; end_date?: string;
}
interface Props {
    type: string; reportData: any[];
    projects: Project[]; employees: Employee[]; filters: Filters;
}

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);

const REPORT_TYPES = [
    { key: 'collection', label: 'Collections', icon: '💰' },
    { key: 'outstanding', label: 'Outstanding', icon: '⚠' },
    { key: 'expense', label: 'Expenses', icon: '💸' },
    { key: 'visit', label: 'Site Visits', icon: '📍' },
    { key: 'employee_ledger', label: 'Employee Ledger', icon: '📋' },
];

export default function ReportsIndex({ type, reportData, projects, employees, filters }: Props) {
    const handleFilterChange = (key: string, value: string) => {
        router.get(route('reports.index'), { ...filters, type, [key]: value }, { preserveState: true, replace: true });
    };

    const handleTypeChange = (newType: string) => router.get(route('reports.index'), { type: newType });

    const showProjectFilter = ['collection', 'outstanding', 'visit'].includes(type);
    const showEmployeeFilter = ['visit', 'employee_ledger'].includes(type);

    return (
        <Layout title="Reports & Exports" subtitle="Operational and financial reporting">
            {/* Report Type Tabs */}
            <div style={{ marginBottom: '1.25rem' }}>
                <div className="tab-bar">
                    {REPORT_TYPES.map(rt => (
                        <button
                            key={rt.key}
                            className={`tab-item ${type === rt.key ? 'active' : ''}`}
                            onClick={() => handleTypeChange(rt.key)}
                        >
                            {rt.icon} {rt.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ padding: '0.875rem 1.25rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                {showProjectFilter && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <label className="form-label" style={{ fontSize: '0.6rem' }}>Project</label>
                        <select
                            value={filters.project_id || ''}
                            onChange={e => handleFilterChange('project_id', e.target.value)}
                            style={{ background: 'rgba(8,17,38,0.8)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', padding: '0.35rem 0.75rem', fontSize: '0.78rem', outline: 'none', minWidth: 160 }}
                        >
                            <option value="">All Projects</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                )}
                {showEmployeeFilter && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <label className="form-label" style={{ fontSize: '0.6rem' }}>Employee</label>
                        <select
                            value={filters.employee_id || ''}
                            onChange={e => handleFilterChange('employee_id', e.target.value)}
                            style={{ background: 'rgba(8,17,38,0.8)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', padding: '0.35rem 0.75rem', fontSize: '0.78rem', outline: 'none', minWidth: 160 }}
                        >
                            <option value="">All Employees</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label className="form-label" style={{ fontSize: '0.6rem' }}>From Date</label>
                    <input type="date" value={filters.start_date || ''} onChange={e => handleFilterChange('start_date', e.target.value)}
                        style={{ background: 'rgba(8,17,38,0.8)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', padding: '0.35rem 0.75rem', fontSize: '0.78rem', outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <label className="form-label" style={{ fontSize: '0.6rem' }}>To Date</label>
                    <input type="date" value={filters.end_date || ''} onChange={e => handleFilterChange('end_date', e.target.value)}
                        style={{ background: 'rgba(8,17,38,0.8)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', padding: '0.35rem 0.75rem', fontSize: '0.78rem', outline: 'none' }} />
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'flex-end', paddingBottom: '0px' }}>
                    <button onClick={() => window.print()} className="btn btn-secondary btn-sm">
                        🖨️ Print / PDF
                    </button>
                </div>
            </div>

            {/* Results Count */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{reportData.length} records found</span>
            </div>

            {/* Report Table */}
            <div className="card table-container">
                <table className="data-table">
                    <thead>
                        {type === 'collection' && (
                            <tr><th>Date</th><th>Customer / Unit</th><th>Project</th><th>Amount</th><th>Mode</th></tr>
                        )}
                        {type === 'outstanding' && (
                            <tr><th>Customer</th><th>Project</th><th>Basic Cost</th><th>Collected</th><th>Outstanding</th></tr>
                        )}
                        {type === 'expense' && (
                            <tr><th>Date</th><th>Category</th><th>Paid To</th><th>Amount</th></tr>
                        )}
                        {type === 'visit' && (
                            <tr><th>Date</th><th>Employee</th><th>Project</th><th>Visits</th></tr>
                        )}
                        {type === 'employee_ledger' && (
                            <tr><th>Date</th><th>Employee</th><th>Type</th><th>Amount</th><th>Description</th></tr>
                        )}
                    </thead>
                    <tbody>
                        {reportData.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    <div style={{ fontSize: '2rem', opacity: 0.3, marginBottom: 8 }}>📊</div>
                                    No data found for the selected filters.
                                </td>
                            </tr>
                        ) : reportData.map((row: any, i: number) => (
                            <tr key={i}>
                                {type === 'collection' && (
                                    <>
                                        <td style={{ color: 'var(--text-secondary)' }}>{row.payment_date}</td>
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{row.booking?.customer_name}</div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Unit: {row.booking?.unit_number}</div>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{row.booking?.project?.name}</td>
                                        <td style={{ fontWeight: 800, color: '#34d399' }}>₹{fmt(row.amount)}</td>
                                        <td><span className="badge badge-blue">{row.payment_mode}</span></td>
                                    </>
                                )}
                                {type === 'outstanding' && (
                                    <>
                                        <td>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{row.customer_name}</div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Unit: {row.unit_number}</div>
                                        </td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{row.project_name}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{fmt(row.basic_amount)}</td>
                                        <td style={{ fontWeight: 700, color: '#34d399' }}>₹{fmt(row.total_collected)}</td>
                                        <td style={{ fontWeight: 800, color: '#f87171' }}>₹{fmt(row.outstanding)}</td>
                                    </>
                                )}
                                {type === 'expense' && (
                                    <>
                                        <td style={{ color: 'var(--text-secondary)' }}>{row.expense_date}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.category}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{row.paid_to || '—'}</td>
                                        <td style={{ fontWeight: 800, color: '#f87171' }}>₹{fmt(row.amount)}</td>
                                    </>
                                )}
                                {type === 'visit' && (
                                    <>
                                        <td style={{ color: 'var(--text-secondary)' }}>{row.visit_date}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.employee?.name}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{row.project?.name}</td>
                                        <td><span className="badge badge-indigo">{row.visit_count} visits</span></td>
                                    </>
                                )}
                                {type === 'employee_ledger' && (
                                    <>
                                        <td style={{ color: 'var(--text-secondary)' }}>{row.transaction_date}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.employee?.name}</td>
                                        <td><span className={`badge ${row.entry_type?.includes('CREDIT') ? 'badge-emerald' : 'badge-red'}`}>{(row.entry_type || '').replace(/_/g, ' ')}</span></td>
                                        <td style={{ fontWeight: 800, color: row.entry_type?.includes('CREDIT') ? '#34d399' : '#f87171' }}>₹{fmt(row.amount)}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{row.description}</td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
}
