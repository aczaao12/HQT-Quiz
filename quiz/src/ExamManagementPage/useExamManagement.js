import { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

export const useExamManagement = (user) => {
  const [myCreatedExams, setMyCreatedExams] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const fetchMyCreatedExams = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'exams'), where('teacher_id', '==', user.uid));
      const snapshot = await getDocs(q);
      const exams = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMyCreatedExams(exams);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch exams: ' + err.message);
    }
  }, [user]);

  const handleCreateExam = useCallback(async ({ examTitle, examDuration, totalPoints }) => {
    if (!user) {
      setError('You must be logged in to create exams.');
      return;
    }

    if (!examTitle.trim() || !examDuration || !totalPoints) {
      setError('Please fill all fields.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const newExamRef = await addDoc(collection(db, 'exams'), {
        title: examTitle,
        teacher_id: user.uid,
        duration: Number(examDuration),
        total_points: Number(totalPoints),
        status: 'draft',
        created_at: serverTimestamp(),
      });
      setSuccess(`Exam "${examTitle}" created successfully. ID: ${newExamRef.id}`);
      fetchMyCreatedExams();
    } catch (err) {
      console.error(err);
      setError('Failed to create exam: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  }, [user, fetchMyCreatedExams]);

  useEffect(() => {
    if (user) fetchMyCreatedExams();
  }, [user, fetchMyCreatedExams]);

  return {
    myCreatedExams,
    actionLoading,
    success,
    error,
    handleCreateExam,
    setError,
    setSuccess,
  };
};
