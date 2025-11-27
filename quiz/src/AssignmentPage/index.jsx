import React, { useState, useEffect } from 'react';

import { useUser } from '../context/UserContext';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';


const AssignmentPage = () => {
  const { user, userData, loading } = useUser();
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [myCreatedClasses, setMyCreatedClasses] = useState([]); // Renamed teacherClasses
  const [selectedClassId, setSelectedClassId] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isRandomOrder, setIsRandomOrder] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(1);

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [shareableLink, setShareableLink] = useState(null); // New state for shareable link
  const [existingAssignments, setExistingAssignments] = useState([]); // New state for existing assignments

  useEffect(() => {
    if (user && examId) {
      fetchExamDetails();
      fetchMyCreatedClasses();
    }
  }, [user, examId]);

  useEffect(() => {
    if (user && examId && selectedClassId) {
      fetchExistingAssignments();
    }
  }, [user, examId, selectedClassId]);

  const fetchExamDetails = async () => {
    try {
      const examRef = doc(db, 'exams', examId);
      const examSnap = await getDoc(examRef);
      if (examSnap.exists()) {
        setExam({ id: examSnap.id, ...examSnap.data() });
      } else {
        setError('Exam not found.');
      }
    } catch (err) {
      setError('Failed to fetch exam details: ' + err.message);
      console.error(err);
    }
  };

  const fetchMyCreatedClasses = async () => { // Renamed fetchTeacherClasses
    if (!user) return; // Only check for authentication
    try {
      const q = query(collection(db, 'classes'), where('teacher_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const classes = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMyCreatedClasses(classes); // Use new state
      if (classes.length > 0) {
        setSelectedClassId(classes[0].id); // Select first class by default
      }
    } catch (err) {
      setError('Failed to fetch my created classes: ' + err.message);
      console.error(err);
    }
  };

  const fetchExistingAssignments = async () => {
    if (!user || !examId || !selectedClassId) return;
    setActionLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'assignments'),
        where('exam_id', '==', examId),
        where('class_id', '==', selectedClassId)
      );
      const querySnapshot = await getDocs(q);
      const assignments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        shareableLink: `${window.location.origin}/assignments/${doc.id}/take`
      }));
      setExistingAssignments(assignments);
    } catch (err) {
      setError('Failed to fetch existing assignments: ' + err.message);
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!user) { // Only check for authentication
      setError('You must be logged in to create assignments.');
      return;
    }
    if (!selectedClassId || !examId || !startTime || !endTime) {
      setError('Please fill all required fields.');
      return;
    }
    if (new Date(startTime) >= new Date(endTime)) {
      setError('Start time must be before end time.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);
    setShareableLink(null); // Clear previous link

    try {
      const docRef = await addDoc(collection(db, 'assignments'), {
        exam_id: examId,
        class_id: selectedClassId,
        start_time: new Date(startTime),
        end_time: new Date(endTime),
        is_random_order: isRandomOrder,
        max_attempts: Number(maxAttempts),
        created_at: serverTimestamp(),
      });
      setSuccess(`Exam "${exam?.title}" assigned to class successfully!`);
      const generatedLink = `${window.location.origin}/assignments/${docRef.id}/take`;
      setShareableLink(generatedLink);
      // Reset form or navigate
      setStartTime('');
      setEndTime('');
      setIsRandomOrder(false);
      setMaxAttempts(1);
    } catch (err) {
      setError('Failed to create assignment: ' + err.message);
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-lg mx-auto mt-5 p-4 text-center"><p>Loading...</p></div>;
  }

  if (!user) { // Only check for authentication
    return <div className="max-w-lg mx-auto mt-5 p-4 text-center"><p>Please log in to view this page.</p></div>;
  }

  if (!exam) {
    return <div className="max-w-lg mx-auto mt-5 p-4 text-center"><p>Loading exam details or exam not found...</p></div>;
  }

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6 flex flex-col">
        <div className="w-full bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-extrabold text-gray-800">Assign Exam: {exam.title}</h1>
            <button onClick={() => navigate('/exams')} className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200">
              Back to Exams
            </button>
          </div>
  
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
          {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">{success}</div>}
  
          {shareableLink && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex flex-col items-start space-y-3">
              <p className="text-blue-800 font-semibold text-lg">Share this link with students (New Assignment):</p>
              <div className="flex w-full items-center">
                <input
                  type="text"
                  readOnly
                  value={shareableLink}
                  className="flex-grow p-3 border border-blue-300 rounded-l-lg bg-blue-100 text-blue-900 text-sm overflow-x-auto focus:outline-none" 
                />
                <button
                  onClick={() => navigator.clipboard.writeText(shareableLink)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-5 rounded-r-lg text-sm transition duration-200"
                >
                  Copy Link
                </button>
              </div>
            </div>
          )}

          {existingAssignments.length > 0 && (
            <div className="mb-6 p-6 bg-gray-50 border border-gray-200 rounded-lg shadow-inner">
              <h3 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">Existing Assignments for {exam.title} in Selected Class</h3>
              <div className="space-y-4">
                {existingAssignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 bg-white border border-gray-100 rounded-md shadow-sm flex flex-col items-start space-y-2">
                    <p className="text-lg font-semibold text-gray-800">Assignment ID: <span className="font-normal text-blue-600 text-base">{assignment.id}</span></p>
                    <p className="text-sm text-gray-600">Start: {new Date(assignment.start_time.toDate()).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">End: {new Date(assignment.end_time.toDate()).toLocaleString()}</p>
                    <p className="text-sm text-gray-600">Random Order: {assignment.is_random_order ? 'Yes' : 'No'}</p>
                    <p className="text-sm text-gray-600">Max Attempts: {assignment.max_attempts}</p>
                    <div className="flex w-full items-center mt-2">
                      <input
                        type="text"
                        readOnly
                        value={assignment.shareableLink}
                        className="flex-grow p-2 border border-blue-300 rounded-l-lg bg-blue-50 text-blue-800 text-xs overflow-x-auto focus:outline-none"
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(assignment.shareableLink)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-r-lg text-xs transition duration-200"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-2xl font-bold text-gray-700 mb-6 border-b pb-2">Create New Assignment</h3>

          <form onSubmit={handleCreateAssignment} className="space-y-6">
            <div className="mb-4">
              <label htmlFor="formExamId" className="block text-gray-700 text-sm font-bold mb-2">Exam ID</label>
              <input 
                type="text" 
                id="formExamId" 
                value={examId} 
                readOnly 
                disabled 
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none bg-gray-100 cursor-not-allowed sm:text-sm text-gray-900" 
              />
            </div>

            <div className="mb-4">
              <label htmlFor="formClassSelect" className="block text-gray-700 text-sm font-bold mb-2">Select Class</label>
              <select
                id="formClassSelect"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={actionLoading}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              >
                {myCreatedClasses.length === 0 ? (
                  <option value="" className="text-gray-900">No classes available</option>
                ) : (
                  myCreatedClasses.map((cls) => (
                    <option key={cls.id} value={cls.id} className="text-gray-900">
                      {cls.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="formStartTime" className="block text-gray-700 text-sm font-bold mb-2">Start Time</label>
              <input
                type="datetime-local"
                id="formStartTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={actionLoading}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="formEndTime" className="block text-gray-700 text-sm font-bold mb-2">End Time</label>
              <input
                type="datetime-local"
                id="formEndTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={actionLoading}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              />
            </div>
  
            <div className="mb-4 flex items-center">
              <input
                type="checkbox"
                id="formRandomOrder"
                checked={isRandomOrder}
                onChange={(e) => setIsRandomOrder(e.target.checked)}
                disabled={actionLoading}
                className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out rounded"
              />
              <label htmlFor="formRandomOrder" className="ml-2 block text-gray-700 text-sm font-bold">Randomize Question Order</label>
            </div>
  
            <div className="mb-4">
              <label htmlFor="formMaxAttempts" className="block text-gray-700 text-sm font-bold mb-2">Max Attempts</label>
              <input
                type="number"
                id="formMaxAttempts"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                min="1"
                disabled={actionLoading}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
              />
            </div>
  
            <button type="submit" disabled={actionLoading || myCreatedClasses.length === 0} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              {actionLoading ? 'Assigning...' : 'Assign Exam'}
            </button>
          </form>
        </div>
      </div>
    );
};

export default AssignmentPage;