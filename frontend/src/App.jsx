
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Login from './Login';

function App() {
    const [token, setToken] = useState(() => localStorage.getItem('token'));
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [threadId, setThreadId] = useState(Date.now().toString());
    const messagesEndRef = useRef(null);

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setMessages([]);
    };

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMsg = { role: 'user', content: text };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${backendUrl}/chats/message/${threadId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ query: text }),
            });

            if (response.status === 401) {
                handleLogout();
                return;
            }

            const data = await response.json();

            // Handle the complex response format from the agent
            const botContent = data.message || "I'm not sure how to respond to that.";
            const suggestions = data.suggestions ? data.suggestions.split(',').map(s => s.trim()) : [];

            const botMsg = {
                role: 'assistant',
                content: botContent,
                suggestions: suggestions
            };

            setMessages((prev) => [...prev, botMsg]);

        } catch (error) {
            console.error('Error:', error);
            setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') sendMessage(input);
    };

    if (!token) {
        return <Login onLogin={(tk) => {
            localStorage.setItem('token', tk);
            setToken(tk);
        }} />;
    }

    return (
        <div className="app-container">
            <div className="bg-animation"></div>

            <header className="chat-header">
                <div className="logo-container">
                    <span style={{ fontSize: '1.5rem' }}>☕</span>
                    <span className="title">Starbucks Agent</span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    Logout
                </button>
            </header>

            <div className="chat-window">
                {messages.length === 0 && (
                    <div style={{ textAlign: 'center', marginTop: '50px', color: 'var(--text-muted)' }}>
                        <h2>Welcome to Starbucks! ☕</h2>
                        <p>I can help you order your perfect drink. What would you like today?</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div key={idx} className={`message ${msg.role}-message`}>
                        {msg.content}
                        {msg.suggestions && msg.suggestions.length > 0 && (
                            <div className="suggestions">
                                {msg.suggestions.map((s, i) => (
                                    <button key={i} className="chip" onClick={() => sendMessage(s)}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="message bot-message">
                        <div className="typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <div className="input-container">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your order..."
                        disabled={loading}
                    />
                    <button
                        className="send-btn"
                        onClick={() => sendMessage(input)}
                        disabled={loading || !input.trim()}
                    >
                        ➤
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
