// src/components/Auth/Register.jsx
import React, { useRef, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function Register() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    try {
      setMessage('');
      setError('');
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value);
      setMessage('Account created successfully! Please wait for admin approval to log in.');
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    }

    setLoading(false);
  }

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      {error && <div className="auth-error">{error}</div>}
      {message && <div className="auth-message">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input type="email" id="email" ref={emailRef} required />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input type="password" id="password" ref={passwordRef} required />
        </div>
        <div className="form-group">
          <label htmlFor="password-confirm">Password Confirmation</label>
          <input type="password" id="password-confirm" ref={passwordConfirmRef} required />
        </div>
        <button disabled={loading} type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default Register;
