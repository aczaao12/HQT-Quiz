import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Card, Form, Alert, ProgressBar } from 'react-bootstrap';
import { useUser } from '../context/UserContext';
import { db } from '../../firebase';
import { collection, doc, getDoc, getDocs, addDoc, query, where } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

const TakeExamPage = () => {
  const { user, userData, loading } = useUser();
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] = useState(null);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // {questionId: answer}
  const [error, setError] = useState(null);
  const [examLoading, setExamLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const timerRef = useRef(null);

  useEffect(() => {
    if (user && assignmentId) { // Rely only on user authentication
      fetchAssignmentAndExamDetails();
    }
  }, [user, assignmentId]); // Removed userData.role from dependency

  useEffect(() => {
    if (timeLeft > 0 && !submitting) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && !examLoading && !submitting) {
      handleSubmitExam(true); // Auto-submit when time runs out
    }
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, examLoading, submitting]);

  const fetchAssignmentAndExamDetails = async () => {
    setExamLoading(true);
    try {
      const assignmentRef = doc(db, 'assignments', assignmentId);
      const assignmentSnap = await getDoc(assignmentRef);

      if (!assignmentSnap.exists()) {
        setError('Assignment not found.');
        setExamLoading(false);
        return;
      }
      const assignmentData = { id: assignmentSnap.id, ...assignmentSnap.data() };
      setAssignment(assignmentData);

      // Fetch exam details
      const examRef = doc(db, 'exams', assignmentData.exam_id);
      const examSnap = await getDoc(examRef);
      if (!examSnap.exists()) {
        setError('Exam not found for this assignment.');
        setExamLoading(false);
        return;
      }
      const examData = { id: examSnap.id, ...examSnap.data() };
      setExam(examData);
      setTimeLeft(examData.duration * 60); // Convert minutes to seconds

      // Fetch questions
      const questionsQuery = query(collection(db, 'exams', examData.id, 'questions'));
      const questionsSnap = await getDocs(questionsQuery);
      let fetchedQuestions = questionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Handle random order if specified
      if (assignmentData.is_random_order) {
        fetchedQuestions = fetchedQuestions.sort(() => Math.random() - 0.5);
      }
      setQuestions(fetchedQuestions);
    } catch (err) {
      setError('Failed to fetch exam details: ' + err.message);
      console.error(err);
    } finally {
      setExamLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q) => {
      if (q.type === 'multiple_choice' && answers[q.id] === q.correct_answer) {
        score += q.points;
      }
      // For essay/fill_in, scoring would be manual or more complex.
      // For now, only multiple_choice contributes to auto-score.
    });
    return score;
  };

  const handleSubmitExam = async (timeUp = false) => {
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const finalScore = calculateScore();

      // Check attempt number
      const resultsQuery = query(
        collection(db, 'results'),
        where('assignment_id', '==', assignmentId),
        where('student_id', '==', user.uid)
      );
      const resultsSnap = await getDocs(resultsQuery);
      const attemptNumber = resultsSnap.docs.length + 1;

      if (attemptNumber > assignment.max_attempts) {
        setError("You have exceeded the maximum number of attempts for this exam.");
        setSubmitting(false);
        return;
      }

      await addDoc(collection(db, 'results'), {
        assignment_id: assignmentId,
        student_id: user.uid,
        submission_time: serverTimestamp(),
        score: finalScore,
        answers: answers, // Store all answers
        attempt_number: attemptNumber,
        exam_title: exam?.title, // Denormalize for easier viewing
        student_name: userData?.name, // Denormalize
        time_up: timeUp,
      });

      setSuccess(timeUp ? 'Time up! Exam submitted automatically.' : 'Exam submitted successfully!');
      setTimeout(() => {
        navigate(`/classes/${assignment.class_id}/assignments`); // Go back to assignments page
      }, 2000);
    } catch (err) {
      setError('Failed to submit exam: ' + err.message);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || examLoading) {
    return <Container className="text-center mt-5"><p>Loading exam...</p></Container>;
  }

  if (!user) { // Only check for authentication
    return <Container className="text-center mt-5"><p>Please log in to take this exam.</p></Container>;
  }

  if (error && !submitting) {
    return <Container className="text-center mt-5"><Alert variant="danger">{error}</Alert></Container>;
  }

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = (timeLeft / (exam.duration * 60)) * 100;

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-4">Taking Exam: {exam?.title}</h2>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4>Time Left: {formatTime(timeLeft)}</h4>
        <ProgressBar now={progressPercent} variant={progressPercent < 20 ? 'danger' : progressPercent < 50 ? 'warning' : 'info'} style={{ width: '50%' }} />
      </div>

      {submitting && <Alert variant="info">Submitting your exam...</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Form onSubmit={(e) => { e.preventDefault(); handleSubmitExam(); }}>
        {questions.length === 0 ? (
          <Alert variant="info">No questions found for this exam.</Alert>
        ) : (
          questions.map((question, qIndex) => (
            <Card key={question.id} className="mb-3 shadow-sm">
              <Card.Body>
                <Card.Title>
                  Q{qIndex + 1}: {question.text} ({question.points} points)
                </Card.Title>
                {question.type === 'multiple_choice' && (
                  <Form.Group>
                    {question.options.map((option, oIndex) => (
                      <Form.Check
                        key={oIndex}
                        type="radio"
                        id={`question-${question.id}-option-${oIndex}`}
                        name={`question-${question.id}`}
                        label={option}
                        value={option}
                        checked={answers[question.id] === option}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        disabled={submitting}
                      />
                    ))}
                  </Form.Group>
                )}
                {question.type === 'essay' && (
                  <Form.Group controlId={`question-${question.id}`}>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      disabled={submitting}
                    />
                  </Form.Group>
                )}
                {question.type === 'fill_in' && (
                  <Form.Group controlId={`question-${question.id}`}>
                    <Form.Control
                      type="text"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      disabled={submitting}
                    />
                  </Form.Group>
                )}
              </Card.Body>
            </Card>
          ))
        )}
        <Button variant="primary" type="submit" className="w-100 mt-4" disabled={submitting || questions.length === 0}>
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </Button>
      </Form>
    </Container>
  );
};

export default TakeExamPage;