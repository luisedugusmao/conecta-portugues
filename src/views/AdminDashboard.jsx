import React, { useState } from 'react';
import { collection, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';
import {
    Users, DollarSign, Video, UserPlus, X, Save, Filter, Edit, Copy, Trash2, Paperclip, Link as LinkIcon, FileText, PlayCircle, PlusCircle, CheckSquare, Check, Type, AlignLeft, Plus, ShieldAlert, Home, Gamepad2, CalendarDays, LogOut, FileCheck, Star, Clock
} from 'lucide-react';
import { LogoSVG } from '../components/LogoSVG';
import { NavButton, MobileNavButton, StudentCard } from '../components/UIHelpers';
import { ViewCalendar } from './ViewCalendar';
import { ViewCorrections } from './ViewCorrections';
import { ViewFinancial } from './ViewFinancial';
import { getClassStatus, formatDate } from '../utils/classHelpers';

export const AdminDashboard = ({ currentUser, students, classes, quizzes, onLogout }) => {
    const [currentView, setCurrentView] = useState('overview');
    const [showStudentForm, setShowStudentForm] = useState(false);
    const [classFilterYear, setClassFilterYear] = useState('Todos');
    const [editingClass, setEditingClass] = useState(null);

    const [newStudentData, setNewStudentData] = useState({ name: '', age: '', gender: 'Masculino', parentName: '', parentEmail: '', parentPhone: '', studentPhone: '', schoolYear: '6º Ano', photoUrl: '' });
    // Updated newClass state to include scheduledAt
    const [newClass, setNewClass] = useState({ title: '', scheduledAt: '', description: '', link: '', type: 'meet', assignedTo: [], materials: [] });
    const [materialInput, setMaterialInput] = useState({ title: '', type: 'pdf', url: '' });
    const [showChallengeForm, setShowChallengeForm] = useState(false);
    const [newChallenge, setNewChallenge] = useState({ id: null, title: '', xpReward: 50, coinReward: 5, questions: [], assignedTo: [], deadline: '' });
    const [currentQuestion, setCurrentQuestion] = useState({ type: 'multiple_choice', text: '', options: ['', ''], correctAnswer: '' });

    const totalStudents = students.filter(s => s.role === 'student').length;
    const totalClasses = classes.length;
    const totalRevenue = totalStudents * 150;

    const handleAddStudent = async () => {
        if (!newStudentData.name || !newStudentData.parentName || !newStudentData.parentEmail) return alert("Preencha campos obrigatórios.");
        const newId = `st${Date.now()}`;
        let userCode; let isUnique = false; const namePart = newStudentData.name.substring(0, 3).toUpperCase();
        let attempts = 0;
        while (!isUnique && attempts < 100) { const numPart = Math.floor(1000 + Math.random() * 9000); userCode = `${namePart}${numPart}`; if (!students.some(s => s.userCode === userCode)) isUnique = true; attempts++; }
        if (!isUnique) return alert("Erro ao gerar código.");
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', newId), { id: newId, ...newStudentData, userCode, avatar: '🧑‍🎓', photoUrl: newStudentData.photoUrl || '', xp: 0, level: 1, coins: 0, password: '1234', role: 'student' });
        setNewStudentData({ name: '', age: '', gender: 'Masculino', parentName: '', parentEmail: '', parentPhone: '', studentPhone: '', schoolYear: '6º Ano', photoUrl: '' });
        setShowStudentForm(false); alert(`Aluno cadastrado! Código: ${userCode}`);
    };

    const handleAddMaterialToClass = () => { if (!materialInput.title) return alert("Título obrigatório."); setNewClass({ ...newClass, materials: [...newClass.materials, { ...materialInput }] }); setMaterialInput({ title: '', type: 'pdf', url: '' }); };
    const handleRemoveMaterialFromClass = (index) => { setNewClass({ ...newClass, materials: newClass.materials.filter((_, i) => i !== index) }); };

    const handleAddClass = async () => {
        if (!newClass.title || !newClass.scheduledAt) return alert("Título e Data são obrigatórios.");
        const newId = `cl${Date.now()}`;
        let classCode; let isUnique = false; let attempts = 0;
        while (!isUnique && attempts < 50) { const numPart = Math.floor(1000 + Math.random() * 9000); classCode = `AUL${numPart}`; if (!classes.some(c => c.classCode === classCode)) isUnique = true; attempts++; }

        const classData = {
            id: newId,
            classCode,
            title: newClass.title,
            scheduledAt: newClass.scheduledAt, // ISO String from input
            date: formatDate(newClass.scheduledAt), // Keep for fallback display
            description: newClass.description,
            status: 'soon', // Initial status
            manualStatus: null,
            materials: newClass.materials,
            assignedTo: newClass.assignedTo,
            sortOrder: 99,
            createdBy: currentUser.name
        };

        if (newClass.type === 'meet') classData.meetLink = newClass.link; else classData.recordingLink = newClass.link;
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'classes', newId), classData);
        setNewClass({ title: '', scheduledAt: '', description: '', link: '', type: 'meet', assignedTo: [], materials: [] }); alert(`Aula criada por ${currentUser.name}! Código: ${classCode}`);
    };

    const handleUpdateClass = async () => {
        if (!editingClass || !editingClass.title) return;
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'classes', editingClass.id), {
            title: editingClass.title,
            scheduledAt: editingClass.scheduledAt,
            date: formatDate(editingClass.scheduledAt),
            description: editingClass.description,
            meetLink: editingClass.meetLink || '',
            recordingLink: editingClass.recordingLink || '',
            assignedTo: editingClass.assignedTo,
            manualStatus: editingClass.manualStatus || null
        });
        setEditingClass(null);
        alert('Aula atualizada!');
    };

    const toggleClassStatus = async (cls, status) => {
        const newStatus = cls.manualStatus === status ? null : status; // Toggle off if valid
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'classes', cls.id), {
            manualStatus: newStatus
        });
    };

    const handleDuplicateClass = (cls) => { setNewClass({ title: cls.title + ' (Cópia)', scheduledAt: '', description: cls.description, link: cls.meetLink || cls.recordingLink || '', type: cls.meetLink ? 'meet' : 'recording', assignedTo: [], materials: cls.materials || [] }); window.scrollTo({ top: 0, behavior: 'smooth' }); alert('Dados copiados para o formulário.'); };
    const handleDeleteClass = async (classId) => { if (confirm('Excluir aula?')) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'classes', classId)); }

    const addQuestionToChallenge = () => { if (!currentQuestion.text) return alert("Digite o enunciado."); let qToAdd = { type: currentQuestion.type, q: currentQuestion.text, answer: currentQuestion.correctAnswer }; if (currentQuestion.type === 'multiple_choice') qToAdd.options = currentQuestion.options.filter(o => o.trim() !== ''); else if (currentQuestion.type === 'true_false') qToAdd.options = ['Verdadeiro', 'Falso']; setNewChallenge({ ...newChallenge, questions: [...newChallenge.questions, qToAdd] }); setCurrentQuestion({ type: 'multiple_choice', text: '', options: ['', ''], correctAnswer: '' }); };
    const handleEditChallenge = (quiz) => { setNewChallenge({ id: quiz.id, title: quiz.title, xpReward: quiz.xpReward, coinReward: quiz.coinReward, questions: quiz.questions, assignedTo: quiz.assignedTo || [], deadline: quiz.deadline || '', timeLimit: quiz.timeLimit || '' }); setShowChallengeForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };

    const saveChallenge = async () => {
        if (!newChallenge.title || newChallenge.questions.length === 0) return alert("Adicione título e questões.");
        const data = { title: newChallenge.title, xpReward: newChallenge.xpReward, coinReward: newChallenge.coinReward, questions: newChallenge.questions, assignedTo: newChallenge.assignedTo || [], deadline: newChallenge.deadline || '', timeLimit: newChallenge.timeLimit || '' };

        if (newChallenge.id) {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'quizzes', newChallenge.id), data);
            alert("Desafio atualizado!");
        } else {
            const newId = `qz${Date.now()}`;
            let challengeCode; let isUnique = false; let attempts = 0;
            const currentCodes = quizzes.map(q => q.challengeCode);
            while (!isUnique && attempts < 50) { const numPart = Math.floor(1000 + Math.random() * 9000); challengeCode = `DES${numPart}`; if (!currentCodes.includes(challengeCode)) isUnique = true; attempts++; }

            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'quizzes', newId), {
                id: newId,
                challengeCode,
                ...data,
                completedBy: [],
                createdBy: currentUser.name
            });
            alert(`Desafio criado por ${currentUser.name}! Código: ${challengeCode}`);
        }
        setNewChallenge({ id: null, title: '', xpReward: 50, coinReward: 5, questions: [], assignedTo: [], deadline: '' }); setShowChallengeForm(false);
    };

    const deleteChallenge = async (id) => { if (confirm("Excluir desafio?")) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'quizzes', id)); };

    const renderContent = () => {
        switch (currentView) {
            case 'overview':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"><div className="p-4 bg-indigo-100 text-indigo-600 rounded-xl"><Users size={24} /></div><div><p className="text-sm text-slate-500">Total de Alunos</p><p className="text-2xl font-bold text-slate-800">{totalStudents}</p></div></div>
                        {currentUser.role === 'admin' && (<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"><div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl"><DollarSign size={24} /></div><div><p className="text-sm text-slate-500">Receita Mensal (Est.)</p><p className="text-2xl font-bold text-slate-800">R$ {totalRevenue},00</p></div></div>)}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"><div className="p-4 bg-purple-100 text-purple-600 rounded-xl"><Video size={24} /></div><div><p className="text-sm text-slate-500">Aulas Criadas</p><p className="text-2xl font-bold text-slate-800">{totalClasses}</p></div></div>
                    </div>
                );
            case 'students':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        {!showStudentForm ? (<div className="flex justify-end"><button onClick={() => setShowStudentForm(true)} className="bg-[#a51a8f] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#7d126b] shadow-lg shadow-[#a51a8f]/30 flex items-center gap-2 transition-all transform hover:scale-105"><UserPlus size={20} /> Registrar Novo Aluno</button></div>) : (<div className="bg-white p-6 rounded-2xl shadow-lg border border-[#a51a8f]/20 animate-slideUp relative"><div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4"><h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><UserPlus size={20} className="text-[#a51a8f]" /> Preencha os Dados do Novo Aluno</h3><button onClick={() => setShowStudentForm(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="col-span-1 md:col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-2">Dados do Aluno</div><div className="col-span-1 md:col-span-2 flex gap-4"><div className="flex-1"><input type="text" placeholder="Nome Completo" value={newStudentData.name} onChange={(e) => setNewStudentData({ ...newStudentData, name: e.target.value })} className="w-full border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none" /></div><div className="flex-1"><input type="text" placeholder="URL da Foto (Opcional)" value={newStudentData.photoUrl} onChange={(e) => setNewStudentData({ ...newStudentData, photoUrl: e.target.value })} className="w-full border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none" /></div></div><div className="flex gap-4"><input type="number" placeholder="Idade" value={newStudentData.age} onChange={(e) => setNewStudentData({ ...newStudentData, age: e.target.value })} className="w-1/3 border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none" /><select value={newStudentData.gender} onChange={(e) => setNewStudentData({ ...newStudentData, gender: e.target.value })} className="w-2/3 border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none"><option value="Masculino">Masculino</option><option value="Feminino">Feminino</option><option value="Outro">Outro</option></select></div><select value={newStudentData.schoolYear} onChange={(e) => setNewStudentData({ ...newStudentData, schoolYear: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none"><option value="6º Ano">6º Ano</option><option value="7º Ano">7º Ano</option><option value="8º Ano">8º Ano</option><option value="9º Ano">9º Ano</option></select><input type="text" placeholder="WhatsApp Aluno" value={newStudentData.studentPhone} onChange={(e) => setNewStudentData({ ...newStudentData, studentPhone: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none" /><div className="col-span-1 md:col-span-2 text-xs font-bold text-slate-400 uppercase tracking-wider mt-4">Dados do Responsável</div><input type="text" placeholder="Nome Responsável" value={newStudentData.parentName} onChange={(e) => setNewStudentData({ ...newStudentData, parentName: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none" /><input type="email" placeholder="Email Responsável" value={newStudentData.parentEmail} onChange={(e) => setNewStudentData({ ...newStudentData, parentEmail: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none" /><input type="text" placeholder="WhatsApp Responsável" value={newStudentData.parentPhone} onChange={(e) => setNewStudentData({ ...newStudentData, parentPhone: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50 focus:border-[#a51a8f] focus:outline-none" /></div><div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-4"><button onClick={() => setShowStudentForm(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors">Cancelar</button><button onClick={handleAddStudent} className="bg-[#a51a8f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#7d126b] shadow-lg shadow-[#a51a8f]/30 flex items-center gap-2 transition-transform transform hover:scale-105 active:scale-95"><Save size={18} /> Salvar Cadastro</button></div></div>)}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-50 text-slate-500 text-xs uppercase"><tr><th className="p-4">Aluno</th><th className="p-4">Código</th><th className="p-4">Ano</th><th className="p-4">Responsável</th><th className="p-4">XP</th></tr></thead><tbody className="divide-y divide-slate-100">{students.filter(s => s.role === 'student').map(st => (<tr key={st.id} className="hover:bg-slate-50 text-sm"><td className="p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-xl overflow-hidden shrink-0">{st.photoUrl ? <img src={st.photoUrl} alt={st.name} className="w-full h-full object-cover" /> : st.avatar}</div><div><p className="font-bold text-slate-700">{st.name}</p><p className="text-xs text-slate-400">{st.studentPhone || 'Sem cel'}</p></div></td><td className="p-4"><span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">{st.userCode || 'N/A'}</span></td><td className="p-4"><span className="bg-[#fff9db] text-[#b89508] px-2 py-1 rounded text-xs font-bold border border-[#eec00a]">{st.schoolYear || '-'}</span></td><td className="p-4"><p className="text-slate-700">{st.parentName || '-'}</p><p className="text-xs text-slate-400">{st.parentPhone || '-'}</p></td><td className="p-4 font-bold text-[#a51a8f]">{st.xp}</td></tr>))}</tbody></table></div>
                    </div>
                );
            case 'classes':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        {editingClass && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"><div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-2xl animate-slideUp"><div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4"><h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Edit size={20} className="text-[#a51a8f]" /> Editar / Reatribuir Aula</h3><button onClick={() => setEditingClass(null)}><X size={24} className="text-slate-400 hover:text-slate-600" /></button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><input type="text" placeholder="Título" value={editingClass.title} onChange={e => setEditingClass({ ...editingClass, title: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50" />
                            <input type="datetime-local" value={editingClass.scheduledAt || ''} onChange={e => setEditingClass({ ...editingClass, scheduledAt: e.target.value })} className="border rounded-xl px-4 py-2 bg-slate-50" />
                            <div className="flex items-center gap-2 bg-slate-50 border rounded-xl px-2"><Filter size={14} className="text-[#a51a8f]" /><select value={classFilterYear} onChange={(e) => setClassFilterYear(e.target.value)} className="bg-transparent text-sm focus:outline-none w-full py-2"><option value="Todos">Todos os Anos</option><option value="6º Ano">6º Ano</option><option value="7º Ano">7º Ano</option><option value="8º Ano">8º Ano</option><option value="9º Ano">9º Ano</option></select></div><div className="col-span-2"><label className="block text-sm font-bold text-slate-600 mb-2">Atribuir a:</label><div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-xl bg-slate-50">{students.filter(s => s.role === 'student' && (classFilterYear === 'Todos' || s.schoolYear === classFilterYear)).map(st => (<button key={st.id} onClick={() => { const current = editingClass.assignedTo || []; if (current.includes(st.id)) setEditingClass({ ...editingClass, assignedTo: current.filter(id => id !== st.id) }); else setEditingClass({ ...editingClass, assignedTo: [...current, st.id] }); }} className={`px-3 py-1 rounded-full text-xs border transition-all ${(editingClass.assignedTo || []).includes(st.id) ? 'bg-[#a51a8f] text-white border-[#a51a8f]' : 'bg-white text-slate-600 border-slate-300'}`}>{st.name} {st.schoolYear && <span className="opacity-70 text-[9px]">({st.schoolYear})</span>}</button>))}</div></div>
                            <div className="col-span-2 border-t pt-4 mt-2">
                                <label className="block text-sm font-bold text-slate-600 mb-2">Controle Manual de Status:</label>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingClass({ ...editingClass, manualStatus: 'live' })} className={`px-3 py-1 rounded-lg border text-sm ${editingClass.manualStatus === 'live' ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-600'}`}>Forçar AO VIVO</button>
                                    <button onClick={() => setEditingClass({ ...editingClass, manualStatus: 'completed' })} className={`px-3 py-1 rounded-lg border text-sm ${editingClass.manualStatus === 'completed' ? 'bg-green-500 text-white border-green-500' : 'bg-white text-slate-600'}`}>Forçar Finalizada</button>
                                    <button onClick={() => setEditingClass({ ...editingClass, manualStatus: null })} className="px-3 py-1 rounded-lg border bg-slate-100 text-slate-600 text-sm">Automático</button>
                                </div>
                            </div>
                        </div><div className="flex justify-end gap-3 mt-6"><button onClick={() => setEditingClass(null)} className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100">Cancelar</button><button onClick={handleUpdateClass} className="bg-[#a51a8f] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#7d126b]">Salvar Alterações</button></div></div></div>)}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="font-bold text-lg mb-4 text-slate-800">Criar Nova Aula</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><input type="text" placeholder="Título da Aula" className="border rounded-xl px-4 py-2" value={newClass.title} onChange={e => setNewClass({ ...newClass, title: e.target.value })} />
                            <input type="datetime-local" className="border rounded-xl px-4 py-2" value={newClass.scheduledAt} onChange={e => setNewClass({ ...newClass, scheduledAt: e.target.value })} />
                            <input type="text" placeholder="Link da Aula (Meet ou Vídeo)" className="border rounded-xl px-4 py-2 col-span-2" value={newClass.link} onChange={e => setNewClass({ ...newClass, link: e.target.value })} /><textarea placeholder="Descrição da aula..." className="border rounded-xl px-4 py-2 col-span-2" value={newClass.description} onChange={e => setNewClass({ ...newClass, description: e.target.value })}></textarea><div className="col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200"><label className="block text-sm font-bold text-slate-600 mb-2 flex items-center gap-2"><Paperclip size={16} /> Materiais de Apoio / Anexos</label><div className="flex gap-2 mb-2"><input type="text" placeholder="Título (ex: PDF Slides)" className="flex-1 border rounded-lg px-3 py-2 text-sm" value={materialInput.title} onChange={e => setMaterialInput({ ...materialInput, title: e.target.value })} /><select className="border rounded-lg px-3 py-2 text-sm bg-white" value={materialInput.type} onChange={e => setMaterialInput({ ...materialInput, type: e.target.value })}><option value="pdf">PDF</option><option value="video">Vídeo</option><option value="link">Link</option></select></div><div className="flex gap-2 mb-3"><input type="text" placeholder="URL do Arquivo/Link" className="flex-1 border rounded-lg px-3 py-2 text-sm" value={materialInput.url} onChange={e => setMaterialInput({ ...materialInput, url: e.target.value })} /><button onClick={handleAddMaterialToClass} className="bg-slate-700 text-white px-4 rounded-lg text-sm font-bold hover:bg-slate-800">Add</button></div>{newClass.materials.length > 0 && (<div className="flex flex-wrap gap-2 mt-2">{newClass.materials.map((mat, idx) => (<div key={idx} className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-slate-200 text-sm text-slate-700">{mat.type === 'pdf' ? <FileText size={14} /> : mat.type === 'video' ? <PlayCircle size={14} /> : <LinkIcon size={14} />}<span className="truncate max-w-[150px]">{mat.title}</span><button onClick={() => handleRemoveMaterialFromClass(idx)} className="text-red-400 hover:text-red-600 ml-1"><X size={14} /></button></div>))}</div>)}</div><div className="col-span-2"><div className="flex justify-between items-center mb-2"><label className="block text-sm font-bold text-slate-600">Atribuir a (Opcional - Deixe vazio para todos):</label><div className="flex items-center gap-2"><Filter size={16} className="text-[#a51a8f]" /><select value={classFilterYear} onChange={(e) => setClassFilterYear(e.target.value)} className="text-sm border rounded-lg px-2 py-1 bg-slate-50 focus:border-[#a51a8f] focus:outline-none"><option value="Todos">Todos os Anos</option><option value="6º Ano">6º Ano</option><option value="7º Ano">7º Ano</option><option value="8º Ano">8º Ano</option><option value="9º Ano">9º Ano</option></select></div></div><div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">{students.filter(s => s.role === 'student').filter(s => classFilterYear === 'Todos' || s.schoolYear === classFilterYear).map(st => (<button key={st.id} onClick={() => { const current = newClass.assignedTo; if (current.includes(st.id)) setNewClass({ ...newClass, assignedTo: current.filter(id => id !== st.id) }); else setNewClass({ ...newClass, assignedTo: [...current, st.id] }); }} className={`px-3 py-1 rounded-full text-xs border transition-all ${newClass.assignedTo.includes(st.id) ? 'bg-[#a51a8f] text-white border-[#a51a8f] shadow-sm scale-105' : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'}`}>{st.name} {st.schoolYear && <span className="opacity-70 text-[9px]">({st.schoolYear})</span>}</button>))}</div></div></div><button onClick={handleAddClass} className="w-full bg-[#a51a8f] text-white py-3 rounded-xl font-bold hover:bg-[#7d126b]">Publicar Aula</button></div>
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"><div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center"><h3 className="font-bold text-slate-700 flex items-center gap-2"><Video size={18} className="text-[#a51a8f]" />Gerenciar Aulas</h3><span className="text-xs font-bold text-slate-400 uppercase">{classes.length} Aulas</span></div><table className="w-full text-left"><thead className="bg-slate-50 text-slate-500 text-xs uppercase"><tr><th className="p-4">Código</th><th className="p-4">Título</th><th className="p-4">Criado Por</th><th className="p-4">Status (Calc / Manual)</th><th className="p-4 text-right">Ações</th></tr></thead><tbody className="divide-y divide-slate-100">{classes.map(cls => {
                            const status = getClassStatus(cls); // Computed status
                            return (
                                <tr key={cls.id} className="hover:bg-slate-50 text-sm"><td className="p-4"><span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">{cls.classCode || '-'}</span></td><td className="p-4 font-bold text-slate-700"><div>{cls.title}</div><div className="text-xs text-slate-400">{formatDate(cls.scheduledAt)}</div></td><td className="p-4 text-slate-500 italic">{cls.createdBy || 'Sistema'}</td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${status === 'live' ? 'bg-red-100 text-red-600 animate-pulse' : status === 'completed' ? 'bg-green-100 text-green-600' : status === 'soon' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-200 text-slate-600'}`}>{status.toUpperCase()}</span>
                                        {cls.manualStatus && <span className="ml-2 text-[10px] bg-slate-800 text-white px-1 rounded">MANUAL</span>}
                                    </td>
                                    <td className="p-4 text-right"><div className="flex justify-end gap-2">
                                        <button onClick={() => toggleClassStatus(cls, 'live')} className={`p-1 rounded ${cls.manualStatus === 'live' ? 'bg-red-500 text-white' : 'text-slate-300 hover:text-red-500'}`} title="Ao Vivo"><Video size={14} /></button>
                                        <button onClick={() => toggleClassStatus(cls, 'completed')} className={`p-1 rounded ${cls.manualStatus === 'completed' ? 'bg-green-500 text-white' : 'text-slate-300 hover:text-green-500'}`} title="Finalizar"><CheckSquare size={14} /></button>
                                        <button onClick={() => setEditingClass(cls)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar"><Edit size={16} /></button><button onClick={() => handleDuplicateClass(cls)} className="p-2 text-slate-400 hover:text-[#a51a8f] hover:bg-[#fdf2fa] rounded-lg" title="Duplicar"><Copy size={16} /></button><button onClick={() => handleDeleteClass(cls.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Excluir"><Trash2 size={16} /></button></div></td></tr>
                            );
                        })}</tbody></table></div>
                    </div>
                );
            case 'challenges':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        {!showChallengeForm ? (
                            <div className="flex justify-end"><button onClick={() => { setNewChallenge({ id: null, title: '', xpReward: 50, coinReward: 5, questions: [], assignedTo: [], deadline: '' }); setShowChallengeForm(true); }} className="bg-[#a51a8f] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#7d126b] shadow-lg shadow-[#a51a8f]/30 flex items-center gap-2 transition-all transform hover:scale-105"><PlusCircle size={20} /> Criar Novo Desafio</button></div>
                        ) : (
                            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-slideUp">
                                <div className="bg-[#2d1b36] p-6 text-white"><div className="flex justify-between items-start mb-4"><h2 className="text-xl font-bold">{newChallenge.id ? 'Editar Desafio' : 'Criador de Desafios'}</h2><button onClick={() => setShowChallengeForm(false)} className="hover:bg-white/10 p-2 rounded-full"><X /></button></div><input type="text" placeholder="Título do Desafio (ex: Quiz de Verbos)" className="w-full bg-transparent text-2xl font-bold placeholder-white/40 focus:outline-none border-b border-white/20 pb-2 mb-4" value={newChallenge.title} onChange={e => setNewChallenge({ ...newChallenge, title: e.target.value })} /><div className="flex flex-wrap gap-4 mb-4"><div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg"><span className="text-sm font-bold text-[#eec00a]">XP</span><input type="number" className="bg-transparent w-16 text-white font-mono focus:outline-none" value={newChallenge.xpReward} onChange={e => setNewChallenge({ ...newChallenge, xpReward: parseInt(e.target.value) })} /></div><div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg"><Star size={14} className="text-[#eec00a] fill-[#eec00a]" /><input type="number" className="bg-transparent w-16 text-white font-mono focus:outline-none" value={newChallenge.coinReward} onChange={e => setNewChallenge({ ...newChallenge, coinReward: parseInt(e.target.value) })} /></div><div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg"><Clock size={16} className="text-[#eec00a]" /><input type="datetime-local" className="bg-transparent text-white text-xs focus:outline-none" value={newChallenge.deadline} onChange={e => setNewChallenge({ ...newChallenge, deadline: e.target.value })} /></div><div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-lg"><Clock size={16} className="text-[#eec00a]" /><input type="number" placeholder="Minutos (Opcional)" className="bg-transparent text-white text-xs focus:outline-none w-28" value={newChallenge.timeLimit} onChange={e => setNewChallenge({ ...newChallenge, timeLimit: e.target.value })} /></div></div><div className="mt-4 pt-4 border-t border-white/10"><div className="flex justify-between items-center mb-2"><label className="text-xs font-bold uppercase tracking-wider text-white/70">Atribuir a (Opcional - Vazio = Todos):</label><div className="flex items-center gap-2"><Filter size={14} className="text-[#eec00a]" /><select value={classFilterYear} onChange={(e) => setClassFilterYear(e.target.value)} className="text-xs bg-white/20 border-none rounded px-2 py-1 text-white focus:outline-none"><option className="text-slate-800" value="Todos">Todos</option><option className="text-slate-800" value="6º Ano">6º Ano</option><option className="text-slate-800" value="7º Ano">7º Ano</option><option className="text-slate-800" value="8º Ano">8º Ano</option><option className="text-slate-800" value="9º Ano">9º Ano</option></select></div></div><div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">{students.filter(s => s.role === 'student' && (classFilterYear === 'Todos' || s.schoolYear === classFilterYear)).map(st => (<button key={st.id} onClick={() => { const current = newChallenge.assignedTo || []; if (current.includes(st.id)) setNewChallenge({ ...newChallenge, assignedTo: current.filter(id => id !== st.id) }); else setNewChallenge({ ...newChallenge, assignedTo: [...current, st.id] }); }} className={`px-3 py-1 rounded-full text-xs border transition-all ${(newChallenge.assignedTo || []).includes(st.id) ? 'bg-[#eec00a] text-[#2d1b36] border-[#eec00a] font-bold' : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'}`}>{st.name}</button>))}</div></div></div>
                                <div className="p-6 bg-slate-50 border-b border-slate-200">{newChallenge.questions.length === 0 ? (<p className="text-center text-slate-400 py-4">Nenhuma questão adicionada ainda.</p>) : (<div className="space-y-4">{newChallenge.questions.map((q, idx) => (<div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group"><div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => setNewChallenge({ ...newChallenge, questions: newChallenge.questions.filter((_, i) => i !== idx) })} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button></div><div className="flex items-center gap-2 mb-2"><span className="bg-slate-100 text-slate-500 text-xs font-bold px-2 py-1 rounded uppercase">{q.type}</span></div><p className="font-bold text-slate-800">{idx + 1}. {q.q}</p></div>))}</div>)}</div>
                                <div className="p-6"><h4 className="font-bold text-slate-700 mb-4 flex items-center gap-2">Adicionar Questão</h4><div className="flex gap-4 mb-4"><div className="w-1/3"><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tipo</label><div className="space-y-2"><button onClick={() => setCurrentQuestion({ ...currentQuestion, type: 'multiple_choice' })} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left ${currentQuestion.type === 'multiple_choice' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-slate-50'}`}><CheckSquare size={16} /> Múltipla Escolha</button><button onClick={() => setCurrentQuestion({ ...currentQuestion, type: 'true_false' })} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left ${currentQuestion.type === 'true_false' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-slate-50'}`}><Check size={16} /> Verdadeiro / Falso</button><button onClick={() => setCurrentQuestion({ ...currentQuestion, type: 'short_answer' })} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left ${currentQuestion.type === 'short_answer' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-slate-50'}`}><Type size={16} /> Resposta Curta</button><button onClick={() => setCurrentQuestion({ ...currentQuestion, type: 'long_answer' })} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left ${currentQuestion.type === 'long_answer' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'hover:bg-slate-50'}`}><AlignLeft size={16} /> Resposta Longa</button></div></div><div className="w-2/3 space-y-4"><div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">Enunciado</label><textarea className="w-full border rounded-xl p-3 focus:border-[#a51a8f] focus:outline-none" rows={2} placeholder="Digite a pergunta aqui..." value={currentQuestion.text} onChange={e => setCurrentQuestion({ ...currentQuestion, text: e.target.value })}></textarea></div>{currentQuestion.type === 'multiple_choice' && (<div className="bg-slate-50 p-4 rounded-xl border border-slate-200"><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Opções (Marque a correta)</label>{currentQuestion.options.map((opt, idx) => (<div key={idx} className="flex gap-2 mb-2"><input type="radio" name="correctOpt" checked={currentQuestion.correctAnswer === opt && opt !== ''} onChange={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: opt })} className="mt-2" /><input type="text" className="flex-1 border rounded-lg px-3 py-1.5 text-sm" placeholder={`Opção ${idx + 1}`} value={opt} onChange={(e) => { const newOpts = [...currentQuestion.options]; newOpts[idx] = e.target.value; const newCorrect = currentQuestion.correctAnswer === opt ? e.target.value : currentQuestion.correctAnswer; setCurrentQuestion({ ...currentQuestion, options: newOpts, correctAnswer: newCorrect }); }} /></div>))}<button onClick={() => setCurrentQuestion({ ...currentQuestion, options: [...currentQuestion.options, ''] })} className="text-xs font-bold text-[#a51a8f] hover:underline mt-1">+ Adicionar Opção</button></div>)}{currentQuestion.type === 'true_false' && (<div className="flex gap-4"><button onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 'Verdadeiro' })} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${currentQuestion.correctAnswer === 'Verdadeiro' ? 'bg-green-100 border-green-500 text-green-700' : 'hover:bg-slate-50'}`}>Verdadeiro</button><button onClick={() => setCurrentQuestion({ ...currentQuestion, correctAnswer: 'Falso' })} className={`flex-1 py-3 rounded-xl border font-bold transition-all ${currentQuestion.correctAnswer === 'Falso' ? 'bg-red-100 border-red-500 text-red-700' : 'hover:bg-slate-50'}`}>Falso</button></div>)}{(currentQuestion.type === 'short_answer' || currentQuestion.type === 'long_answer') && (<div><label className="block text-xs font-bold text-slate-400 uppercase mb-1">{currentQuestion.type === 'short_answer' ? 'Resposta Correta (Exata)' : 'Resposta Modelo (Opcional)'}</label><input type="text" className="w-full border rounded-xl px-4 py-2" placeholder="Digite a resposta esperada..." value={currentQuestion.correctAnswer} onChange={e => setCurrentQuestion({ ...currentQuestion, correctAnswer: e.target.value })} /></div>)}<button onClick={addQuestionToChallenge} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 flex justify-center items-center gap-2"><Plus size={18} /> Adicionar Questão ao Desafio</button></div></div></div><div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3"><button onClick={() => setShowChallengeForm(false)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-200">Cancelar</button><button onClick={saveChallenge} className="bg-[#a51a8f] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#7d126b] shadow-lg">Salvar Desafio</button></div></div>
                        )}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mt-8">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center"><h3 className="font-bold text-slate-700 flex items-center gap-2"><Gamepad2 size={18} className="text-[#a51a8f]" />Gerenciar Desafios</h3><span className="text-xs font-bold text-slate-400 uppercase">{quizzes.length} Desafios</span></div>
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                                    <tr>
                                        <th className="p-4">Título</th>
                                        <th className="p-4">Código</th>
                                        <th className="p-4">Criado Por</th>
                                        <th className="p-4">XP</th>
                                        <th className="p-4 text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {quizzes.map(qz => (
                                        <tr key={qz.id} className="hover:bg-slate-50 text-sm">
                                            <td className="p-4 font-bold text-slate-700">{qz.title}</td>
                                            <td className="p-4"><span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-600 font-bold">{qz.challengeCode || '-'}</span></td>
                                            <td className="p-4 text-slate-500 italic">{qz.createdBy || 'Sistema'}</td>
                                            <td className="p-4 text-[#a51a8f] font-bold">{qz.xpReward} XP</td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => handleEditChallenge(qz)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                                                    <button onClick={() => deleteChallenge(qz.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'financial':
                if (currentUser.role !== 'admin') return <div className="p-8 text-center text-red-500 flex flex-col items-center"><ShieldAlert size={48} className="mb-4" /> Acesso Negado: Apenas o Diretor tem acesso ao financeiro.</div>;
                return <ViewFinancial students={students} />;
            case 'calendar':
                return <ViewCalendar classes={classes} />;
            case 'corrections':
                return <ViewCorrections students={students} quizzes={quizzes} />;
            default:
                return <div className="text-center py-10 text-slate-400">Em desenvolvimento...</div>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row">
            <aside className="hidden md:flex flex-col w-64 bg-[#2d1b36] text-white h-screen sticky top-0"><div className="p-6 border-b border-white/10 flex flex-col items-center justify-center"><div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-3xl mb-3">{currentUser.avatar}</div><div className="text-center"><h1 className="font-bold text-lg text-[#eec00a]">{currentUser.name}</h1><p className="text-xs text-white/50 uppercase tracking-widest">{currentUser.role === 'admin' ? 'Diretoria' : 'Professor'}</p></div></div><nav className="flex-1 p-4 space-y-2"><NavButton active={currentView === 'overview'} onClick={() => setCurrentView('overview')} icon={<Home />} label="Visão Geral" dark /><NavButton active={currentView === 'students'} onClick={() => setCurrentView('students')} icon={<Users />} label="Alunos" dark /><NavButton active={currentView === 'classes'} onClick={() => setCurrentView('classes')} icon={<Video />} label="Gestão de Aulas" dark /><NavButton active={currentView === 'challenges'} onClick={() => setCurrentView('challenges')} icon={<Gamepad2 />} label="Criar Desafios" dark /><NavButton active={currentView === 'corrections'} onClick={() => setCurrentView('corrections')} icon={<FileCheck />} label="Correções" dark />{currentUser.role === 'admin' && <NavButton active={currentView === 'financial'} onClick={() => setCurrentView('financial')} icon={<DollarSign />} label="Financeiro" dark />}<NavButton active={currentView === 'calendar'} onClick={() => setCurrentView('calendar')} icon={<CalendarDays />} label="Agenda" dark /></nav><div className="p-4 border-t border-white/10"><button onClick={onLogout} className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium text-sm"><LogOut size={18} /> Sair</button></div></aside>
            <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8"><header className="md:hidden flex justify-between items-center mb-6"><div className="w-32"><LogoSVG className="w-full h-auto" /></div><button onClick={onLogout}><LogOut size={20} /></button></header><h2 className="text-2xl font-bold text-slate-800 mb-6 capitalize">{currentView === 'overview' ? 'Visão Geral' : currentView}</h2>{renderContent()}</main>
            <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 grid grid-cols-6 gap-0.5 px-1 py-1 z-50 pb-safe">
                <MobileNavButton active={currentView === 'overview'} onClick={() => setCurrentView('overview')} icon={<Home size={18} />} label="Home" compact />
                <MobileNavButton active={currentView === 'students'} onClick={() => setCurrentView('students')} icon={<Users size={18} />} label="Alunos" compact />
                <MobileNavButton active={currentView === 'classes'} onClick={() => setCurrentView('classes')} icon={<Video size={18} />} label="Aulas" compact />
                <MobileNavButton active={currentView === 'challenges'} onClick={() => setCurrentView('challenges')} icon={<Gamepad2 size={18} />} label="Desafios" compact />
                <MobileNavButton active={currentView === 'corrections'} onClick={() => setCurrentView('corrections')} icon={<FileCheck size={18} />} label="Correção" compact />
                <MobileNavButton active={currentView === 'calendar'} onClick={() => setCurrentView('calendar')} icon={<CalendarDays size={18} />} label="Agenda" compact />
            </nav>
        </div>
    );
};
