import { useState, useEffect, useRef } from 'react';

export const useExamTimer = (initialTime, examLoading, submitting, handleSubmitExam) => {
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const timerRef = useRef(null);

    // Update timeLeft when initialTime changes (e.g., when exam data is fetched)
    useEffect(() => {
        if (initialTime > 0) {
            setTimeLeft(initialTime);
        }
    }, [initialTime]);

    useEffect(() => {
        if (timeLeft > 0 && !submitting && !examLoading) {
            timerRef.current = setTimeout(() => {
                setTimeLeft(prevTime => prevTime - 1);
            }, 1000);
        } else if (timeLeft === 0 && !examLoading && !submitting) {
            // Only auto-submit if exam data is loaded and not already submitting
            handleSubmitExam(true); // Automatically submit when time runs out
        }
        return () => clearTimeout(timerRef.current);
    }, [timeLeft, examLoading, submitting, handleSubmitExam]);

    return { timeLeft, setTimeLeft, timerRef };
};