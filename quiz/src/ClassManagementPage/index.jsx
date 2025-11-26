import React, { useState, useEffect } from 'react';
import { Container, Button, Form, Card, Row, Col, Alert } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { db } from '../../firebase';
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';

const ClassesPage = () => {
  const { user, userData, loading } = useUser();
  const [className, setClassName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [allMyClasses, setAllMyClasses] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAllMyClasses();
    }
  }, [user]);

  const fetchAllMyClasses = async () => {
    if (!user) return;
    try {
      const createdClassesQuery = query(collection(db, 'classes'), where('teacher_id', '==', user.uid));
      const createdClassesSnapshot = await getDocs(createdClassesQuery);
      const created = createdClassesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isCreator: true }));

      const joinedClassesList = [];
      const allClassesRef = collection(db, 'classes');
      const allClassesSnapshot = await getDocs(allClassesRef);

      for (const classDoc of allClassesSnapshot.docs) {
        if (!created.some(cls => cls.id === classDoc.id)) {
          const studentSubcollectionRef = collection(db, 'classes', classDoc.id, 'students');
          const studentDocRef = doc(studentSubcollectionRef, user.uid);
          const studentDocSnap = await getDoc(studentDocRef);

          if (studentDocSnap.exists()) {
            joinedClassesList.push({ id: classDoc.id, ...classDoc.data(), ...studentDocSnap.data(), isCreator: false });
          }
        }
      }
      setAllMyClasses([...created, ...joinedClassesList]);
    } catch (err) {
      setError('Failed to fetch classes: ' + err.message);
      console.error(err);
    }
  };

  const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create classes.');
      return;
    }
    if (!className.trim()) {
      setError('Class name cannot be empty.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const joinCode = generateJoinCode();
      const newClassRef = await addDoc(collection(db, 'classes'), {
        name: className,
        teacher_id: user.uid,
        organization_id: userData?.organization_id || 'default_org',
        join_code: joinCode,
        created_at: serverTimestamp(),
      });
      setSuccess(`Class "${className}" created successfully with Join Code: ${joinCode}`);
      setClassName('');
      fetchAllMyClasses();
    } catch (err) {
      setError('Failed to create class: ' + err.message);
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinClass = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to join classes.');
      return;
    }
    if (!joinCode.trim()) {
      setError('Join Code cannot be empty.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const q = query(collection(db, 'classes'), where('join_code', '==', joinCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Invalid Join Code.');
        return;
      }

      const classDoc = querySnapshot.docs[0];
      const classId = classDoc.id;

      // Add student to the class's students subcollection
      const studentSubcollectionRef = doc(db, 'classes', classId, 'students', user.uid);
      await setDoc(studentSubcollectionRef, {
        joined_at: serverTimestamp(),
      });

      setSuccess(`Successfully joined class "${classDoc.data().name}".`);
      setJoinCode('');
      fetchAllMyClasses();
    } catch (err) {
      setError('Failed to join class: ' + err.message);
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <Container className="text-center mt-5"><p>Loading...</p></Container>;
  }

  if (!user) {
    return <Container className="text-center mt-5"><p>Please log in to view this page.</p></Container>;
  }

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">My Classes</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="mb-4 shadow">
        <Card.Body>
          <h4 className="mb-3">Create New Class</h4>
          <Form onSubmit={handleCreateClass}>
            <Form.Group className="mb-3" controlId="formClassName">
              <Form.Label>Class Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter class name"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                disabled={actionLoading}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" disabled={actionLoading}>
              {actionLoading ? 'Creating...' : 'Create Class'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <Card className="mb-4 shadow">
        <Card.Body>
          <h4 className="mb-3">Join a Class</h4>
          <Form onSubmit={handleJoinClass}>
            <Form.Group className="mb-3" controlId="formJoinCode">
              <Form.Label>Join Code</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter join code"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                disabled={actionLoading}
                required
              />
            </Form.Group>
            <Button variant="success" type="submit" disabled={actionLoading}>
              {actionLoading ? 'Joining...' : 'Join Class'}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      <h4 className="mb-3">All My Classes</h4>
      {allMyClasses.length === 0 ? (
        <Alert variant="info">You haven't created or joined any classes yet.</Alert>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {allMyClasses.map((cls) => (
            <Col key={cls.id}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <Card.Title>{cls.name}</Card.Title>
                  <Card.Text>
                    <strong>ID:</strong> {cls.id}
                    <br />
                    {cls.isCreator && <><strong>Join Code:</strong> {cls.join_code}<br/></>}
                    <strong>Role:</strong> {cls.isCreator ? 'Creator' : 'Member'}
                    <br />
                    <strong>Status:</strong> {cls.isCreator ? `Created: ${new Date(cls.created_at.toDate()).toLocaleDateString()}` : `Joined: ${cls.joined_at ? new Date(cls.joined_at.toDate()).toLocaleDateString() : 'N/A'}`}
                  </Card.Text>
                  {cls.isCreator && (
                    <Button variant="info" size="sm" className="me-2">
                      Manage Students
                    </Button>
                  )}
                  <Link to={`/classes/${cls.id}/assignments`} className="btn btn-primary btn-sm">
                    View Assignments
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default ClassesPage;