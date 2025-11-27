import React from 'react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const HomePage = () => {
  const navigate = useNavigate();
  const { user, userData, loading } = useUser();

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
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {user && userData ? (
        <>
          <h1 className="text-3xl font-bold mb-4">Welcome, {userData.name}!</h1>
          <p className="text-lg mb-2">You are logged in (Role: {userData.role}).</p>
          <p className="text-lg mb-4">Email: {userData.email}</p>
          <div className="flex space-x-4">
            <Link to="/classes" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              My Classes
            </Link>
            <Link to="/exams" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
              My Exams
            </Link>
          </div>
          <button
            onClick={handleSignOut}
            className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-4">Welcome to the Home Page!</h1>
          <p className="text-lg mb-4">You are logged in.</p>
          <button
            onClick={handleSignOut}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Sign Out
          </button>
        </>
      )}
    </div>
  );
};

export default HomePage;
