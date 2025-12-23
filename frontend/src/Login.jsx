
import React, { useState } from 'react';
import './App.css';

export default function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

        try {
            const response = await fetch(`${backendUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Could not connect to the server. Please check your internet or try again.');
            }

            const data = await response.json();
            onLogin(data.access_token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="bg-animation"></div>

            <div className="login-card">
                <div className="login-logo">★</div>
                <h1 className="login-title">Starbucks Agent</h1>
                <p className="login-subtitle">Your personal AI Barista awaits.</p>

                {error && (
                    <div style={{
                        background: 'rgba(255, 107, 107, 0.1)',
                        border: '1px solid rgba(255, 107, 107, 0.3)',
                        color: '#ff6b6b',
                        padding: '12px',
                        borderRadius: '12px',
                        textAlign: 'center',
                        marginBottom: '20px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                placeholder="Email address"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="input-wrapper">
                            <input
                                type="password"
                                placeholder="Password (any)"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <span className="typing-indicator" style={{ justifyContent: 'center' }}>
                                <span style={{ background: 'white' }}></span>
                                <span style={{ background: 'white' }}></span>
                                <span style={{ background: 'white' }}></span>
                            </span>
                        ) : 'Enter Café ➤'}
                    </button>
                </form>

                <p style={{
                    textAlign: 'center',
                    marginTop: '30px',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    opacity: 0.7
                }}>
                    Powered by Google Gemini & LangGraph
                </p>
            </div>
        </div>
    );
}
