import React, { useState } from 'react';
import Layout from '../../Layouts/Layout';
import { useForm, router } from '@inertiajs/react';

interface VisitRecord {
    id: number;
    employee_id: number;
    project_id: number;
    visit_count: number;
    visit_date: string;
    notes?: string;
    employee?: { id: number; name: string };
    project?: { id: number; name: string };
}

interface StaffSummary {
    employee_id: number;
    employee_name: string;
    role: string;
    visit_count: number;
    bonus: number;
    slab_name: string;
    next_slab: number;
}

interface Employee { id: number; name: string; role: string; }
interface Project { id: number; name: string; }

interface Props {
    visits: VisitRecord[];
    summary: StaffSummary[];
    employees: Employee[];
    projects: Project[];
    selectedMonth: string;
    totalVisitsMonth: number;
    totalBonusMonth: number;
}

const fmt = (n: number) => new Intl.NumberFormat('en-IN').format(n);

export default function SiteVisitsIndex({
    visits,
    summary,
    employees,
    projects,
    selectedMonth,
    totalVisitsMonth,
    totalBonusMonth,
}: Props) {
    const [showModal, setShowModal] = useState(false);
    const [search, setSearch] = useState('');

    const form = useForm({
        employee_id: employees.length > 0 ? employees[0].id : '',
        project_id: projects.length > 0 ? projects[0].id : '',
        visit_count: 1,
        visit_date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('visits.store'), {
            onSuccess: () => {
                setShowModal(false);
                form.reset();
            },
        });
    };

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this visit entry?')) {
            router.delete(route('visits.destroy', { visit: id }));
        }
    };

    const handleMonthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        router.get(route('visits.index'), { month: e.target.value }, { preserveState: true });
    };

    const filteredVisits = visits.filter(v =>
        (v.employee?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.project?.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (v.notes || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout title="Site Visits & Slabs" subtitle="Track staff site visits and automatic slab bonuses">
            {/* Top KPI Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Visits This Month', value: `${totalVisitsMonth} Visits`, color: '#60a5fa', icon: '📍' },
                    { label: 'Active Staff Visiting', value: summary.filter(s => s.visit_count > 0).length, color: '#34d399', icon: '👥' },
                    { label: 'Eligible Visit Bonus', value: `₹${fmt(totalBonusMonth)}`, color: '#fbbf24', icon: '⭐' },
                    { label: 'Highest Visits', value: `${Math.max(0, ...summary.map(s => s.visit_count))} Visits`, color: '#c084fc', icon: '🏆' },
                ].map((s, i) => (
                    <div key={i} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                        <div style={{ fontSize: '1.5rem', opacity: 0.8 }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color, marginTop: 2 }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Slab Rules Legend */}
            <div className="card" style={{ padding: '0.875rem 1.25rem', marginBottom: '1.5rem', background: 'rgba(59,130,246,0.04)', borderColor: 'rgba(59,130,246,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1rem' }}>🎯</span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>Monthly Slab Rule:</span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span className="badge badge-slate" style={{ fontSize: '0.72rem' }}>20 Visits = <b>₹500</b></span>
                        <span className="badge badge-blue" style={{ fontSize: '0.72rem' }}>30 Visits = <b>₹750</b></span>
                        <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>40 Visits = <b>₹1,000</b></span>
                        <span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>50+ Visits = <b>₹1,500</b></span>
                    </div>
                </div>
            </div>

            {/* Staff Slabs Overview Grid */}
            <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Staff Progress This Month</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Month:</span>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={handleMonthChange}
                            className="form-input"
                            style={{ padding: '4px 10px', fontSize: '0.75rem', width: 'auto' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
                    {summary.map((st) => {
                        const pct = Math.min(100, Math.round((st.visit_count / 50) * 100));
                        return (
                            <div key={st.employee_id} className="card" style={{ padding: '1rem 1.125rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.625rem' }}>
                                    <div>
                                        <div style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{st.employee_name}</div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{st.role}</div>
                                    </div>
                                    <span className={`badge ${st.bonus > 0 ? 'badge-emerald' : 'badge-slate'}`} style={{ fontWeight: 800 }}>
                                        {st.bonus > 0 ? `+₹${fmt(st.bonus)} Bonus` : 'No Bonus'}
                                    </span>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.375rem' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#60a5fa' }}>{st.visit_count}</span>
                                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                        {st.visit_count < 50 ? `${st.next_slab - st.visit_count} more for ${st.next_slab} slab` : 'Max slab achieved! 🎉'}
                                    </span>
                                </div>

                                {/* Progress Bar to 50 */}
                                <div style={{ height: '6px', background: 'rgba(99,130,200,0.12)', borderRadius: 99, overflow: 'hidden' }}>
                                    <div
                                        style={{
                                            height: '100%',
                                            width: `${pct}%`,
                                            background: st.bonus >= 1500 ? 'linear-gradient(90deg, #10b981, #059669)' :
                                                        st.bonus > 0 ? 'linear-gradient(90deg, #3b82f6, #10b981)' :
                                                        'linear-gradient(90deg, #64748b, #94a3b8)',
                                            borderRadius: 99,
                                            transition: 'width 0.3s ease',
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Toolbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div className="search-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search employee, project, notes..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{filteredVisits.length} entries</span>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>📍</span> Log Site Visit
                    </button>
                </div>
            </div>

            {/* Visits History Table */}
            <div className="card table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Employee</th>
                            <th>Project Visited</th>
                            <th>Visits Count</th>
                            <th>Notes / Remarks</th>
                            <th style={{ textAlign: 'right' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVisits.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No site visits logged for this month. Click "+ Log Site Visit" to add one.
                                </td>
                            </tr>
                        ) : filteredVisits.map((v) => (
                            <tr key={v.id}>
                                <td style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.8rem' }}>{v.visit_date}</td>
                                <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{v.employee?.name || '—'}</td>
                                <td>
                                    <span className="badge badge-blue">{v.project?.name || '—'}</span>
                                </td>
                                <td style={{ fontWeight: 800, color: '#60a5fa', fontSize: '0.85rem' }}>
                                    +{v.visit_count} {v.visit_count > 1 ? 'visits' : 'visit'}
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{v.notes || '—'}</td>
                                <td style={{ textAlign: 'right' }}>
                                    <button
                                        onClick={() => handleDelete(v.id)}
                                        className="btn btn-secondary btn-sm"
                                        style={{ padding: '2px 8px', color: '#f87171' }}
                                        title="Delete"
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal: Log Site Visit */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Log Site Visit</div>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Employee / Staff *</label>
                                    <select
                                        className="form-input"
                                        value={form.data.employee_id}
                                        onChange={e => form.setData('employee_id', e.target.value)}
                                        required
                                    >
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Project Visited *</label>
                                    <select
                                        className="form-input"
                                        value={form.data.project_id}
                                        onChange={e => form.setData('project_id', e.target.value)}
                                        required
                                    >
                                        {projects.map(proj => (
                                            <option key={proj.id} value={proj.id}>{proj.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Visits Count *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="50"
                                            className="form-input"
                                            value={form.data.visit_count}
                                            onChange={e => form.setData('visit_count', parseInt(e.target.value) || 1)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Date *</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={form.data.visit_date}
                                            onChange={e => form.setData('visit_date', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Notes / Client Details</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Client Ramesh Patel visited plot"
                                        value={form.data.notes}
                                        onChange={e => form.setData('notes', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={form.processing}>
                                    {form.processing ? 'Saving...' : 'Save Visits'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
