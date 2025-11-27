import React, { useState, useEffect } from 'react';

import { useUser } from '../context/UserContext';
import { db } from '../../firebase';
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';

const ExamPreviewPage = () => {
  const { user, loading } = useUser();
  const { examId } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const [examLoading, setExamLoading] = useState(true);

  useEffect(() => {
    if (user && examId) {
      fetchExamDetailsAndQuestions();
    }
  }, [user, examId]);

  const fetchExamDetailsAndQuestions = async () => {
    setExamLoading(true);
    try {
      const examRef = doc(db, 'exams', examId);
      const examSnap = await getDoc(examRef);

      if (!examSnap.exists()) {
        setError('Exam not found.');
        setExamLoading(false);
        return;
      }
      const examData = { id: examSnap.id, ...examSnap.data() };
      setExam(examData);

      const questionsQuery = query(collection(db, 'exams', examData.id, 'questions'));
      const questionsSnap = await getDocs(questionsQuery);
      const fetchedQuestions = questionsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setQuestions(fetchedQuestions);

    } catch (err) {
      setError('Failed to fetch exam details and questions: ' + err.message);
      console.error(err);
    } finally {
      setExamLoading(false);
    }
  };

  if (loading || examLoading) {
    return <div className="max-w-lg mx-auto mt-5 p-4 text-center"><p>Loading exam preview...</p></div>;
  }

  if (!user) {
    return <div className="max-w-lg mx-auto mt-5 p-4 text-center"><p>Please log in to preview this exam.</p></div>;
  }

  if (error) {
    return <div className="max-w-lg mx-auto mt-5 p-4 text-center"><div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div></div>;
  }

  return (
    <div className="w-full mt-5 p-4">
      <h2 className="text-center mb-4">Exam Preview: {exam?.title}</h2>
      <p className="text-center">Duration: {exam?.duration} minutes | Total Points: {exam?.total_points}</p>

      <button onClick={() => navigate('/exams')} className="mb-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Back to My Created Exams</button>

      {questions.length === 0 ? (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">No questions found for this exam.</div>
      ) : (
        <ul className="mb-4 space-y-4">
          {questions.map((question, qIndex) => (
            <li key={question.id} className="mb-3 p-4 border border-gray-200 rounded-lg shadow-sm bg-white">
              <h3 className="text-lg font-semibold mb-3">
                Q{qIndex + 1}: {question.text} ({question.points} points)
              </h3>
              {question.type === 'multiple_choice' && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Options:</label>
                  {question.options.map((option, oIndex) => (
                    <div key={oIndex} className="flex items-center mb-2">
                      <input
                        type="radio"
                        id={`question-${question.id}-option-${oIndex}`}
                        name={`question-${question.id}`}
                        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        checked={question.correct_answer === option}
                        readOnly
                        disabled // Disable interactions for preview
                      />
                      <label htmlFor={`question-${question.id}-option-${oIndex}`} className="ml-2 text-gray-700">{option}</label>
                    </div>
                  ))}
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-2" role="alert">
                    Correct Answer: <strong>{question.correct_answer}</strong>
                  </div>
                </div>
              )}
              {(question.type === 'essay' || question.type === 'fill_in') && (
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Type: {question.type.replace('_', ' ')}</label>
                  {question.type === 'essay' ? (
                    <textarea
                      rows={3}
                      readOnly
                      placeholder="This is a preview mode. No input is allowed."
                      disabled
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm resize-y"
                    ></textarea>
                  ) : (
                    <input
                      type="text"
                      readOnly
                      placeholder="This is a preview mode. No input is allowed."
                      disabled
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  )}
                  {question.correct_answer && ( // Display correct answer if provided for essay/fill-in
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-2" role="alert">
                      Model Answer: <strong>{question.correct_answer}</strong>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExamPreviewPage;
