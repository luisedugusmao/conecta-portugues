import React, { useState } from 'react';
import { Star, Gamepad2, CheckCircle, Clock, X, CheckSquare, Check, Type, AlignLeft, Plus } from 'lucide-react';

export const ViewChallenges = ({ student, quizzes, onCompleteQuiz }) => {
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [answers, setAnswers] = useState({});
    const [score, setScore] = useState(null);
    const myChallenges = quizzes.filter(q => !q.assignedTo || q.assignedTo.length === 0 || q.assignedTo.includes(student.id));

    const startQuiz = (quiz) => { setActiveQuiz(quiz); setAnswers({}); setScore(null); };
    const handleAnswer = (qIndex, option) => { setAnswers(prev => ({ ...prev, [qIndex]: option })); };
    const submitQuiz = () => {
        let correctCount = 0;
        activeQuiz.questions.forEach((q, idx) => {
            const studentAnswer = answers[idx]; const correct = q.answer;
            if (studentAnswer === correct) correctCount++;
        });
        setScore(correctCount);
        if (correctCount > 0) onCompleteQuiz(activeQuiz.id, activeQuiz.xpReward, activeQuiz.coinReward);
    };

    if (activeQuiz) {
        return (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden min-h-[500px] flex flex-col">
                <div className="bg-[#a51a8f] p-6 text-white flex justify-between items-center"><h3 className="text-xl font-bold">{activeQuiz.title}</h3><button onClick={() => setActiveQuiz(null)} className="p-2 hover:bg-white/10 rounded-full"><X /></button></div>
                <div className="p-6 flex-1 overflow-y-auto">
                    {score === null ? (
                        <div className="space-y-8">{activeQuiz.questions.map((q, idx) => (<div key={idx} className="bg-slate-50 p-4 rounded-xl"><p className="font-bold text-slate-800 mb-4 text-lg">{idx + 1}. {q.q}</p>{q.type === 'multiple_choice' && (<div className="grid grid-cols-1 gap-3">{q.options.map((opt) => (<button key={opt} onClick={() => handleAnswer(idx, opt)} className={`text-left px-4 py-3 rounded-lg border-2 transition-all ${answers[idx] === opt ? 'border-[#a51a8f] bg-[#fdf2fa] text-[#a51a8f] font-bold' : 'border-slate-200 hover:border-[#a51a8f]/50'}`}>{opt}</button>))}</div>)}</div>))}<button onClick={submitQuiz} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">Enviar Respostas</button></div>
                    ) : (
                        <div className="text-center py-10 animate-fadeIn"><h3 className="text-3xl font-bold text-slate-800 mb-2">Quiz Completado!</h3><button onClick={() => setActiveQuiz(null)} className="bg-[#a51a8f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#8e167b]">Voltar</button></div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            <header><h2 className="text-2xl font-bold text-slate-800">Sala de Desafios</h2></header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myChallenges.map(quiz => {
                    return (
                        <div key={quiz.id} className={`bg-white p-6 rounded-2xl border-2 transition-all shadow-md`}>
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">{quiz.title}</h3>
                            <button onClick={() => startQuiz(quiz)} className={`w-full py-3 rounded-xl font-bold transition-colors bg-[#a51a8f] text-white hover:bg-[#8e167b] shadow-lg shadow-[#a51a8f]/20`}>Começar Desafio</button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
