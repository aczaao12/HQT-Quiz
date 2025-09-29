// src/components/Auth/Login.jsx
import React, { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      // Redirect to dashboard or home page after successful login
      // For now, we'll just show a success message
      alert('Logged in successfully!'); 
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    }

    setLoading(false);
  }

  return (
    <div className="auth-container">
      <h2>Log In</h2>
      {error && <div className="auth-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" ref={emailRef} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" ref={passwordRef} required />
        </div>
        <button disabled={loading} type="submit">Log In</button>
      </form>
    </div>
  );
}

export default Login;
