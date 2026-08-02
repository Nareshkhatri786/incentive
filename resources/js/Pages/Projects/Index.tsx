import React, { useState } from 'react';
import Layout from '../../Layouts/Layout';
import { useForm, router } from '@inertiajs/react';

interface Employee { id: number; name: string; role: string; status?: string; }
interface Rule {
    id: number; employee: Employee; employee_id: number;
    rule_type: 'Percentage' | 'Fixed'; value: number;
    release_trigger: string; condition_logic?: string;
    status: 'Active' | 'Inactive';
    effective_from?: string; effective_to?: string;
}
interface Project { id: number; name: string; location?: string; rules: Rule[]; }
interface Props { projects: Project[]; employees: Employee[]; }

const fmt = (n: number | string | undefined | null) => {
    const num = Number(n);
    return new Intl.NumberFormat('en-IN').format(isNaN(num) ? 0 : num);
};

const triggerColors: Record<string, string> = {
    'Booking': 'badge-blue', 'Bana Khat': 'badge-amber',
    'Sale Deed': 'badge-emerald', 'Collection': 'badge-purple',
};

export default function ProjectsIndex({ projects, employees }: Props) {
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showRuleModal, setShowRuleModal] = useState(false);
    const [editingRule, setEditingRule] = useState<Rule | null>(null);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const projectForm = useForm({ name: '', location: '' });

    const ruleForm = useForm({
        employee_id: '',
        rule_type: 'Percentage',
        value: 0,
        release_trigger: 'Booking',
        condition_logic: '',
        status: 'Active',
        effective_from: '',
        effective_to: '',
    });

    const editRuleForm = useForm({
        rule_type: 'Percentage',
        value: 0,
        release_trigger: 'Booking',
        condition_logic: '',
        status: 'Active',
        effective_from: '',
        effective_to: '',
    });

    const handleCreateProject = (e: React.FormEvent) => {
        e.preventDefault();
        projectForm.post(route('projects.store'), {
            onSuccess: () => { setShowProjectModal(false); projectForm.reset(); },
        });
    };

    const handleAddRule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject) return;
        ruleForm.post(route('projects.rules.store', { project: selectedProject.id }), {
            onSuccess: () => { setShowRuleModal(false); ruleForm.reset(); },
        });
    };

    const openEditRule = (rule: Rule) => {
        setEditingRule(rule);
        editRuleForm.setData({
            rule_type: rule.rule_type,
            value: rule.value,
            release_trigger: rule.release_trigger,
            condition_logic: rule.condition_logic || '',
            status: rule.status || 'Active',
            effective_from: rule.effective_from || '',
            effective_to: rule.effective_to || '',
        });
    };

    const handleUpdateRule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRule) return;
        editRuleForm.put(route('projects.rules.update', { rule: editingRule.id }), {
            onSuccess: () => setEditingRule(null),
        });
    };

    const handleToggleRuleStatus = (ruleId: number) => {
        router.post(route('projects.rules.toggle', { rule: ruleId }));
    };

    const handleDeleteRule = (ruleId: number) => {
        if (confirm('Are you sure you want to delete this incentive rule?')) {
            router.delete(route('projects.rules.destroy', { rule: ruleId }));
        }
    };

    return (
        <Layout title="Projects & Incentive Rules" subtitle="Configure & manage active or historical commission rules">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <div className="section-title">Active Real Estate Projects</div>
                    <div className="section-sub">{projects.length} project{projects.length !== 1 ? 's' : ''} configured</div>
                </div>
                <button onClick={() => setShowProjectModal(true)} className="btn btn-primary btn-sm">
                    + New Project
                </button>
            </div>

            {/* Projects List */}
            {projects.length === 0 ? (
                <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', opacity: 0.3, marginBottom: '0.75rem' }}>🏗️</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No projects yet. Create your first project to get started.</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {projects.map((proj) => (
                        <div key={proj.id} className="card">
                            {/* Project Header */}
                            <div style={{
                                padding: '1rem 1.25rem',
                                borderBottom: '1px solid var(--border)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '8px',
                                        background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(124,58,237,0.1))',
                                        border: '1px solid #bfdbfe',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
                                    }}>🏗️</div>
                                    <div>
                                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{proj.name}</div>
                                        {proj.location && (
                                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 1 }}>
                                                📍 {proj.location}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span className="badge badge-slate">{proj.rules ? proj.rules.length : 0} rules</span>
                                    <button
                                        onClick={() => {
                                            setSelectedProject(proj);
                                            ruleForm.reset();
                                            setShowRuleModal(true);
                                        }}
                                        className="btn btn-secondary btn-sm"
                                    >
                                        + Add Rule
                                    </button>
                                </div>
                            </div>

                            {/* Rules Table */}
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Rule Type</th>
                                            <th>Value</th>
                                            <th>Release Trigger</th>
                                            <th>Validity Period</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {proj.rules && proj.rules.length > 0 ? (
                                            proj.rules.map((r) => (
                                                <tr key={r.id} style={{ opacity: r.status === 'Inactive' ? 0.6 : 1 }}>
                                                    <td>
                                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.8rem' }}>
                                                            {r.employee?.name}
                                                        </div>
                                                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                                            {r.employee?.role}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${r.rule_type === 'Percentage' ? 'badge-amber' : 'badge-emerald'}`}>
                                                            {r.rule_type}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: 700, color: '#b45309', fontSize: '0.85rem' }}>
                                                        {r.rule_type === 'Percentage' ? `${r.value}%` : `₹${fmt(r.value)}`}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${triggerColors[r.release_trigger] || 'badge-slate'}`}>
                                                            {r.release_trigger}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                                        {r.effective_from || r.effective_to ? (
                                                            <span>
                                                                {r.effective_from ? r.effective_from : 'Start'} → {r.effective_to ? r.effective_to : 'Present'}
                                                            </span>
                                                        ) : (
                                                            <span style={{ fontStyle: 'italic' }}>Always Active</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <button
                                                            onClick={() => handleToggleRuleStatus(r.id)}
                                                            className={`badge ${r.status === 'Active' ? 'badge-emerald' : 'badge-red'}`}
                                                            style={{ cursor: 'pointer', border: 'none' }}
                                                            title="Click to toggle status"
                                                        >
                                                            {r.status === 'Active' ? '● Active' : '○ Inactive'}
                                                        </button>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                                                            <button
                                                                onClick={() => openEditRule(r)}
                                                                className="btn btn-secondary btn-sm"
                                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteRule(r.id)}
                                                                className="btn btn-danger btn-sm"
                                                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }}
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                                    No incentive rules configured yet for this project.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal: New Project */}
            {showProjectModal && (
                <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">New Real Estate Project</div>
                            <button onClick={() => setShowProjectModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleCreateProject}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Project Name *</label>
                                    <input
                                        type="text" className="form-input"
                                        value={projectForm.data.name}
                                        onChange={e => projectForm.setData('name', e.target.value)}
                                        placeholder="e.g. Signature Heights Phase 1"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <input
                                        type="text" className="form-input"
                                        value={projectForm.data.location}
                                        onChange={e => projectForm.setData('location', e.target.value)}
                                        placeholder="e.g. Sector 62, Noida"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowProjectModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={projectForm.processing}>
                                    {projectForm.processing ? 'Saving...' : 'Create Project'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Add Rule */}
            {showRuleModal && selectedProject && (
                <div className="modal-overlay" onClick={() => setShowRuleModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <div className="modal-title">Add Incentive Rule</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{selectedProject.name}</div>
                            </div>
                            <button onClick={() => setShowRuleModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleAddRule}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Employee *</label>
                                    <select className="form-input" value={ruleForm.data.employee_id} onChange={e => ruleForm.setData('employee_id', e.target.value)} required>
                                        <option value="">— Select Employee —</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>
                                                {emp.name} ({emp.role}){emp.status === 'Inactive' ? ' [Inactive]' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Rule Type</label>
                                        <select className="form-input" value={ruleForm.data.rule_type} onChange={e => ruleForm.setData('rule_type', e.target.value as any)}>
                                            <option value="Percentage">Percentage (%)</option>
                                            <option value="Fixed">Fixed Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Value {ruleForm.data.rule_type === 'Percentage' ? '(%)' : '(₹)'}</label>
                                        <input type="number" step="0.01" className="form-input" value={ruleForm.data.value} onChange={e => ruleForm.setData('value', parseFloat(e.target.value) || 0)} required />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Release Trigger</label>
                                        <select className="form-input" value={ruleForm.data.release_trigger} onChange={e => ruleForm.setData('release_trigger', e.target.value)}>
                                            <option value="Booking">Booking</option>
                                            <option value="Bana Khat">Bana Khat</option>
                                            <option value="Sale Deed">Sale Deed</option>
                                            <option value="Collection">Collection</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Rule Status</label>
                                        <select className="form-input" value={ruleForm.data.status} onChange={e => ruleForm.setData('status', e.target.value as any)}>
                                            <option value="Active">Active (Enabled)</option>
                                            <option value="Inactive">Inactive (Disabled)</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Effective From</label>
                                        <input type="date" className="form-input" value={ruleForm.data.effective_from} onChange={e => ruleForm.setData('effective_from', e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Effective To</label>
                                        <input type="date" className="form-input" value={ruleForm.data.effective_to} onChange={e => ruleForm.setData('effective_to', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Condition / Remarks</label>
                                    <input type="text" className="form-input" value={ruleForm.data.condition_logic} onChange={e => ruleForm.setData('condition_logic', e.target.value)} placeholder="e.g. Applicable after promotion" />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowRuleModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={ruleForm.processing}>
                                    {ruleForm.processing ? 'Saving...' : 'Add Rule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Edit Rule */}
            {editingRule && (
                <div className="modal-overlay" onClick={() => setEditingRule(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <div className="modal-title">Edit Incentive Rule</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                    Employee: {editingRule.employee?.name}
                                </div>
                            </div>
                            <button onClick={() => setEditingRule(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem' }}>✕</button>
                        </div>
                        <form onSubmit={handleUpdateRule}>
                            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Rule Type</label>
                                        <select className="form-input" value={editRuleForm.data.rule_type} onChange={e => editRuleForm.setData('rule_type', e.target.value as any)}>
                                            <option value="Percentage">Percentage (%)</option>
                                            <option value="Fixed">Fixed Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Value {editRuleForm.data.rule_type === 'Percentage' ? '(%)' : '(₹)'}</label>
                                        <input type="number" step="0.01" className="form-input" value={editRuleForm.data.value} onChange={e => editRuleForm.setData('value', parseFloat(e.target.value) || 0)} required />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Release Trigger</label>
                                        <select className="form-input" value={editRuleForm.data.release_trigger} onChange={e => editRuleForm.setData('release_trigger', e.target.value)}>
                                            <option value="Booking">Booking</option>
                                            <option value="Bana Khat">Bana Khat</option>
                                            <option value="Sale Deed">Sale Deed</option>
                                            <option value="Collection">Collection</option>
                                        </select>
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Status</label>
                                        <select className="form-input" value={editRuleForm.data.status} onChange={e => editRuleForm.setData('status', e.target.value as any)}>
                                            <option value="Active">Active (Enabled)</option>
                                            <option value="Inactive">Inactive (Disabled)</option>
                                        </select>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Effective From</label>
                                        <input type="date" className="form-input" value={editRuleForm.data.effective_from} onChange={e => editRuleForm.setData('effective_from', e.target.value)} />
                                    </div>
                                    <div className="form-group" style={{ margin: 0 }}>
                                        <label className="form-label">Effective To</label>
                                        <input type="date" className="form-input" value={editRuleForm.data.effective_to} onChange={e => editRuleForm.setData('effective_to', e.target.value)} />
                                    </div>
                                </div>
                                <div className="form-group" style={{ margin: 0 }}>
                                    <label className="form-label">Condition / Remarks</label>
                                    <input type="text" className="form-input" value={editRuleForm.data.condition_logic} onChange={e => editRuleForm.setData('condition_logic', e.target.value)} placeholder="Condition details..." />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditingRule(null)}>Cancel</button>
                                <button type="submit" className="btn btn-primary btn-sm" disabled={editRuleForm.processing}>
                                    {editRuleForm.processing ? 'Saving...' : 'Update Rule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
}
