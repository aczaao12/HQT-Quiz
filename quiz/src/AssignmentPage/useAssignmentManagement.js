import { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    serverTimestamp,
} from 'firebase/firestore';

export const useAssignmentManagement = (user, examId) => {
    const [exam, setExam] = useState(null);
    const [myCreatedClasses, setMyCreatedClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isRandomOrder, setIsRandomOrder] = useState(false);
    const [maxAttempts, setMaxAttempts] = useState(1);

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [shareableLink, setShareableLink] = useState(null);
    const [existingAssignments, setExistingAssignments] = useState([]);
    const [copiedLink, setCopiedLink] = useState(null);

    const fetchExamDetails = useCallback(async () => {
        try {
            const examRef = doc(db, 'exams', examId);
            const examSnap = await getDoc(examRef);
            if (examSnap.exists()) {
                setExam({ id: examSnap.id, ...examSnap.data() });
            } else {
                setError('Exam not found.');
            }
        } catch (err) {
            setError('Failed to fetch exam details: ' + err.message);
            console.error(err);
        }
    }, [examId]);

    const fetchMyCreatedClasses = useCallback(async () => {
        if (!user) return;
        try {
            const q = query(collection(db, 'classes'), where('teacher_id', '==', user.uid));
            const querySnapshot = await getDocs(q);
            const classes = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setMyCreatedClasses(classes);
            if (classes.length > 0) {
                setSelectedClassId(classes[0].id);
            }
        } catch (err) {
            setError('Failed to fetch my created classes: ' + err.message);
            console.error(err);
        }
    }, [user]);

    const fetchExistingAssignments = useCallback(async () => {
        if (!user || !examId || !selectedClassId) return;
        setActionLoading(true);
        setError(null);
        try {
            const q = query(
                collection(db, 'assignments'),
                where('exam_id', '==', examId),
                where('class_id', '==', selectedClassId)
            );
            const querySnapshot = await getDocs(q);
            const assignments = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                shareableLink: `${window.location.origin}/assignments/${doc.id}/take`
            }));
            setExistingAssignments(assignments);
        } catch (err) {
            setError('Failed to fetch existing assignments: ' + err.message);
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    }, [user, examId, selectedClassId]);

    const handleCreateAssignment = useCallback(async (e) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to create assignments.');
            return;
        }
        if (!selectedClassId || !examId || !startTime || !endTime) {
            setError('Please fill all required fields.');
            return;
        }
        if (new Date(startTime) >= new Date(endTime)) {
            setError('Start time must be before end time.');
            return;
        }

        setActionLoading(true);
        setError(null);
        setSuccess(null);
        setShareableLink(null);

        try {
            const docRef = await addDoc(collection(db, 'assignments'), {
                exam_id: examId,
                class_id: selectedClassId,
                start_time: new Date(startTime),
                end_time: new Date(endTime),
                is_random_order: isRandomOrder,
                max_attempts: Number(maxAttempts),
                created_at: serverTimestamp(),
            });
            setSuccess(`Exam "${exam?.title}" assigned to class successfully!`);
            const generatedLink = `${window.location.origin}/assignments/${docRef.id}/take`;
            setShareableLink(generatedLink);
            fetchExistingAssignments();
            // Reset form
            setStartTime('');
            setEndTime('');
            setIsRandomOrder(false);
            setMaxAttempts(1);
        } catch (err) {
            setError('Failed to create assignment: ' + err.message);
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    }, [user, examId, selectedClassId, startTime, endTime, isRandomOrder, maxAttempts, exam, fetchExistingAssignments]);

    const handleCopyLink = useCallback((link) => {
        navigator.clipboard.writeText(link);
        setCopiedLink(link);
        setTimeout(() => setCopiedLink(null), 2000);
    }, []);

    const handleClassCreated = useCallback((newClass) => {
        setMyCreatedClasses(prev => [...prev, newClass]);
        setSelectedClassId(newClass.id);
        setSuccess('Lớp học đã được tạo thành công!');
    }, []);

    useEffect(() => {
        if (user && examId) {
            fetchExamDetails();
            fetchMyCreatedClasses();
        }
    }, [user, examId, fetchExamDetails, fetchMyCreatedClasses]);

    useEffect(() => {
        if (user && examId && selectedClassId) {
            fetchExistingAssignments();
        }
    }, [user, examId, selectedClassId, fetchExistingAssignments]);

    return {
        exam,
        myCreatedClasses,
        selectedClassId,
        setSelectedClassId,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
        isRandomOrder,
        setIsRandomOrder,
        maxAttempts,
        setMaxAttempts,
        error,
        setError,
        success,
        setSuccess,
        actionLoading,
        shareableLink,
        existingAssignments,
        copiedLink,
        handleCreateAssignment,
        handleCopyLink,
        handleClassCreated,
    };
};
