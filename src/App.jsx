import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Navbar from './components/Navbar/Navbar';
import LandingPage from './pages/LandingPage/LandingPage';
import AboutPage from './pages/AboutPage/AboutPage';
import RecruitmentPage from './pages/RecruitmentPage/RecruitmentPage';
import ContactForm from './components/ContactForm/ContactForm';
import Footer from './components/Footer/Footer';
import BackToTopButton from './components/BackToTopButton/BackToTopButton';
import ParticleBackground from './components/ParticleBackground/ParticleBackground';
import CustomCursor from './components/CustomCursor/CustomCursor';
import { useDarkMode } from './hooks/useDarkMode';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage/AuthPage';
import './App.css';

function AppContent() {
  const { isDarkMode } = useDarkMode();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]); // Adjust for desired parallax effect
  const { currentUser, logout } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    document.body.classList.toggle('light-mode', !isDarkMode);
  }, [isDarkMode]);

  async function handleLogout() {
    setError('');
    try {
      await logout();
    } catch (err) {
      setError('Failed to log out: ' + err.message);
    }
  }

  if (!currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="app-container">
      <ParticleBackground />
      <CustomCursor />
      <Navbar />
      {error && <div className="auth-error" style={{textAlign: 'center', padding: '10px', backgroundColor: 'rgba(255,0,0,0.2)'}}>{error}</div>}
      <button onClick={handleLogout} style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        padding: '10px 15px',
        backgroundColor: 'var(--primary-color)',
        color: 'var(--button-text-color)',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
      }}>
        Logout
      </button>
      <motion.div style={{ y }} className="content-wrapper">
        <LandingPage />
        <AboutPage />
        <RecruitmentPage />
        <ContactForm />
        <Footer />
      </motion.div>
      <BackToTopButton />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
