import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../firebase';
import {
    X, Printer, Save, GraduationCap, Star, Trophy, Target,
    BookOpen, Calendar, MessageSquare, AlertCircle, TrendingUp, AlertTriangle, CheckCircle
} from 'lucide-react';

export const ViewStudentDetails = ({ student, classes, quizzes = [], onClose }) => {
    const [submissions, setSubmissions] = useState([]);
    const [stats, setStats] = useState({
        accuracy: 0,
        totalQuizzes: 0,
        completedQuizzes: 0,
        missedQuizzes: 0,
        missedRate: 0,
        averageScore: 0,
        classesThisMonth: 0
    });
    const [loading, setLoading] = useState(true);
    const [observation, setObservation] = useState(student.observations || '');
    const [savingObs, setSavingObs] = useState(false);

    // For print ref
    const contentRef = useRef();

    useEffect(() => {
        const fetchStudentData = async () => {
            if (!student?.id) return;

            try {
                // Fetch Submissions
                const q = query(
                    collection(db, 'artifacts', appId, 'public', 'data', 'submissions'),
                    where("studentId", "==", student.id)
                );
                const querySnapshot = await getDocs(q);
                const subs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                // --- Advanced Stats Calculation ---

                // 1. Accuracy
                let totalScore = 0;
                let totalMaxScore = 0;
                subs.forEach(s => {
                    totalScore += (s.score || 0);
                    totalMaxScore += (s.totalQuestions || 1);
                });
                const accuracy = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;

                // 2. Missed Quizzes Logic
                // Filter quizzes assigned to THIS student (or all if assignedTo is empty)
                const assignedQuizzes = quizzes.filter(q =>
                    !q.assignedTo || q.assignedTo.length === 0 || q.assignedTo.includes(student.id)
                );

                const totalAssigned = assignedQuizzes.length;
                const completedCount = subs.filter(s => s.status === 'graded' || s.status === 'completed').length;

                // "Missed" logic: Assigned - Completed (Simplification: assumes all assigned should be done)
                // Ideally check deadlines, but let's stick to simple "To Do vs Done"
                const missedCount = Math.max(0, totalAssigned - completedCount);
                const missedRate = totalAssigned > 0 ? Math.round((missedCount / totalAssigned) * 100) : 0;

                // 3. Classes this month (Attendance Proxy)
                // Filter classes with scheduledAt in the current month AND status completed (or just past date)
                const now = new Date();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                const classesThisMonth = classes.filter(c => {
                    if (!c.scheduledAt) return false;
                    const d = new Date(c.scheduledAt);
                    return d.getMonth() === currentMonth && d.getFullYear() === currentYear && d <= now;
                }).length;

                // --- History Construction ---
                // Combine submissions with missed quizzes
                const historyItems = [];

                // 1. Add Submissions
                subs.forEach(s => {
                    historyItems.push({
                        id: s.id,
                        title: s.quizTitle,
                        date: s.submittedAt ? new Date(s.submittedAt.seconds * 1000) : new Date(),
                        score: `${s.score} / ${s.totalQuestions}`,
                        status: s.status === 'graded' ? 'graded' : 'pending',
                        isMissed: false
                    });
                });

                // 2. Add Missed Quizzes (Assigned but not in subs)
                const submittedQuizIds = subs.map(s => s.quizId);
                const missedQuizzesList = assignedQuizzes.filter(q => !submittedQuizIds.includes(q.id));

                missedQuizzesList.forEach(q => {
                    historyItems.push({
                        id: q.id,
                        title: q.title,
                        date: q.deadline ? new Date(q.deadline) : new Date(), // Use deadline as date reference
                        score: '-',
                        status: 'missed',
                        isMissed: true
                    });
                });

                // Sort by date descending
                historyItems.sort((a, b) => b.date - a.date);

                setSubmissions(historyItems); // Repurpose state for full history
                setStats({
                    accuracy,
                    totalQuizzes: totalAssigned,
                    completedQuizzes: completedCount,
                    missedQuizzes: missedCount,
                    missedRate,
                    averageScore: completedCount > 0 ? (totalScore / completedCount).toFixed(1) : 0,
                    classesThisMonth
                });

            } catch (err) {
                console.error("Error fetching student details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [student.id, quizzes, classes]);

    const handleSaveObservation = async () => {
        setSavingObs(true);
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', student.id), {
                observations: observation,
                lastObservationUpdate: serverTimestamp()
            });
            alert("Observações salvas com sucesso!");
        } catch (err) {
            console.error("Error saving observation:", err);
            alert("Erro ao salvar observação.");
        } finally {
            setSavingObs(false);
        }
    };

    const handlePrint = () => {
        const newWin = window.open('', 'Relatório', 'height=800,width=800');

        newWin.document.write(`
            <html><head><title>Relatório do Aluno - ${student.name}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;700&display=swap');
                @page { size: A4; margin: 0; }
                body { font-family: 'Outfit', sans-serif; color: #1e293b; margin: 20mm; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; }
                .header { display: flex; align-items: flex-start; justify-content: space-between; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 30px; }
                .header-left { display: flex; flex-direction: column; align-items: flex-start; }
                .header-right { text-align: right; }
                .footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding: 10px 0; background: white; }
                .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                .card { background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
                .stat-value { font-size: 24px; font-weight: bold; color: #a51a8f; }
                .stat-label { font-size: 12px; text-transform: uppercase; color: #64748b; letter-spacing: 1px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
                th { text-align: left; background: #e2e8f0; padding: 8px; font-weight: 700; color: #475569; }
                td { border-bottom: 1px solid #e2e8f0; padding: 8px; color: #334155; }
                .section-title { font-size: 16px; font-weight: bold; color: #2d1b36; margin: 30px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
                .observation { background: #fffbeb; padding: 15px; border-radius: 8px; border: 1px solid #fcd34d; margin-top: 10px; font-size: 14px; line-height: 1.5; color: #92400e; }
                .alert-high { color: #dc2626; }
                .alert-low { color: #16a34a; }
            </style>
            </head><body>
            
            <div class="header">
                <div class="header-left">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1373.75 371.2" style="width: 200px; height: auto;">
                        <g>
                            <path fill="#a51a8f" d="M382.08,0c14.52-.06,27.88,4.81,40.07,14.61,9.57,7.7,14.35,15.66,14.35,23.89,0,7-2.92,12.42-8.75,16.27-3.32,2.22-6.94,3.32-10.85,3.32-3.21,0-6.27-.76-9.19-2.27-1.22-.64-4.26-3.59-9.1-8.84-4.49-4.9-10.12-7.35-16.89-7.35s-12,2.26-16.41,6.78c-4.4,4.52-6.61,10.05-6.61,16.58s2.2,11.97,6.61,16.49c4.4,4.52,9.84,6.78,16.32,6.78,5.37,0,10.35-1.81,14.96-5.42,2.86-2.74,5.69-5.48,8.49-8.22,3.03-2.62,6.88-3.94,11.55-3.94,5.37,0,10.02,1.88,13.96,5.64,3.94,3.76,5.91,8.33,5.91,13.69,0,7.29-4.29,14.67-12.86,22.14-12.02,10.5-25.9,15.75-41.65,15.75-9.74,0-18.93-2.07-27.56-6.21-10.91-5.25-19.58-12.96-26.03-23.14-6.45-10.18-9.67-21.3-9.67-33.38,0-18.08,6.71-33.48,20.12-46.2C350.7,5.78,365.11.12,382.08,0Z" />
                            <path fill="#a51a8f" d="M505.36,0c12.13-.12,23.27,3.05,33.42,9.49,10.15,6.45,17.85,14.95,23.1,25.5,4.37,8.75,6.56,18.02,6.56,27.82,0,11.02-2.71,21.35-8.14,30.97-5.42,9.62-12.83,17.29-22.22,23.01-9.97,6.07-21,9.1-33.07,9.1s-22.68-3.17-32.85-9.49c-10.18-6.33-17.86-14.77-23.05-25.33-4.38-8.87-6.56-18.61-6.56-29.22,0-8.75,1.89-17.21,5.69-25.37,5.19-11.26,12.95-20.15,23.27-26.69C481.59,3.39,492.88.12,505.36,0Z" />
                            <path fill="#a51a8f" d="M647.01,48.65v-22.22c0-6.82,1.2-12.02,3.6-15.57,3.8-5.66,9.24-8.49,16.31-8.49,6.08,0,11.08,2.36,14.99,7.09,3.1,3.73,4.65,8.95,4.65,15.66v73.23c0,8.17-1.43,14.09-4.29,17.76-3.85,4.96-8.95,7.44-15.31,7.44s-11.61-2.65-15.75-7.96l-31.41-40.07v25.11c0,6.94-1.43,12.19-4.29,15.75-3.85,4.78-8.9,7.17-15.14,7.17-6.65,0-11.9-2.57-15.75-7.7-2.8-3.73-4.2-9.33-4.2-16.8V23.54c0-6.36,1.85-11.48,5.55-15.35,3.7-3.88,8.72-5.82,15.07-5.82,5.48,0,10.34,2.6,14.59,7.79l31.37,38.5Z" />
                            <path fill="#a51a8f" d="M742.82,85.75h17.9c7.39,0,12.89,1.52,16.5,4.55,4.25,3.62,6.37,8.28,6.37,14s-2.13,10.56-6.39,14.17c-3.32,2.8-8.78,4.2-16.36,4.2h-30.71c-7.23,0-12.19-.55-14.87-1.66-5.25-2.16-8.72-5.69-10.41-10.59-1.05-3.15-1.58-8.31-1.58-15.49V30.01c0-5.42.17-9.07.53-10.94.64-3.79,2.19-7,4.64-9.62,2.8-2.97,6.36-4.87,10.67-5.69,2.04-.35,6.18-.52,12.42-.52h23.54c6.42,0,10.15.06,11.2.17,4.2.41,7.64,1.63,10.32,3.67,4.78,3.62,7.17,8.34,7.17,14.17,0,6.3-2.1,11.11-6.29,14.44-3.73,2.97-8.82,4.46-15.28,4.46h-19.38v8.14h15.44c4.54,0,8.29,1.2,11.25,3.59,3.14,2.57,4.71,6.1,4.71,10.59,0,9.51-5.79,14.26-17.36,14.26h-14.05v9.01Z" />
                            <path fill="#a51a8f" d="M853.85,0c14.52-.06,27.88,4.81,40.07,14.61,9.57,7.7,14.35,15.66,14.35,23.89,0,7-2.92,12.42-8.75,16.27-3.32,2.22-6.94,3.32-10.85,3.32-3.21,0-6.27-.76-9.19-2.27-1.23-.64-4.26-3.59-9.1-8.84-4.49-4.9-10.12-7.35-16.89-7.35s-12,2.26-16.4,6.78c-4.41,4.52-6.61,10.05-6.61,16.58s2.2,11.97,6.61,16.49c4.4,4.52,9.84,6.78,16.32,6.78,5.37,0,10.35-1.81,14.96-5.42,2.86-2.74,5.69-5.48,8.49-8.22,3.03-2.62,6.88-3.94,11.55-3.94,5.37,0,10.02,1.88,13.96,5.64s5.91,8.33,5.91,13.69c0,7.29-4.29,14.67-12.86,22.14-12.02,10.5-25.9,15.75-41.65,15.75-9.74,0-18.93-2.07-27.56-6.21-10.91-5.25-19.58-12.96-26.03-23.14-6.45-10.18-9.67-21.3-9.67-33.38,0-18.08,6.71-33.48,20.12-46.2C822.47,5.78,836.87.12,853.85,0Z" />
                            <path fill="#a51a8f" d="M940.29,39.9h-10.41c-5.77,0-10.56-1.58-14.35-4.72-4.03-3.38-6.04-7.9-6.04-13.56,0-3.38.95-6.63,2.84-9.76,1.9-3.12,4.34-5.34,7.35-6.65,3-1.31,10.13-1.97,21.39-1.97h39.72c9.74,0,16.04.58,18.9,1.75,3.15,1.28,5.7,3.49,7.66,6.61,1.95,3.12,2.93,6.4,2.93,9.84,0,5.42-2.16,10.15-6.47,14.17-3.09,2.86-8.14,4.29-15.14,4.29h-9.01v59.5c0,6.47-1.11,11.49-3.32,15.05-3.73,5.95-9.13,8.92-16.19,8.92s-12.48-2.71-16.27-8.14c-2.39-3.38-3.59-8.52-3.59-15.4v-59.93Z" />
                            <path fill="#a51a8f" d="M1039.51,107.18c-1.87,4.43-3.79,7.73-5.77,9.89-3.97,4.32-8.78,6.47-14.44,6.47-6.94,0-12.34-2.8-16.19-8.4-2.27-3.32-3.41-7.06-3.41-11.2,0-3.44.82-6.91,2.45-10.41l37.36-79.53c3.62-7.76,9.65-11.64,18.11-11.64s14.73,4,18.46,11.99l37.71,80.14c1.52,3.21,2.27,6.39,2.27,9.54,0,4.67-1.52,8.81-4.55,12.42-3.97,4.72-9.04,7.09-15.22,7.09-5.07,0-9.3-1.57-12.69-4.72-2.51-2.33-5.02-6.21-7.52-11.64h-36.57Z" />
                        </g>
                        <g>
                            <path fill="#eec00a" d="M381.35,243.9v12.47c0,6.94-1.72,12.62-5.16,17.06-3.75,4.87-9,7.31-15.75,7.31-7.69,0-13.56-3.22-17.62-9.66-1.87-2.94-3-6.15-3.37-9.66-.19-1.44-.28-4.94-.28-10.5v-74.71c0-8.06,1.94-14.06,5.81-18,4.19-4.25,9.9-6.37,17.15-6.37h17.81c11.31,0,19.53.78,24.65,2.34,9.69,2.94,17.51,8.44,23.48,16.5,5.97,8.06,8.95,17.15,8.95,27.28,0,9.5-2.72,18.19-8.16,26.06-9.19,13.25-22.59,19.87-40.21,19.87h-7.31Z" />
                            <path fill="#eec00a" d="M510.71,148.38c13-.12,24.93,3.27,35.81,10.17,10.87,6.91,19.12,16.01,24.75,27.32,4.69,9.37,7.03,19.31,7.03,29.81,0,11.81-2.91,22.87-8.72,33.18s-13.75,18.53-23.81,24.65c-10.69,6.5-22.5,9.75-35.43,9.75s-24.29-3.39-35.2-10.17c-10.91-6.78-19.14-15.83-24.7-27.14-4.69-9.5-7.03-19.93-7.03-31.31,0-9.37,2.03-18.43,6.09-27.18,5.56-12.06,13.87-21.59,24.93-28.59,10.81-6.87,22.9-10.37,36.28-10.5Z" />
                            <path fill="#eec00a" d="M675.41,230.5l9.94,15.93c2.75,4.44,4.12,9,4.12,13.69,0,5.94-2.05,10.86-6.14,14.76-4.09,3.91-9.11,5.86-15.04,5.86-7.62,0-13.4-3.25-17.34-9.75l-17.62-28.87v17.34c0,5.94-1.95,10.97-5.86,15.09-3.91,4.12-8.83,6.19-14.76,6.19-7.25,0-12.75-2.59-16.5-7.78-3.37-4.56-5.06-10.56-5.06-18v-78.83c0-16.18,8.72-24.28,26.15-24.28h26.81c8.81,0,17,2.55,24.56,7.64,7.56,5.09,13.09,11.7,16.59,19.83,2.62,6.12,3.94,12.28,3.94,18.47,0,11.56-4.59,22.47-13.78,32.71Z" />
                            <path fill="#eec00a" d="M725.56,191.13h-11.15c-6.19,0-11.31-1.69-15.37-5.06-4.31-3.62-6.47-8.47-6.47-14.53,0-3.62,1.02-7.11,3.05-10.45,2.03-3.34,4.65-5.72,7.87-7.12,3.22-1.41,10.86-2.11,22.92-2.11h42.56c10.44,0,17.18.62,20.25,1.87,3.38,1.38,6.11,3.73,8.2,7.08,2.09,3.34,3.14,6.86,3.14,10.55,0,5.81-2.31,10.87-6.94,15.19-3.31,3.06-8.72,4.59-16.22,4.59h-9.66v63.74c0,6.94-1.19,12.31-3.56,16.12-4,6.37-9.78,9.56-17.34,9.56s-13.37-2.91-17.43-8.72c-2.56-3.62-3.84-9.12-3.84-16.5v-64.21Z" />
                            <path fill="#eec00a" d="M849.1,175.85v50.34c0,9.75,3.9,14.62,11.72,14.62s11.72-4.69,11.72-14.06v-50.99c0-4.69.12-7.72.37-9.09.5-2.63,1.84-5.25,4.03-7.87,4.25-5.25,9.69-7.87,16.31-7.87s12.19,2.56,16.5,7.69c3.31,3.94,4.97,10.72,4.97,20.34v45.18c0,16.75-4.44,30.18-13.31,40.31-11.06,12.56-24.59,18.84-40.59,18.84-9.81,0-19.06-2.62-27.75-7.87-11.06-6.69-18.78-16.25-23.15-28.68-2-5.69-3-13.22-3-22.59v-45.18c0-5.25.12-8.72.38-10.41.56-3.5,1.94-6.62,4.12-9.37,4.31-5.5,9.87-8.25,16.69-8.25,6.06,0,11.22,2.22,15.47,6.66,3.69,3.81,5.53,9.91,5.53,18.28Z" />
                            <path fill="#eec00a" d="M1008.27,236.03h-6.09c-7.81,0-13.12-2.5-15.94-7.5-1.38-2.37-2.06-5-2.06-7.87,0-5.12,2-9.12,6-12,3-2.19,7.81-3.28,14.44-3.28,10.56,0,16.68.06,18.37.19,8.12.56,13.75,2.16,16.87,4.78,4.75,4,7.12,10.78,7.12,20.34,0,7.31-.16,13.69-.47,19.12-.44,7.87-5.34,15.03-14.72,21.47-11.62,8-24.25,12-37.87,12-16.37,0-30.81-5.19-43.31-15.56-7.62-6.37-13.59-14.14-17.9-23.29-4.31-9.15-6.47-18.7-6.47-28.64,0-12.87,3.38-24.76,10.12-35.67,6.75-10.9,15.87-19.14,27.37-24.7,9.69-4.69,19.68-7.03,30-7.03,13,0,25,3.47,36,10.4,8.81,5.56,13.22,12.22,13.22,19.97,0,5.88-2.09,10.89-6.28,15.04-4.19,4.16-9.22,6.23-15.09,6.23-2.44,0-7.5-1.91-15.19-5.72-4.62-2.31-9.06-3.47-13.31-3.47-6.62,0-12.28,2.48-16.97,7.45-4.69,4.97-7.03,10.8-7.03,17.48s2.39,12.83,7.17,17.67c4.78,4.84,10.64,7.26,17.58,7.26,4.44,0,9.25-1.56,14.44-4.69Z" />
                            <path fill="#eec00a" d="M1100.6,175.85v50.34c0,9.75,3.91,14.62,11.72,14.62s11.72-4.69,11.72-14.06v-50.99c0-4.69.12-7.72.38-9.09.5-2.63,1.84-5.25,4.03-7.87,4.25-5.25,9.69-7.87,16.31-7.87s12.19,2.56,16.5,7.69c3.31,3.94,4.97,10.72,4.97,20.34v45.18c0,16.75-4.44,30.18-13.31,40.31-11.06,12.56-24.59,18.84-40.59,18.84-9.81,0-19.06-2.62-27.75-7.87-11.06-6.69-18.78-16.25-23.15-28.68-2-5.69-3-13.22-3-22.59v-45.18c0-5.25.12-8.72.38-10.41.56-3.5,1.94-6.62,4.12-9.37,4.31-5.5,9.87-8.25,16.69-8.25,6.06,0,11.22,2.22,15.47,6.66,3.69,3.81,5.53,9.91,5.53,18.28Z" />
                            <path fill="#eec00a" d="M1225.27,240.24h19.17c7.92,0,13.81,1.63,17.68,4.88,4.55,3.88,6.83,8.87,6.83,15s-2.28,11.31-6.84,15.19c-3.56,3-9.41,4.5-17.53,4.5h-32.9c-7.75,0-13.06-.59-15.94-1.78-5.62-2.31-9.34-6.09-11.15-11.34-1.12-3.38-1.69-8.91-1.69-16.59v-69.55c0-5.81.19-9.72.56-11.72.69-4.06,2.34-7.5,4.97-10.31,3-3.19,6.81-5.22,11.44-6.09,2.19-.38,6.62-.56,13.31-.56h25.21c6.87,0,10.87.06,12,.19,4.5.44,8.19,1.75,11.06,3.94,5.12,3.88,7.69,8.94,7.69,15.19,0,6.75-2.25,11.9-6.73,15.47-3.99,3.19-9.45,4.78-16.37,4.78h-20.77v8.72h16.55c4.86,0,8.88,1.28,12.06,3.84,3.36,2.75,5.05,6.53,5.05,11.34,0,10.19-6.2,15.28-18.6,15.28h-15.05v9.65ZM1225.52,133.31l-6.56,5.33c-3.25,2.62-6.52,3.93-9.83,3.93-3.75,0-6.9-1.3-9.46-3.89-2.56-2.59-3.84-5.76-3.84-9.51,0-4.62,2.22-8.59,6.66-11.9l13.69-10.22c3.5-2.62,6.75-3.94,9.75-3.94,3.81,0,7.78,1.75,11.9,5.25l11.72,9.94c4.19,3.56,6.28,7.28,6.28,11.15,0,3.5-1.35,6.62-4.04,9.37-2.69,2.75-5.79,4.12-9.29,4.12-3.69,0-7.13-1.33-10.33-3.99l-6.65-5.64Z" />
                            <path fill="#eec00a" d="M1296.89,231.43c4.69,0,9.69,2.06,15,6.19,6.62,5.19,11.15,7.78,13.59,7.78,3.62,0,5.44-1.88,5.44-5.62,0-2.06-1.06-3.81-3.19-5.25-1.12-.71-7.44-3.15-18.93-7.22-18.81-6.62-28.21-18.87-28.21-36.75,0-13.5,4.97-24.15,14.9-31.96,8.69-6.81,19.43-10.22,32.25-10.22,11.06,0,20.68,2.64,28.87,7.92,8.19,5.28,12.28,12.08,12.28,20.39,0,5-1.55,9.17-4.64,12.51-3.09,3.34-7.11,5.02-12.04,5.02-5.19,0-10.94-2.47-17.25-7.41-3.94-3.06-6.91-4.59-8.9-4.59-3.44,0-5.16,1.69-5.16,5.06,0,3.19,4.25,6.09,12.75,8.72,11.75,3.69,20.84,8.19,27.28,13.5,8.56,7.12,12.84,17.12,12.84,30,0,14-4.81,24.93-14.44,32.81-8.94,7.31-20.56,10.97-34.87,10.97s-26.15-3.81-35.53-11.44c-7.5-6.06-11.25-13.15-11.25-21.28,0-5.44,1.84-9.97,5.53-13.59,3.69-3.62,8.25-5.47,13.69-5.53Z" />
                        </g>
                        <g>
                            <path fill="#eec00a" d="M0,26.27C2.44,12.27,13.26,1.52,27.65.44l145.09.03c14.61,1.45,26.06,12.96,27.16,27.67v123.19c-1.83,20.13-19.16,29.74-38.15,27.97-13.32,8.57-26.47,22.08-39.83,30.05-3.64,2.17-6.62,3-10.35.24-.91-.68-3.04-3.53-3.04-4.49v-26.08H26.06c-12.11,0-24.76-14.26-26.06-25.81V26.27ZM134.75,33.41c-12.98,1.42-21.71,12.91-21.62,25.69l-32.41,13.88c-1.59.16-2.39-1.61-3.71-2.51-12.1-8.28-28.76-5.79-35.85,7.5-11.95,22.37,13.02,45.6,34.88,31.68,1.5-.95,3.28-3.3,4.68-3.16l32.12,13.63c.83,3.14.76,6.4,1.75,9.54,5.68,18,30.6,22.38,41.99,7.36,16.35-21.55-8.64-49.71-32.1-35.35-1.5.92-3.91,3.73-5.33,3.59l-31.75-13.46c-1.3-.46-1.28-3.18-.37-3.94l32.12-13.63c1.42-.14,3.83,2.67,5.33,3.59,19.03,11.65,41.9-5.16,36.35-26.7-2.98-11.58-14.27-18.98-26.09-17.69Z" />
                            <path fill="#a51a8f" d="M156.37,275.81l-43.01-31.98c-12.39.15-23.47-1.12-31.67-11.33-2.52-3.14-6.46-11.11-6.46-15.05v-22.32h17.19v11.02c0,14.9,22.02,26.86,34.92,18.81l39.79-29.55c21.21.5,40.79-12.02,46.87-32.68.59-1.99,2.01-6.96,2.01-8.75v-78.25h33.05c13.63,0,25.25,15.42,26.09,28.21,2.36,36.19-1.84,74.91,0,111.37.49,12.5-13.62,28.21-26.09,28.21h-82.48v26.08c0,2.43-3.99,5.16-5.91,6.18h-4.3Z" />
                        </g>
                     </svg>
                    <h1 style="margin:5px 0 0 0; font-size:24px;">Relatório de Desempenho</h1>
                </div>
                <div class="header-right">
                    <p style="margin:0; font-weight:bold; font-size:24px;">${student.name}</p>
                    <p style="margin:0; font-size:12px; color:#64748b;">Gerado em: ${new Date().toLocaleDateString()}</p>
                </div>
            </div>
            
            <div class="grid">
                 <div class="card">
                    <div class="stat-label">Nível Atual</div>
                    <div class="stat-value">${student.level || 1}</div>
                </div>
                <div class="card">
                    <div class="stat-label">Taxa de Acerto (Simulados)</div>
                    <div class="stat-value">${stats.accuracy}%</div>
                </div>
                <div class="card">
                    <div class="stat-label">Taxa de Não Realização</div>
                    <div class="stat-value ${stats.missedRate > 30 ? 'alert-high' : 'alert-low'}">${stats.missedRate}%</div>
                </div>
                <div class="card">
                    <div class="stat-label">Aulas no Mês Atual</div>
                    <div class="stat-value">${stats.classesThisMonth}</div>
                </div>
            </div>

            <div class="section-title">Análise Pedagógica</div>
            <div class="observation">
                <strong>Observações do Professor:</strong><br/>
                ${observation || 'Nenhuma observação registrada.'}
            </div>

            <div class="section-title">Histórico de Simulados</div>
            <table>
                <thead><tr><th>Data Envio</th><th>Simulado</th><th>Nota (Acertos)</th><th>Status</th></tr></thead>
                <tbody>
                    ${submissions.slice(0, 15).map(s => `
                        <tr>
                            <td>${s.date.toLocaleDateString()}</td>
                            <td>${s.title}</td>
                            <td>${s.score}</td>
                            <td style="color: ${s.isMissed ? '#dc2626' : '#16a34a'}; font-weight:bold;">
                                ${s.isMissed ? 'NÃO REALIZADO' : s.status === 'graded' ? 'Corrigido' : 'Pendente'}
                            </td>
                        </tr>
                    `).join('')}
                    ${submissions.length === 0 ? '<tr><td colspan="4" style="text-align:center; padding:10px;">Nenhum histórico disponível.</td></tr>' : ''}
                </tbody>
            </table>

            <div class="section-title">Histórico de Aulas</div>
            <table>
                <thead><tr><th>Data</th><th>Aula</th><th>Status</th></tr></thead>
                <tbody>
                    ${classes.slice(0, 15).map(c => `
                        <tr>
                            <td>${c.scheduledAt ? new Date(c.scheduledAt).toLocaleDateString() : 'N/A'}</td>
                            <td>${c.title}</td>
                            <td>${c.status === 'completed' ? 'Finalizada' : c.status === 'live' ? 'Ao Vivo' : 'Agendada'}</td>
                        </tr>
                    `).join('')}
                    ${classes.length === 0 ? '<tr><td colspan="3" style="text-align:center; padding:10px;">Nenhuma aula registrada.</td></tr>' : ''}
                </tbody>
            </table>
            
            <div class="footer">
                Relatório gerado pelo sistema Conecta Português | Período de coleta: Total | Página 1
            </div>
            </body></html>
        `);
        newWin.document.close();
        newWin.focus();
        setTimeout(() => newWin.print(), 500);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
            <div className="bg-slate-50 dark:bg-slate-900 w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-[85vh] animate-slideUp">

                {/* Sidebar Info */}
                <div className="w-full md:w-80 bg-white dark:bg-slate-800 p-6 border-r border-slate-200 dark:border-slate-700 flex flex-col items-center text-center relative shrink-0">
                    <button onClick={onClose} className="absolute top-4 left-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400">
                        <X size={24} />
                    </button>

                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#a51a8f] to-purple-600 p-1 shadow-xl mb-4 flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                            {student.photoUrl ? (
                                <img src={student.photoUrl} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-4xl">{student.avatar}</span>
                            )}
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-1">{student.name}</h2>
                    <span className="bg-[#a51a8f]/10 text-[#a51a8f] px-3 py-1 rounded-full text-xs font-bold border border-[#a51a8f]/20 mb-6">
                        {student.schoolYear || 'Aluno'}
                    </span>

                    <div className="w-full space-y-3">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span className="text-xs font-bold text-slate-400 uppercase">Aulas (Mês)</span>
                            <span className="font-bold text-slate-700 dark:text-white flex items-center gap-1.5"><Calendar size={14} className="text-indigo-500" /> {stats.classesThisMonth}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span className="text-xs font-bold text-slate-400 uppercase">XP Total</span>
                            <span className="font-bold text-slate-700 dark:text-white flex items-center gap-1.5"><GraduationCap size={14} className="text-[#a51a8f]" /> {student.xp || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                            <span className="text-xs font-bold text-slate-400 uppercase">Estrelas</span>
                            <span className="font-bold text-slate-700 dark:text-white flex items-center gap-1.5"><Star size={14} className="text-[#eec00a]" /> {student.coins || 0}</span>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 w-full">
                        <button
                            onClick={handlePrint}
                            className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors shadow-lg"
                        >
                            <Printer size={18} /> Imprimir Relatório
                        </button>
                    </div>
                </div>

                {/* Main Content Scrollable */}
                <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 p-6 md:p-8" ref={contentRef}>
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Parent Focus Metrics */}
                        <section>
                            <div className="flex items-center gap-2 mb-4">
                                <Target className="text-[#a51a8f]" />
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Indicadores de Engajamento</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-full">
                                    <div>
                                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Taxa de Acerto</div>
                                        <div className="text-3xl font-bold text-[#a51a8f]">{loading ? '...' : `${stats.accuracy}%`}</div>
                                    </div>
                                    <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-[#a51a8f] h-full rounded-full" style={{ width: `${stats.accuracy}%` }}></div>
                                    </div>
                                </div>

                                <div className={`bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border ${stats.missedRate > 30 ? 'border-red-100 dark:border-red-900/30' : 'border-slate-100 dark:border-slate-700'} flex flex-col justify-between h-full`}>
                                    <div>
                                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Índice de Ausência (Simulados)</div>
                                        <div className={`text-3xl font-bold ${stats.missedRate > 30 ? 'text-red-500' : 'text-slate-800 dark:text-white'}`}>{loading ? '...' : `${stats.missedRate}%`}</div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">{stats.missedQuizzes} simulados não feitos</p>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-full">
                                    <div>
                                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Frequência (Mês Atual)</div>
                                        <div className="text-3xl font-bold text-slate-800 dark:text-white">{stats.classesThisMonth}</div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Aulas disponíveis até hoje</p>
                                </div>

                                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col justify-between h-full">
                                    <div>
                                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">Simulados Concluídos</div>
                                        <div className="text-3xl font-bold text-green-500">{stats.completedQuizzes}</div>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1">Total de entregas feitas</p>
                                </div>
                            </div>
                        </section>

                        {/* Challenges History */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Trophy className="text-[#a51a8f]" /> Histórico de Simulados</h3>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <div className="max-h-60 overflow-y-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 text-xs uppercase sticky top-0">
                                            <tr>
                                                <th className="p-4">Simulado</th>
                                                <th className="p-4">Data Envio</th>
                                                <th className="p-4">Nota</th>
                                                <th className="p-4">Situação</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {submissions.length > 0 ? submissions.map((sub, idx) => (
                                                <tr key={idx} className="text-sm hover:bg-slate-50 dark:hover:bg-slate-700/30">
                                                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{sub.title}</td>
                                                    <td className="p-4 text-slate-500 font-mono">
                                                        {sub.date.toLocaleDateString()}
                                                    </td>
                                                    <td className={`p-4 font-bold ${sub.isMissed ? 'text-red-400' : 'text-[#a51a8f]'}`}>
                                                        {sub.score}
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`flex items-center gap-1 text-xs font-bold ${sub.isMissed ? 'text-red-500' :
                                                            sub.status === 'graded' ? 'text-green-600' : 'text-yellow-600'
                                                            }`}>
                                                            {sub.isMissed ? <X size={12} /> : sub.status === 'graded' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                                            {sub.isMissed ? 'Não Realizado' : sub.status === 'graded' ? 'Corrigido' : 'Pendente'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colspan="4" className="p-8 text-center text-slate-400">Nenhum simulado atribuído ou realizado ainda.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* Recent Classes */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><BookOpen className="text-[#a51a8f]" /> Últimas Aulas</h3>
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <div className="max-h-48 overflow-y-auto">
                                    <table className="w-full text-left">
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {classes.slice(0, 5).map(cls => (
                                                <tr key={cls.id} className="text-sm hover:bg-slate-50">
                                                    <td className="p-3 text-slate-500 w-24">{cls.scheduledAt ? new Date(cls.scheduledAt).toLocaleDateString() : 'N/A'}</td>
                                                    <td className="p-3 font-medium text-slate-700 dark:text-white">{cls.title}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </section>

                        {/* Observations */}
                        <section>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><MessageSquare className="text-[#a51a8f]" /> Observações Pedagógicas</h3>
                            <div className="bg-[#fffbeb] dark:bg-yellow-900/10 p-6 rounded-2xl border border-yellow-200 dark:border-yellow-900/30">
                                <div className="flex items-start gap-3 mb-4">
                                    <AlertCircle className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-1" size={20} />
                                    <div>
                                        <h4 className="font-bold text-yellow-800 dark:text-yellow-500">Notas para os Pais</h4>
                                        <p className="text-sm text-yellow-700 dark:text-yellow-600/80">Este texto aparecerá no relatório impresso.</p>
                                    </div>
                                </div>
                                <textarea
                                    className="w-full bg-white dark:bg-slate-800 border-2 border-yellow-100 dark:border-slate-700 rounded-xl p-4 min-h-[120px] focus:outline-none focus:border-[#eec00a] transition-colors resize-none"
                                    placeholder="Escreva suas observações aqui..."
                                    value={observation}
                                    onChange={(e) => setObservation(e.target.value)}
                                ></textarea>
                                <div className="flex justify-end mt-4">
                                    <button
                                        onClick={handleSaveObservation}
                                        disabled={savingObs}
                                        className="bg-[#eec00a] text-[#7d126b] px-6 py-2 rounded-xl font-bold hover:bg-[#d4ab09] transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
                                    >
                                        <Save size={18} /> {savingObs ? 'Salvando...' : 'Salvar Nota'}
                                    </button>
                                </div>
                            </div>
                        </section>

                    </div>
                </div>
            </div>
        </div>
    );
};
