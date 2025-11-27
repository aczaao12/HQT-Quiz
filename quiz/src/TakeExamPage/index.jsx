import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTakeExam } from './useTakeExam';
import TakeExamHeader from './TakeExamHeader';
import QuestionCard from './QuestionCard';
import NavigationCard from './NavigationCard';
import { formatTime } from './formatTime';

const TakeExamPage = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();

    const { userLoading, status, error, questions, currentQuestionIndex, answers, 
            handleAnswerChange, handleSubmitExam, setCurrentQuestionIndex, progressPercent, 
            timerColor, timeLeft, assignment, exam, submitting } = useTakeExam(assignmentId, navigate);

    if (userLoading || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading Exam...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1>Error</h1>
                    <p>{error}</p>
                    <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
                </div>
            </div>
        );
    }

    if (!assignment || !exam || questions.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1>No Questions Available or Exam Not Found</h1>
                    <button onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion.id] || '';

    return (
        <div className="min-h-screen p-6 sm:p-10 bg-gray-50">
            <div className="max-w-7xl mx-auto space-y-8">
                <TakeExamHeader
                    exam={exam}
                    assignment={assignment}
                    progressPercent={progressPercent}
                    answeredCount={Object.keys(answers).length}
                    questionsLength={questions.length}
                    timeLeft={timeLeft}
                    timerColor={timerColor}
                    submitting={submitting}
                    navigate={navigate}
                    handleSubmitExam={handleSubmitExam}
                    formatTime={formatTime} // <--- Added this line
                />

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <NavigationCard
                        questions={questions}
                        answers={answers}
                        currentQuestionIndex={currentQuestionIndex}
                        setCurrentQuestionIndex={setCurrentQuestionIndex}
                        handleSubmitExam={handleSubmitExam}
                        actionLoading={submitting}
                    />

                    <div className="lg:col-span-3 space-y-6">
                        <QuestionCard
                            question={currentQuestion}
                            currentAnswer={currentAnswer}
                            handleAnswerChange={handleAnswerChange}
                            actionLoading={submitting}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TakeExamPage;