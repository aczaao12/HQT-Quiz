import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTakeExam } from './useTakeExam';
import TakeExamHeader from './TakeExamHeader';
import QuestionCard from './QuestionCard';
import NavigationCard from './NavigationCard';
import { formatTime } from './formatTime';

const TakeExamPage = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();

    const { userLoading, status, error, questions, currentQuestionIndex, answers,
        handleAnswerChange, handleSubmitExam, setCurrentQuestionIndex, progressPercent,
        timerColor, timeLeft, assignment, exam, submitting } = useTakeExam(assignmentId, navigate);

    if (userLoading || status === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-900 dark:to-indigo-950 flex flex-col items-center justify-center p-4">
                <div className="relative">
                    {/* Animated spinner */}
                    <div className="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
                    {/* Inner glow */}
                    <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-violet-400 rounded-full animate-spin animation-delay-150 opacity-60"></div>
                </div>
                <p className="mt-6 text-lg font-semibold text-gray-700 dark:text-gray-300 animate-pulse">Loading Exam...</p>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please wait while we prepare your exam</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-900 dark:to-rose-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-rose-200 dark:border-rose-900 text-center space-y-6">
                    {/* Error Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-rose-500/50">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Oops! Something went wrong</h1>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{error}</p>
                    </div>

                    <button
                        onClick={() => navigate('/home')}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/50 hover:shadow-xl"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (!assignment || !exam || questions.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 text-center space-y-6">
                    {/* Empty State Icon */}
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>

                    <div>
                        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">No Questions Available</h1>
                        <p className="text-gray-600 dark:text-gray-300">This exam doesn't have any questions yet, or the exam could not be found.</p>
                    </div>

                    <button
                        onClick={() => navigate('/home')}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/50 hover:shadow-xl"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id] || '';

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50/50 via-white to-violet-50/50 dark:from-gray-950 dark:via-gray-900 dark:to-indigo-950/50">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] dark:opacity-[0.05] pointer-events-none" />

            <TakeExamHeader
                exam={exam}
                assignment={assignment}
                progressPercent={progressPercent}
                answeredCount={Object.keys(answers).length}
                questionsLength={questions.length}
                timeLeft={timeLeft}
                timerColor={timerColor}
                submitting={submitting}
                navigate={navigate}
                handleSubmitExam={handleSubmitExam}
                formatTime={formatTime}
            />

            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                    <NavigationCard
                        questions={questions}
                        answers={answers}
                        currentQuestionIndex={currentQuestionIndex}
                        setCurrentQuestionIndex={setCurrentQuestionIndex}
                        handleSubmitExam={handleSubmitExam}
                        actionLoading={submitting}
                    />

                    <div className="lg:col-span-3 space-y-6">
                        <QuestionCard
                            question={currentQuestion}
                            currentAnswer={currentAnswer}
                            handleAnswerChange={handleAnswerChange}
                            actionLoading={submitting}
                        />

                        {/* Navigation Buttons */}
                        <div className="flex justify-between items-center gap-4">
                            <button
                                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                                disabled={currentQuestionIndex === 0 || submitting}
                                className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                Previous
                            </button>

                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                Question {currentQuestionIndex + 1} of {questions.length}
                            </span>

                            <button
                                onClick={() => setCurrentQuestionIndex(Math.min(questions.length - 1, currentQuestionIndex + 1))}
                                disabled={currentQuestionIndex === questions.length - 1 || submitting}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/50 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                            >
                                Next
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TakeExamPage;