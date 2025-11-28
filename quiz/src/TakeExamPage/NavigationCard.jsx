import React from 'react';

const NavigationCard = ({
    questions,
    answers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    handleSubmitExam,
    actionLoading,
}) => {
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = questions.length - answeredCount;
    const completionPercent = (answeredCount / questions.length) * 100;

    return (
        <div className="lg:col-span-1 space-y-4">
            {/* Progress Summary Card */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-lg border border-indigo-100 dark:border-indigo-800">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Progress
                </h3>

                <div className="space-y-3">
                    {/* Circular Progress */}
                    <div className="flex items-center justify-center">
                        <div className="relative w-24 h-24 sm:w-28 sm:h-28">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    className="text-gray-200 dark:text-gray-700"
                                />
                                <circle
                                    cx="50"
                                    cy="50"
                                    r="40"
                                    fill="none"
                                    stroke="url(#gradient)"
                                    strokeWidth="8"
                                    strokeDasharray={`${2 * Math.PI * 40}`}
                                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercent / 100)}`}
                                    strokeLinecap="round"
                                    className="transition-all duration-500"
                                />
                                <defs>
                                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                    {Math.round(completionPercent)}%
                                </span>
                                <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400 font-medium">Complete</span>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white dark:bg-gray-800 p-2 sm:p-2.5 rounded-xl shadow-sm">
                            <div className="flex items-center gap-1.5 mb-1">
                                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                                <span className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Answered</span>
                            </div>
                            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{answeredCount}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 sm:p-2.5 rounded-xl shadow-sm">
                            <div className="flex items-center gap-1.5 mb-1">
                                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                <span className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Remaining</span>
                            </div>
                            <p className="text-xl font-black text-gray-600 dark:text-gray-400">{unansweredCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Card */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-4 sm:p-5 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 sticky top-20 sm:top-24">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Questions
                </h3>

                {/* Question Navigation - Horizontal Scroll */}
                <div className="relative mb-4">
                    {/* Scroll Container */}
                    <div className="overflow-x-auto scrollbar-hide snap-x snap-mandatory">
                        <div className="flex gap-2 pb-2 min-w-min">
                            {questions.map((q, index) => {
                                const isAnswered = answers[q.id];
                                const isCurrent = index === currentQuestionIndex;

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestionIndex(index)}
                                        className={`relative flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-300 snap-center ${isCurrent
                                                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/50 scale-110 z-10 ring-2 ring-indigo-300 dark:ring-indigo-700'
                                                : isAnswered
                                                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 shadow-sm hover:scale-105'
                                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-sm hover:scale-105'
                                            } ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={actionLoading}
                                    >
                                        {index + 1}
                                        {isAnswered && !isCurrent && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center animate-scale-in">
                                                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Scroll Indicators */}
                    {questions.length > 5 && (
                        <>
                            <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-white dark:from-gray-800 to-transparent pointer-events-none" />
                            <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none" />
                        </>
                    )}
                </div>

                <button
                    onClick={() => handleSubmitExam(false)}
                    disabled={actionLoading}
                    className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/60 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 text-sm"
                >
                    {actionLoading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span className="hidden sm:inline">Submitting...</span>
                            <span className="sm:hidden">...</span>
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="hidden sm:inline">Submit All & Finish</span>
                            <span className="sm:hidden">Submit</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default NavigationCard;
