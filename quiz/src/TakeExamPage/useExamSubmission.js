import { useState, useCallback } from 'react';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';

export const useExamSubmission = (user, userData, assignmentId, assignment, exam, questions, navigate, timeLeft, setError, setSuccess, submitting, setSubmitting) => {
    const [answers, setAnswers] = useState({}); // {questionId: answer}

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
        console.log("handleSubmitExam called. timeUp:", timeUp);
        if (submitting) {
            console.log("Already submitting, returning.");
            return;
        }

        setSubmitting(true);
        setError(null);
        // Note: clearTimeout is handled in useExamTimer

        try {
            const finalScore = calculateScore();
            console.log("Calculated finalScore:", finalScore);

            // Check attempt number
            const resultsQuery = query(
                collection(db, 'results'),
                where('assignment_id', '==', assignmentId),
                where('student_id', '==', user.uid)
            );
            const resultsSnap = await getDocs(resultsQuery);
            const attemptNumber = resultsSnap.docs.length + 1;
            console.log("Attempt number:", attemptNumber);

            if (attemptNumber > (assignment?.max_attempts || Infinity)) {
                setError("You have exceeded the maximum number of attempts for this exam.");
                setSubmitting(false);
                console.log("Max attempts exceeded.");
                return;
            }

            const resultData = {
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
                exam_id: exam?.id,
            };
            console.log("Attempting to add result data:", resultData);

            const resultRef = await addDoc(collection(db, 'results'), resultData);
            console.log("addDoc successful, resultRef.id:", resultRef.id);

            setSuccess(timeUp ? 'Time up! Exam submitted automatically.' : 'Exam submitted successfully!');
            setTimeout(() => {
                const navigateUrl = `/results/${resultRef.id}`;
                console.log("Navigating to:", navigateUrl);
                navigate(navigateUrl);
            }, 2000);

        } catch (err) {
            console.error("Error in handleSubmitExam:", err);
            setError('Failed to submit exam: ' + err.message);
        } finally {
            setSubmitting(false);
            console.log("Submission process finished.");
        }
    }, [submitting, calculateScore, assignmentId, user, answers, assignment, exam, userData, navigate, timeLeft, setError, setSuccess, setSubmitting]);

    return { answers, submitting, handleAnswerChange, handleSubmitExam, calculateScore };
};