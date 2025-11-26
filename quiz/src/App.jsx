import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import LoginPage from './LoginPage';
import HomePage from './HomePage';
import ClassesPage from './ClassManagementPage';
import ExamManagementPage from './ExamManagementPage';
import QuestionManagementPage from './QuestionManagementPage';
import AssignmentPage from './AssignmentPage';
import AssignmentsPage from './AssignmentsPage';
import TakeExamPage from './TakeExamPage';
import ExamPreviewPage from './ExamPreviewPage'; // Import ExamPreviewPage
import './App.css';

function App() {
  const { user, loading } = useUser(); // userData is not needed for top-level route guarding now

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/home" /> : <LoginPage />} />
        <Route
          path="/home"
          element={user ? <HomePage /> : <Navigate to="/login" />}
        />
        {/* All routes below now only check for user authentication, not roles */}
        <Route
          path="/classes"
          element={
            user ? (
              <ClassesPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/exams"
          element={
            user ? (
              <ExamManagementPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/exams/:examId/questions"
          element={
            user ? (
              <QuestionManagementPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/exams/:examId/assign"
          element={
            user ? (
              <AssignmentPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/classes/:classId/assignments"
          element={
            user ? (
              <AssignmentsPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/assignments/:assignmentId/take"
          element={
            user ? (
              <TakeExamPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        {/* Protected route for Exam Preview - Any authenticated user */}
        <Route
          path="/exams/:examId/preview"
          element={
            user ? (
              <ExamPreviewPage />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="*" element={<Navigate to={user ? "/home" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;