import { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, query, getDocs, serverTimestamp, writeBatch, doc, getDoc } from 'firebase/firestore';

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
      const q = query(collection(db, 'exams', examId, 'questions'));
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
    console.log('handleSyncQuestions: Function entered.'); // Log at the very beginning
    if (!user) {
      console.log('handleSyncQuestions: User not logged in, returning early.');
      setError('You must be logged in to sync questions.');
      return;
    }
    if (!parsedQuestions || parsedQuestions.length === 0) {
      console.log('handleSyncQuestions: No parsed questions or parsedQuestions is empty, returning early. parsedQuestions:', parsedQuestions);
      setError('No questions parsed from input to sync. Add questions to the canvas.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    console.log('handleSyncQuestions: Starting sync process.');
    console.log('handleSyncQuestions: parsedQuestions received:', parsedQuestions);

    try {
      const batch = writeBatch(db);

      // Fetch current questions from Firestore for comparison
      const existingQuestionsSnapshot = await getDocs(query(collection(db, 'exams', examId, 'questions')));
      const existingQuestionsMap = new Map();
      existingQuestionsSnapshot.docs.forEach(docSnap => {
        existingQuestionsMap.set(docSnap.id, { id: docSnap.id, ...docSnap.data() });
      });
      console.log('handleSyncQuestions: Existing questions in Firestore:', Array.from(existingQuestionsMap.values()));


      // 1. Process Creates and Updates
      parsedQuestions.forEach(parsedQ => {
        const firestoreId = parsedQ.id; // This is the Firestore ID if it was an existing question
        const questionDataToSave = {
          displayNumber: parsedQ.displayNumber,
          text: parsedQ.text,
          type: parsedQ.type,
          options: parsedQ.options,
          correct_answer: parsedQ.correct_answer,
          points: parsedQ.points,
          // Do not include _id as it's a temp client-side ID
        };

        if (firestoreId && existingQuestionsMap.has(firestoreId)) {
          const existingQ = existingQuestionsMap.get(firestoreId);
          // Deep comparison for content changes
          const isContentChanged = JSON.stringify(existingQ.text) !== JSON.stringify(parsedQ.text) ||
                                   JSON.stringify(existingQ.type) !== JSON.stringify(parsedQ.type) ||
                                   JSON.stringify(existingQ.options) !== JSON.stringify(parsedQ.options) ||
                                   JSON.stringify(existingQ.correct_answer) !== JSON.stringify(parsedQ.correct_answer) ||
                                   JSON.stringify(existingQ.points) !== JSON.stringify(parsedQ.points) ||
                                   JSON.stringify(existingQ.displayNumber) !== JSON.stringify(parsedQ.displayNumber);
          
          if (isContentChanged) {
            batch.update(doc(db, 'exams', examId, 'questions', firestoreId), { ...questionDataToSave, updated_at: serverTimestamp() });
            console.log('handleSyncQuestions: Batched update for question:', firestoreId, questionDataToSave);
          }
          existingQuestionsMap.delete(firestoreId); // Mark as processed
        } else {
          const newQuestionRef = doc(collection(db, 'exams', examId, 'questions'));
          batch.set(newQuestionRef, { ...questionDataToSave, created_at: serverTimestamp() });
          console.log('handleSyncQuestions: Batched create for new question:', questionDataToSave);
        }
      });

      // 2. Process Deletes - any remaining in existingQuestionsMap were removed from canvas
      existingQuestionsMap.forEach((existingQ) => {
        batch.delete(doc(db, 'exams', examId, 'questions', existingQ.id));
        console.log('handleSyncQuestions: Batched delete for question:', existingQ.id);
      });

      await batch.commit();

      setSuccess(`Successfully synced ${parsedQuestions.length} questions to the exam!`);
      console.log('handleSyncQuestions: Batch commit successful.');
    } catch (err) {
      setError('Failed to sync questions: ' + err.message);
      console.error('handleSyncQuestions: Sync failed with error:', err); // Log full error object
    } finally {
      setActionLoading(false);
      console.log('handleSyncQuestions: Sync process finished.');
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
