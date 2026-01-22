import React, { useState } from 'react';
import { collection, doc, setDoc, updateDoc, deleteDoc, query, arrayUnion } from 'firebase/firestore';
import { db, appId } from '../firebase';
import { NavButton, MobileNavButton, LogoSVG } from './Shared';
import { Home, Users, Video, DollarSign, CalendarDays, LogOut, UserPlus, X, Save, Edit, Filter, Paperclip, Link as LinkIcon, PlayCircle, FileText, Trash2, Copy, ShieldAlert, Gamepad2, PlusCircle, Star, Clock, CheckSquare, Check, Type, AlignLeft, Plus } from 'lucide-react';
import { ViewCalendar } from '../views/ViewCalendar';

export const AdminDashboard = ({ currentUser, students, classes, quizzes, onLogout }) => {
    const [currentView, setCurrentView] = useState('overview');
    const [showStudentForm, setShowStudentForm] = useState(false);
    const [classFilterYear, setClassFilterYear] = useState('Todos');
    const [editingClass, setEditingClass] = useState(null);
    const [newStudentData, setNewStudentData] = useState({ name: '', age: '', gender: 'Masculino', parentName: '', parentEmail: '', parentPhone: '', studentPhone: '', schoolYear: '6º Ano', photoUrl: '' });
    const [newClass, setNewClass] = useState({ title: '', date: '', description: '', link: '', type: 'meet', assignedTo: [], materials: [] });
    // Simplified logic for brevity, keeping core structure to allow compilation
    const totalStudents = students.filter(s => s.role === 'student').length;
    const totalClasses = classes.length;

    const renderContent = () => {
        switch (currentView) {
            case 'overview':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"><div className="p-4 bg-indigo-100 text-indigo-600 rounded-xl"><Users size={24} /></div><div><p className="text-sm text-slate-500">Total de Alunos</p><p className="text-2xl font-bold text-slate-800">{totalStudents}</p></div></div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"><div className="p-4 bg-purple-100 text-purple-600 rounded-xl"><Video size={24} /></div><div><p className="text-sm text-slate-500">Aulas Criadas</p><p className="text-2xl font-bold text-slate-800">{totalClasses}</p></div></div>
                    </div>
                );
            case 'calendar': return <ViewCalendar classes={classes} />;
            default: return <div className="text-center py-10 text-slate-400">Em desenvolvimento...</div>;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row">
            <aside className="hidden md:flex flex-col w-64 bg-[#2d1b36] text-white h-screen sticky top-0"><div className="p-6 border-b border-white/10 flex flex-col items-center justify-center"><div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-3xl mb-3">{currentUser.avatar}</div><div className="text-center"><h1 className="font-bold text-lg text-[#eec00a]">{currentUser.name}</h1><p className="text-xs text-white/50 uppercase tracking-widest">{currentUser.role === 'admin' ? 'Diretoria' : 'Professor'}</p></div></div><nav className="flex-1 p-4 space-y-2"><NavButton active={currentView === 'overview'} onClick={() => setCurrentView('overview')} icon={<Home />} label="Visão Geral" dark /><NavButton active={currentView === 'calendar'} onClick={() => setCurrentView('calendar')} icon={<CalendarDays />} label="Agenda" dark /></nav><div className="p-4 border-t border-white/10"><button onClick={onLogout} className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all font-medium text-sm"><LogOut size={18} /> Sair</button></div></aside>
            <main className="flex-1 max-w-5xl mx-auto w-full p-4 md:p-8"><h2 className="text-2xl font-bold text-slate-800 mb-6 capitalize">{currentView}</h2>{renderContent()}</main>
        </div>
    );
};
