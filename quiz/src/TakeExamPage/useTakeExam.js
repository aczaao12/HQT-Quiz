import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { collection, doc, getDoc, getDocs, addDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { useUser } from '../context/UserContext';
import { shuffleArray } from '../utils/arrayUtils';

/**
 * Custom hook to encapsulate all state, side effects, and logic for the exam taking process.
 * @param {string} assignmentId - The ID of the current assignment.
 * @param {function} navigate - React Router's navigate function.
 */
export const useTakeExam = (assignmentId, navigate) => {
    const { user, userData, loading: userLoading } = useUser();
    
    // Core States
    const [assignment, setAssignment] = useState(null);
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({}); // {questionId: answer}
    
    // UI/Flow States
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [examLoading, setExamLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Timer State (in seconds)
    const [timeLeft, setTimeLeft] = useState(0); 
    const timerRef = useRef(null);

    // Current question index for navigation
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // =========================================================
    // 1. DATA FETCHING LOGIC
    // =========================================================

    const fetchAssignmentAndExamDetails = useCallback(async () => {
        if (!user || !assignmentId) return;

        setExamLoading(true);
        setError(null);

        try {
            // 1. Fetch Assignment
            const assignmentRef = doc(db, 'assignments', assignmentId);
            const assignmentSnap = await getDoc(assignmentRef);

            if (!assignmentSnap.exists()) {
                setError('Assignment not found.');
                setExamLoading(false);
                return;
            }
            const assignmentData = { id: assignmentSnap.id, ...assignmentSnap.data() };
            setAssignment(assignmentData);

            // 2. Fetch Exam Details
            const examRef = doc(db, 'exams', assignmentData.exam_id);
            const examSnap = await getDoc(examRef);
            if (!examSnap.exists()) {
                setError('Exam not found for this assignment.');
                setExamLoading(false);
                return;
            }
            const examData = { id: examSnap.id, ...examSnap.data() };
            setExam(examData);
            setTimeLeft(examData.duration * 60); // Initialize timer (minutes to seconds)

            // 3. Fetch questions (Assuming questions are subcollection of 'exams')
            const questionsQuery = query(collection(db, 'exams', examData.id, 'questions'));
            const questionsSnap = await getDocs(questionsQuery);
            let fetchedQuestions = questionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

            // 4. Handle random order
            if (assignmentData.is_random_order) {
                fetchedQuestions = shuffleArray(fetchedQuestions);
            }
            setQuestions(fetchedQuestions);

        } catch (err) {
            setError('Failed to fetch exam details: ' + err.message);
            console.error(err);
        } finally {
            setExamLoading(false);
        }
    }, [user, assignmentId]);

    // Effect to trigger data fetching
    useEffect(() => {
        if (user && assignmentId) {
            fetchAssignmentAndExamDetails();
        }
    }, [user, assignmentId, fetchAssignmentAndExamDetails]);


    // =========================================================
    // 3. SCORING AND SUBMISSION LOGIC
    // =========================================================

    const handleAnswerChange = useCallback((questionId, value) => {
        setAnswers((prevAnswers) => ({
            ...prevAnswers,
            [questionId]: value,
        }));
    }, []);

    const calculateScore = useCallback(() => {
        let score = 0;
        questions.forEach((q) => {
            if (q.type === 'multiple_choice' && answers[q.id] === q.correct_answer) {
                score += q.points;
            }
            // Add other scoring logic here if needed (e.g., fill_in exact match)
        });
        return score;
    }, [questions, answers]);
    
    const handleSubmitExam = useCallback(async (timeUp = false) => {
        if (submitting) return;

        setSubmitting(true);
        setError(null);
        clearTimeout(timerRef.current); // Stop timer

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

            if (attemptNumber > (assignment?.max_attempts || Infinity)) {
                setError("You have exceeded the maximum number of attempts for this exam.");
                setSubmitting(false);
                return;
            }

            await addDoc(collection(db, 'results'), {
                assignment_id: assignmentId,
                student_id: user.uid,
                submission_time: serverTimestamp(),
                score: finalScore,
                answers: answers, 
                attempt_number: attemptNumber,
                exam_title: exam?.title,
                student_name: userData?.name || user.email,
                time_up: timeUp,
                total_duration_minutes: exam?.duration,
                time_remaining_seconds: timeLeft,
            });

            setSuccess(timeUp ? 'Time up! Exam submitted automatically.' : 'Exam submitted successfully!');
            setTimeout(() => {
                navigate(`/classes/${assignment.class_id}/assignments`); 
            }, 2000);

        } catch (err) {
            setError('Failed to submit exam: ' + err.message);
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    }, [submitting, calculateScore, assignmentId, user, answers, assignment, exam, userData, navigate, timeLeft]);


    // =========================================================
    // 2. TIMER LOGIC
    // =========================================================

    useEffect(() => {
        if (timeLeft > 0 && !submitting && !examLoading) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0 && !examLoading && !submitting && exam) {
            const handleTimeoutSubmit = async () => {
                await handleSubmitExam(true);
            };
            handleTimeoutSubmit();
        }
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, examLoading, submitting, exam, handleSubmitExam]);


    // =========================================================
    // 4. MEMOIZED VALUES (Derived State)
    // =========================================================

    // Time Formatting
    const formatTime = useCallback((totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    // Progress Bar percentage (time remaining vs total duration)
    const totalDurationSeconds = useMemo(() => exam?.duration * 60, [exam?.duration]);

    const progressPercent = useMemo(() => {
        if (!totalDurationSeconds || totalDurationSeconds === 0) return 0;
        return (timeLeft / totalDurationSeconds) * 100;
    }, [timeLeft, totalDurationSeconds]);

    // Progress Bar Color based on percentage
    const timerColor = useMemo(() => {
        if (progressPercent > 50) return 'bg-green-500';
        if (progressPercent > 20) return 'bg-yellow-500';
        return 'bg-red-500';
    }, [progressPercent]);

    // **FIX** Answer progress: Explicitly check for non-empty string answer
    const answeredCount = useMemo(() => {
        return questions.filter(q => {
            const answerValue = answers[q.id];
            // Question is answered if the answer value is defined and not an empty string
            // This handles both multiple-choice (string value) and text/essay (non-empty string)
            return answerValue !== undefined && answerValue !== "";
        }).length;
    }, [questions, answers]);


    // =========================================================
    // 5. RETURN VALUES
    // =========================================================

    return {
        // Data
        assignment,
        exam,
        questions,
        answers,
        
        // State
        error,
        success,
        examLoading: userLoading || examLoading, // Combine user loading with exam loading
        submitting,
        timeLeft,
        currentQuestionIndex,
        
        // Handlers
        handleAnswerChange,
        handleSubmitExam,
        setCurrentQuestionIndex,
        
        // Derived values
        formatTime,
        progressPercent,
        timerColor,
        answeredCount,
        totalQuestions: questions.length,
        user,
    };
};