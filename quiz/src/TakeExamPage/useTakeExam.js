import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { useAssignmentAndExamDetails } from './useAssignmentAndExamDetails';
import { useExamTimer } from './useExamTimer';
import { useExamSubmission } from './useExamSubmission';

/**
 * Custom hook to encapsulate all state, side effects, and logic for the exam taking process.
 * @param {string} assignmentId - The ID of the current assignment.
 * @param {function} navigate - React Router's navigate function.
 */
export const useTakeExam = (assignmentId, navigate) => {
    const { user, userData, loading: userLoading } = useUser();

    // Current question index for navigation
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    // Lifted state for error, success, and loading
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [examLoading, setExamLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const { assignment, exam, questions } = useAssignmentAndExamDetails(
        user,
        assignmentId,
        setError,
        setExamLoading
    );

    const { timeLeft, setTimeLeft } = useExamTimer(
        exam?.duration * 60, // initialTime
        examLoading,
        submitting
    );

    const { answers, handleAnswerChange, handleSubmitExam } = useExamSubmission(
        user,
        userData,
        assignmentId,
        assignment,
        exam,
        questions,
        navigate,
        timeLeft,
        setError,
        setSuccess,
        submitting,
        setSubmitting
    );

    // Auto-submit when time runs out
    useEffect(() => {
        if (timeLeft === 0 && !examLoading && !submitting && !success) {
            handleSubmitExam(true);
        }
    }, [timeLeft, examLoading, submitting, handleSubmitExam, success]);

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


    // Status derived state
    const status = useMemo(() => {
        if (examLoading) return 'loading';
        if (error) return 'error';
        return 'ready';
    }, [examLoading, error]);

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
        examLoading,
        userLoading, // Return raw userLoading
        status,      // Return derived status
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