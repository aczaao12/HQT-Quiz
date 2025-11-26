import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useParams, useNavigate, Link } from 'react-router-dom';

const AssignmentsPage = () => { // Renamed component
  const { user, userData, loading } = useUser();
  const { classId } = useParams();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [currentClass, setCurrentClass] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && classId) { // Rely only on user authentication
      fetchClassDetails();
      fetchAssignments(); // Renamed function
    }
  }, [user, classId]); // Removed userData.role from dependency

  const fetchClassDetails = async () => {
    try {
      const classRef = doc(db, 'classes', classId);
      const classSnap = await getDoc(classRef);
      if (classSnap.exists()) {
        setCurrentClass({ id: classSnap.id, ...classSnap.data() });
      } else {
        setError('Class not found.');
      }
    } catch (err) {
      setError('Failed to fetch class details: ' + err.message);
      console.error(err);
    }
  };

  const fetchAssignments = async () => { // Renamed from fetchStudentAssignments
    if (!user || !classId) return; // Only check for authentication
    try {
      const q = query(collection(db, 'assignments'), where('class_id', '==', classId));
      const querySnapshot = await getDocs(q);
      const fetchedAssignments = [];
      for (const assignmentDoc of querySnapshot.docs) {
        const assignmentData = { id: assignmentDoc.id, ...assignmentDoc.data() };

        // Fetch exam details for each assignment
        const examRef = doc(db, 'exams', assignmentData.exam_id);
        const examSnap = await getDoc(examRef);
        if (examSnap.exists()) {
          assignmentData.exam = { id: examSnap.id, ...examSnap.data() };
        }

        // Check if user has already submitted results for this assignment
        const resultsQuery = query(
          collection(db, 'results'),
          where('assignment_id', '==', assignmentDoc.id),
          where('student_id', '==', user.uid)
        );
        const resultsSnap = await getDocs(resultsQuery);
        assignmentData.submittedCount = resultsSnap.docs.length;
        assignmentData.hasSubmitted = !resultsSnap.empty;

        fetchedAssignments.push(assignmentData);
      }
      setAssignments(fetchedAssignments);
    } catch (err) {
      setError('Failed to fetch assignments: ' + err.message);
      console.error(err);
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
      <h2 className="text-center mb-4">Assignments for {currentClass?.name || 'Class'}</h2>

      <Button variant="secondary" onClick={() => navigate('/classes')} className="mb-4">Back to My Classes</Button>

      {error && <Alert variant="danger">{error}</Alert>}

      {assignments.length === 0 ? (
        <Alert variant="info">No assignments found for this class yet.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {assignments.map((assignment) => (
            <Col key={assignment.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{assignment.exam?.title || 'Unknown Exam'}</Card.Title>
                  <Card.Text>
                    <strong>Start Time:</strong> {assignment.start_time?.toDate().toLocaleString() || 'N/A'}<br/>
                    <strong>End Time:</strong> {assignment.end_time?.toDate().toLocaleString() || 'N/A'}<br/>
                    <strong>Max Attempts:</strong> {assignment.max_attempts}<br/>
                    <strong>Submitted:</strong> {assignment.submittedCount} time(s)
                  </Card.Text>
                  {assignment.submittedCount < assignment.max_attempts ? (
                    <Link to={`/assignments/${assignment.id}/take`} className="btn btn-primary btn-sm">
                      Take Exam
                    </Link>
                  ) : (
                    <Button variant="secondary" size="sm" disabled>
                      Max Attempts Reached
                    </Button>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default AssignmentsPage;