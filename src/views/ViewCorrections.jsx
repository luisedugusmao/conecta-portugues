import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp, increment } from 'firebase/firestore';
import { db, appId } from '../firebase';
import { FileCheck, MessageSquare, Check, X } from 'lucide-react';

export const ViewCorrections = ({ students, quizzes }) => {
    const [submissions, setSubmissions] = useState([]);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [feedback, setFeedback] = useState("");
    const [bonusXP, setBonusXP] = useState(0);
    const [manualGrades, setManualGrades] = useState({});
    const [teacherCorrections, setTeacherCorrections] = useState({});

    useEffect(() => {
        const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'submissions'), where("status", "==", "pending"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => (b.submittedAt?.seconds || 0) - (a.submittedAt?.seconds || 0));
            setSubmissions(data);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (selectedSubmission) {
            const initialGrades = {};
            selectedSubmission.questions.forEach((q, idx) => {
                let isCorrect = false;
                const studentAnswer = selectedSubmission.answers[idx];
                const correct = q.answer;
                if (q.type === 'short_answer' || q.type === 'long_answer') {
                    if (studentAnswer && studentAnswer.toLowerCase().trim() === correct.toLowerCase().trim()) isCorrect = true;
                } else {
                    if (studentAnswer === correct) isCorrect = true;
                }
                initialGrades[idx] = isCorrect;
            });
            setManualGrades(initialGrades);
            setFeedback(selectedSubmission.teacherFeedback || "");
            setBonusXP(selectedSubmission.teacherBonusXP || 0);
            setTeacherCorrections(selectedSubmission.teacherCorrections || {});
        }
    }, [selectedSubmission]);

    const toggleGrade = (idx) => {
        setManualGrades(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    const handleTeacherCorrectionChange = (idx, value) => {
        setTeacherCorrections(prev => ({
            ...prev,
            [idx]: value
        }));
    };

    const handleFinalizeCorrection = async () => {
        if (!selectedSubmission) return;

        try {
            const finalScore = Object.values(manualGrades).filter(v => v === true).length;
            const previousXP = selectedSubmission.xpAwarded || 0;
            const finalTotalXP = previousXP + bonusXP;

            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'submissions', selectedSubmission.id), {
                status: 'graded',
                teacherFeedback: feedback,
                teacherBonusXP: bonusXP, // This is the manual addition
                xpAwarded: finalTotalXP, // Total final XP
                score: finalScore,
                questionsStatus: manualGrades,
                teacherCorrections: teacherCorrections,
                gradedAt: serverTimestamp()
            });

            if (bonusXP > 0) {
                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', selectedSubmission.studentId), {
                    xp: increment(bonusXP),
                    coins: increment(Math.floor(bonusXP / 10))
                });
            }

            alert("Correção enviada com sucesso!");
            setSelectedSubmission(null);
            setFeedback("");
            setBonusXP(0);
            setManualGrades({});
            setTeacherCorrections({});
        } catch (error) {
            console.error("Error finalizing correction:", error);
            alert("Erro ao salvar correção.");
        }
    };

    if (selectedSubmission) {
        const selectedQuizCode = quizzes?.find(q => q.id === selectedSubmission.quizId)?.challengeCode;

        return (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col animate-slideUp">
                <div className="bg-[#2d1b36] p-6 text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold flex items-center gap-2"><FileCheck className="text-[#eec00a]" /> Correção de Desafio</h3>
                        <p className="text-white/60 text-sm flex items-center gap-2">
                            {selectedSubmission.studentName} - {selectedSubmission.quizTitle}
                            {selectedQuizCode && <span className="bg-white/10 px-2 py-0.5 rounded text-xs font-mono text-[#eec00a]">#{selectedQuizCode}</span>}
                        </p>
                    </div>
                    <button onClick={() => setSelectedSubmission(null)} className="p-2 hover:bg-white/10 rounded-full"><X /></button>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                    <div className="flex gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex-1 text-center border-r border-slate-200">
                            <p className="text-xs font-bold text-slate-400 uppercase">Nota Atual (Ajustada)</p>
                            <p className="text-2xl font-bold text-[#a51a8f]">{Object.values(manualGrades).filter(v => v === true).length} / {selectedSubmission.totalQuestions}</p>
                        </div>
                        <div className="flex-1 text-center">
                            <p className="text-xs font-bold text-slate-400 uppercase">Data Envio</p>
                            <p className="text-lg font-bold text-slate-700">{selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt.seconds * 1000).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h4 className="font-bold text-slate-700 border-b pb-2">Respostas do Aluno (Clique para alterar correção)</h4>
                        {selectedSubmission.questions && selectedSubmission.questions.map((q, idx) => {
                            const isCorrect = manualGrades[idx];
                            return (
                                <div key={idx} className={`bg-white border-2 p-4 rounded-xl transition-all ${isCorrect ? 'border-green-100' : 'border-red-50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="font-bold text-slate-800">{idx + 1}. {q.q} <span className="text-xs font-normal text-slate-400 uppercase ml-2">({q.type})</span></p>
                                        <button
                                            onClick={() => toggleGrade(idx)}
                                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold transition-all ${isCorrect ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                        >
                                            {isCorrect ? <Check size={14} /> : <X size={14} />}
                                            {isCorrect ? 'Correto' : 'Incorreto'}
                                        </button>
                                    </div>

                                    <div className="mb-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Resposta do Aluno:</p>
                                        <div className={`p-3 rounded-lg border ${isCorrect ? 'bg-green-50/50 border-green-200 text-green-900' : 'bg-red-50/50 border-red-200 text-red-900'
                                            }`}>
                                            {selectedSubmission.answers[idx] || <span className="italic text-slate-400">Sem resposta</span>}
                                        </div>
                                    </div>

                                    <div className="mb-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Gabarito:</p>
                                        <p className="text-sm text-slate-600 font-mono bg-slate-100 inline-block px-2 py-1 rounded">{q.answer || 'N/A'}</p>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                        <label className="block text-xs font-bold text-[#a51a8f] uppercase mb-1">Sua Correção / Sugestão:</label>
                                        <textarea
                                            className="w-full text-sm border border-slate-200 rounded-lg p-2 focus:border-[#a51a8f] focus:outline-none"
                                            rows={2}
                                            placeholder="Escreva a resposta ideal aqui se necessário..."
                                            value={teacherCorrections[idx] || ''}
                                            onChange={(e) => handleTeacherCorrectionChange(idx, e.target.value)}
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="bg-[#fdf2fa] p-6 rounded-xl border border-[#a51a8f]/20">
                        <h4 className="font-bold text-[#a51a8f] mb-4 flex items-center gap-2"><MessageSquare size={18} /> Feedback do Professor</h4>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Comentários:</label>
                            <textarea
                                className="w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-[#a51a8f]"
                                rows={3}
                                placeholder="Escreva um recado para o aluno..."
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">Nota Manual (Máx Restante: {selectedSubmission.maxXP ? (selectedSubmission.maxXP - (selectedSubmission.xpAwarded || 0)) : 100} XP):</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    className="w-24 border border-slate-200 rounded-xl p-2 font-bold text-[#a51a8f] focus:outline-none focus:border-[#a51a8f]"
                                    value={bonusXP}
                                    onChange={(e) => setBonusXP(Math.min(Number(e.target.value), selectedSubmission.maxXP ? (selectedSubmission.maxXP - (selectedSubmission.xpAwarded || 0)) : 1000))}
                                    min="0"
                                    max={selectedSubmission.maxXP ? (selectedSubmission.maxXP - (selectedSubmission.xpAwarded || 0)) : 1000}
                                />
                                <div className="text-xs text-slate-500">
                                    <p>XP Automático já recebido: <strong className="text-green-600">{selectedSubmission.xpAwarded || 0} XP</strong></p>
                                    <p>XP Máximo do Desafio: <strong>{selectedSubmission.maxXP || 'N/A'} XP</strong></p>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleFinalizeCorrection} className="w-full bg-[#a51a8f] text-white py-3 rounded-xl font-bold hover:bg-[#7d126b] shadow-lg shadow-[#a51a8f]/20 transition-transform active:scale-95">
                            Finalizar e Enviar Correção
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn pb-20 md:pb-0">
            <div className="grid grid-cols-1 gap-4">
                {submissions.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <FileCheck size={40} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-500">Tudo em dia!</h3>
                        <p className="text-slate-400">Nenhuma tarefa pendente de correção.</p>
                    </div>
                ) : (
                    submissions.map(sub => {
                        const quizCode = quizzes?.find(q => q.id === sub.quizId)?.challengeCode;
                        return (
                            <div key={sub.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row justify-between items-center gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <div className="w-12 h-12 rounded-full bg-[#fdf2fa] flex items-center justify-center text-[#a51a8f]">
                                        <FileCheck size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                            {sub.quizTitle}
                                            {quizCode && <span className="text-xs font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">#{quizCode}</span>}
                                        </h4>
                                        <p className="text-sm text-slate-500">Aluno: <span className="font-bold text-slate-700">{sub.studentName}</span></p>
                                        <p className="text-xs text-slate-400">{sub.submittedAt ? new Date(sub.submittedAt.seconds * 1000).toLocaleString() : 'Data desconhecida'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right mr-4">
                                        <span className="block text-xs font-bold text-slate-400 uppercase">Acertos</span>
                                        <span className="font-bold text-[#a51a8f] text-lg">{sub.score} / {sub.totalQuestions}</span>
                                    </div>
                                    <button onClick={() => setSelectedSubmission(sub)} className="bg-[#a51a8f] text-white px-6 py-2 rounded-xl font-bold hover:bg-[#7d126b] text-sm shadow-md">
                                        Corrigir
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
