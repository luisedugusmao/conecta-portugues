import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../firebase';
import { FileCheck, MessageSquare, Check, X, Clock, Gamepad2, CheckCircle, Star, XCircle, ArrowRight, AlertCircle, ChevronRight, RotateCcw, Sparkles, FileText } from 'lucide-react';
import { getExplanation } from '../services/gemini';
import { PremiumLock } from '../components/PremiumLock';

export const ViewSimulados = ({ student, quizzes, onCompleteQuiz, onFullScreenToggle }) => {
    // Core State
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [mySubmissions, setMySubmissions] = useState({});
    const [pendingStartQuiz, setPendingStartQuiz] = useState(null);
    const myChallenges = quizzes.filter(q => !q.assignedTo || q.assignedTo.length === 0 || q.assignedTo.includes(student.id));

    // Full Screen Toggle Effect
    useEffect(() => {
        if (onFullScreenToggle) {
            onFullScreenToggle(!!activeQuiz);
        }
        // Cleanup to ensure nav returns if component unmounts
        return () => {
            if (onFullScreenToggle) onFullScreenToggle(false);
        };
    }, [activeQuiz, onFullScreenToggle]);

    // Quiz Execution State
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { 0: "Option A", 1: "Option B" }
    const [currentSelectedOption, setCurrentSelectedOption] = useState(null); // Currently selected but not verified
    const [quizState, setQuizState] = useState('answering'); // 'answering', 'feedback', 'finished', 'review'
    const [timeLeft, setTimeLeft] = useState(null);
    const [feedbackStatus, setFeedbackStatus] = useState(null); // 'correct', 'incorrect'
    const [aiExplanation, setAiExplanation] = useState(null);
    const [isLoadingAI, setIsLoadingAI] = useState(false);

    // Load Submissions
    useEffect(() => {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'submissions'), where("studentId", "==", student.id));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const subs = {};
            snapshot.docs.forEach(doc => {
                const data = doc.data();
                subs[data.quizId] = { id: doc.id, ...data };
            });
            setMySubmissions(subs);
        });
        return () => unsubscribe();
    }, [student.id]);

    // Timer Logic
    useEffect(() => {
        if (timeLeft === null || quizState === 'finished' || quizState === 'review') return;
        if (timeLeft <= 0) {
            finishQuiz(true); // Auto-submit on timeout
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, quizState]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Start Quiz
    const startQuiz = (quiz) => {
        // ... (Logic to check status and permissions)
        const sub = mySubmissions[quiz.id];
        if (sub && sub.status === 'graded') {
            // View Results Mode
            setActiveQuiz(quiz);
            setQuizState('review');
            return;
        }
        if (sub && sub.status === 'pending') {
            alert("Este simulado aguarda correção.");
            return;
        }
        if (quiz.timeLimit && parseInt(quiz.timeLimit) > 0 && (!sub || sub.status !== 'completed')) {
            setPendingStartQuiz(quiz);
            return;
        }
        confirmStartQuiz(quiz);
    };

    const confirmStartQuiz = (quiz) => {
        setPendingStartQuiz(null);
        setActiveQuiz(quiz);
        setCurrentQIndex(0);
        setAnswers({});
        setQuizState('answering');
        setCurrentSelectedOption(null);
        setFeedbackStatus(null);
        setAiExplanation(null);
        setIsLoadingAI(false);

        const limit = quiz.timeLimit ? parseInt(quiz.timeLimit) : 0;
        if (!isNaN(limit) && limit > 0) {
            setTimeLeft(limit * 60);
        } else {
            setTimeLeft(null);
        }
    };

    // Interaction Logic
    const handleOptionSelect = (option) => {
        if (quizState === 'answering') {
            setCurrentSelectedOption(option);
        }
    };

    const handleVerifyAnswer = () => {
        if (!currentSelectedOption) return;

        const currentQuestion = activeQuiz.questions[currentQIndex];
        const isCorrect = currentQuestion.answer === currentSelectedOption;

        // Save answer temporarily
        setAnswers(prev => ({ ...prev, [currentQIndex]: currentSelectedOption }));

        setFeedbackStatus(isCorrect ? 'correct' : 'incorrect');
        setQuizState('feedback');

        // AI Explanation Call
        if (!currentQuestion.explanation) {
            setIsLoadingAI(true);
            getExplanation(currentQuestion.q, currentQuestion.answer, isCorrect, currentSelectedOption, currentQuestion.options)
                .then(text => setAiExplanation(text))
                .catch(err => console.error("AI Error", err))
                .finally(() => setIsLoadingAI(false));
        } else {
            setAiExplanation(currentQuestion.explanation);
        }
    };

    const handleNextQuestion = () => {
        if (currentQIndex < activeQuiz.questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
            setQuizState('answering');
            setCurrentSelectedOption(null);
            setFeedbackStatus(null);
            setAiExplanation(null);
            setIsLoadingAI(false);
        } else {
            finishQuiz();
        }
    };

    const finishQuiz = async (isTimeout = false) => {
        setQuizState('finished');
        setTimeLeft(null);

        // Calculate Score locally for immediate feedback
        let correctCount = 0;
        activeQuiz.questions.forEach((q, idx) => {
            const studentAnswer = answers[idx];
            // Note: For timeout, answers might be missing for unreached questions
            if (studentAnswer === q.answer) correctCount++;
        });

        const totalQ = activeQuiz.questions.length;
        const autoXP = Math.round((correctCount / totalQ) * activeQuiz.xpReward);
        const autoCoins = Math.round((correctCount / totalQ) * activeQuiz.coinReward);

        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'submissions'), {
                quizId: activeQuiz.id,
                quizTitle: activeQuiz.title,
                studentId: student.id,
                studentName: student.name,
                answers: answers,
                score: correctCount,
                totalQuestions: totalQ,
                status: 'pending', // Keeps pending for teacher review if needed, or could be 'completed' if fully auto
                submittedAt: serverTimestamp(),
                questions: activeQuiz.questions,
                xpAwarded: autoXP,
                autoXP: autoXP,
                autoCoins: autoCoins,
                maxXP: activeQuiz.xpReward,
                isTimeout: isTimeout
            });
            if (autoXP > 0) onCompleteQuiz(activeQuiz.id, autoXP, autoCoins);

            // BROADCAST TO FEED (Global Activity)
            // Only if score is good? Let's say > 70% or just completion
            if (activeQuiz.questions.length > 0) {
                const percent = (correctCount / activeQuiz.questions.length) * 100;
                if (percent >= 70) {
                    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'feed'), {
                        channel: 'activity-log',
                        title: '🏆 Novo Campeão!',
                        content: `Parabéns ${student.name} por completar o simulado "${activeQuiz.title}"!`,
                        xpEarned: autoXP,
                        coinsEarned: autoCoins,
                        quizTitle: activeQuiz.title,
                        authorId: student.id,
                        authorName: student.name,
                        authorAvatar: student.avatar || '👤',
                        role: 'system',
                        createdAt: serverTimestamp(),
                        reactions: {}
                    });
                }
            }

        } catch (error) {
            console.error("Error submitting:", error);
            alert("Erro ao salvar resultado. Verifique sua conexão.");
        }
    };

    // Render Helpers
    const getProgressColor = () => {
        const progress = ((currentQIndex) / activeQuiz.questions.length) * 100;
        return progress;
    };

    // --- MAIN RENDER ---
    if (activeQuiz) {

        // --- REVIEW MODE (Old logic preserved/adapted) ---
        if (quizState === 'review') {
            const sub = mySubmissions[activeQuiz.id];
            return (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col animate-slideUp">
                    {/* Header */}
                    <div className="bg-[#a51a8f] p-6 text-white flex justify-between items-center">
                        <h3 className="text-xl font-bold flex items-center gap-2"><FileCheck className="text-[#eec00a]" /> Resultado: {activeQuiz.title}</h3>
                        <button onClick={() => setActiveQuiz(null)} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
                    </div>
                    {/* Content (Simplified for brevity, similar to original) */}
                    <div className="p-6">
                        <div className="text-center mb-6">
                            <p className="text-4xl font-bold text-[#a51a8f]">{sub.score} / {sub.totalQuestions}</p>
                            <p className="text-slate-500">Acertos</p>
                        </div>
                        <div className="space-y-4">
                            {sub.questions.map((q, idx) => (
                                <div key={idx} className={`p-4 rounded-xl border-l-4 ${sub.answers[idx] === q.answer ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                    <p className="font-bold mb-1">{idx + 1}. {q.q}</p>
                                    <p className="text-sm">Sua resposta: {sub.answers[idx] || '-'}</p>
                                    {sub.answers[idx] !== q.answer && <p className="text-sm font-bold text-green-700">Correto: {q.answer}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        // --- TAKING QUIZ MODE ---
        // Progress Bar (Segmented)
        const totalQuestions = activeQuiz.questions.length;

        return (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden min-h-[600px] flex flex-col animate-slideUp relative">

                {/* Game Header */}
                <div className="p-6 flex items-center justify-between bg-white dark:bg-slate-800 z-10">
                    <button
                        onClick={() => { if (confirm("Sair do simulado? Seu progresso será perdido.")) setActiveQuiz(null) }}
                        className="p-2 -ml-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        <ArrowRight className="rotate-180" size={24} />
                    </button>

                    {/* Fun Progress Dashes */}
                    <div className="flex gap-1.5 flex-1 mx-6 justify-center max-w-sm">
                        {Array.from({ length: totalQuestions }).map((_, idx) => {
                            let statusColor = "bg-slate-200 dark:bg-slate-700"; // default
                            if (idx < currentQIndex) statusColor = "bg-[#a51a8f]"; // passed
                            if (idx === currentQIndex) statusColor = "bg-[#a51a8f] animate-pulse"; // current

                            // If we have answer history, we could color by correct/incorrect, but let's keep it simple "progress" for now
                            // Or, if (idx < currentQIndex), check if answer was right? 
                            // The current logic stores answers in `answers` state.
                            const ans = answers[idx];
                            if (ans && activeQuiz.questions[idx].answer === ans) statusColor = "bg-green-500";
                            else if (ans) statusColor = "bg-red-400";

                            return (
                                <div key={idx} className={`h-2.5 flex-1 rounded-full transition-all duration-500 ${statusColor}`} />
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-bold text-sm">
                        <div className="w-5 h-5 bg-yellow-400 border-2 border-yellow-200 rounded-full flex items-center justify-center text-[10px] text-white shadow-sm">
                            $
                        </div>
                        {activeQuiz.coinReward || 0}
                    </div>
                </div>

                {/* Main Game Area */}
                <div className="flex-1 px-6 md:px-12 flex flex-col w-full max-w-4xl mx-auto overflow-y-auto custom-scrollbar">

                    {quizState === 'finished' ? (
                        <div className="text-center py-10 animate-fadeIn my-auto">
                            <div className="w-32 h-32 bg-[#eec00a] rounded-full mx-auto flex items-center justify-center text-6xl mb-6 shadow-[0_10px_40px_-10px_rgba(238,192,10,0.5)] animate-bounce text-white">
                                <Star size={64} fill="white" />
                            </div>
                            <h3 className="text-4xl font-extrabold text-slate-800 dark:text-white mb-3">Simulado Finalizado!</h3>
                            <p className="text-lg text-slate-600 dark:text-slate-300 mb-10">Você completou todas as questões.</p>
                            <button onClick={() => finishQuiz()} className="bg-[#a51a8f] text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-[#8e167b] shadow-xl shadow-[#a51a8f]/30 hover:scale-105 transition-transform">
                                Ver Resultado Completo
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Question Container */}
                            <div className="mb-8 mt-4 text-center">
                                {/* Optional: Space for an image if the question had one */}
                                {/* <div className="h-40 bg-slate-100 rounded-2xl mb-6 flex items-center justify-center text-slate-400">
                                    <ImageIcon size={48} />
                                </div> */}

                                <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 dark:text-white leading-tight mb-4">
                                    {activeQuiz.questions[currentQIndex].q}
                                </h2>

                                {timeLeft !== null && (
                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                                        <Clock size={16} /> {formatTime(timeLeft)}
                                    </div>
                                )}
                            </div>


                            {/* Options 2x2 Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-20 md:mb-8">
                                {activeQuiz.questions[currentQIndex].options.map((opt, idx) => {
                                    const isSelected = currentSelectedOption === opt;
                                    const isFeedbackMode = quizState === 'feedback';
                                    const isCorrect = activeQuiz.questions[currentQIndex].answer === opt;

                                    // Fun Colors for A, B, C, D
                                    const colors = [
                                        { border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-600', letterBg: 'bg-purple-100' }, // A
                                        { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-600', letterBg: 'bg-blue-100' },     // B
                                        { border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-600', letterBg: 'bg-green-100' },   // C
                                        { border: 'border-orange-200', bg: 'bg-orange-50', text: 'text-orange-600', letterBg: 'bg-orange-100' }, // D
                                    ];
                                    const theme = colors[idx % 4];

                                    let cardClasses = `relative p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center gap-4 group hover:scale-[1.02] active:scale-95 `;

                                    if (isFeedbackMode) {
                                        if (isCorrect) {
                                            cardClasses += "border-green-500 bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500 ring-offset-2 dark:ring-offset-slate-800";
                                        } else if (isSelected && !isCorrect) {
                                            cardClasses += "border-red-500 bg-red-100 dark:bg-red-900/30 opacity-80";
                                        } else {
                                            cardClasses += "border-slate-100 dark:border-slate-700 opacity-40 grayscale";
                                        }
                                    } else if (isSelected) {
                                        cardClasses += `border-[#a51a8f] bg-[#fdf2fa] shadow-md ring-1 ring-[#a51a8f]`;
                                    } else {
                                        // Default "Fun" State
                                        cardClasses += `${theme.border} bg-white dark:bg-slate-800 dark:border-slate-700 hover:shadow-lg hover:border-[#a51a8f]/60`;
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionSelect(opt)}
                                            disabled={isFeedbackMode}
                                            className={cardClasses}
                                        >
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-sm transition-colors
                                                ${isSelected || (isFeedbackMode && isCorrect)
                                                    ? 'bg-[#a51a8f] text-white'
                                                    : `${theme.letterBg} ${theme.text} group-hover:bg-[#a51a8f] group-hover:text-white`
                                                }
                                            `}>
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <span className={`font-bold text-lg text-left leading-snug flex-1 ${isSelected ? 'text-[#a51a8f]' : 'text-slate-700 dark:text-slate-200'}`}>
                                                {opt}
                                            </span>

                                            {isFeedbackMode && isCorrect && <CheckCircle className="text-green-600 absolute top-4 right-4" size={24} fill="white" />}
                                            {isFeedbackMode && isSelected && !isCorrect && <XCircle className="text-red-500 absolute top-4 right-4" size={24} fill="white" />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback Overlay / Section */}
                            {quizState === 'feedback' && (
                                <div className="mb-6 animate-slideUp">
                                    <div className={`p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-start ${feedbackStatus === 'correct' ? 'bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-100' : 'bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100'}`}>
                                        <div className={`p-3 rounded-full shrink-0 ${feedbackStatus === 'correct' ? 'bg-green-200 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {feedbackStatus === 'correct' ? <Check size={24} /> : <X size={24} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-xl mb-1">
                                                {feedbackStatus === 'correct' ? 'Boa! Continue assim!' : 'Ah não... Resposta errada.'}
                                            </h4>

                                            {feedbackStatus === 'incorrect' && (
                                                <div className="mb-2 p-3 bg-white/50 dark:bg-black/20 rounded-xl inline-block">
                                                    <span className="text-sm font-bold opacity-70 block mb-1">Gabarito:</span>
                                                    <span className="font-bold text-lg">{activeQuiz.questions[currentQIndex].answer}</span>
                                                </div>
                                            )}

                                            <div className="text-base opacity-90 leading-relaxed mt-2 p-3 bg-white/40 dark:bg-black/10 rounded-xl">
                                                {isLoadingAI ? (
                                                    <p className="flex items-center gap-2"><Sparkles size={16} className="animate-spin" /> O professor IA está escrevendo uma dica...</p>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Sparkles size={18} className="shrink-0 mt-1 opacity-70" />
                                                        <p>{aiExplanation || activeQuiz.questions[currentQIndex].explanation || (feedbackStatus === 'correct' ? "Você mandou bem na lógica!" : "Revise este tópico com atenção.")}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </>
                    )}
                </div>

                {/* Footer Action Bar */}
                {quizState !== 'finished' && (
                    <div className="p-4 md:p-6 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-center sticky bottom-0 z-20">
                        {quizState === 'answering' ? (
                            <button
                                onClick={handleVerifyAnswer}
                                disabled={!currentSelectedOption}
                                className="w-full md:max-w-md bg-[#a51a8f] text-white py-4 rounded-2xl font-black text-lg hover:bg-[#8e167b] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed transition-all shadow-xl shadow-[#a51a8f]/20 hover:scale-[1.02] active:scale-95 uppercase tracking-wide flex items-center justify-center gap-3"
                            >
                                Verificar Resposta <CheckCircle size={24} className="opacity-50" />
                            </button>
                        ) : (
                            <button
                                onClick={handleNextQuestion}
                                className={`w-full md:max-w-md py-4 rounded-2xl font-black text-lg transition-all shadow-xl hover:scale-[1.02] active:scale-95 uppercase tracking-wide flex items-center justify-center gap-3
                                    ${feedbackStatus === 'correct' ? 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/30' : 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-slate-500/30'}
                                `}
                            >
                                {currentQIndex < activeQuiz.questions.length - 1 ? 'Continuar' : 'Ver Resultados'} <ArrowRight size={24} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // --- DASHBOARD VIEW (List of Quizzes) ---
    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <header>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Área de Simulados</h2>
                <p className="text-slate-500 dark:text-slate-400">Teste seus conhecimentos e ganhe prêmios</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myChallenges.map(quiz => {
                    const isCompleted = quiz.completedBy?.includes(student.id);
                    const sub = mySubmissions[quiz.id];
                    const isGraded = sub && sub.status === 'graded';
                    const isPending = sub && sub.status === 'pending'; // Submitted, waiting for teacher? Wait, we are submitting as pending now in new logic too? 
                    // Actually, if we auto-grade, maybe we don't need 'pending' unless teacher needs to review.
                    // For now, let's assume auto-graded quizzes are 'graded' instantly if we wanted, or we keep 'pending' if we want manual check.
                    // The new logic sets status='pending' initially. Let's keep it consistent.

                    const isExpired = quiz.deadline && new Date() > new Date(quiz.deadline);

                    return (
                        <div key={quiz.id} className={`bg-white dark:bg-slate-800 p-6 rounded-2xl border-2 transition-all ${isCompleted ? 'border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-900/10' : isExpired ? 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 grayscale opacity-80' : 'border-slate-100 dark:border-slate-700 hover:border-[#a51a8f]/50 shadow-md'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${isCompleted ? 'bg-green-200 text-green-700' : isExpired ? 'bg-slate-300 text-slate-500' : 'bg-[#fdf2fa] text-[#a51a8f] dark:bg-[#a51a8f]/20'}`}>
                                    <FileText className="w-6 h-6" />
                                </div>
                                {isPending ? (
                                    <span className="flex items-center gap-1 text-orange-600 font-bold text-sm bg-orange-100 px-2 py-1 rounded-full"><Clock size={14} /> Em Análise</span>
                                ) : isGraded ? (
                                    <span className="flex items-center gap-1 text-green-700 font-bold text-sm bg-white px-2 py-1 rounded-full shadow-sm"><CheckCircle size={14} /> Ver Nota</span>
                                ) : isCompleted ? (
                                    <span className="flex items-center gap-1 text-green-700 font-bold text-sm bg-white px-2 py-1 rounded-full shadow-sm"><CheckCircle size={14} /> Enviado</span>
                                ) : isExpired ? (
                                    <span className="flex items-center gap-1 text-slate-500 font-bold text-sm bg-slate-200 px-2 py-1 rounded-full"><Clock size={14} /> Encerrado</span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[#b89508] font-bold text-sm bg-[#fff9db] px-2 py-1 rounded-full border border-[#eec00a]">+{quiz.xpReward} XP</span>
                                )}
                            </div>

                            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
                                {quiz.title}
                                {quiz.challengeCode && <span className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">#{quiz.challengeCode}</span>}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 mt-2">Responda {quiz.questions?.length} questões para ganhar pontos.</p>

                            {quiz.timeLimit && parseInt(quiz.timeLimit) > 0 && (
                                <div className="flex items-center gap-1 text-xs text-orange-600 font-bold mb-2 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded w-fit">
                                    <Clock size={12} /> Limite: {quiz.timeLimit} min
                                </div>
                            )}

                            <PremiumLock user={student} feature="simulados">
                                <button
                                    onClick={() => startQuiz(quiz)}
                                    disabled={isExpired && !isCompleted}
                                    className={`w-full py-3 rounded-xl font-bold transition-colors shadow-lg
                                    ${isCompleted || isGraded
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : isExpired
                                                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                                : 'bg-[#a51a8f] text-white hover:bg-[#8e167b] shadow-[#a51a8f]/20'
                                        }`}
                                >
                                    {isGraded ? 'Ver Resultado' : isPending ? 'Aguardar Correção' : isCompleted ? 'Ver Envios' : isExpired ? 'Prazo Esgotado' : 'Começar'}
                                </button>
                            </PremiumLock>
                        </div>
                    );
                })}
                {myChallenges.length === 0 && (<p className="text-slate-400 col-span-full text-center py-10">Você não tem simulados disponíveis.</p>)}
            </div>

            {/* Start Quiz Confirm Modal */}
            {pendingStartQuiz && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-slideUp p-6 text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"><Clock size={32} className="text-yellow-600" /></div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Simulado com Tempo!</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">Este simulado tem um limite de <strong className="text-[#a51a8f]">{pendingStartQuiz.timeLimit} minutos</strong>.<br /><span className="text-xs mt-2 block">O cronômetro começa assim que você clicar em iniciar.</span></p>
                        <div className="flex gap-3">
                            <button onClick={() => setPendingStartQuiz(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">Cancelar</button>
                            <button onClick={() => confirmStartQuiz(pendingStartQuiz)} className="flex-1 py-3 bg-[#a51a8f] text-white rounded-xl font-bold hover:bg-[#7d126b] shadow-lg">Iniciar Agora</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
