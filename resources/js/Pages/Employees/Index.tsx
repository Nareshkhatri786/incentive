import React, { useState } from 'react';
import Layout from '../../Layouts/Layout';
import { useForm } from '@inertiajs/react';

interface Employee {
    id: number; name: string; role: string; mobile: string;
    username: string; monthly_salary: number;
    status: 'Active' | 'Inactive'; is_admin: boolean;
}
interface Props { employees: Employee[]; }

const fmt = (n: number | string | undefined | null) => {
    const num = Number(n);
    return new Intl.NumberFormat('en-IN').format(isNaN(num) ? 0 : num);
};

export default function EmployeesIndex({ employees }: Props) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [search, setSearch] = useState('');

    const form = useForm({
        name: '', email: '', mobile: '', username: '',
        password: '', role: 'Sales', monthly_salary: 0, is_admin: false,
    });

    const editForm = useForm({
        name: '', mobile: '', role: 'Sales', monthly_salary: 0,
        status: 'Active', is_admin: false,
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        form.post(route('employees.store'), {
            onSuccess: () => { setShowCreateModal(false); form.reset(); },
        });
    };

    const openEdit = (emp: Employee) => {
        setEditingEmployee(emp);
        editForm.setData({
            name: emp.name, mobile: emp.mobile,
            role: emp.role, monthly_salary: emp.monthly_salary,
            status: emp.status, is_admin: emp.is_admin,
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingEmployee) return;
        editForm.put(route('employees.update', { employee: editingEmployee.id }), {
            onSuccess: () => setEditingEmployee(null),
        });
    };

    const filtered = employees.filter(emp =>
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.role.toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = employees.filter(e => e.status === 'Active').length;
    const totalSalary = employees.filter(e => e.status === 'Active').reduce((s, e) => s + (Number(e.monthly_salary) || 0), 0);

    return (
        <Layout title="Employees" subtitle="Staff management and commission configuration">
            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total Staff', value: employees.length, color: '#60a5fa', icon: '👥' },
                    { label: 'Active Employees', value: activeCount, color: '#34d399', icon: '✅' },
                    { label: 'Monthly Salary Commitment', value: `₹${fmt(totalSalary)}`, color: '#fbbf24', icon: '💰' },
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
                    <input type="text" className="search-input" placeholder="Search name or role..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <button onClick={() => setShowCreateModal(true)} className="btn btn-primary btn-sm">
                    + Add Employee
                </button>
            </div>

            {/* Table */}
            <div className="card table-container">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Employee</th>
                            <th>Role</th>
                            <th>Contact</th>
                            <th>Monthly Salary</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No employees found.</td></tr>
                        ) : filtered.map((emp) => (
                            <tr key={emp.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                                        <div style={{
                                            width: 28, height: 28, borderRadius: '50%',
                                            background: emp.is_admin
                                                ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                                                : 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '0.65rem', fontWeight: 800, color: 'white', flexShrink: 0,
                                        }}>
                                            {emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{emp.name}</div>
                                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>@{emp.username}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={`badge ${emp.is_admin ? 'badge-purple' : 'badge-blue'}`}>{emp.role}</span>
                                    {emp.is_admin && <span className="badge badge-purple" style={{ marginLeft: 4 }}>Admin</span>}
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>{emp.mobile || '—'}</td>
                                <td style={{ fontWeight: 800, color: '#34d399', fontSize: '0.85rem' }}>₹{fmt(emp.monthly_salary)}</td>
                                <td>
                                    <span className={`badge ${emp.status === 'Active' ? 'badge-emerald' : 'badge-red'}`}>
                                        {emp.status}
                                    </span>
                                </td>
                                <td>
                                    <button onClick={() => openEdit(emp)} className="btn btn-secondary btn-sm">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal: Create Employee */}
            {showCreateModal && (
                <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Add New Employee</div>
                            <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleCreate}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Full Name *</label>
                                    <input type="text" className="form-input" value={form.data.name} onChange={e => form.setData('name', e.target.value)} placeholder="e.g. Rahul Sharma" required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Mobile</label>
                                        <input type="text" className="form-input" value={form.data.mobile} onChange={e => form.setData('mobile', e.target.value)} placeholder="10-digit number" />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Role</label>
                                        <select className="form-input" value={form.data.role} onChange={e => form.setData('role', e.target.value)}>
                                            <option value="Sales">Sales Executive</option>
                                            <option value="Manager">Sales Manager</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Username *</label>
                                        <input type="text" className="form-input" value={form.data.username} onChange={e => form.setData('username', e.target.value)} placeholder="Login username" required />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Password *</label>
                                        <input type="password" className="form-input" value={form.data.password} onChange={e => form.setData('password', e.target.value)} placeholder="Set password" required />
                                    </div>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Monthly Salary (₹)</label>
                                    <input type="number" className="form-input" value={form.data.monthly_salary} onChange={e => form.setData('monthly_salary', parseFloat(e.target.value) || 0)} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={form.processing}>
                                    {form.processing ? 'Creating...' : 'Create Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit Employee */}
            {editingEmployee && (
                <div className="modal-overlay" onClick={() => setEditingEmployee(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <div className="modal-title">Edit Employee</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{editingEmployee.name}</div>
                            </div>
                            <button onClick={() => setEditingEmployee(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleEdit}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Full Name</label>
                                    <input type="text" className="form-input" value={editForm.data.name} onChange={e => editForm.setData('name', e.target.value)} required />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Mobile</label>
                                        <input type="text" className="form-input" value={editForm.data.mobile} onChange={e => editForm.setData('mobile', e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Role</label>
                                        <select className="form-input" value={editForm.data.role} onChange={e => editForm.setData('role', e.target.value)}>
                                            <option value="Sales">Sales Executive</option>
                                            <option value="Manager">Sales Manager</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Monthly Salary (₹)</label>
                                        <input type="number" className="form-input" value={editForm.data.monthly_salary} onChange={e => editForm.setData('monthly_salary', parseFloat(e.target.value) || 0)} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Status</label>
                                        <select className="form-input" value={editForm.data.status} onChange={e => editForm.setData('status', e.target.value as any)}>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingEmployee(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={editForm.processing}>
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
