import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const ResultPage = () => {
    const { resultId } = useParams();
    const [result, setResult] = useState(null);
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResultDetails = async () => {
            console.log("ResultPage useEffect: resultId from useParams", resultId);

            if (!resultId || typeof resultId !== 'string') {
                console.error("Invalid resultId received in ResultPage:", resultId);
                setError('Invalid result ID provided.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Fetch Result
                console.log("Attempting to fetch result with ID:", resultId);
                const resultRef = doc(db, 'results', resultId);
                const resultSnap = await getDoc(resultRef);

                if (!resultSnap.exists()) {
                    setError('Result not found.');
                    setLoading(false);
                    return;
                }
                const resultData = { id: resultSnap.id, ...resultSnap.data() };
                setResult(resultData);
                console.log("Fetched resultData:", resultData);

                // Fetch Exam details using exam_id from result
                const examId = resultData.exam_id;
                if (!examId || typeof examId !== 'string') {
                    console.error("Invalid exam_id from resultData:", examId);
                    setError('Invalid exam ID in result data.');
                    setLoading(false);
                    return;
                }
                console.log("Attempting to fetch exam with ID:", examId);
                const examRef = doc(db, 'exams', examId);
                const examSnap = await getDoc(examRef);
                if (!examSnap.exists()) {
                    setError('Exam not found for this result.');
                    setLoading(false);
                    return;
                }
                const examData = { id: examSnap.id, ...examSnap.data() };
                setExam(examData);
                console.log("Fetched examData:", examData);

                // Fetch questions for the exam
                const questionsQuery = query(collection(db, 'exams', examData.id, 'questions'), orderBy('created_at'));
                const questionsSnap = await getDocs(questionsQuery);
                const fetchedQuestions = questionsSnap.docs.map(qDoc => ({ id: qDoc.id, ...qDoc.data() }));
                setQuestions(fetchedQuestions);
                console.log("Fetched questions:", fetchedQuestions.length);

            } catch (err) {
                console.error("Error fetching result details:", err);
                setError('Failed to load exam results: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResultDetails();
    }, [resultId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-xl text-gray-700 dark:text-gray-300">Loading results...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-xl text-red-600 dark:text-red-400">Error: {error}</p>
            </div>
        );
    }

    if (!result || !exam) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <p className="text-xl text-gray-700 dark:text-gray-300">No result data available.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 space-y-8">
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white text-center">Exam Result: {exam.title}</h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-6">
                    Student: {result.student_name} | Score: <span className="font-bold text-indigo-600 dark:text-indigo-400">{result.score}</span> / {exam.total_points || 'N/A'}
                </p>

                <div className="space-y-6">
                    {questions.map((q, index) => {
                        const userAnswer = result.answers[q.id] ?? '';
                        const isCorrect = q.type === 'multiple_choice' ? (userAnswer === (q.correct_answer ?? '')) : 'N/A'; // Extend for other types

                        return (
                            <div key={q.id} className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg shadow">
                                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
                                    Question {index + 1}: {q.text}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 mb-2">
                                    Your Answer: <span className="font-medium">{userAnswer || 'No Answer'}</span>
                                </p>
                                {q.type === 'multiple_choice' && (
                                    <p className="text-gray-600 dark:text-gray-300 mb-2">
                                        Correct Answer: <span className="font-medium">{q.correct_answer}</span>
                                    </p>
                                )}
                                <p className={`font-bold ${isCorrect === true ? 'text-green-600' : isCorrect === false ? 'text-red-600' : 'text-yellow-600'}`}>
                                    Status: {isCorrect === true ? 'Correct' : isCorrect === false ? 'Incorrect' : 'Not Applicable (e.g., Essay)'}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ResultPage;