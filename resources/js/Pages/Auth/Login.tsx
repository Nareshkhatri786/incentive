import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        username: '',
        password: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(window.location.pathname);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                {/* Logo */}
                <div className="login-logo">
                    <div className="login-logo-icon">🏢</div>
                    <div className="login-title">Signature Properties</div>
                    <div className="login-subtitle">Internal Operations & Financial System</div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Username</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute', left: '0.75rem', top: '50%',
                                transform: 'translateY(-50%)', color: '#94a3b8',
                                fontSize: '0.85rem', pointerEvents: 'none'
                            }}>👤</span>
                            <input
                                type="text"
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                className="form-input"
                                style={{ paddingLeft: '2.25rem' }}
                                placeholder="Enter username"
                                autoFocus
                                required
                            />
                        </div>
                        {errors.username && (
                            <div className="form-error">⚠ {errors.username}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{
                                position: 'absolute', left: '0.75rem', top: '50%',
                                transform: 'translateY(-50%)', color: '#94a3b8',
                                fontSize: '0.85rem', pointerEvents: 'none'
                            }}>🔒</span>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="form-input"
                                style={{ paddingLeft: '2.25rem', paddingRight: '2.75rem' }}
                                placeholder="Enter password"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute', right: '0.75rem', top: '50%',
                                    transform: 'translateY(-50%)', background: 'none',
                                    border: 'none', cursor: 'pointer',
                                    color: '#64748b', fontSize: '0.75rem',
                                    padding: '2px', transition: 'color 0.15s'
                                }}
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        {errors.password && (
                            <div className="form-error">⚠ {errors.password}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={processing}
                        className="btn btn-primary"
                        style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', marginTop: '0.5rem', fontSize: '0.85rem' }}
                    >
                        {processing ? (
                            <>Signing in...</>
                        ) : (
                            <>Sign In →</>
                        )}
                    </button>
                </form>

                {/* Footer note */}
                <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.68rem', color: '#94a3b8' }}>
                    Secured internal system · Signature Properties
                </div>
            </div>
        </div>
    );
}
