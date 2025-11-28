import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { db } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import CreateClassModal from '../AssignmentPage/CreateClassModal';
import JoinClassModal from './JoinClassModal';

const ClassesPage = () => {
  const { user, loading } = useUser();
  const [allMyClasses, setAllMyClasses] = useState([]);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isLoadingClasses, setIsLoadingClasses] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllMyClasses();
    }
  }, [user]);

  const fetchAllMyClasses = async () => {
    if (!user) return;
    setIsLoadingClasses(true);
    try {
      // 1. Get classes created by me
      const createdClassesQuery = query(collection(db, 'classes'), where('teacher_id', '==', user.uid));
      const createdClassesSnapshot = await getDocs(createdClassesQuery);
      const created = createdClassesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), isCreator: true }));

      // 2. Get classes I joined
      // Note: Ideally, we should have a 'users/{uid}/joined_classes' collection or 'classes/{classId}/students/{uid}' 
      // querying 'classes' collection for all classes and checking subcollection is inefficient but matches original logic for now.
      // Optimization: In a real app, we should store joined class IDs in the user profile or a separate collection.
      // Keeping original logic for safety but refactoring structure.

      const joinedClassesList = [];
      const allClassesRef = collection(db, 'classes');
      const allClassesSnapshot = await getDocs(allClassesRef);

      // This is O(N) reads where N is total classes. Not scalable but works for small apps.
      // A better way would be `collectionGroup` query if data structure allowed, or storing `joined_classes` on user.
      // We will stick to the original logic's intent but maybe optimize slightly if possible? 
      // The original logic iterated ALL classes. Let's keep it simple for now to avoid breaking data model assumptions.

      const checkJoinPromises = allClassesSnapshot.docs.map(async (classDoc) => {
        if (created.some(cls => cls.id === classDoc.id)) return null; // Skip if created by me

        const studentSubcollectionRef = doc(db, 'classes', classDoc.id, 'students', user.uid);
        const studentDocSnap = await getDoc(studentSubcollectionRef);

        if (studentDocSnap.exists()) {
          return { id: classDoc.id, ...classDoc.data(), ...studentDocSnap.data(), isCreator: false };
        }
        return null;
      });

      const joinedResults = await Promise.all(checkJoinPromises);
      const joined = joinedResults.filter(Boolean);

      setAllMyClasses([...created, ...joined]);
    } catch (err) {
      setError('Không thể tải danh sách lớp học: ' + err.message);
      console.error(err);
    } finally {
      setIsLoadingClasses(false);
    }
  };

  const handleClassCreated = (newClass) => {
    // Add new class to list immediately
    setAllMyClasses(prev => [{ ...newClass, isCreator: true, created_at: { toDate: () => new Date() } }, ...prev]);
  };

  const handleClassJoined = (joinedClass) => {
    setAllMyClasses(prev => [...prev, joinedClass]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Đang tải...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Yêu cầu đăng nhập</h3>
        <p className="text-gray-600 dark:text-gray-400">Vui lòng đăng nhập để xem danh sách lớp học.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] font-sans pb-20">
      {/* Modals */}
      {showCreateModal && (
        <CreateClassModal
          user={user}
          onClose={() => setShowCreateModal(false)}
          onClassCreated={handleClassCreated}
        />
      )}
      {showJoinModal && (
        <JoinClassModal
          user={user}
          onClose={() => setShowJoinModal(false)}
          onClassJoined={handleClassJoined}
        />
      )}

      {/* Navbar / Header */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            Quản lý lớp học
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-4 py-2 rounded-xl font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="hidden sm:inline">Tham gia lớp</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Tạo lớp mới</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-3 mb-6 animate-fade-in border border-rose-100 dark:border-rose-900/30">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        {isLoadingClasses ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
            ))}
          </div>
        ) : allMyClasses.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Chưa có lớp học nào</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
              Bạn chưa tham gia hoặc tạo lớp học nào. Hãy bắt đầu bằng cách tạo một lớp mới hoặc tham gia lớp học có sẵn.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg"
              >
                Tạo lớp ngay
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allMyClasses.map((cls) => (
              <div
                key={cls.id}
                className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden flex flex-col"
              >
                <div className={`h-24 ${cls.isCreator ? 'bg-gradient-to-r from-indigo-500 to-violet-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'} p-6 relative`}>
                  <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/30">
                    {cls.isCreator ? 'Giáo viên' : 'Học sinh'}
                  </div>
                  <h3 className="text-xl font-bold text-white truncate shadow-sm">{cls.name}</h3>
                  <p className="text-white/80 text-sm truncate">{cls.description || 'Không có mô tả'}</p>
                </div>

                <div className="p-6 flex-grow flex flex-col gap-4">
                  <div className="space-y-3">
                    {cls.isCreator && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mã tham gia</span>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">
                            {cls.join_code}
                          </code>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {cls.isCreator
                        ? `Tạo ngày: ${cls.created_at?.toDate().toLocaleDateString('vi-VN')}`
                        : `Tham gia: ${cls.joined_at?.toDate().toLocaleDateString('vi-VN') || 'N/A'}`
                      }
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                    <Link
                      to={`/classes/${cls.id}/assignments`}
                      className="flex-1 text-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-xl font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                    >
                      Bài tập
                    </Link>
                    {cls.isCreator && (
                      <button className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors" title="Cài đặt">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClassesPage;