import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useAssignmentManagement } from './useAssignmentManagement';
import AssignmentForm from './AssignmentForm';
import AssignmentList from './AssignmentList';
import CreateClassModal from './CreateClassModal';

const AssignmentPage = () => {
  const { user, loading } = useUser();
  const { examId } = useParams();
  const navigate = useNavigate();
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);

  const {
    exam,
    myCreatedClasses,
    selectedClassId,
    setSelectedClassId,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    isRandomOrder,
    setIsRandomOrder,
    maxAttempts,
    setMaxAttempts,
    error,
    success,
    actionLoading,
    shareableLink,
    existingAssignments,
    copiedLink,
    handleCreateAssignment,
    handleCopyLink,
    handleClassCreated,
  } = useAssignmentManagement(user, examId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h3>
        <p className="text-gray-600 dark:text-gray-400">Please log in to view this page.</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center">
        <p className="text-gray-600 dark:text-gray-300">Loading exam details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] font-sans pb-20">
      {/* Create Class Modal */}
      {showCreateClassModal && (
        <CreateClassModal
          user={user}
          onClose={() => setShowCreateClassModal(false)}
          onClassCreated={handleClassCreated}
        />
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 overflow-hidden">
            <button
              onClick={() => navigate('/exams')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors flex-shrink-0"
              title="Back to Exams"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <div className="flex flex-col min-w-0">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
                Giao bài thi
              </h1>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate font-medium">
                {exam.title}
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* Alerts */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-3 mb-4 animate-fade-in border border-rose-100 dark:border-rose-900/30">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}
        {success && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center gap-3 mb-4 animate-fade-in border border-emerald-100 dark:border-emerald-900/30">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {success}
          </div>
        )}
        {shareableLink && (
          <div className="p-6 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 mb-4">
            <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              Link bài thi mới đã được tạo
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareableLink}
                className="flex-grow px-4 py-2.5 bg-white dark:bg-gray-800 border border-indigo-200 dark:border-indigo-700 rounded-xl text-sm text-gray-900 dark:text-white font-mono"
              />
              <button
                onClick={() => handleCopyLink(shareableLink)}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
              >
                {copiedLink === shareableLink ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Đã sao chép!
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Sao chép
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Create Form */}
          <div className="lg:col-span-1">
            <AssignmentForm
              myCreatedClasses={myCreatedClasses}
              selectedClassId={selectedClassId}
              setSelectedClassId={setSelectedClassId}
              startTime={startTime}
              setStartTime={setStartTime}
              endTime={endTime}
              setEndTime={setEndTime}
              maxAttempts={maxAttempts}
              setMaxAttempts={setMaxAttempts}
              isRandomOrder={isRandomOrder}
              setIsRandomOrder={setIsRandomOrder}
              actionLoading={actionLoading}
              onSubmit={handleCreateAssignment}
              onCreateClass={() => setShowCreateClassModal(true)}
            />
          </div>

          {/* Right Column: Existing Assignments */}
          <AssignmentList
            existingAssignments={existingAssignments}
            handleCopyLink={handleCopyLink}
            copiedLink={copiedLink}
          />
        </div>
      </main>
    </div>
  );
};

export default AssignmentPage;