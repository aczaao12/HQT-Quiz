import { useParams, useNavigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';
import { useUser } from '../context/UserContext';
import { useQuestionParser } from './useQuestionParser';
import { useQuestionsFirestore } from './useQuestionsFirestore';
import { useAutoCompletion } from './useAutoCompletion';
import { useState, useEffect, useRef } from 'react';
import { parseExcelOrCSV, convertToQuizFormat } from './importHandlers/fileImporter';

const QuestionManagementPage = () => {
    const { user, loading: userLoading } = useUser();
    const { examId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    // 1. Use Question Parser Hook
    const { rawInputText, setRawInputText, parsedQuestions, handlePointsChange, formatQuestionsToRawText, parseInputText } = useQuestionParser();

    // 2. Use Firestore Hook
    const {
        examTitle,
        fetchExamDetailsAndQuestions,
        handleSyncQuestions: syncQuestionsToFirestore,
        actionLoading: firestoreActionLoading,
        error: firestoreError,
        success: firestoreSuccess,
    } = useQuestionsFirestore(user, examId, parsedQuestions);

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

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setActionLoading(true);
            const importedText = await parseExcelOrCSV(file);
            setRawInputText(prev => prev + (prev ? '\n\n' : '') + importedText);
            setSuccess('Questions imported successfully!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            setError('Failed to import file. Please check the format.');
            console.error(err);
            setTimeout(() => setError(null), 3000);
        } finally {
            setActionLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDownloadTemplate = () => {
        const headers = ['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Correct Answer', 'Points'];
        const sampleRow = ['What is the capital of France?', 'London', 'Berlin', 'Paris', 'Madrid', 'C', '10'];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + sampleRow.join(",");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "quiz_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (userLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-300">Loading editor...</p>
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
                <p className="text-gray-600 dark:text-gray-400 mb-6">Please log in to manage questions.</p>
                <button onClick={() => navigate('/login')} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors">
                    Go to Login
                </button>
            </div>
        );
    }

    return (
        <ErrorBoundary showDetails={true}>
            <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0f172a] font-sans flex flex-col h-screen overflow-hidden">
                {/* Navbar */}
                <nav className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-50">
                    <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
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
                                    Question Editor
                                </h1>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 truncate font-medium">
                                    {examTitle || examId}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                {parsedQuestions.length} Questions Parsed
                            </div>
                            <button
                                onClick={handleSyncClick}
                                disabled={actionLoading || parsedQuestions.length === 0}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 ${actionLoading || parsedQuestions.length === 0
                                    ? 'bg-gray-400 cursor-not-allowed opacity-70'
                                    : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:-translate-y-0.5'
                                    }`}
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span className="hidden sm:inline">Syncing...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                        <span className="hidden sm:inline">Save Changes</span>
                                        <span className="sm:hidden">Save</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Alerts Area */}
                <div className="flex-shrink-0 px-4 sm:px-6 lg:px-8 pt-4">
                    {error && (
                        <div className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 rounded-xl flex items-center gap-3 animate-fade-in border border-rose-100 dark:border-rose-900/30">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-xl flex items-center gap-3 animate-fade-in border border-emerald-100 dark:border-emerald-900/30">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {success}
                        </div>
                    )}
                </div>

                {/* Main Editor Area */}
                <div className="flex-grow flex flex-col md:flex-row overflow-hidden p-4 sm:p-6 lg:p-8 gap-6">

                    {/* Left Column: Editor */}
                    <div className="w-full md:w-1/2 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        {/* Toolbar */}
                        <div className="flex-shrink-0 px-4 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2 overflow-x-auto">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".xlsx, .xls, .csv"
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-sm font-medium whitespace-nowrap"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                Import Excel/CSV
                            </button>
                            <button
                                onClick={handleDownloadTemplate}
                                className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium whitespace-nowrap"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download Template
                            </button>
                            <div className="flex-grow"></div>
                            <span className="text-xs text-gray-400 font-mono hidden sm:inline">Markdown Supported</span>
                        </div>
                        <div className="flex-grow relative">
                            <textarea
                                ref={textareaRef}
                                value={rawInputText}
                                onChange={autoCompletionHandleChange}
                                className="absolute inset-0 w-full h-full p-4 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-mono text-sm leading-relaxed resize-none focus:ring-0 border-none focus:outline-none"
                                placeholder={`Example:\nCâu 1: What is the capital of France?\n[A] London\n[B] Berlin\n[C] Paris\n[D] Madrid\n[ANSWER] C`}
                                spellCheck="false"
                            ></textarea>
                        </div>
                    </div>

                    {/* Right Column: Preview */}
                    <div className="w-full md:w-1/2 flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-between items-center">
                            <h3 className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                Live Preview
                            </h3>
                        </div>

                        <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {parsedQuestions.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8 text-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
                                    <svg className="w-12 h-12 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                    <p>Start typing in the canvas to see your questions appear here.</p>
                                </div>
                            ) : (
                                parsedQuestions.map((q, index) => (
                                    <div key={q._id || index} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-grow">
                                                <div className="flex items-baseline gap-2 mb-2">
                                                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-md">
                                                        {q.displayNumber || index + 1}
                                                    </span>
                                                    <h4 className="text-gray-900 dark:text-white font-medium leading-snug">{q.text}</h4>
                                                </div>

                                                <div className="ml-8">
                                                    {q.type === 'multiple_choice' && (
                                                        <div className="space-y-1.5 mt-3">
                                                            {q.options?.map((opt, optIndex) => {
                                                                const isCorrect = opt === q.correct_answer;
                                                                return (
                                                                    <div
                                                                        key={optIndex}
                                                                        className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg border ${isCorrect
                                                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                                                                            : 'bg-gray-50 dark:bg-gray-700/30 border-transparent text-gray-600 dark:text-gray-400'
                                                                            }`}
                                                                    >
                                                                        <span className={`font-mono font-bold ${isCorrect ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                                            {String.fromCharCode(65 + optIndex)}.
                                                                        </span>
                                                                        <span>{opt}</span>
                                                                        {isCorrect && <svg className="w-4 h-4 ml-auto text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded uppercase tracking-wider">
                                                            {q.type === 'multiple_choice' ? 'Multiple Choice' : q.type}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0 flex flex-col items-end gap-1">
                                                <label className="text-xs font-medium text-gray-400 uppercase tracking-wide">Points</label>
                                                <input
                                                    type="number"
                                                    value={q.points || ''}
                                                    onChange={(e) => handlePointsChange(index, e.target.value)}
                                                    min="1"
                                                    max="1000"
                                                    className="w-16 p-1 text-center text-sm font-bold bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default QuestionManagementPage;

