import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../firebase';
import { FileCheck, MessageSquare, Check, X, Clock, Gamepad2, CheckCircle, Star, XCircle } from 'lucide-react';

export const ViewChallenges = ({ student, quizzes, onCompleteQuiz }) => {
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);
    const [mySubmissions, setMySubmissions] = useState({});
    const myChallenges = quizzes.filter(q => !q.assignedTo || q.assignedTo.length === 0 || q.assignedTo.includes(student.id));
    const [timeLeft, setTimeLeft] = useState(null);
    const [pendingStartQuiz, setPendingStartQuiz] = useState(null);

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

    useEffect(() => {
        if (timeLeft === null) return;
        if (timeLeft <= 0) {
            submitQuiz();
            return;
        }
        const timerId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timerId);
    }, [timeLeft]);

    const startQuiz = (quiz) => {
        const sub = mySubmissions[quiz.id];
        if (sub && sub.status === 'graded') {
            setActiveQuiz(quiz);
            return;
        }
        if (sub && sub.status === 'pending') {
            alert("Este desafio está em correção pelo professor. Aguarde o retorno!");
            return;
        }
        const limit = quiz.timeLimit ? parseInt(quiz.timeLimit) : 0;
        if (!isNaN(limit) && limit > 0 && (!sub || sub.status !== 'completed')) {
            setPendingStartQuiz(quiz);
            return;
        }
        confirmStartQuiz(quiz);
    };

    const confirmStartQuiz = (quiz) => {
        setPendingStartQuiz(null);
        const sub = mySubmissions[quiz.id];
        setActiveQuiz(quiz);
        setAnswers({});
        setScore(null);
        const limit = quiz.timeLimit ? parseInt(quiz.timeLimit) : 0;
        if (!isNaN(limit) && limit > 0 && (!sub || sub.status !== 'completed')) {
            setTimeLeft(limit * 60);
        } else {
            setTimeLeft(null);
        }
    };

    const handleAnswer = (qIndex, option) => { setAnswers(prev => ({ ...prev, [qIndex]: option })); };
    const submitQuiz = async () => {
        setTimeLeft(null);
        let correctCount = 0;
        activeQuiz.questions.forEach((q, idx) => {
            const studentAnswer = answers[idx];
            const correct = q.answer;
            if (q.type === 'short_answer' || q.type === 'long_answer') {
                if (studentAnswer && studentAnswer.toLowerCase().trim() === correct.toLowerCase().trim()) correctCount++;
            } else {
                if (studentAnswer === correct) correctCount++;
            }
        });

        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'submissions'), {
                quizId: activeQuiz.id,
                quizTitle: activeQuiz.title,
                studentId: student.id,
                studentName: student.name,
                answers: answers,
                score: correctCount,
                totalQuestions: activeQuiz.questions.length,
                status: 'pending',
                submittedAt: serverTimestamp(),
                questions: activeQuiz.questions
            });
            setScore(correctCount);
            if (correctCount > 0) onCompleteQuiz(activeQuiz.id, activeQuiz.xpReward, activeQuiz.coinReward);
        } catch (error) {
            console.error("Error submitting quiz:", error);
            alert("Erro ao enviar desafio. Tente novamente.");
        }
    };

    if (activeQuiz) {
        const sub = mySubmissions[activeQuiz.id];
        const isGradedView = sub && sub.status === 'graded';
        const formatTime = (seconds) => {
            const m = Math.floor(seconds / 60);
            const s = seconds % 60;
            return `${m}:${s < 10 ? '0' : ''}${s}`;
        };

        if (isGradedView) {
            return (
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col animate-slideUp">
                    <div className="bg-[#a51a8f] p-6 text-white flex justify-between items-center">
                        <div><h3 className="text-xl font-bold flex items-center gap-2"><FileCheck className="text-[#eec00a]" /> Resultado: {activeQuiz.title}</h3></div>
                        <button onClick={() => setActiveQuiz(null)} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto space-y-6">
                        <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <div className="flex-1 text-center border-r border-slate-200 dark:border-slate-600">
                                <p className="text-xs font-bold text-slate-400 uppercase">Nota Final</p>
                                <p className="text-3xl font-bold text-[#a51a8f] dark:text-[#d36ac1]">{sub.score} / {sub.totalQuestions}</p>
                            </div>
                            {sub.teacherBonusXP > 0 && (<div className="flex-1 text-center border-r border-slate-200 dark:border-slate-600"><p className="text-xs font-bold text-slate-400 uppercase">Bônus Extra</p><p className="text-xl font-bold text-[#eec00a]">+{sub.teacherBonusXP} XP</p></div>)}
                            <div className="flex-1 text-center"><p className="text-xs font-bold text-slate-400 uppercase">Corrigido em</p><p className="text-sm font-bold text-slate-700 dark:text-slate-300">{sub.gradedAt ? new Date(sub.gradedAt.seconds * 1000).toLocaleDateString() : 'Recentemente'}</p></div>
                        </div>
                        {sub.teacherFeedback && (<div className="bg-[#fdf2fa] dark:bg-[#a51a8f]/10 p-4 rounded-xl border border-[#a51a8f]/20"><h4 className="font-bold text-[#a51a8f] dark:text-[#d36ac1] mb-2 flex items-center gap-2"><MessageSquare size={16} /> Comentário do Professor</h4><p className="text-slate-700 italic">"{sub.teacherFeedback}"</p></div>)}
                        <div className="space-y-4">
                            <h4 className="font-bold text-slate-700 border-b pb-2">Detalhes da Correção</h4>
                            {sub.questions && sub.questions.map((q, idx) => {
                                let status = sub.questionsStatus ? sub.questionsStatus[idx] : (sub.score > idx);
                                if (sub.questionsStatus && sub.questionsStatus[idx] !== undefined) status = sub.questionsStatus[idx];
                                return (
                                    <div key={idx} className={`border-l-4 p-4 rounded-r-xl bg-white shadow-sm ${status ? 'border-green-400' : 'border-red-400'}`}>
                                        <div className="flex justify-between items-start"><p className="font-bold text-slate-800 text-sm mb-1">{idx + 1}. {q.q}</p>{status ? <CheckCircle className="text-green-500 w-5 h-5 flex-shrink-0" /> : <XCircle className="text-red-500 w-5 h-5 flex-shrink-0" />}</div>
                                        <p className="text-sm text-slate-600 mb-1"><span className="font-bold text-slate-400 text-xs uppercase">Sua Resposta:</span> {sub.answers[idx] || "—"}</p>
                                        {sub.teacherCorrections && sub.teacherCorrections[idx] ? (<div className="mt-2 text-sm bg-blue-50 border border-blue-100 p-2 rounded"><span className="font-bold text-blue-700 text-xs uppercase block mb-1">Correção do Professor:</span><span className="text-blue-900">{sub.teacherCorrections[idx]}</span></div>) : !status && (q.type !== 'short_answer' && q.type !== 'long_answer') && (<p className="text-sm text-slate-600 bg-green-50 px-2 py-1 rounded inline-block mt-1"><span className="font-bold text-green-700 text-xs uppercase">Gabarito:</span> {q.answer}</p>)}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                <div className="bg-[#a51a8f] p-6 text-white flex justify-between items-center relative">
                    <h3 className="text-xl font-bold flex items-center gap-2">{activeQuiz.title}{timeLeft !== null && (<div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-mono ${timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}><Clock size={16} />{formatTime(timeLeft)}</div>)}</h3>
                    <button onClick={() => setActiveQuiz(null)} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
                </div>
                <div className="p-6 flex-1 overflow-y-auto">
                    {score === null ? (
                        <div className="space-y-8">{activeQuiz.questions.map((q, idx) => (<div key={idx} className="bg-slate-50 p-4 rounded-xl"><p className="font-bold text-slate-800 mb-4 text-lg">{idx + 1}. {q.q}</p>{(q.type === 'multiple_choice' || q.type === 'true_false') && (<div className="grid grid-cols-1 gap-3">{q.options.map((opt) => (<button key={opt} onClick={() => handleAnswer(idx, opt)} className={`text-left px-4 py-3 rounded-lg border-2 transition-all ${answers[idx] === opt ? 'border-[#a51a8f] bg-[#fdf2fa] text-[#a51a8f] font-bold' : 'border-slate-200 hover:border-[#a51a8f]/50 text-slate-600'}`}>{opt}</button>))}</div>)}{q.type === 'short_answer' && (<input type="text" placeholder="Sua resposta..." className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-[#a51a8f] focus:outline-none" value={answers[idx] || ''} onChange={(e) => handleAnswer(idx, e.target.value)} />)}{q.type === 'long_answer' && (<textarea rows={4} placeholder="Digite sua resposta aqui..." className="w-full border-2 border-slate-200 rounded-xl px-4 py-3 focus:border-[#a51a8f] focus:outline-none" value={answers[idx] || ''} onChange={(e) => handleAnswer(idx, e.target.value)}></textarea>)}</div>))}<button onClick={submitQuiz} disabled={Object.keys(answers).length !== activeQuiz.questions.length} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">Enviar Respostas</button></div>
                    ) : (
                        <div className="text-center py-10 animate-fadeIn"><div className="w-24 h-24 bg-[#eec00a] rounded-full mx-auto flex items-center justify-center text-5xl mb-6 shadow-lg animate-bounce text-white"><Star size={48} fill="white" /></div><h3 className="text-3xl font-bold text-slate-800 mb-2">Desafio Enviado!</h3><p className="text-slate-600 mb-6">Suas respostas foram enviadas para correção.</p><div className="flex justify-center gap-4 mb-8"><div className="bg-[#fdf2fa] px-4 py-2 rounded-lg"><span className="block text-xs text-[#a51a8f] font-bold uppercase">Ganhou</span><span className="text-xl font-bold text-[#7d126b]">+{activeQuiz.xpReward} XP</span></div><div className="bg-[#fff9db] px-4 py-2 rounded-lg"><span className="block text-xs text-[#b89508] font-bold uppercase">Ganhou</span><span className="flex items-center gap-1 text-xl font-bold text-[#b89508]">+{activeQuiz.coinReward} <Star className="w-4 h-4 fill-[#b89508]" /></span></div></div><button onClick={() => setActiveQuiz(null)} className="bg-[#a51a8f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#8e167b]">Voltar aos Desafios</button></div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <header><h2 className="text-2xl font-bold text-slate-800">Sala de Desafios</h2><p className="text-slate-500">Teste seus conhecimentos e ganhe prêmios</p></header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myChallenges.map(quiz => {
                    const isCompleted = quiz.completedBy?.includes(student.id);
                    const isExpired = quiz.deadline && new Date() > new Date(quiz.deadline);
                    return (
                        <div key={quiz.id} className={`bg-white p-6 rounded-2xl border-2 transition-all ${isCompleted ? 'border-green-200 bg-green-50' : isExpired ? 'border-slate-200 bg-slate-100 grayscale' : 'border-slate-100 hover:border-[#a51a slightly_lighter_purple]/50 shadow-md'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl ${isCompleted ? 'bg-green-200 text-green-700' : isExpired ? 'bg-slate-300 text-slate-500' : 'bg-[#fdf2fa] text-[#a51a8f]'}`}><Gamepad2 className="w-6 h-6" /></div>
                                {mySubmissions[quiz.id]?.status === 'pending' ? (<span className="flex items-center gap-1 text-orange-600 font-bold text-sm bg-orange-100 px-2 py-1 rounded-full"><Clock className="w-4 h-4" /> Em Análise</span>) : mySubmissions[quiz.id]?.status === 'graded' ? (<span className="flex items-center gap-1 text-green-700 font-bold text-sm bg-white px-2 py-1 rounded-full shadow-sm"><CheckCircle className="w-4 h-4" /> Ver Nota</span>) : isCompleted ? (<span className="flex items-center gap-1 text-green-700 font-bold text-sm bg-white px-2 py-1 rounded-full shadow-sm"><CheckCircle className="w-4 h-4" /> Enviado</span>) : isExpired ? (<span className="flex items-center gap-1 text-slate-500 font-bold text-sm bg-slate-200 px-2 py-1 rounded-full"><Clock className="w-4 h-4" /> Encerrado</span>) : (<span className="flex items-center gap-1 text-[#b89508] font-bold text-sm bg-[#fff9db] px-2 py-1 rounded-full border border-[#eec00a]">+{quiz.xpReward} XP</span>)}
                            </div>
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">{quiz.title}{quiz.challengeCode && <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">#{quiz.challengeCode}</span>}</h3>
                            <p className="text-slate-500 text-sm mb-6 mt-2">Responda {quiz.questions?.length} questões para ganhar pontos.</p>
                            {quiz.timeLimit && parseInt(quiz.timeLimit) > 0 && (<div className="flex items-center gap-1 text-xs text-orange-600 font-bold mb-2 bg-orange-50 px-2 py-1 rounded w-fit"><Clock size={12} /> Limite de Tempo: {quiz.timeLimit} min</div>)}
                            {quiz.deadline && !isCompleted && !isExpired && (<div className="text-xs text-red-500 font-bold mb-4 flex items-center gap-1"><Clock size={12} /> Expira em: {new Date(quiz.deadline).toLocaleString()}</div>)}
                            <button onClick={() => startQuiz(quiz)} disabled={isExpired && !isCompleted} className={`w-full py-3 rounded-xl font-bold transition-colors ${isCompleted ? 'bg-green-600 text-white hover:bg-green-700' : isExpired ? 'bg-slate-300 text-slate-500 cursor-not-allowed' : 'bg-[#a51a8f] text-white hover:bg-[#8e167b] shadow-lg shadow-[#a51a8f]/20'}`}>{mySubmissions[quiz.id]?.status === 'graded' ? 'Ver Resultado' : mySubmissions[quiz.id]?.status === 'pending' ? 'Aguardar Correção' : isCompleted ? 'Enviado' : isExpired ? 'Prazo Esgotado' : 'Começar Desafio'}</button>
                        </div>
                    );
                })}
                {myChallenges.length === 0 && (<p className="text-slate-400 col-span-full text-center py-10">Você não tem desafios pendentes no momento.</p>)}
            </div>
            {pendingStartQuiz && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-slideUp p-6 text-center">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4"><Clock size={32} className="text-yellow-600" /></div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Desafio com Tempo!</h3>
                        <p className="text-slate-600 dark:text-slate-300 mb-6">Este desafio tem um limite de <strong className="text-[#a51a8f]">{pendingStartQuiz.timeLimit} minutos</strong>.<br /><span className="text-xs mt-2 block">O cronômetro começa assim que você clicar em iniciar.</span></p>
                        <div className="flex gap-3"><button onClick={() => setPendingStartQuiz(null)} className="flex-1 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700">Cancelar</button><button onClick={() => confirmStartQuiz(pendingStartQuiz)} className="flex-1 py-3 bg-[#a51a8f] text-white rounded-xl font-bold hover:bg-[#7d126b] shadow-lg">Iniciar Agora</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};
