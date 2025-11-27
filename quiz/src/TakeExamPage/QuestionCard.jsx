import React from 'react';

const QuestionCard = ({
    question,
    currentAnswer,
    handleAnswerChange,
    actionLoading,
}) => {
    if (!question) {
        return <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg">No question data.</div>;
    }

    return (
        <div 
            key={question.id} 
            className={`bg-white dark:bg-gray-800 p-8 rounded-3xl transition-all duration-300 ease-in-out border border-transparent 
                ${currentAnswer 
                    ? 'shadow-xl shadow-indigo-100/50 dark:shadow-indigo-900/20 border-indigo-300 dark:border-indigo-600' 
                    : 'shadow-lg hover:shadow-xl dark:shadow-gray-700/20 hover:border-gray-300 dark:hover:border-gray-700'}`
            }
        >
            {/* Question Title and Points (Separated) */}
            <div className="flex justify-between items-start mb-6 pb-3 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                    Question
                </h3>
                <span className="text-md font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/50 px-4 py-1.5 rounded-full shadow-sm">
                    {question.points} Points
                </span>
            </div>
            
            {/* Question Text */}
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed font-medium">{question.text}</p>
            
            {/* Answer Input Area */}
            <div className="py-2">
                {question.type === 'multiple_choice' && (
                    <div className="space-y-4">
                        {question.options.map((option, oIndex) => (
                            <label 
                                key={oIndex} 
                                htmlFor={`question-${question.id}-option-${oIndex}`} 
                                className={`flex items-start p-4 border rounded-xl cursor-pointer transition-all duration-200 
                                    ${currentAnswer === option 
                                        ? 'bg-indigo-50 dark:bg-indigo-900/50 border-indigo-400 dark:border-indigo-600 shadow-inner' 
                                        : 'bg-gray-50 dark:bg-gray-700/30 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50'}`}
                            >
                                <input
                                    type="radio"
                                    id={`question-${question.id}-option-${oIndex}`}
                                    name={`question-${question.id}`}
                                    value={option}
                                    checked={currentAnswer === option}
                                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                    disabled={actionLoading}
                                    className="form-radio h-5 w-5 text-indigo-600 dark:text-indigo-400 mt-0.5 transition duration-150 ease-in-out focus:ring-indigo-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                                />
                                <span className="ml-4 text-base text-gray-800 dark:text-gray-200 select-none leading-relaxed">
                                    {option}
                                </span>
                            </label>
                        ))}
                    </div>
                )}
                
                {question.type === 'essay' && (
                    <textarea
                        rows={8}
                        value={currentAnswer}
                        placeholder="Write your detailed answer here..."
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        disabled={actionLoading}
                        className="block w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base resize-y text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700/50 transition duration-200"
                    ></textarea>
                )}
                
                {question.type === 'fill_in' && (
                    <input
                        type="text"
                        value={currentAnswer}
                        placeholder="Enter your short answer here..."
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        disabled={actionLoading}
                        className="block w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700/50 transition duration-200"
                    />
                )}
            </div>
        </div>
    );
};

export default QuestionCard;
