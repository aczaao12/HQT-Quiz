import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Card, Row, Col, Alert } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { db } from '../../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';

const ExamManagementPage = () => {
  const { user, userData, loading } = useUser();
  // const navigate = useNavigate(); // No longer needed for this navigation

  const [examTitle, setExamTitle] = useState('');
  const [examDuration, setExamDuration] = useState('');
  const [totalPoints, setTotalPoints] = useState('');
  const [myCreatedExams, setMyCreatedExams] = useState([]); // Renamed state
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) { // Fetch exams if user is authenticated
      fetchMyCreatedExams();
    }
  }, [user]); // Re-fetch when user changes

  const fetchMyCreatedExams = async () => { // Renamed function
    if (!user) return; // Only check for authentication
    try {
      const q = query(collection(db, 'exams'), where('teacher_id', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const exams = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyCreatedExams(exams);
    } catch (err) {
      setError('Failed to fetch exams: ' + err.message);
      console.error(err);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!user) { // Only check for authentication
      setError('You must be logged in to create exams.');
      return;
    }
    if (!examTitle.trim() || !examDuration || !totalPoints) {
      setError('Please fill all fields.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newExamRef = await addDoc(collection(db, 'exams'), {
        title: examTitle,
        teacher_id: user.uid,
        duration: Number(examDuration),
        total_points: Number(totalPoints),
        status: 'draft', // Default status
        created_at: serverTimestamp(),
      });
      setSuccess(`Exam "${examTitle}" created successfully. ID: ${newExamRef.id}`);
      setExamTitle('');
      setExamDuration('');
      setTotalPoints('');
      fetchMyCreatedExams(); // Refresh list
    } catch (err) {
      setError('Failed to create exam: ' + err.message);
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

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Exam Management</h2>

      <Card className="mb-4 shadow">
        <Card.Body>
          <h4 className="mb-3">Create New Exam</h4>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          <Form onSubmit={handleCreateExam}>
            <Form.Group className="mb-3" controlId="formExamTitle">
              <Form.Label>Exam Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter exam title"
                value={examTitle}
                onChange={(e) => setExamTitle(e.target.value)}
                disabled={actionLoading}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formExamDuration">
              <Form.Label>Duration (minutes)</Form.Label>
              <Form.Control
                type="number"
                placeholder="e.g., 60"
                value={examDuration}
                onChange={(e) => setExamDuration(e.target.value)}
                disabled={actionLoading}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formTotalPoints">
              <Form.Label>Total Points</Form.Label>
              <Form.Control
                type="number"
                placeholder="e.g., 100"
                value={totalPoints}
                onChange={(e) => setTotalPoints(e.target.value)}
                disabled={actionLoading}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={actionLoading}>
              {actionLoading ? 'Creating...' : 'Create Exam'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <h4 className="mb-3">My Created Exams</h4>
      {myCreatedExams.length === 0 ? (
        <Alert variant="info">You haven't created any exams yet.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {myCreatedExams.map((exam) => (
            <Col key={exam.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{exam.title}</Card.Title>
                  <Card.Text>
                    <strong>ID:</strong> {exam.id}<br/>
                    <strong>Duration:</strong> {exam.duration} minutes<br/>
                    <strong>Total Points:</strong> {exam.total_points}<br/>
                    <strong>Status:</strong> {exam.status}<br/>
                    <strong>Created:</strong> {new Date(exam.created_at.toDate()).toLocaleDateString()}
                  </Card.Text>
                  <Link to={`/exams/${exam.id}/questions`} className="btn btn-info btn-sm me-2">Add Questions</Link>
                  <Link to={`/exams/${exam.id}/assign`} className="btn btn-success btn-sm me-2">Assign</Link>
                  <Link to={`/exams/${exam.id}/preview`} className="btn btn-secondary btn-sm me-2">Preview</Link>
                  <Button variant="secondary" size="sm">Edit</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ExamManagementPage;