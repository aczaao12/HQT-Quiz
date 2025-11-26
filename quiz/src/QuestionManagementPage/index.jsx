import { useParams, useNavigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary'; // Import ErrorBoundary
import { useUser } from '../context/UserContext'; // Import useUser hook
import { useQuestionParser } from './useQuestionParser';
import { useQuestionsFirestore } from './useQuestionsFirestore';
import { useAutoCompletion } from './useAutoCompletion';
import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, ListGroup, InputGroup } from 'react-bootstrap';

const QuestionManagementPage = () => {
  const { user, loading: userLoading } = useUser();
  const { examId } = useParams();
  const navigate = useNavigate();

  // 1. Use Question Parser Hook
  const { rawInputText, setRawInputText, parsedQuestions, handlePointsChange, formatQuestionsToRawText, parseInputText } = useQuestionParser();

  // 2. Use Firestore Hook
  const {
    examTitle,
    fetchExamDetailsAndQuestions,
    handleSyncQuestions: syncQuestionsToFirestore, // Renamed to avoid conflict
    actionLoading: firestoreActionLoading,
    error: firestoreError,
    success: firestoreSuccess,
    setError: setFirestoreError,
    setSuccess: setFirestoreSuccess,
  } = useQuestionsFirestore(user, examId, parsedQuestions ); // Removed formatQuestionsToRawText from arguments

  // 3. Use Auto-completion Hook
  const { textareaRef, handleRawInputTextChange: autoCompletionHandleChange } = useAutoCompletion(rawInputText, setRawInputText);

  // Combine error and success states for display
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setError(firestoreError);
  }, [firestoreError]);

  useEffect(() => {
    setSuccess(firestoreSuccess);
  }, [firestoreSuccess]);

  useEffect(() => {
    setActionLoading(firestoreActionLoading);
  }, [firestoreActionLoading]);

  // Initial fetch and populate canvas
  useEffect(() => {
    if (user && examId) {
      const loadData = async () => {
        const fetchedQuestions = await fetchExamDetailsAndQuestions();
        if (fetchedQuestions) {
          setRawInputText(formatQuestionsToRawText(fetchedQuestions));
        }
      };
      loadData();
    }
  }, [user, examId, fetchExamDetailsAndQuestions, formatQuestionsToRawText, setRawInputText]);


  // Effect to re-parse input whenever rawInputText changes
  useEffect(() => {
    parseInputText();
  }, [rawInputText, parseInputText]);


  // Handle sync button click
  const handleSyncClick = async () => {
    await syncQuestionsToFirestore();
  };

  if (userLoading) {
    return (
      <Container className="text-center py-5">
        <p>Loading user data...</p>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="text-center py-5">
        <p>Please log in to manage questions.</p>
      </Container>
    );
  }

  return (
    <ErrorBoundary showDetails={true}>
      <Container fluid className="py-3">
  
        <h2 className="mb-3">Manage Questions for Exam: {examTitle || examId}</h2>
        <Button variant="secondary" onClick={() => navigate('/exams')} className="mb-3">
          Back to Exams
        </Button>
  
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
  
        <div className="border rounded p-0 mb-4 bg-light" style={{ height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
          <Row className="g-0" style={{ height: '100%' }}>
  
            {/* LEFT COLUMN */}
            <Col md={6} style={{ height: '100%' }}>
              <Card className="h-100 border-0 rounded-0">
                <Card.Body className="d-flex flex-column h-100">
                  <Card.Title>Input Questions (Canvas)</Card.Title>
                  <Form.Group className="mb-0 d-flex flex-column" style={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Form.Label className="d-none">Paste or type your questions here:</Form.Label>
                    <Form.Control
                      as="textarea"
                      ref={textareaRef}
                      value={rawInputText}
                      onChange={autoCompletionHandleChange}
                      style={{
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontFamily: "'Fira Code', 'Consolas', 'Monaco', monospace",
                        border: 'none',
                        padding: '15px',
                        boxShadow: 'none',
                        lineHeight: '1.5',
                        flexGrow: 1,
                        height: '100%',
                        overflowY: 'auto',
                        resize: 'none',
                      }}
                      placeholder={`Example:\nCâu 1: ...`}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
  
            {/* RIGHT COLUMN */}
            <Col md={6} style={{ height: '100%' }}>
              <Card className="h-100 border-0 rounded-0 border-start">
                <Card.Body className="d-flex flex-column h-100">
                  <Card.Title>Parsed Questions Preview</Card.Title>
  
                  <div
                    style={{
                      flexGrow: 1,
                      height: '100%',
                      overflowY: 'auto',
                    }}
                  >
                    {parsedQuestions.length === 0 ? (
                      <Alert variant="info">
                        No questions parsed yet. Type or paste into the canvas.
                      </Alert>
                    ) : (
                      <ListGroup className="mb-3">
                        {parsedQuestions.map((q, index) => (
                          <ListGroup.Item key={q._id || index}>
                            <div className="d-flex justify-content-between align-items-start">
                              <div className="flex-grow-1">
                                <strong>Câu {q.displayNumber || index + 1}:</strong> {q.text}
                                <br />
                                <small>Type: {q.type === 'multiple_choice' ? 'Multiple Choice' : q.type}</small>
  
                                {q.options.length > 0 && (
                                  <ListGroup variant="flush" className="mt-1">
                                    {q.options.map((opt, optIndex) => (
                                      <ListGroup.Item
                                        key={optIndex}
                                        className={opt === q.correct_answer ? 'fw-bold text-success' : ''}
                                      >
                                        {String.fromCharCode(65 + optIndex)}. {opt}
                                        {opt === q.correct_answer && ' (Correct)'}
                                      </ListGroup.Item>
                                    ))}
                                  </ListGroup>
                                )}
                              </div>
  
                              <InputGroup style={{ width: '120px' }} className="ms-2">
                                <Form.Control
                                  type="number"
                                  value={q.points}
                                  onChange={(e) => handlePointsChange(index, e.target.value)}
                                  min="1"
                                  max="1000"
                                />
                                <InputGroup.Text>points</InputGroup.Text>
                              </InputGroup>
                            </div>
                          </ListGroup.Item>
                        ))}
                      </ListGroup>
                    )}
                  </div>
  
                  <Button
                    variant="success"
                    onClick={handleSyncClick}
                    disabled={actionLoading}
                    className="w-100 mt-3"
                  >
                    {actionLoading ? 'Syncing Questions...' : `Sync ${parsedQuestions.length} Questions`}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
  
          </Row>
        </div>
      </Container>
    </ErrorBoundary>
  );
  
  
  
};

export default QuestionManagementPage;

