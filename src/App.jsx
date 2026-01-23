import React, { useState, useEffect, Suspense, lazy } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, updateDoc, onSnapshot, query, increment, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ThemeToggle } from './components/ThemeToggle';
import { BackgroundPaths } from './components/BackgroundPaths';
import { LogoSVG } from './components/LogoSVG';
import { LoginWall } from './components/LoginWall';
import { NavButton, MobileNavButton } from './components/UIHelpers';
import { auth, db, appId } from './firebase';
import {
  Home, BookOpen, CalendarDays, Gamepad2, LogOut, X, Plus, Trophy
} from 'lucide-react';

// Lazy loaded views for performance
const ViewHome = lazy(() => import('./views/ViewHome').then(module => ({ default: module.ViewHome })));
const ViewJourney = lazy(() => import('./views/ViewJourney').then(module => ({ default: module.ViewJourney })));
const ViewCalendar = lazy(() => import('./views/ViewCalendar').then(module => ({ default: module.ViewCalendar })));
const ViewChallenges = lazy(() => import('./views/ViewChallenges').then(module => ({ default: module.ViewChallenges })));
const AdminDashboard = lazy(() => import('./views/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const ViewRank = lazy(() => import('./views/ViewRank').then(module => ({ default: module.ViewRank })));

const LoadingScreen = ({ exiting }) => (
  <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center transition-opacity duration-700 ease-out ${exiting ? 'opacity-0' : 'opacity-100'}`}>
    <div className="w-24 mb-4 animate-bounce">
      <LogoSVG className="w-full h-auto drop-shadow-lg" />
    </div>
    <div className="w-8 h-8 border-4 border-[#a51a8f] border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-slate-500 font-medium animate-pulse">Carregando...</p>
  </div>
);


const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [showRank, setShowRank] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setLoading(false);
      if (u) {
        // User is logged in
      }
      setTimeout(() => setShowLoading(false), 700);
    });

    const qStudents = query(collection(db, 'artifacts', appId, 'public', 'data', 'students'));
    const unsubStudents = onSnapshot(qStudents, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(data);
      // Update current user if data changes
      if (user) {
        const updated = data.find(s => s.id === user.id);
        if (updated) setUser(updated);
      }
    });

    const qClasses = query(collection(db, 'artifacts', appId, 'public', 'data', 'classes'));
    const unsubClasses = onSnapshot(qClasses, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
      setClasses(data);
    });

    const qQuizzes = query(collection(db, 'artifacts', appId, 'public', 'data', 'quizzes'));
    const unsubQuizzes = onSnapshot(qQuizzes, (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setQuizzes(data);
    });

    return () => { unsubscribeAuth(); unsubStudents(); unsubClasses(); unsubQuizzes(); };
  }, [user?.id]);

  const handleLogin = (student) => {
    setUser(student);
    setLoading(true);
    setShowLoading(true);
    // Short artificial delay for login transition/loading effect
    setTimeout(() => {
      setLoading(false);
      setTimeout(() => setShowLoading(false), 700);
    }, 800);
  };

  const handleLogout = () => {
    if (confirm('Sair do sistema?')) {
      setUser(null);
      setCurrentView('home');
    }
  };

  const handleCompleteQuiz = async (quizId, xpDetails, coinDetails) => {
    if (!user) return;
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', user.id), {
      xp: increment(xpDetails),
      coins: increment(coinDetails)
    });
    // Record completion in quiz
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'quizzes', quizId), {
      completedBy: arrayUnion(user.id)
    });
  };

  // Show loading screen if we are technically loading OR if we are showing the exit animation
  if (showLoading && !user) return <LoadingScreen exiting={!loading} />;
  // If not loading and no user, show login wall
  if (!user) return <LoginWall onLogin={handleLogin} />;

  // Render Admin Dashboard or Student Layout
  if (user.role === 'admin' || user.role === 'teacher') {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <SpeedInsights />
        <ThemeToggle />
        <AdminDashboard
          currentUser={user}
          students={students}
          classes={classes}
          quizzes={quizzes}
          onLogout={handleLogout}
        />
      </Suspense>
    );
  }

  // Student Layout
  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen font-sans transition-colors duration-300">
      <SpeedInsights />
      <ThemeToggle />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 h-screen sticky top-0 z-30 shadow-sm transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-center">
          <div className="w-24"><LogoSVG className="w-full h-auto" /></div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavButton active={currentView === 'home'} onClick={() => setCurrentView('home')} icon={<Home />} label="Início" />
          <NavButton active={currentView === 'journey'} onClick={() => setCurrentView('journey')} icon={<BookOpen />} label="Jornada" />
          <NavButton active={currentView === 'calendar'} onClick={() => setCurrentView('calendar')} icon={<CalendarDays />} label="Agenda" />
          <NavButton active={currentView === 'challenges'} onClick={() => setCurrentView('challenges')} icon={<Gamepad2 />} label="Desafios" />
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-700">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all font-medium text-sm">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-8 relative">
        <BackgroundPaths>
          <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen">
            {/* Mobile Header */}
            <header className="md:hidden flex justify-between items-center mb-6 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 -mx-4 z-20 border-b border-slate-100 dark:border-slate-700">
              <div className="w-[4.5rem]"><LogoSVG className="w-full h-auto" /></div>
              <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
                <LogOut size={18} />
              </button>
            </header>

            <Suspense fallback={<LoadingScreen />}>
              {currentView === 'home' && <ViewHome student={user} classes={classes} onOpenRank={() => setShowRank(true)} />}
              {currentView === 'journey' && <ViewJourney classes={classes} />}
              {currentView === 'calendar' && <ViewCalendar classes={classes} />}
              {currentView === 'challenges' && <ViewChallenges student={user} quizzes={quizzes} onCompleteQuiz={handleCompleteQuiz} />}
            </Suspense>
          </div>
        </BackgroundPaths>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-100 dark:border-slate-700 p-2 flex justify-between items-center z-50 pb-safe">
        <MobileNavButton active={currentView === 'home'} onClick={() => setCurrentView('home')} icon={<Home size={24} />} label="Início" />
        <MobileNavButton active={currentView === 'challenges'} onClick={() => setCurrentView('challenges')} icon={<Gamepad2 size={24} />} label="Desafios" />
        <div className="relative -mt-8">
          <button onClick={() => setCurrentView('journey')} className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-[#a51a8f]/40 transition-transform active:scale-95 border-4 border-white dark:border-slate-900 ${currentView === 'journey' ? 'bg-[#eec00a] text-[#7d126b]' : 'bg-[#a51a8f]'}`}>
            <BookOpen size={24} />
          </button>
        </div>
        <MobileNavButton active={currentView === 'calendar'} onClick={() => setCurrentView('calendar')} icon={<CalendarDays size={24} />} label="Agenda" />
        <MobileNavButton active={false} onClick={() => { setShowRank(true); }} icon={<Trophy size={24} />} label="Rank" />
      </nav>

      {/* Rank Modal */}
      {showRank && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowRank(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowRank(false)} className="absolute top-4 right-4 p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white z-10"><X size={20} /></button>
            <div className="max-h-[80vh] overflow-y-auto p-2">
              <Suspense fallback={<div className="p-8 text-center text-slate-500">Carregando Ranking...</div>}>
                <ViewRank students={students} currentStudentId={user.id} />
              </Suspense>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;
