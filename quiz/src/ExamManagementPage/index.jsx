import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useExamManagement } from './useExamManagement';

const ExamCard = ({ exam }) => {
  const createdAt = exam.created_at?.toDate ? new Date(exam.created_at.toDate()) : null;

  const getStatusBadge = (status) => {
    const statusColors = {
      draft: 'bg-yellow-300 text-green-800',
      published: 'bg-green-300 text-green-900',
      archived: 'bg-red-300 text-red-900',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${statusColors[status] || 'bg-yellow-300 text-green-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-[#1e3a1e]/90 rounded-2xl p-6 shadow-lg flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h4 className="text-yellow-400 font-bold">{exam.title}</h4>
        {getStatusBadge(exam.status)}
      </div>
      <div className="flex flex-wrap gap-2 text-sm text-green-200">
        <div>⏱️ {exam.duration} minutes</div>
        <div>⭐ {exam.total_points} points</div>
        <div>📅 {createdAt ? createdAt.toLocaleDateString() : 'N/A'}</div>
      </div>
      <div className="flex gap-2 mt-2">
        <Link to={`/exams/${exam.id}/questions`} className="px-2 py-1 bg-green-700 text-yellow-400 rounded text-xs hover:bg-green-600">Questions</Link>
        <Link to={`/exams/${exam.id}/assign`} className="px-2 py-1 bg-green-700 text-yellow-400 rounded text-xs hover:bg-green-600">Assign</Link>
        <Link to={`/exams/${exam.id}/preview`} className="px-2 py-1 bg-green-700 text-yellow-400 rounded text-xs hover:bg-green-600">Preview</Link>
        <Link to={`/exams/${exam.id}/assign`} className="px-2 py-1 bg-green-700 text-yellow-400 rounded text-xs hover:bg-green-600">Generate Share Link</Link>
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
    <div className="bg-[#f0fdf4] p-6 rounded-2xl shadow-lg flex flex-col gap-6 w-full max-w-lg">
      <h3 className="text-2xl font-bold text-yellow-400">Create New Exam</h3>
      {error && <div className="text-red-600">{error}</div>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="flex flex-col">
          <span className="text-yellow-400 font-semibold">📝 Exam Title</span>
          <input
            type="text"
            placeholder="Enter exam title"
            value={examTitle}
            onChange={(e) => setExamTitle(e.target.value)}
            disabled={loading}
            className="mt-1 p-2 rounded-lg border border-green-800 focus:ring-2 focus:ring-green-700 bg-white text-black"
            required
          />
        </label>

        <label className="flex flex-col">
          <span className="text-yellow-400 font-semibold">⏱️ Duration (minutes)</span>
          <input
            type="number"
            placeholder="e.g., 60"
            value={examDuration}
            onChange={(e) => setExamDuration(e.target.value)}
            disabled={loading}
            className="mt-1 p-2 rounded-lg border border-green-800 focus:ring-2 focus:ring-green-700 bg-white text-black"
            required
          />
        </label>

        <label className="flex flex-col">
          <span className="text-yellow-400 font-semibold">⭐ Total Points</span>
          <input
            type="number"
            placeholder="e.g., 100"
            value={totalPoints}
            onChange={(e) => setTotalPoints(e.target.value)}
            disabled={loading}
            className="mt-1 p-2 rounded-lg border border-green-800 focus:ring-2 focus:ring-green-700 bg-white text-black"
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full bg-gradient-to-r from-green-800 to-green-600 text-yellow-400 font-semibold py-2 rounded-lg hover:shadow-lg transition"
        >
          {loading ? '⏳ Creating Exam...' : '🚀 Create Exam'}
        </button>
      </form>
    </div>
  );
};

const ExamManagementPage = () => {
  const { user, loading } = useUser();
  const { myCreatedExams, actionLoading, success, error, handleCreateExam } = useExamManagement(user);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-800"></div>
      <p className="mt-2">Loading...</p>
    </div>
  );

  if (!user) return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h3 className="text-xl font-bold">🔐 Authentication Required</h3>
      <p>Please log in to view this page.</p>
    </div>
  );

  return (
    <div className="p-6 bg-gradient-to-br from-[#f5f7fa] to-[#c3cfe2] min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-[#667eea] to-[#764ba2] text-transparent bg-clip-text">Exam Management</h1>
        <p className="text-gray-700 mt-2">Create and manage your exams with ease</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <CreateExamForm onCreate={handleCreateExam} loading={actionLoading} />

        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-2xl font-bold text-gray-800">My Created Exams</h3>
            <span className="px-3 py-1 bg-gradient-to-r from-pink-400 to-red-500 text-white rounded-full text-sm font-semibold">
              {myCreatedExams.length} exams
            </span>
          </div>

          {success && <div className="text-green-600">{success}</div>}
          {error && <div className="text-red-600">{error}</div>}

          {myCreatedExams.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-4xl mb-2">📚</div>
              <h4 className="font-bold mb-1">No Exams Yet</h4>
              <p>Create your first exam to get started!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[70vh] pr-2">
              {myCreatedExams.map(exam => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamManagementPage;
