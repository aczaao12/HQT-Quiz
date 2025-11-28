import React from 'react';

const AssignmentList = ({ existingAssignments, handleCopyLink, copiedLink }) => {
    return (
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bài tập đã giao</h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {existingAssignments.length} bài tập
                </span>
            </div>

            {existingAssignments.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
                    <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                        📋
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chưa có bài tập nào</h3>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                        Tạo bài tập đầu tiên bằng form bên trái
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {existingAssignments.map((assignment) => (
                        <div key={assignment.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mb-1">ID: {assignment.id}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{new Date(assignment.start_time.toDate()).toLocaleString()}</span>
                                        </div>
                                        <span>→</span>
                                        <div className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{new Date(assignment.end_time.toDate()).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-full">
                                        {assignment.max_attempts} lần
                                    </span>
                                    {assignment.is_random_order && (
                                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-full">
                                            🔀 Xáo trộn
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={assignment.shareableLink}
                                    className="flex-grow px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-900 dark:text-white font-mono"
                                />
                                <button
                                    onClick={() => handleCopyLink(assignment.shareableLink)}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                                >
                                    {copiedLink === assignment.shareableLink ? (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span className="hidden sm:inline">Đã sao chép!</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            <span className="hidden sm:inline">Sao chép</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssignmentList;
