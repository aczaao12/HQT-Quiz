import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Card, Alert } from 'react-bootstrap';
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

  useEffect(() => {
    if (user && examId) { // Rely only on user authentication
      fetchExamDetails();
      fetchMyCreatedClasses(); // Renamed fetchTeacherClasses
    }
  }, [user, examId]); // Removed userData.role from dependency

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

    try {
      await addDoc(collection(db, 'assignments'), {
        exam_id: examId,
        class_id: selectedClassId,
        start_time: new Date(startTime),
        end_time: new Date(endTime),
        is_random_order: isRandomOrder,
        max_attempts: Number(maxAttempts),
        created_at: serverTimestamp(),
      });
      setSuccess(`Exam "${exam?.title}" assigned to class successfully!`);
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
    return <Container className="text-center mt-5"><p>Loading...</p></Container>;
  }

  if (!user) { // Only check for authentication
    return <Container className="text-center mt-5"><p>Please log in to view this page.</p></Container>;
  }

  if (!exam) {
    return <Container className="text-center mt-5"><p>Loading exam details or exam not found...</p></Container>;
  }

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Assign Exam: {exam.title}</h2>

      <Button variant="secondary" onClick={() => navigate('/exams')} className="mb-4">Back to Exams</Button>

      <Card className="mb-4 shadow">
        <Card.Body>
          <h4 className="mb-3">Assignment Details</h4>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleCreateAssignment}>
            <Form.Group className="mb-3" controlId="formExamId">
              <Form.Label>Exam ID</Form.Label>
              <Form.Control type="text" value={examId} readOnly disabled />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formClassSelect">
              <Form.Label>Select Class</Form.Label>
              <Form.Control
                as="select"
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={actionLoading}
                required
              >
                {myCreatedClasses.length === 0 ? ( // Use new state
                  <option value="">No classes available</option>
                ) : (
                  myCreatedClasses.map((cls) => ( // Use new state
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))
                )}
              </Form.Control>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formStartTime">
              <Form.Label>Start Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={actionLoading}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formEndTime">
              <Form.Label>End Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={actionLoading}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRandomOrder">
              <Form.Check
                type="checkbox"
                label="Randomize Question Order"
                checked={isRandomOrder}
                onChange={(e) => setIsRandomOrder(e.target.checked)}
                disabled={actionLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formMaxAttempts">
              <Form.Label>Max Attempts</Form.Label>
              <Form.Control
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                min="1"
                disabled={actionLoading}
                required
              />
            </Form.Group>

            <Button variant="primary" type="submit" disabled={actionLoading || myCreatedClasses.length === 0}>
              {actionLoading ? 'Assigning...' : 'Assign Exam'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AssignmentPage;