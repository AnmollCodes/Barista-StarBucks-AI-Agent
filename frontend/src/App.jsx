
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Login from './Login';

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState('');
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    // Generate a random thread ID for the session
    // In a real app, you might fetch previous threads from backend
    setThreadId(crypto.randomUUID());

    // Add initial greeting
    setMessages([{
      role: 'agent',
      content: 'Welcome to Starbucks! I can help you craft your perfect drink. What can I get started for you today? ☕',
      suggestions: ['I want a Latte', 'What are the seasonal drinks?', 'Surprise me!']
    }]);
  }, [token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setMessages([]);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
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
        throw new Error('Session expired');
      }

      if (!response.ok) throw new Error('Network error');

      const data = await response.json();

      const agentMessage = {
        role: 'agent',
        content: data.message || "I'm sorry, I didn't verify that. Could you say it again?",
        suggestions: data.suggestions || [],
        order: data.current_order
      };

      setMessages(prev => [...prev, agentMessage]);

      if (data.progress === 'completed') {
        // Maybe show confetti or reset?
      }

    } catch (error) {
      console.error('Error:', error);
      if (error.message !== 'Session expired') {
        setMessages(prev => [...prev, {
          role: 'agent',
          content: "Sorry, I'm having trouble connecting to the barista system right now. Please try again."
        }]);
      }
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
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
      <header>
        <h1>
          <span className="logo">★</span>
          Starbucks Agent
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div className="status">
            <div className="status-dot"></div>
            Online
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              padding: '5px 10px',
              border: '1px solid var(--border-color)',
              borderRadius: '5px'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="sender-name">{msg.role === 'agent' ? 'Barista AI' : 'You'}</div>
            <div className="content">{msg.content}</div>

            {msg.role === 'agent' && msg.suggestions && Array.isArray(msg.suggestions) && msg.suggestions.length > 0 && (
              <div className="suggestions">
                {msg.suggestions.map((sugg, i) => (
                  <button key={i} onClick={() => sendMessage(sugg)} className="suggestion-chip">
                    {sugg}
                  </button>
                ))}
              </div>
            )}

            {msg.role === 'agent' && msg.suggestions && typeof msg.suggestions === 'string' && (
              <div className="suggestions-text">
                Try: {msg.suggestions}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="message agent">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="input-area">
        <div className="input-wrapper">
          <input
            ref={inputRef}
            type="text"
            placeholder="Order your favorite drink..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
            disabled={loading}
          />
        </div>
        <button
          className="send-btn"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default App;
