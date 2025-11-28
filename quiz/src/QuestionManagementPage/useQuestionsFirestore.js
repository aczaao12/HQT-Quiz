import { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, serverTimestamp, writeBatch, doc, getDoc, orderBy } from 'firebase/firestore';

export const useQuestionsFirestore = (user, examId, parsedQuestions) => {
  const [examTitle, setExamTitle] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExamDetailsAndQuestions = useCallback(async () => {
    if (!user || !examId) return;
    setError(null);
    try {
      // Fetch exam details
      const examRef = doc(db, 'exams', examId);
      const examSnap = await getDoc(examRef);
      if (examSnap.exists()) {
        setExamTitle(examSnap.data().title);
      } else {
        setError('Exam not found!');
        return;
      }

      // Fetch questions
      const q = query(collection(db, 'exams', examId, 'questions'),
        orderBy('displayNumber', 'asc') // <--- THÊM DÒNG NÀY
      );

      const querySnapshot = await getDocs(q);
      const fetchedQuestions = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

      return fetchedQuestions; // Return fetched questions for canvas population
    } catch (err) {
      setError('Failed to fetch exam details or existing questions: ' + err.message);
      console.error(err);
      return [];
    }
  }, [user, examId]);

  const handleSyncQuestions = useCallback(async () => {
    console.log('handleSyncQuestions: Function entered.');
    if (!user) {
      setError('You must be logged in to sync questions.');
      return;
    }
    if (!parsedQuestions || parsedQuestions.length === 0) {
      setError('No questions parsed from input to sync. Add questions to the canvas.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const batch = writeBatch(db);

      // Fetch current questions from Firestore for comparison
      const existingQuestionsSnapshot = await getDocs(query(collection(db, 'exams', examId, 'questions')));
      let existingQuestions = existingQuestionsSnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));

      console.log('handleSyncQuestions: Existing questions count:', existingQuestions.length);

      // 1. Process Creates and Updates using Content Matching (Smart Sync)
      parsedQuestions.forEach((parsedQ, index) => {
        // IMPORTANT: Use index-based displayNumber to preserve order
        const correctDisplayNumber = (index + 1).toString();

        const questionDataToSave = {
          displayNumber: correctDisplayNumber, // Always use position-based number
          text: parsedQ.text,
          type: parsedQ.type,
          options: parsedQ.options,
          correct_answer: parsedQ.correct_answer,
          points: parsedQ.points,
        };

        // Find a matching question in existing questions based on TEXT content
        // We use text as the primary key for "identity" in the absence of explicit IDs
        const matchIndex = existingQuestions.findIndex(eq => eq.text === parsedQ.text);

        if (matchIndex !== -1) {
          // MATCH FOUND: It's an update (or no-op)
          const existingQ = existingQuestions[matchIndex];
          const firestoreId = existingQ.id;

          // Check if ANY fields changed (including displayNumber for reordering)
          const isContentChanged =
            JSON.stringify(existingQ.options) !== JSON.stringify(parsedQ.options) ||
            JSON.stringify(existingQ.correct_answer) !== JSON.stringify(parsedQ.correct_answer) ||
            JSON.stringify(existingQ.points) !== JSON.stringify(parsedQ.points) ||
            existingQ.displayNumber !== correctDisplayNumber; // Compare with correct position-based number

          if (isContentChanged) {
            batch.update(doc(db, 'exams', examId, 'questions', firestoreId), { ...questionDataToSave, updated_at: serverTimestamp() });
            console.log('handleSyncQuestions: Batched update for question:', firestoreId, 'new displayNumber:', correctDisplayNumber);
          }

          // Remove from existingQuestions pool so we don't match it again (handling duplicates)
          existingQuestions.splice(matchIndex, 1);
        } else {
          // NO MATCH: It's a new question
          const newQuestionRef = doc(collection(db, 'exams', examId, 'questions'));
          batch.set(newQuestionRef, { ...questionDataToSave, created_at: serverTimestamp() });
          console.log('handleSyncQuestions: Batched create for new question with displayNumber:', correctDisplayNumber);
        }
      });

      // 2. Process Deletes - any remaining in existingQuestions were removed from canvas
      existingQuestions.forEach((existingQ) => {
        batch.delete(doc(db, 'exams', examId, 'questions', existingQ.id));
        console.log('handleSyncQuestions: Batched delete for question:', existingQ.id);
      });

      await batch.commit();

      setSuccess(`Successfully synced ${parsedQuestions.length} questions to the exam!`);
      console.log('handleSyncQuestions: Batch commit successful.');
    } catch (err) {
      setError('Failed to sync questions: ' + err.message);
      console.error('handleSyncQuestions: Sync failed with error:', err);
    } finally {
      setActionLoading(false);
    }
  }, [user, examId, parsedQuestions]);

  return {
    examTitle,
    fetchExamDetailsAndQuestions,
    handleSyncQuestions,
    actionLoading,
    error,
    success,
    setError,
    setSuccess
  };
};
