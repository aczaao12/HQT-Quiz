import React, { useState, useMemo } from 'react';
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useStatistics } from './useStatistics';

const StatCard = ({ stat }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all">
    <div className="flex justify-between items-start mb-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1" title={stat.exam_title}>
          {stat.exam_title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {stat.last_taken.toLocaleDateString('vi-VN')}
        </p>
      </div>
      <div className="text-right ml-2">
        <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
          {stat.max_score}
        </span>
        <p className="text-[10px] text-gray-500 uppercase">Cao nhất</p>
      </div>
    </div>

    <div className="flex gap-4 text-xs mb-3">
      <div>
        <span className="text-gray-500 dark:text-gray-400">Lần làm: </span>
        <span className="font-semibold text-gray-900 dark:text-white">{stat.attempt_count}</span>
      </div>
      <div>
        <span className="text-gray-500 dark:text-gray-400">TB: </span>
        <span className="font-semibold text-gray-900 dark:text-white">{stat.average_score}</span>
      </div>
    </div>

    <Link
      to={`/assignments/${stat.assignment_id}/take`}
      className="block w-full py-2 px-3 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-center rounded-lg font-medium transition-colors text-xs"
    >
      Làm lại
    </Link>
  </div>
);

const QuickActionCard = ({ to, title, icon, gradient, count }) => (
  <Link
    to={to}
    className="group relative bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700 transition-all overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 rounded-bl-full -mr-4 -mt-4`}></div>

    <div className="relative flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-0.5">
          {title}
        </h3>
        {count !== undefined && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {count} mục
          </p>
        )}
      </div>
      <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    </div>
  </Link>
);

const HomePage = () => {
  const navigate = useNavigate();
  const { user, userData, loading } = useUser();

  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState(7);
  const [selectedDate, setSelectedDate] = useState('');

  const filters = useMemo(() => ({
    days: timeRange,
    searchTerm: searchTerm,
    specificDate: selectedDate ? new Date(selectedDate) : null
  }), [timeRange, searchTerm, selectedDate]);

  const { stats, loading: statsLoading } = useStatistics(user, filters);

  const clearFilters = () => {
    setSearchTerm('');
    setTimeRange(7);
    setSelectedDate('');
  };

  const hasActiveFilters = searchTerm !== '' || timeRange !== 7 || selectedDate !== '';

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Compact Navbar */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-1.5 rounded-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                QuizMaster
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{userData?.name || user?.email}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userData?.role || 'Student'}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Đăng xuất"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Compact Hero */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-600 dark:from-indigo-700 dark:to-violet-700 rounded-2xl p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              {getGreeting()}, <span className="text-indigo-200">{userData?.name?.split(' ')[0] || 'Student'}!</span>
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base max-w-2xl">
              Sẵn sàng chinh phục thử thách mới? Truy cập lớp học và bài thi của bạn.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <QuickActionCard
            to="/home"
            title="Lớp học"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
            gradient="from-blue-500 to-cyan-500"
          />
          <QuickActionCard
            to="/exams"
            title="Bài thi"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
            gradient="from-emerald-500 to-teal-500"
          />
          <QuickActionCard
            to="/results"
            title="Kết quả"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
            gradient="from-purple-500 to-pink-500"
          />
          <QuickActionCard
            to="/profile"
            title="Hồ sơ"
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            gradient="from-orange-500 to-red-500"
          />
        </div>

        {/* Statistics Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Hoạt động gần đây
            </h2>
          </div>

          {/* Compact Filters */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Tìm quiz..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value={7}>7 ngày</option>
              <option value={30}>30 ngày</option>
            </select>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Stats Grid */}
          {statsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : stats.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <StatCard key={stat.assignment_id} stat={stat} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700 border-dashed">
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">Không có dữ liệu</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {hasActiveFilters ? 'Thử thay đổi bộ lọc' : 'Chưa có hoạt động nào'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
