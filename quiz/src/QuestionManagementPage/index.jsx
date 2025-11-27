import { useParams, useNavigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary'; // Import ErrorBoundary
import { useUser } from '../context/UserContext'; // Import useUser hook
import { useQuestionParser } from './useQuestionParser';
import { useQuestionsFirestore } from './useQuestionsFirestore';
import { useAutoCompletion } from './useAutoCompletion';
import { useState, useEffect } from 'react';


const QuestionManagementPage = () => {
  const { user, loading: userLoading } = useUser();
  const { examId } = useParams();
  const navigate = useNavigate();

  // 1. Use Question Parser Hook
  const { rawInputText, setRawInputText, parsedQuestions, handlePointsChange, formatQuestionsToRawText, parseInputText } = useQuestionParser();

  // 2. Use Firestore Hook
  const {
    examTitle,
    fetchExamDetailsAndQuestions,
    handleSyncQuestions: syncQuestionsToFirestore, // Renamed to avoid conflict
    actionLoading: firestoreActionLoading,
    error: firestoreError,
    success: firestoreSuccess,
    setError: setFirestoreError,
    setSuccess: setFirestoreSuccess,
  } = useQuestionsFirestore(user, examId, parsedQuestions ); // Removed formatQuestionsToRawText from arguments

  // 3. Use Auto-completion Hook
  const { textareaRef, handleRawInputTextChange: autoCompletionHandleChange } = useAutoCompletion(rawInputText, setRawInputText);

  // Combine error and success states for display
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setError(firestoreError);
  }, [firestoreError]);

  useEffect(() => {
    setSuccess(firestoreSuccess);
  }, [firestoreSuccess]);

  useEffect(() => {
    setActionLoading(firestoreActionLoading);
  }, [firestoreActionLoading]);

  // Initial fetch and populate canvas
  useEffect(() => {
    if (user && examId) {
      const loadData = async () => {
        const fetchedQuestions = await fetchExamDetailsAndQuestions();
        if (fetchedQuestions) {
          setRawInputText(formatQuestionsToRawText(fetchedQuestions));
        }
      };
      loadData();
    }
  }, [user, examId, fetchExamDetailsAndQuestions, formatQuestionsToRawText, setRawInputText]);


  // Effect to re-parse input whenever rawInputText changes
  useEffect(() => {
    parseInputText();
  }, [rawInputText, parseInputText]);


  // Handle sync button click
  const handleSyncClick = async () => {
    await syncQuestionsToFirestore();
  };

  if (userLoading) {
    return (
      <div className="text-center py-5">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-5">
        <p>Please log in to manage questions.</p>
      </div>
    );
  }

  return (
    <ErrorBoundary showDetails={true}>
        {/* ĐÃ SỬA: Dùng h-screen, flex flex-col, và overflow-hidden để container chính chiếm trọn màn hình và ngăn cuộn. */}
        <div className="bg-gray-50 p-4 sm:p-6 lg:p-8 h-screen overflow-hidden flex flex-col">

            {/* HEADER & ACTION BUTTONS - Dùng flex-shrink-0 để đảm bảo không bị co lại */}
            <div className="flex justify-between items-center mb-6 border-b pb-4 flex-shrink-0">
                <h2 className="text-3xl font-extrabold text-gray-800">
                    Manage Questions for Exam: <span className="text-blue-600">{examTitle || examId}</span>
                </h2>
                <button
                    onClick={() => navigate('/exams')}
                    className="px-6 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-700 transition duration-200 shadow-md"
                >
                    Back to Exams
                </button>
            </div>

            {/* ALERTS - Dùng flex-shrink-0 để đảm bảo không bị co lại */}
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 flex-shrink-0" role="alert">{error}</div>}
            {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 flex-shrink-0" role="alert">{success}</div>}

            {/* MAIN CONTENT AREA - 2 COLUMNS - Dùng flex-grow để chiếm hết không gian còn lại */}
            <div 
                className="border border-gray-300 rounded-xl shadow-2xl bg-white flex-grow overflow-hidden" 
                // ĐÃ XÓA: Thuộc tính style height cố định (calc(100vh - 180px))
            >
                <div className="flex h-full">
                    
                    {/* LEFT COLUMN: TEXTAREA INPUT */}
                    <div className="w-full md:w-1/2 h-full flex flex-col border-r border-gray-300">
                        <h3 className="text-xl font-bold p-4 bg-gray-100 border-b border-gray-300 text-gray-800 flex-shrink-0">
                            📝 Input Questions (Canvas)
                        </h3>
                        <div className="flex-grow overflow-hidden">
                            <label className="sr-only">Paste or type your questions here:</label>
                            <textarea
                                ref={textareaRef}
                                value={rawInputText}
                                onChange={autoCompletionHandleChange}
                                // ĐÃ CÓ: overflow-y-auto cho thanh cuộn cột con
                                className="bg-white text-gray-900 font-mono border-none p-4 leading-relaxed w-full h-full resize-none focus:ring-0 focus:outline-none placeholder-gray-400 overflow-y-auto"
                                placeholder={`Example:\nCâu 1: Câu hỏi của bạn?\n[A] Lựa chọn A\n[B] Lựa chọn B\n[ANSWER] B`}
                            ></textarea>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PREVIEW & ACTIONS */}
                    <div className="w-full md:w-1/2 h-full flex flex-col">
                        <h3 className="text-xl font-bold p-4 bg-blue-50 border-b border-gray-300 text-gray-800 flex-shrink-0">
                            👀 Parsed Questions Preview
                        </h3>

                        {/* ĐÃ CÓ: overflow-y-auto cho thanh cuộn cột con */}
                        <div className="flex-grow overflow-y-auto p-4 space-y-4">
                            {parsedQuestions.length === 0 ? (
                                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg relative" role="alert">
                                    No questions parsed yet. Type or paste content into the input canvas.
                                </div>
                            ) : (
                                <ul className="list-none p-0 m-0">
                                    {parsedQuestions.map((q, index) => (
                                        <li key={q._id || index} className="border border-gray-200 bg-white p-4 mb-3 rounded-lg shadow-sm hover:shadow-md transition duration-150">
                                            <div className="flex justify-between items-start">
                                                {/* ĐÃ SỬA: Thêm text-left để đảm bảo căn lề trái rõ ràng */}
                                                <div className="flex-grow pr-4 text-left"> 
                                                    <strong className="text-lg text-gray-700">Câu {q.displayNumber || index + 1}:</strong> 
                                                    <span className="ml-1 text-gray-900">{q.text}</span>
                                                    <br />
                                                    <small className="text-sm text-gray-500">
                                                        Type: <span className="font-medium text-blue-600">
                                                            {q.type === 'multiple_choice' ? 'Multiple Choice' : q.type}
                                                        </span>
                                                    </small>

                                                    {/* OPTIONS */}
                                                    {q.options?.length > 0 && (
                                                        <ul className="mt-2 text-sm space-y-1 pl-4">
                                                            {q.options.map((opt, optIndex) => (
                                                                <li
                                                                    key={optIndex}
                                                                    className={opt === q.correct_answer ? 'font-semibold text-green-700' : 'text-gray-600'}
                                                                >
                                                                    {String.fromCharCode(65 + optIndex)}. {opt}
                                                                    {opt === q.correct_answer && <span className="ml-1 text-xs text-green-500">(Correct)</span>}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>

                                                {/* POINTS INPUT */}
                                                <div className="flex items-center ml-2 w-32 flex-shrink-0">
                                                    <input
                                                        type="number"
                                                        value={q.points || ''}
                                                        onChange={(e) => handlePointsChange(index, e.target.value)}
                                                        min="1"
                                                        max="1000"
                                                        className="w-full p-2 text-center border border-gray-300 rounded-l-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                                    />
                                                    <span className="inline-flex items-center px-3 rounded-r-lg border border-l-0 border-gray-300 bg-gray-100 text-gray-600 text-sm h-full py-2">
                                                        điểm
                                                    </span>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        
                        {/* SYNC BUTTON - Dùng flex-shrink-0 để đảm bảo không bị co lại */}
                        <div className="p-4 border-t border-gray-300 bg-white flex-shrink-0">
                            <button
                                onClick={handleSyncClick}
                                disabled={actionLoading || parsedQuestions.length === 0}
                                className="w-full px-4 py-3 bg-green-600 text-white font-extrabold text-lg rounded-lg hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            >
                                {actionLoading 
                                    ? 'Syncing Questions...' 
                                    : `Sync ${parsedQuestions.length} Questions to Exam`
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </ErrorBoundary>
);
  
  
};

export default QuestionManagementPage;

