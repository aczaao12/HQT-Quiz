import { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, deleteDoc, documentId } from 'firebase/firestore';

export const useExamManagement = (user) => {
  const [myCreatedExams, setMyCreatedExams] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const fetchMyCreatedExams = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Fetch Exams
      const examsQuery = query(collection(db, 'exams'), where('teacher_id', '==', user.uid));
      const examsSnapshot = await getDocs(examsQuery);
      const exams = examsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 2. Fetch Classes (to get class names)
      const classesQuery = query(collection(db, 'classes'), where('teacher_id', '==', user.uid));
      const classesSnapshot = await getDocs(classesQuery);
      const classes = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const classesMap = classes.reduce((acc, cls) => {
        acc[cls.id] = cls;
        return acc;
      }, {});

      // 3. Fetch Assignments (to link exams to classes)
      // Note: In a real large app, we might want to optimize this. 
      // For now, we'll fetch assignments for the teacher's classes or exams.
      // Since we can't easily query "assignments for these exams" without batching,
      // and "assignments for these classes" might be easier if we have classes.

      // Let's try fetching assignments where class_id is in our classes list.
      // Firestore 'in' limit is 10. If teacher has > 10 classes, we need to batch or fetch all.
      // For simplicity in this scope, let's fetch all assignments and filter in memory 
      // (assuming assignments collection isn't huge, or we rely on security rules/indexing later).
      // A better approach for scalability: Store 'assigned_class_ids' in the exam document or use a subcollection.
      // But adhering to current structure:

      const assignmentsQuery = query(collection(db, 'assignments'));
      // Ideally: where('class_id', 'in', classIds) - but let's just fetch and filter for now to be safe against limits.
      // Or better: query assignments where exam_id is in our exam list.

      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const assignments = assignmentsSnapshot.docs.map(doc => doc.data());

      // 4. Map classes to exams
      const examsWithClasses = exams.map(exam => {
        const examAssignments = assignments.filter(a => a.exam_id === exam.id);
        const assignedClassNames = examAssignments
          .map(a => classesMap[a.class_id]?.name)
          .filter(Boolean); // Remove undefined if class not found

        // Deduplicate class names
        const uniqueClassNames = [...new Set(assignedClassNames)];

        return {
          ...exam,
          assigned_classes: uniqueClassNames,
          class_name: uniqueClassNames.join(', ') // For backward compatibility/display
        };
      });

      setMyCreatedExams(examsWithClasses);
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

  const handleDeleteExam = useCallback(async (examId) => {
    if (!user) {
      setError('You must be logged in to delete exams.');
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Delete all questions in the exam first
      const questionsQuery = query(collection(db, 'exams', examId, 'questions'));
      const questionsSnapshot = await getDocs(questionsQuery);

      const deletePromises = questionsSnapshot.docs.map(questionDoc =>
        deleteDoc(doc(db, 'exams', examId, 'questions', questionDoc.id))
      );
      await Promise.all(deletePromises);

      // Delete the exam itself
      await deleteDoc(doc(db, 'exams', examId));

      setSuccess('Exam deleted successfully!');
      fetchMyCreatedExams();
    } catch (err) {
      console.error(err);
      setError('Failed to delete exam: ' + err.message);
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
    handleDeleteExam,
    setError,
    setSuccess,
  };
};
