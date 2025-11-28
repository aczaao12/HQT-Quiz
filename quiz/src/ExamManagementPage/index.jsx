import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useExamManagement } from './useExamManagement';
import DeleteExamModal from './DeleteExamModal';

const ExamCard = ({ exam, onDelete }) => {
  const createdAt = exam.created_at?.toDate ? new Date(exam.created_at.toDate()) : null;

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: '📝' },
      published: { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: '🚀' },
      archived: { color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400', icon: '📦' },
    };
    const config = statusConfig[status] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1.5">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      {/* Delete Button - Top Right Corner */}
      <button
        onClick={() => onDelete(exam)}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        title="Delete Exam"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      <div className="flex justify-between items-start mb-4 pr-8">
        <div>
          <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {exam.title}
          </h4>
          <div className="flex flex-col gap-0.5">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Created on {createdAt ? createdAt.toLocaleDateString() : 'N/A'}
            </p>
            {exam.class_name && (
              <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                {exam.class_name}
              </p>
            )}
          </div>
        </div>
        {getStatusBadge(exam.status)}
      </div>

      <div className="flex items-center gap-4 mb-6 text-sm text-gray-600 dark:text-gray-300">
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{exam.duration} mins</span>
        </div>
        <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-700/50 px-3 py-1.5 rounded-lg">
          <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
          <span>{exam.total_points} pts</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link to={`/exams/${exam.id}/questions`} className="flex items-center justify-center px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-300 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 rounded-lg transition-colors">
          Questions
        </Link>
        <Link to={`/exams/${exam.id}/assign`} className="flex items-center justify-center px-3 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 rounded-lg transition-colors">
          Assign
        </Link>
        <Link to={`/exams/${exam.id}/preview`} className="flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50 dark:hover:bg-gray-700 rounded-lg transition-colors">
          Preview
        </Link>
        <Link to={`/exams/${exam.id}/share`} className="flex items-center justify-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 dark:text-purple-300 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 rounded-lg transition-colors">
          Share
        </Link>
      </div>
    </div>
  );
};

const CreateExamForm = ({ onCreate, loading }) => {
  const [examTitle, setExamTitle] = useState('');
  const [examDuration, setExamDuration] = useState('');
  const [totalPoints, setTotalPoints] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    onCreate({ examTitle, examDuration, totalPoints });
    setExamTitle('');
    setExamDuration('');
    setTotalPoints('');
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 sticky top-24">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Exam</h3>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Exam Title</label>
          <input
            type="text"
            placeholder="e.g., Midterm Physics Exam"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Duration (min)</label>
            <input
              type="number"
              placeholder="60"
              value={examDuration}
              onChange={(e) => setExamDuration(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Total Points</label>
            <input
              type="number"
              placeholder="100"
              value={totalPoints}
              onChange={(e) => setTotalPoints(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Creating...
            </>
          ) : (
            <>
              <span>Create Exam</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

const ExamManagementPage = () => {
  const { user, loading } = useUser();
  const navigate = useNavigate();
  const { myCreatedExams, actionLoading, success, error, handleCreateExam, handleDeleteExam } = useExamManagement(user);

  // Delete modal state
  const [examToDelete, setExamToDelete] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');

  // Extract unique classes from exams
  const uniqueClasses = useMemo(() => {
    const classes = new Set();
    myCreatedExams.forEach(exam => {
      if (exam.assigned_classes && Array.isArray(exam.assigned_classes)) {
        exam.assigned_classes.forEach(cls => classes.add(cls));
      } else if (exam.class_name) {
        // Fallback if assigned_classes is missing but class_name exists
        classes.add(exam.class_name);
      }
    });
    return Array.from(classes).sort();
  }, [myCreatedExams]);

  // Filter exams
  const filteredExams = useMemo(() => {
    return myCreatedExams.filter(exam => {
      const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesClass = false;
      if (selectedClass === 'all') {
        matchesClass = true;
      } else {
        if (exam.assigned_classes && Array.isArray(exam.assigned_classes)) {
          matchesClass = exam.assigned_classes.includes(selectedClass);
        } else if (exam.class_name) {
          matchesClass = exam.class_name === selectedClass;
        }
      }

      return matchesSearch && matchesClass;
    });
  }, [myCreatedExams, searchTerm, selectedClass]);

  const handleDeleteClick = (exam) => {
    setExamToDelete(exam);
  };

  const handleConfirmDelete = async (examId) => {
    await handleDeleteExam(examId);
    setExamToDelete(null);
  };

  const handleCancelDelete = () => {
    setExamToDelete(null);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading your exams...</p>
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Authentication Required</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to manage your exams.</p>
      <Link to="/login" className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">
        Go to Login
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] font-sans pb-20">
      {/* Delete Modal */}
      {examToDelete && (
        <DeleteExamModal
          exam={examToDelete}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          isDeleting={actionLoading}
        />
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            </button>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Exam Management</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {myCreatedExams.length} Active Exams
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Create Form */}
          <div className="lg:col-span-1">
            <CreateExamForm onCreate={handleCreateExam} loading={actionLoading} />
          </div>

          {/* Right Column: Exam List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Exams</h2>

              {/* Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                {/* Search Input */}
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search exams..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-48 pl-9 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Class Filter */}
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full sm:w-40 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="all">All Classes</option>
                  {uniqueClasses.map(className => (
                    <option key={className} value={className}>{className}</option>
                  ))}
                </select>
              </div>
            </div>

            {success && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center gap-3 animate-fade-in">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {success}
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-3 animate-fade-in">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            {filteredExams.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-dashed border-gray-300 dark:border-gray-700">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                  📚
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Exams Found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                  {myCreatedExams.length === 0
                    ? "Get started by creating your first exam using the form on the left."
                    : "Try adjusting your search or filter criteria."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredExams.map(exam => (
                  <ExamCard key={exam.id} exam={exam} onDelete={handleDeleteClick} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamManagementPage;
