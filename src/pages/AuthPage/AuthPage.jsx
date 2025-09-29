// src/pages/AuthPage/AuthPage.jsx
import React, { useState } from 'react';
import Login from '../../components/Auth/Login';
import Register from '../../components/Auth/Register';
import './AuthPage.css'; // We will create this CSS file next

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="auth-page-container">
      <div className="auth-form-card">
        {isLogin ? <Login /> : <Register />}
        <p className="auth-toggle-text">
          {isLogin ? "Need an account?" : "Already have an account?"}
          <span onClick={() => setIsLogin(!isLogin)} className="auth-toggle-link">
            {isLogin ? " Sign Up" : " Log In"}
          </span>
        </p>
      </div>
    </div>
  );
}

export default AuthPage;
