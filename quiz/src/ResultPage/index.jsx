import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';

const ResultPage = () => {
    const { resultId } = useParams();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [exam, setExam] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchResultDetails = async () => {
            if (!resultId || typeof resultId !== 'string') {
                setError('Invalid result ID provided.');
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Fetch Result
                const resultRef = doc(db, 'results', resultId);
                const resultSnap = await getDoc(resultRef);

                if (!resultSnap.exists()) {
                    setError('Result not found.');
                    setLoading(false);
                    return;
                }
                const resultData = { id: resultSnap.id, ...resultSnap.data() };
                setResult(resultData);

                // Fetch Exam details
                const examId = resultData.exam_id;
                if (!examId) {
                    setError('Invalid exam ID in result data.');
                    setLoading(false);
                    return;
                }
                const examRef = doc(db, 'exams', examId);
                const examSnap = await getDoc(examRef);
                if (!examSnap.exists()) {
                    setError('Exam not found for this result.');
                    setLoading(false);
                    return;
                }
                const examData = { id: examSnap.id, ...examSnap.data() };
                setExam(examData);

                // 3. Get Questions (Snapshot or Fetch)
                if (resultData.questions && Array.isArray(resultData.questions) && resultData.questions.length > 0) {
                    // Use snapshot if available
                    setQuestions(resultData.questions);
                } else {
                    // Fallback: Fetch from exams collection (for old results)
                    const questionsQuery = query(collection(db, 'exams', examData.id, 'questions'), orderBy('created_at'));
                    const questionsSnap = await getDocs(questionsQuery);
                    const fetchedQuestions = questionsSnap.docs.map(qDoc => ({ id: qDoc.id, ...qDoc.data() }));
                    setQuestions(fetchedQuestions);
                }

            } catch (err) {
                console.error("Error fetching result details:", err);
                setError('Failed to load exam results: ' + err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchResultDetails();
    }, [resultId]);

    // --- Helpers & Derived State ---

    const getAccuracy = () => {
        if (!questions.length) return 0;
        const correctCount = questions.filter(q => {
            const userAnswer = result?.answers?.[q.id];
            return q.type === 'multiple_choice' && userAnswer === q.correct_answer;
        }).length;
        return Math.round((correctCount / questions.length) * 100);
    };

    const getTimeTaken = () => {
        if (!result || !result.total_duration_minutes) return 'N/A';
        // If we have time_remaining_seconds, we can calculate exact time taken
        // Assuming result.time_remaining_seconds exists
        if (result.time_remaining_seconds !== undefined) {
            const totalSeconds = result.total_duration_minutes * 60;
            const takenSeconds = totalSeconds - result.time_remaining_seconds;
            const mins = Math.floor(takenSeconds / 60);
            const secs = Math.floor(takenSeconds % 60);
            return `${mins}m ${secs}s`;
        }
        return 'N/A';
    };

    // --- Render ---

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Calculating your score...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-4">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Something went wrong</h2>
                    <p className="text-gray-600 dark:text-gray-300">{error}</p>
                    <button onClick={() => navigate('/dashboard')} className="w-full py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors">
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!result || !exam) return null;

    const accuracy = getAccuracy();
    const timeTaken = getTimeTaken();
    const isPass = accuracy >= 50; // Arbitrary pass mark, could be from exam settings

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] font-sans pb-20">
            {/* Navbar / Top Bar */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                            {exam.title}
                        </h1>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                        Completed on {result.submission_time?.toDate().toLocaleDateString()}
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Hero Score Card */}
                <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-gray-900/5">
                    <div className={`absolute top-0 left-0 w-full h-2 ${isPass ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-rose-400 to-red-500'}`}></div>
                    <div className="p-8 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                {result.student_name}
                            </div>
                            <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                                {isPass ? 'Great Job!' : 'Keep Practicing!'}
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md">
                                You have completed the exam. Review your performance statistics and detailed answers below.
                            </p>
                            <div className="pt-4 flex flex-wrap gap-3 justify-center md:justify-start">
                                <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
                                    Back to Dashboard
                                </button>
                                {/* Optional: Retry button if applicable */}
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <div className="relative w-48 h-48 sm:w-56 sm:h-56">
                                {/* Circular Progress Background */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="50%" cy="50%" r="45%" className="stroke-gray-200 dark:stroke-gray-700 fill-none" strokeWidth="12" />
                                    <circle
                                        cx="50%" cy="50%" r="45%"
                                        className={`${isPass ? 'stroke-emerald-500' : 'stroke-rose-500'} fill-none transition-all duration-1000 ease-out`}
                                        strokeWidth="12"
                                        strokeDasharray="283"
                                        strokeDashoffset={283 - (283 * accuracy) / 100}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl sm:text-6xl font-black text-gray-900 dark:text-white tracking-tighter">
                                        {accuracy}%
                                    </span>
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-1">Accuracy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    <StatCard
                        label="Total Score"
                        value={`${result.score} / ${exam.total_points || '?'}`}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="text-blue-600"
                        bg="bg-blue-50 dark:bg-blue-900/20"
                    />
                    <StatCard
                        label="Questions"
                        value={questions.length}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="text-purple-600"
                        bg="bg-purple-50 dark:bg-purple-900/20"
                    />
                    <StatCard
                        label="Time Taken"
                        value={timeTaken}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                        color="text-amber-600"
                        bg="bg-amber-50 dark:bg-amber-900/20"
                    />
                    <StatCard
                        label="Status"
                        value={isPass ? 'Passed' : 'Failed'}
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                        color={isPass ? 'text-emerald-600' : 'text-rose-600'}
                        bg={isPass ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}
                    />
                </div>

                {/* Detailed Review Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Detailed Review</h3>
                        <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center text-black dark:text-white"><span className="w-3 h-3 rounded-full bg-emerald-500 mr-2"></span>Correct</span>
                            <span className="flex items-center text-black dark:text-white"><span className="w-3 h-3 rounded-full bg-rose-500 mr-2"></span>Incorrect</span>
                            <span className="flex items-center text-black dark:text-white"><span className="w-3 h-3 rounded-full bg-gray-400 mr-2"></span>Skipped</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {questions.map((q, index) => {
                            const userAnswer = result.answers[q.id] ?? '';
                            const isCorrect = q.type === 'multiple_choice' ? (userAnswer === q.correct_answer) : null;
                            const isSkipped = userAnswer === '';

                            return (
                                <div
                                    key={q.id}
                                    className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 transition-all duration-200 hover:shadow-md ${isCorrect === true ? 'border-emerald-100 dark:border-emerald-900/30' :
                                        isCorrect === false ? 'border-rose-100 dark:border-rose-900/30' :
                                            'border-gray-100 dark:border-gray-700'
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center space-x-3">
                                            <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${isCorrect === true ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' :
                                                isCorrect === false ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                                                }`}>
                                                {index + 1}
                                            </span>
                                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">{q.text}</h4>
                                        </div>
                                        <div className="flex-shrink-0">
                                            {isCorrect === true && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">Correct</span>}
                                            {isCorrect === false && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300">Incorrect</span>}
                                            {isCorrect === null && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Review</span>}
                                        </div>
                                    </div>

                                    <div className="ml-11 space-y-3">
                                        {/* User Answer */}
                                        <div className={`p-4 rounded-xl ${isCorrect === true ? 'bg-emerald-50/50 dark:bg-emerald-900/10' :
                                            isCorrect === false ? 'bg-rose-50/50 dark:bg-rose-900/10' :
                                                'bg-gray-50 dark:bg-gray-700/30'
                                            }`}>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Answer</p>
                                            <p className={`font-medium ${isCorrect === true ? 'text-emerald-700 dark:text-emerald-300' :
                                                isCorrect === false ? 'text-rose-700 dark:text-rose-300' :
                                                    'text-gray-900 dark:text-white'
                                                }`}>
                                                {userAnswer || <span className="italic text-gray-400">No answer provided</span>}
                                            </p>
                                        </div>

                                        {/* Correct Answer (only if wrong) */}
                                        {isCorrect === false && q.type === 'multiple_choice' && (
                                            <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                                                <p className="text-sm text-blue-500 dark:text-blue-400 mb-1">Correct Answer</p>
                                                <p className="font-medium text-blue-700 dark:text-blue-300">{q.correct_answer}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
};

const StatCard = ({ label, value, icon, color, bg }) => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center sm:items-start sm:text-left transition-transform hover:scale-[1.02]">
        <div className={`p-3 rounded-xl ${bg} ${color} mb-4`}>
            {icon}
        </div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
);

export default ResultPage;