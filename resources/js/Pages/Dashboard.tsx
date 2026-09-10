import React from 'react';
import Layout from '../Layouts/Layout';
import { Link } from '@inertiajs/react';

interface DashboardMetrics {
    total_business: number;
    total_collection: number;
    total_outstanding: number;
    total_salary_due: number;
    total_incentive_due: number;
    total_active_advances: number;
    total_employee_payable: number;
    monthly_expenses: number;
    monthly_visits: number;
}

interface Collection {
    id: number;
    amount: number;
    payment_date: string;
    booking?: { customer_name: string; unit_number: string };
}

interface Expense {
    id: number;
    category: string;
    amount: number;
    expense_date: string;
}

interface Incentive {
    id: number;
    employee?: { name: string };
    amount: number;
    description: string;
}

interface Props {
    metrics: DashboardMetrics;
    recentCollections: Collection[];
    recentExpenses: Expense[];
    pendingIncentives: Incentive[];
}

const fmt = (n: number | string | undefined | null) => {
    const num = Number(n);
    return new Intl.NumberFormat('en-IN').format(isNaN(num) ? 0 : num);
};

const fmtCr = (n: number | string | undefined | null) => {
    const num = Number(n) || 0;
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
    return `₹${fmt(num)}`;
};

export default function Dashboard({ metrics, recentCollections, recentExpenses, pendingIncentives }: Props) {
    const totalBusiness = Number(metrics?.total_business) || 0;
    const totalCollection = Number(metrics?.total_collection) || 0;
    const collectionPct = totalBusiness > 0 ? Math.round((totalCollection / totalBusiness) * 100) : 0;

    const metricCards = [
        {
            label: 'Total Business Value',
            value: fmtCr(metrics?.total_business),
            color: 'blue',
            valColor: '#1d4ed8',
            icon: '📊',
            badge: { text: 'Total Portfolio', cls: 'badge-blue' },
        },
        {
            label: 'Collection Received',
            value: fmtCr(metrics?.total_collection),
            color: 'emerald',
            valColor: '#047857',
            icon: '💰',
            badge: { text: `${collectionPct}% collected`, cls: 'badge-emerald' },
        },
        {
            label: 'Outstanding Receivables',
            value: fmtCr(metrics?.total_outstanding),
            color: 'red',
            valColor: '#b91c1c',
            icon: '⚠',
            badge: { text: 'Pending dues', cls: 'badge-red' },
        },
        {
            label: 'Monthly Salary Commit',
            value: `₹${fmt(metrics?.total_salary_due)}`,
            color: 'amber',
            valColor: '#b45309',
            icon: '👥',
            badge: { text: 'This month', cls: 'badge-amber' },
        },
        {
            label: 'Eligible Incentives Due',
            value: `₹${fmt(metrics?.total_incentive_due)}`,
            color: 'purple',
            valColor: '#6d28d9',
            icon: '⭐',
            badge: { text: 'Payable now', cls: 'badge-purple' },
        },
        {
            label: 'Active On-Account Advances',
            value: `₹${fmt(metrics?.total_active_advances)}`,
            color: 'rose',
            valColor: '#be123c',
            icon: '💳',
            badge: { text: 'Outstanding', cls: 'badge-red' },
        },
        {
            label: 'Net Employee Payable',
            value: `₹${fmt(metrics?.total_employee_payable)}`,
            color: 'cyan',
            valColor: '#0369a1',
            icon: '🧾',
            badge: { text: 'Settlement due', cls: 'badge-blue' },
        },
        {
            label: 'Monthly Expenses',
            value: `₹${fmt(metrics?.monthly_expenses)}`,
            color: 'rose',
            valColor: '#be123c',
            icon: '📋',
            badge: { text: 'This month', cls: 'badge-slate' },
        },
        {
            label: 'Site Visits This Month',
            value: `${fmt(metrics?.monthly_visits)}`,
            color: 'indigo',
            valColor: '#4338ca',
            icon: '📍',
            badge: { text: 'Client visits', cls: 'badge-indigo' },
        },
    ];

    return (
        <Layout title="Executive Operations Dashboard" subtitle="Real-time financial & operational overview">
            {/* Quick Actions Bar */}
            <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, rgba(59,130,246,0.06), rgba(139,92,246,0.04))', borderColor: 'rgba(59,130,246,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '1.1rem' }}>⚡</span>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>Quick Actions</div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Fast shortcuts for daily real estate operations</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <Link href={route('bookings.index')} className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📑</span> + New Booking
                        </Link>
                        <Link href={route('collections.index')} className="btn btn-sm" style={{ background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>💰</span> + Receive Payment
                        </Link>
                        <Link href={route('visits.index')} className="btn btn-sm" style={{ background: '#f59e0b', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>📍</span> + Log Site Visit
                        </Link>
                        <Link href={route('payroll.index')} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>💸</span> Pay Salary / Advance
                        </Link>
                    </div>
                </div>
            </div>

            {/* Collection Progress Bar */}
            <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                            Portfolio Collection Progress
                        </span>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2563eb' }}>{collectionPct}%</span>
                    </div>
                    <div style={{
                        height: '7px', background: '#e2e8f0',
                        borderRadius: '99px', overflow: 'hidden'
                    }}>
                        <div style={{
                            height: '100%',
                            width: `${collectionPct}%`,
                            background: 'linear-gradient(90deg, #2563eb, #10b981)',
                            borderRadius: '99px',
                            transition: 'width 1s ease',
                        }} />
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '2rem', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Collected</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#047857' }}>{fmtCr(metrics?.total_collection)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.62rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Total</div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{fmtCr(metrics?.total_business)}</div>
                    </div>
                </div>
            </div>

            {/* Metric Cards Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
                gap: '1.25rem',
                marginBottom: '2rem'
            }}>
                {metricCards.map((m, i) => (
                    <div key={i} className={`metric-card ${m.color}`}>
                        <div className="metric-icon">{m.icon}</div>
                        <div className="metric-label">{m.label}</div>
                        <div className="metric-value" style={{ color: m.valColor }}>
                            {m.value}
                        </div>
                        <div style={{ marginTop: '0.5rem' }}>
                            <span className={`badge ${m.badge.cls}`}>{m.badge.text}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                {/* Recent Collections */}
                <div className="card">
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div className="section-title">Recent Collections</div>
                            <div className="section-sub">Latest payments received</div>
                        </div>
                        <span className="badge badge-emerald">Live</span>
                    </div>
                    <div style={{ padding: '0.5rem 0' }}>
                        {!recentCollections || recentCollections.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">💰</div>
                                <div className="empty-state-text">No recent collections</div>
                            </div>
                        ) : recentCollections.map((c) => (
                            <div key={c.id} className="activity-item" style={{ padding: '0.75rem 1.25rem' }}>
                                <div className="activity-dot" style={{ background: '#10b981', marginTop: 5 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {c.booking?.customer_name}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 1 }}>
                                        Unit: {c.booking?.unit_number} · {c.payment_date}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#047857', flexShrink: 0 }}>
                                    +₹{fmt(c.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Eligible Incentives */}
                <div className="card">
                    <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div className="section-title">Eligible Incentives</div>
                            <div className="section-sub">Pending employee payouts</div>
                        </div>
                        {pendingIncentives && pendingIncentives.length > 0 && (
                            <span className="badge badge-amber">{pendingIncentives.length} pending</span>
                        )}
                    </div>
                    <div style={{ padding: '0.5rem 0' }}>
                        {!pendingIncentives || pendingIncentives.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-icon">⭐</div>
                                <div className="empty-state-text">No pending incentives</div>
                            </div>
                        ) : pendingIncentives.map((inc) => (
                            <div key={inc.id} className="activity-item" style={{ padding: '0.75rem 1.25rem' }}>
                                <div className="activity-dot" style={{ background: '#f59e0b', marginTop: 5 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>
                                        {inc.employee?.name}
                                    </div>
                                    <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {inc.description}
                                    </div>
                                </div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#b45309', flexShrink: 0 }}>
                                    ₹{fmt(inc.amount)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
}
