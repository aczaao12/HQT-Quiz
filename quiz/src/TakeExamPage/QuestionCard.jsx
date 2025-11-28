import React from 'react';

const QuestionCard = ({
    question,
    currentAnswer,
    handleAnswerChange,
    actionLoading,
}) => {
    if (!question) {
        return (
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <p className="text-gray-500 dark:text-gray-400">No question data.</p>
            </div>
        );
    }

    const isAnswered = currentAnswer && currentAnswer.trim() !== '';

    return (
        <div
            key={question.id}
            className={`relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl transition-all duration-300 border-2 ${isAnswered
                    ? 'shadow-2xl shadow-indigo-500/20 dark:shadow-indigo-900/40 border-indigo-300 dark:border-indigo-600'
                    : 'shadow-xl border-gray-200 dark:border-gray-700 hover:shadow-2xl hover:border-gray-300 dark:hover:border-gray-600'
                }`}
        >
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-bl-full -mr-4 -mt-4 blur-2xl" />

            {/* Question Header */}
            <div className="relative flex justify-between items-start mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white">
                        Question
                    </h3>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1 sm:py-2 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 rounded-full shadow-sm border border-indigo-100 dark:border-indigo-800">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                    <span className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300">
                        {question.points} Pts
                    </span>
                </div>
            </div>

            {/* Question Text */}
            <p className="text-gray-800 dark:text-gray-200 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8 leading-relaxed font-medium">
                {question.text}
            </p>

            {/* Answer Input Area */}
            <div className="space-y-2 sm:space-y-3">
                {question.type === 'multiple_choice' && (
                    <div className="space-y-2 sm:space-y-3">
                        {question.options.map((option, oIndex) => {
                            const isSelected = currentAnswer === option;
                            return (
                                <label
                                    key={oIndex}
                                    htmlFor={`question-${question.id}-option-${oIndex}`}
                                    className={`group relative flex items-start p-3 sm:p-4 md:p-5 border-2 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 ${isSelected
                                            ? 'bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-900/30 dark:to-violet-900/30 border-indigo-400 dark:border-indigo-500 shadow-lg shadow-indigo-100 dark:shadow-indigo-900/30'
                                            : 'bg-gray-50/50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md'
                                        }`}
                                >
                                    <div className="flex items-center h-5 sm:h-6">
                                        <input
                                            type="radio"
                                            id={`question-${question.id}-option-${oIndex}`}
                                            name={`question-${question.id}`}
                                            value={option}
                                            checked={isSelected}
                                            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                            disabled={actionLoading}
                                            className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 dark:text-indigo-500 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>
                                    <span className={`ml-3 sm:ml-4 text-sm sm:text-base select-none leading-relaxed transition-colors ${isSelected
                                            ? 'text-gray-900 dark:text-white font-semibold'
                                            : 'text-gray-700 dark:text-gray-300 font-medium'
                                        }`}>
                                        {option}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2">
                                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center shadow-lg">
                                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                )}

                {question.type === 'essay' && (
                    <textarea
                        rows={6}
                        value={currentAnswer}
                        placeholder="Write your detailed answer here..."
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        disabled={actionLoading}
                        className="block w-full p-3 sm:p-4 md:p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base resize-y text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700/50 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                )}

                {question.type === 'fill_in' && (
                    <input
                        type="text"
                        value={currentAnswer}
                        placeholder="Enter your short answer here..."
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        disabled={actionLoading}
                        className="block w-full p-3 sm:p-4 md:p-5 border-2 border-gray-200 dark:border-gray-700 rounded-xl sm:rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700/50 transition-all placeholder-gray-400 dark:placeholder-gray-500"
                    />
                )}
            </div>
        </div>
    );
};

export default QuestionCard;
