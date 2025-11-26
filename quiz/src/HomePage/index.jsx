import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom'; // Import Link
import { useUser } from '../context/UserContext'; // Import useUser hook

const HomePage = () => {
  const navigate = useNavigate();
  const { user, userData, loading } = useUser(); // Get user data from context

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
        <p>Loading user data...</p>
      </Container>
    );
  }

  return (
    <Container className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh' }}>
      {user && userData ? (
        <>
          <h1>Welcome, {userData.name}!</h1>
          <p>You are logged in (Role: {userData.role}).</p>
          <p>Email: {userData.email}</p>
          <>
            <Link to="/classes" className="btn btn-info mt-3 me-2">
              My Classes
            </Link>
            <Link to="/exams" className="btn btn-warning mt-3">
              My Exams
            </Link>
          </>
          <Button variant="danger" onClick={handleSignOut} className="mt-3">
            Sign Out
          </Button>
        </>
      ) : (
        <>
          <h1>Welcome to the Home Page!</h1>
          <p>You are logged in.</p>
          <Button variant="danger" onClick={handleSignOut}>
            Sign Out
          </Button>
        </>
      )}
    </Container>
  );
};

export default HomePage;
