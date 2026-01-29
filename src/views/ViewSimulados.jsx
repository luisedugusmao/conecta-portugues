import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../firebase';
import { FileCheck, MessageSquare, Check, X, Clock, Gamepad2, CheckCircle, Star, XCircle, ArrowRight, AlertCircle, ChevronRight, RotateCcw, Sparkles, FileText } from 'lucide-react';
import { getExplanation } from '../services/gemini';
import { PremiumLock } from '../components/PremiumLock';

export const ViewSimulados = ({ student, quizzes, onCompleteQuiz }) => {
    // Core State
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [mySubmissions, setMySubmissions] = useState({});
    const [pendingStartQuiz, setPendingStartQuiz] = useState(null);
    const myChallenges = quizzes.filter(q => !q.assignedTo || q.assignedTo.length === 0 || q.assignedTo.includes(student.id));

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
        // Progress Bar
        const progressPercent = ((currentQIndex + 1) / activeQuiz.questions.length) * 100;

        return (
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden min-h-[600px] flex flex-col animate-slideUp relative">

                {/* Header / Top Bar */}
                <div className="bg-white dark:bg-slate-800 p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center sticky top-0 z-10">
                    <button onClick={() => { if (confirm("Sair do simulado? Seu progresso será perdido.")) setActiveQuiz(null) }} className="p-2 text-slate-400 hover:text-slate-600"><X /></button>

                    <div className="flex-1 mx-4 max-w-md">
                        <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                            <span>Questão {currentQIndex + 1} de {activeQuiz.questions.length}</span>
                            {timeLeft !== null && <span className={`${timeLeft < 60 ? 'text-red-500 animate-pulse' : ''}`}>{formatTime(timeLeft)}</span>}
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-[#a51a8f] transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                    </div>

                    <div className="w-8"></div> {/* Spacer for centering */}
                </div>

                {/* Main Question Area */}
                <div className="flex-1 p-6 md:p-10 flex flex-col max-w-3xl mx-auto w-full">

                    {quizState === 'finished' ? (
                        <div className="text-center py-10 animate-fadeIn">
                            <div className="w-24 h-24 bg-[#eec00a] rounded-full mx-auto flex items-center justify-center text-5xl mb-6 shadow-lg animate-bounce text-white"><Star size={48} fill="white" /></div>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Simulado Finalizado!</h3>
                            <p className="text-slate-600 dark:text-slate-300 mb-8">As respostas foram enviadas.</p>
                            <button onClick={() => setActiveQuiz(null)} className="bg-[#a51a8f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#8e167b]">Voltar ao Menu</button>
                        </div>
                    ) : (
                        <>
                            {/* Question Text */}
                            <div className="mb-8">
                                <h2 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white leading-relaxed">
                                    <span className="text-[#a51a8f] mr-2">{currentQIndex + 1}.</span>
                                    {activeQuiz.questions[currentQIndex].q}
                                </h2>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                {activeQuiz.questions[currentQIndex].options.map((opt, idx) => {
                                    const isSelected = currentSelectedOption === opt;
                                    const isFeedbackMode = quizState === 'feedback';
                                    const isCorrect = activeQuiz.questions[currentQIndex].answer === opt;

                                    let cardStyle = "border-slate-200 dark:border-slate-700 hover:border-[#a51a8f]/50 hover:bg-slate-50 dark:hover:bg-slate-700/50";

                                    if (isSelected && !isFeedbackMode) {
                                        cardStyle = "border-[#a51a8f] bg-[#fdf2fa] dark:bg-[#a51a8f]/20 text-[#a51a8f] dark:text-[#d36ac1] ring-1 ring-[#a51a8f]";
                                    } else if (isFeedbackMode) {
                                        if (isCorrect) {
                                            cardStyle = "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 ring-1 ring-green-500";
                                        } else if (isSelected && !isCorrect) {
                                            cardStyle = "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400";
                                        } else {
                                            cardStyle = "border-slate-100 dark:border-slate-800 opacity-50"; // Dim others
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleOptionSelect(opt)}
                                            disabled={isFeedbackMode}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${cardStyle}`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                                                   ${isSelected || (isFeedbackMode && isCorrect) ? 'border-current' : 'border-slate-300 text-slate-400 group-hover:border-slate-400'}
                                               `}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className="font-medium">{opt}</span>
                                            </div>
                                            {isFeedbackMode && isCorrect && <CheckCircle className="text-green-500" size={20} />}
                                            {isFeedbackMode && isSelected && !isCorrect && <XCircle className="text-red-500" size={20} />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Feedback Section */}
                            {quizState === 'feedback' && (
                                <div className={`mt-6 p-4 rounded-2xl animate-fadeSlideUp ${feedbackStatus === 'correct' ? 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-full ${feedbackStatus === 'correct' ? 'bg-green-200 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {feedbackStatus === 'correct' ? <Check size={20} /> : <X size={20} />}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className={`font-bold text-lg mb-2 ${feedbackStatus === 'correct' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}>
                                                {feedbackStatus === 'correct' ? 'Isso mesmo!' : 'Resposta incorreta'}
                                            </h4>

                                            {feedbackStatus === 'incorrect' && (
                                                <p className="mb-3 text-slate-700 dark:text-slate-300">
                                                    A resposta correta é: <strong className="text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{activeQuiz.questions[currentQIndex].answer}</strong>
                                                </p>
                                            )}

                                            <p className={`text-sm leading-relaxed ${feedbackStatus === 'correct' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                                                {isLoadingAI ? (
                                                    <span className="flex items-center gap-2 opacity-75 animate-pulse"><Sparkles size={14} /> Gerando explicação inteligente...</span>
                                                ) : (
                                                    aiExplanation || activeQuiz.questions[currentQIndex].explanation ||
                                                    (feedbackStatus === 'correct'
                                                        ? "Excelente! A análise confirma que sua lógica está correta. O contexto foi bem aplicado."
                                                        : "A alternativa selecionada não corresponde ao padrão esperado para esta questão. Revise os conceitos gramaticais relacionados.")
                                                )}
                                            </p>

                                            {/* Subtly indicating AI analysis without a full block header */}
                                            <div className="mt-2 flex items-center gap-1 opacity-60">
                                                <Sparkles size={12} />
                                                <span className="text-[10px] uppercase tracking-wide font-bold">Análise Inteligente</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </>
                    )}
                </div>

                {/* Footer Actions */}
                {quizState !== 'finished' && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                        {quizState === 'answering' ? (
                            <button
                                onClick={handleVerifyAnswer}
                                disabled={!currentSelectedOption}
                                className="bg-[#a51a8f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#8e167b] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#a51a8f]/20 flex items-center gap-2"
                            >
                                Verificar <Check size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleNextQuestion}
                                className="bg-slate-800 dark:bg-white dark:text-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700 dark:hover:bg-slate-200 transition-all shadow-lg flex items-center gap-2"
                            >
                                {currentQIndex < activeQuiz.questions.length - 1 ? 'Próxima Questão' : 'Finalizar Simulado'} <ArrowRight size={18} />
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
