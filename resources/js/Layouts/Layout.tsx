import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

const navItems = [
    { href: 'dashboard', label: 'Executive Dashboard', icon: '◈', section: 'Overview' },
    { href: 'projects.index', label: 'Projects & Rules', icon: '⬡', section: 'Management' },
    { href: 'employees.index', label: 'Employees', icon: '◉', section: 'Management' },
    { href: 'bookings.index', label: 'Bookings', icon: '◫', section: 'Management' },
    { href: 'collections.index', label: 'Collections', icon: '◈', section: 'Finance' },
    { href: 'payroll.index', label: 'Payroll & Advances', icon: '⬡', section: 'Finance' },
    { href: 'expenses.index', label: 'Expenses', icon: '◎', section: 'Finance' },
    { href: 'reports.index', label: 'Reports & Exports', icon: '◈', section: 'Analytics' },
];

export default function Layout({ children, title = 'Dashboard', subtitle }: LayoutProps) {
    const { auth } = usePage<any>().props;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    const isActive = (routeName: string) => {
        try {
            const url = route(routeName);
            return currentPath.startsWith(url.replace(window.location.origin, ''));
        } catch {
            return false;
        }
    };

    const userName = auth?.user?.name || 'User';
    const userRole = auth?.user?.role || 'Admin';
    const initials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const sections = [...new Set(navItems.map(n => n.section))];

    return (
        <div className="app-shell">
            {/* Sidebar */}
            <aside className="sidebar">
                {/* Logo */}
                <div className="sidebar-logo">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '1rem', flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                        }}>🏢</div>
                        <div>
                            <div className="sidebar-logo-text">Signature</div>
                            <div className="sidebar-logo-sub">Properties CRM</div>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {sections.map((section) => (
                        <div key={section}>
                            <div className="nav-section-label">{section}</div>
                            {navItems
                                .filter(item => item.section === section)
                                .map((item) => {
                                    const active = isActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={route(item.href)}
                                            className={`nav-item ${active ? 'active' : ''}`}
                                        >
                                            <span className="nav-icon" style={{ opacity: active ? 1 : 0.5 }}>
                                                {item.icon}
                                            </span>
                                            <span>{item.label}</span>
                                        </Link>
                                    );
                                })}
                        </div>
                    ))}
                </nav>

                {/* Footer / User */}
                <div className="sidebar-footer">
                    <div className="user-card">
                        <div className="user-avatar">{initials}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {userName}
                            </div>
                            <div className="user-role">{userRole}</div>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="logout-btn"
                            title="Logout"
                        >
                            ⏻
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <div className="main-content">
                {/* Page Header */}
                <header className="page-header">
                    <div>
                        <div className="page-title">{title}</div>
                        {subtitle && <div className="page-breadcrumb">{subtitle}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                            fontSize: '0.7rem', color: 'var(--text-muted)',
                            background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)',
                            padding: '3px 10px', borderRadius: '20px'
                        }}>
                            <span style={{ color: '#10b981', marginRight: 4 }}>●</span>
                            Live
                        </div>
                    </div>
                </header>

                {/* Page Body */}
                <main className="page-body page-enter">
                    {children}
                </main>
            </div>
        </div>
    );
}
