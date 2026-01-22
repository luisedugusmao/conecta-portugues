import { collection, doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../firebase';

export const seedDatabase = async (currentUserId) => {
    if (!currentUserId) return;
    const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'students');
    const classesRef = collection(db, 'artifacts', appId, 'public', 'data', 'classes');
    const quizzesRef = collection(db, 'artifacts', appId, 'public', 'data', 'quizzes');

    const users = [
        { id: 'admin1', name: 'Diretor(a)', avatar: '👔', xp: 0, level: 99, coins: 0, password: 'admin', role: 'admin' },
        { id: 'teacher1', name: 'Prof. Substituto', avatar: '👩‍🏫', xp: 0, level: 50, coins: 0, password: 'teacher', role: 'teacher' },
        { id: 'st1', name: 'Ana Silva', avatar: '👩‍🔬', xp: 2450, level: 5, coins: 320, password: '1234', role: 'student', schoolYear: '9º Ano', userCode: 'ANA1234', photoUrl: '' },
        { id: 'st2', name: 'João Pedro', avatar: '👨‍🎨', xp: 150, level: 1, coins: 5, password: '1234', role: 'student', schoolYear: '6º Ano', userCode: 'JOAO5678', photoUrl: '' },
        { id: 'st3', name: 'Beatriz Costa', avatar: '👩‍🚀', xp: 1200, level: 3, coins: 150, password: '1234', role: 'student', schoolYear: '8º Ano', userCode: 'BEA9012', photoUrl: '' },
    ];
    for (const u of users) await setDoc(doc(usersRef, u.id), u);

    const classes = [
        { id: 'cl1', title: 'Introdução à Gramática', classCode: 'AUL1001', date: '15/10 - 14:00', description: 'Nossa primeira aula sobre a estrutura da língua portuguesa.', recordingLink: 'https://youtube.com/example', materials: [{ type: 'pdf', title: 'Slides da Aula 1.pdf' }], status: 'completed', sortOrder: 1, assignedTo: [], createdBy: 'Diretor(a)' },
        { id: 'cl2', title: 'A Aventura dos Substantivos', classCode: 'AUL2023', date: 'AGORA - AO VIVO', description: 'Entre agora para participar da aula interativa sobre substantivos!', meetLink: 'https://meet.google.com/abc-defg-hij', materials: [{ type: 'pdf', title: 'Resumo da Aula.pdf' }], status: 'live', sortOrder: 2, assignedTo: [], createdBy: 'Prof. Substituto' }
    ];
    for (const cl of classes) await setDoc(doc(classesRef, cl.id), cl);

    const quizzes = [
        { id: 'qz1', title: 'Desafio Rápido: Substantivos', challengeCode: 'DES1001', xpReward: 100, coinReward: 10, assignedTo: [], completedBy: [], deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16), createdBy: 'Diretor(a)', questions: [{ type: 'multiple_choice', q: 'Qual destas palavras é um substantivo próprio?', options: ['cadeira', 'correr', 'Brasil', 'azul'], answer: 'Brasil' }, { type: 'multiple_choice', q: 'O plural de "pão" é:', options: ['pãos', 'pães', 'paões', 'panes'], answer: 'pães' }] }
    ];
    for (const qz of quizzes) await setDoc(doc(quizzesRef, qz.id), qz);

    alert('Banco de dados atualizado!');
};
