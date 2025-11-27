import React from 'react';

const NavigationCard = ({
    questions,
    answers,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    handleSubmitExam,
    actionLoading,
}) => {
    return (
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg space-y-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2">Question Navigation</h3>
            
            <div className="grid grid-cols-4 gap-3">
                {questions.map((q, index) => (
                    <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(index)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200
                            ${index === currentQuestionIndex
                                ? 'bg-indigo-600 text-white shadow-md'
                                : answers[q.id]
                                    ? 'bg-green-200 dark:bg-green-700 text-green-800 dark:text-white hover:bg-green-300 dark:hover:bg-green-600'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}
                            ${actionLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={actionLoading}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
                <button
                    onClick={() => handleSubmitExam(false)}
                    disabled={actionLoading}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {actionLoading ? 'Submitting...' : 'Submit All & Finish'}
                </button>
            </div>
        </div>
    );
};

export default NavigationCard;
