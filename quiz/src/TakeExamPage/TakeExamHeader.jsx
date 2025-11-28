import React from 'react';

const TakeExamHeader = ({
    exam,
    timeLeft,
    formatTime,
    answeredCount,
    questionsLength,
    progressPercent,
    timerColor,
    submitting,
    assignment,
    navigate,
    handleSubmitExam
}) => {
    const isLowTime = timeLeft <= 60;
    const progress = (answeredCount / questionsLength) * 100;

    return (
        <header className="sticky top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shadow-lg z-50 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-1.5 sm:py-4">
                {/* Mobile Layout - Horizontal & Compact */}
                <div className="flex md:hidden items-center justify-between gap-2">
                    {/* Timer - Compact */}
                    <div className="flex items-center gap-2 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                        <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className={`text-sm font-black ${isLowTime
                            ? 'text-rose-600 dark:text-rose-400 animate-pulse'
                            : 'text-indigo-700 dark:text-indigo-300'
                            }`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    {/* Progress - Compact */}
                    <div className="flex-1 flex items-center gap-2 min-w-0">
                        <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex-shrink-0">
                            <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                                {answeredCount}/{questionsLength}
                            </span>
                        </div>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden min-w-0">
                            <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out rounded-full"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>

                    {/* Actions - Compact */}
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => assignment && navigate(`/home`)}
                            className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg transition-all duration-200 border border-gray-200 dark:border-gray-700"
                            disabled={submitting}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </button>
                        <button
                            onClick={() => handleSubmitExam()}
                            className="px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                            disabled={submitting || questionsLength === 0}
                        >
                            {submitting ? '...' : 'Submit'}
                        </button>
                    </div>
                </div>

                {/* Desktop/Tablet Layout - Original */}
                <div className="hidden md:flex items-center justify-between gap-4">
                    {/* Timer with Circular Progress */}
                    <div className="relative flex-shrink-0">
                        <svg className="w-20 h-20 lg:w-24 lg:h-24 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-gray-200 dark:text-gray-700"
                            />
                            <circle
                                cx="50"
                                cy="50"
                                r="42"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray={`${2 * Math.PI * 42}`}
                                strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                                strokeLinecap="round"
                                className={`transition-all duration-500 ${isLowTime
                                    ? 'text-rose-500 dark:text-rose-400'
                                    : 'text-indigo-500 dark:text-indigo-400'
                                    }`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</span>
                            <span className={`text-lg lg:text-xl font-black transition-all duration-300 ${isLowTime
                                ? 'text-rose-600 dark:text-rose-400 animate-pulse'
                                : 'text-indigo-700 dark:text-indigo-300'
                                }`}>
                                {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>

                    {/* Exam Info */}
                    <div className="flex-1 text-left min-w-0">
                        <h1 className="text-xl lg:text-2xl font-extrabold text-gray-900 dark:text-white truncate mb-2">
                            {exam?.title || 'Online Examination'}
                        </h1>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
                                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                                    {answeredCount}/{questionsLength}
                                </span>
                            </div>
                            <div className="w-32 lg:w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out rounded-full"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <button
                            onClick={() => assignment && navigate(`/home`)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-700 text-sm"
                            disabled={submitting}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                        <button
                            onClick={() => handleSubmitExam()}
                            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none text-sm"
                            disabled={submitting || questionsLength === 0}
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Submitting...
                                </span>
                            ) : (
                                'Submit Exam'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TakeExamHeader;