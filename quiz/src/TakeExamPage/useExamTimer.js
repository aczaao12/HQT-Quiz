import { useState, useEffect, useRef } from 'react';

export const useExamTimer = (initialTime, examLoading, submitting) => {
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
        }
        // Auto-submit logic moved to parent to avoid circular dependency

        return () => clearTimeout(timerRef.current);
    }, [timeLeft, examLoading, submitting]);

    return { timeLeft, setTimeLeft, timerRef };
};