import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../../firebase';
import { shuffleArray } from '../utils/arrayUtils';

export const useAssignmentAndExamDetails = (user, assignmentId, setError, setExamLoading) => {
    const [assignment, setAssignment] = useState(null);
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);

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
    }, [user, assignmentId, setExamLoading, setError]);

    // Effect to trigger data fetching
    useEffect(() => {
        if (user && assignmentId) {
            fetchAssignmentAndExamDetails();
        }
    }, [user, assignmentId, fetchAssignmentAndExamDetails]);

    return { assignment, exam, questions, fetchAssignmentAndExamDetails };
};