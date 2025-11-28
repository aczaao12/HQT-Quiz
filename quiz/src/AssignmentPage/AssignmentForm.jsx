import React from 'react';

const AssignmentForm = ({
    myCreatedClasses,
    selectedClassId,
    setSelectedClassId,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    maxAttempts,
    setMaxAttempts,
    isRandomOrder,
    setIsRandomOrder,
    actionLoading,
    onSubmit,
    onCreateClass,
}) => {
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 sticky top-24">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Tạo bài tập
            </h3>

            <form onSubmit={onSubmit} className="space-y-5">
                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chọn lớp</label>
                        <button
                            type="button"
                            onClick={onCreateClass}
                            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium flex items-center gap-1"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Tạo lớp mới
                        </button>
                    </div>
                    <select
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                        disabled={actionLoading}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    >
                        {myCreatedClasses.length === 0 ? (
                            <option value="">Chưa có lớp nào</option>
                        ) : (
                            myCreatedClasses.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))
                        )}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Thời gian bắt đầu
                        </label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            disabled={actionLoading}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Thời gian kết thúc
                        </label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            disabled={actionLoading}
                            required
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        Số lần làm tối đa
                    </label>
                    <input
                        type="number"
                        value={maxAttempts}
                        onChange={(e) => setMaxAttempts(Number(e.target.value))}
                        min="1"
                        disabled={actionLoading}
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <input
                        type="checkbox"
                        id="formRandomOrder"
                        checked={isRandomOrder}
                        onChange={(e) => setIsRandomOrder(e.target.checked)}
                        disabled={actionLoading}
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                    />
                    <label htmlFor="formRandomOrder" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Xáo trộn thứ tự câu hỏi
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={actionLoading || myCreatedClasses.length === 0}
                    className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-2 ${actionLoading || myCreatedClasses.length === 0
                        ? 'bg-gray-400 cursor-not-allowed opacity-70'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:-translate-y-0.5'
                        }`}
                >
                    {actionLoading ? (
                        <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Đang tạo...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Tạo bài tập
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default AssignmentForm;
