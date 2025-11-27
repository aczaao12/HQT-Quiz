import React from 'react';

// This component uses values returned from useExamLogic hook
const TakeExamHeader = ({ 
    exam, 
    timeLeft, 
    formatTime, 
    answeredCount, 
    totalQuestions, 
    progressPercent, 
    timerColor, 
    submitting, 
    assignment, 
    navigate,
    handleSubmitExam // Thêm handler vào props
}) => {
    return (
        <header className="fixed top-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-xl z-50 p-4 border-b border-indigo-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-14">
                
                {/* Timer (Tonal/Prominent) */}
                <div className="flex flex-col items-start text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50 shadow-inner">
                    <p className="text-xs font-medium uppercase tracking-wider text-indigo-500 dark:text-indigo-500">Time Left</p>
                    <p className={`text-3xl font-extrabold transition-colors duration-500 ${timeLeft <= 60 ? 'text-red-600 dark:text-red-400 animate-pulse' : 'text-indigo-700 dark:text-indigo-400'}`}>
                        {formatTime(timeLeft)}
                    </p>
                </div>

                {/* Exam Info / Progress (Clean/Centered) */}
                <div className="flex-grow mx-4 md:mx-12 text-center">
                    <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white truncate">
                        {exam?.title || 'Online Examination'}
                    </h1>
                    <div className="mt-1 flex items-center justify-center space-x-4">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            Completed: {answeredCount}/{totalQuestions}
                        </span>
                        {/* Progress Bar (Sleeker) */}
                        <div className="w-40 bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                            <div
                                className={`h-2.5 rounded-full transition-all duration-1000 ease-in-out ${timerColor}`}
                                style={{ width: progressPercent + '%' }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Actions (Elevated Buttons) */}
                <div className="flex space-x-3">
                    <button
                        onClick={() => assignment && navigate(`/classes/${assignment.class_id}/assignments`)}
                        className="flex items-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 rounded-xl transition duration-300 shadow-md text-sm border border-gray-300 dark:border-gray-600"
                        disabled={submitting}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back
                    </button>
                    <button
                        onClick={() => handleSubmitExam()}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl transition duration-300 shadow-lg shadow-indigo-500/50 text-sm disabled:bg-indigo-400"
                        disabled={submitting || totalQuestions === 0}
                    >
                        {submitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default TakeExamHeader;