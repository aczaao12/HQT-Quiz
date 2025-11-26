import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Form, Alert, ListGroup } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { db } from '../../firebase';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

const ExamPreviewPage = () => {
  const { user, loading } = useUser();
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [examLoading, setExamLoading] = useState(true);

  useEffect(() => {
    if (user && examId) {
      fetchExamDetailsAndQuestions();
    }
  }, [user, examId]);

  const fetchExamDetailsAndQuestions = async () => {
    setExamLoading(true);
    try {
      const examRef = doc(db, 'exams', examId);
      const examSnap = await getDoc(examRef);

      if (!examSnap.exists()) {
        setError('Exam not found.');
        setExamLoading(false);
        return;
      }
      const examData = { id: examSnap.id, ...examSnap.data() };
      setExam(examData);

      const questionsQuery = query(collection(db, 'exams', examData.id, 'questions'));
      const questionsSnap = await getDocs(questionsQuery);
      const fetchedQuestions = questionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuestions(fetchedQuestions);

    } catch (err) {
      setError('Failed to fetch exam details and questions: ' + err.message);
      console.error(err);
    } finally {
      setExamLoading(false);
    }
  };

  if (loading || examLoading) {
    return <Container className="text-center mt-5"><p>Loading exam preview...</p></Container>;
  }

  if (!user) {
    return <Container className="text-center mt-5"><p>Please log in to preview this exam.</p></Container>;
  }

  if (error) {
    return <Container className="text-center mt-5"><Alert variant="danger">{error}</Alert></Container>;
  }

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Exam Preview: {exam?.title}</h2>
      <p className="text-center">Duration: {exam?.duration} minutes | Total Points: {exam?.total_points}</p>

      <Button variant="secondary" onClick={() => navigate('/exams')} className="mb-4">Back to My Created Exams</Button>

      {questions.length === 0 ? (
        <Alert variant="info">No questions found for this exam.</Alert>
      ) : (
        <ListGroup className="mb-4">
          {questions.map((question, qIndex) => (
            <ListGroup.Item key={question.id} className="mb-3 shadow-sm">
              <Card.Title className="mb-3">
                Q{qIndex + 1}: {question.text} ({question.points} points)
              </Card.Title>
              {question.type === 'multiple_choice' && (
                <Form.Group>
                  <Form.Label>Options:</Form.Label>
                  {question.options.map((option, oIndex) => (
                    <Form.Check
                      key={oIndex}
                      type="radio"
                      id={`question-${question.id}-option-${oIndex}`}
                      name={`question-${question.id}`}
                      label={option}
                      checked={question.correct_answer === option}
                      readOnly
                      disabled // Disable interactions for preview
                    />
                  ))}
                  <Alert variant="success" className="mt-2">
                    Correct Answer: <strong>{question.correct_answer}</strong>
                  </Alert>
                </Form.Group>
              )}
              {(question.type === 'essay' || question.type === 'fill_in') && (
                <Form.Group>
                  <Form.Label>Type: {question.type.replace('_', ' ')}</Form.Label>
                  <Form.Control
                    as={question.type === 'essay' ? 'textarea' : 'input'}
                    rows={question.type === 'essay' ? 3 : 1}
                    readOnly
                    placeholder="This is a preview mode. No input is allowed."
                    disabled
                  />
                  {question.correct_answer && ( // Display correct answer if provided for essay/fill-in
                    <Alert variant="success" className="mt-2">
                      Model Answer: <strong>{question.correct_answer}</strong>
                    </Alert>
                  )}
                </Form.Group>
              )}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </Container>
  );
};

export default ExamPreviewPage;
