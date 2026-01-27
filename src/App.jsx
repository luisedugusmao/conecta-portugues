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
  Home, BookOpen, CalendarDays, ClipboardList, LogOut, X, Plus, Trophy, MessageCircle
} from 'lucide-react';
import { NotificationBell } from './components/NotificationBell';
import { calculateLevel, getLevelReward } from './utils/levelLogic';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StudentRegistration } from './components/StudentRegistration';
import { useClassReminders } from './hooks/useClassReminders';

// Lazy loaded views for performance
const ViewHome = lazy(() => import('./views/ViewHome').then(module => ({ default: module.ViewHome })));
const ViewJourney = lazy(() => import('./views/ViewJourney').then(module => ({ default: module.ViewJourney })));
const ViewCalendar = lazy(() => import('./views/ViewCalendar').then(module => ({ default: module.ViewCalendar })));
const ViewSimulados = lazy(() => import('./views/ViewSimulados').then(module => ({ default: module.ViewSimulados })));
const AdminDashboard = lazy(() => import('./views/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const ViewRank = lazy(() => import('./views/ViewRank').then(module => ({ default: module.ViewRank })));
const ViewHub = lazy(() => import('./views/ViewHub').then(module => ({ default: module.ViewHub })));
const ViewStore = lazy(() => import('./views/ViewStore').then(module => ({ default: module.ViewStore })));
const ViewProfile = lazy(() => import('./views/ViewProfile').then(module => ({ default: module.ViewProfile })));

const LoadingScreen = ({ exiting }) => (
  <div className={`min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center transition-opacity duration-700 ease-out ${exiting ? 'opacity-0' : 'opacity-100'}`}>
    <div className="w-24 mb-4 animate-bounce">
      <LogoSVG className="w-full h-auto drop-shadow-lg" />
    </div>
    <div className="w-8 h-8 border-4 border-[#a51a8f] border-t-transparent rounded-full animate-spin"></div>
    <p className="mt-4 text-slate-500 font-medium animate-pulse">Carregando...</p>
  </div>
);


// ADMIN EMAILS - Add your email here to automatically become an admin
const ADMIN_EMAILS = [
  'luisedugusmao@gmail.com', // Replace with your email
  'luisedugusmao@gmail.com'
];

const App = () => {
  const [user, setUser] = useState(null);
  const [newUserAuth, setNewUserAuth] = useState(null); // Track new users waiting for registration
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(true);
  const [currentView, setCurrentView] = useState('home');
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [showRank, setShowRank] = useState(false);
  const [showStore, setShowStore] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    // Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (authUser) => {
      setLoading(true);
      if (authUser) {
        // User is logged in, check if profile exists
        const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', authUser.uid);

        // We use onSnapshot to get real-time updates of the user profile
        const unsubUser = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            // Student profile exists, load it
            setUser({ id: authUser.uid, ...docSnap.data() });
            setLoading(false);
          } else {
            // NEW USER: No profile found
            // Instead of auto-creating, we set the newUserAuth state
            // This will trigger the StudentRegistration component to render
            console.log("No profile found, waiting for registration...");
            setUser(null); // Ensure user is null so main app doesn't load
            setNewUserAuth(authUser); // Trigger registration flow
            setLoading(false);
          }
        });

        // Cleanup this internal listener when auth changes
        return () => unsubUser();

      } else {
        // User logged out
        setUser(null);
        setNewUserAuth(null);
        setLoading(false);
      }
      setTimeout(() => setShowLoading(false), 700);
    });

    // ... Other listeners remain the same ...

    const qStudents = query(collection(db, 'artifacts', appId, 'public', 'data', 'students'));
    const unsubStudents = onSnapshot(qStudents, async (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStudents(data);
      // Update current user if data changes
      if (user) {
        const updated = data.find(s => s.id === user.id);
        if (updated) {
          console.log("Current user data:", updated);
          console.log("Is Admin Email?", ADMIN_EMAILS.includes(updated.email));

          // AUTO-PROMOTE ADMIN
          // Force lowercase check to avoid sensitive issues
          const isAdminEmail = ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(updated.email?.toLowerCase().trim());

          if (isAdminEmail && updated.role !== 'admin') {
            console.log("Promoting user to admin (ATTEMPTING):", updated.email);

            try {
              const { updateDoc, doc } = await import('firebase/firestore');
              const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', user.id);
              await updateDoc(userRef, { role: 'admin' });
              console.log("SUCCESS: User promoted to admin in Firestore!");
              updated.role = 'admin'; // Update local immediately
            } catch (err) {
              console.error("FAILED to promote user:", err);
              alert("Erro ao tentar virar admin: " + err.message);
            }
          }
          setUser(updated);
        }
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

  // Hook for Class Reminders (10 min before & Live)
  useClassReminders(user, classes);

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

  const handleLogout = async () => {
    if (confirm('Sair do sistema?')) {
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
      // setUser(null); // Auth listener will handle this
      setCurrentView('home');
    }
  };

  const handleCompleteQuiz = async (quizId, xpDetails, coinDetails) => {
    if (!user) return;

    // Calculate new XP and potential Level Up
    const currentXP = user.xp || 0;
    const currentCoins = user.coins || 0;
    const newTotalXP = currentXP + xpDetails;

    const oldLevelInfo = calculateLevel(currentXP);
    const newLevelInfo = calculateLevel(newTotalXP);

    let rewardCoins = 0;
    if (newLevelInfo.level > oldLevelInfo.level) {
      const levelsGained = newLevelInfo.level - oldLevelInfo.level;
      rewardCoins = getLevelReward(levelsGained);
      // Ideally show a toast/notification here: `Parabéns! Você subiu para o nível ${newLevelInfo.level} e ganhou ${rewardCoins} estrelas!`
      alert(`Parabéns! Você subiu para o nível ${newLevelInfo.level} e ganhou ${rewardCoins} estrelas!`);
    }

    const quiz = quizzes.find(q => q.id === quizId);
    const quizTitle = quiz ? quiz.title : 'Quiz';

    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', user.id), {
      xp: increment(xpDetails),
      monthlyXP: increment(xpDetails),
      coins: increment(coinDetails + rewardCoins),
      level: newLevelInfo.level,
      xpHistory: arrayUnion({
        action: `Quiz Completado: ${quizTitle}`,
        xp: xpDetails,
        date: new Date() // Basic JS Date, Firestore converts to Timestamp
      })
    });
    // Record completion in quiz
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'quizzes', quizId), {
      completedBy: arrayUnion(user.id)
    });
  };

  // Show loading screen if we are technically loading OR if we are showing the exit animation
  if (showLoading && !user && !newUserAuth) return <LoadingScreen exiting={!loading} />;

  // NEW USER REGISTRATION
  if (newUserAuth) {
    return <StudentRegistration authUser={newUserAuth} onComplete={(student) => { setUser(student); setNewUserAuth(null); }} />;
  }

  // If not loading and no user, show login wall
  if (!user) return <LoginWall />;



  // Render Admin Dashboard or Student Layout
  if (user.role === 'admin' || user.role === 'teacher') {
    return (
      <ErrorBoundary>
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
      </ErrorBoundary>
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
          <div className="w-40"><LogoSVG className="w-full h-auto" /></div>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavButton active={currentView === 'home'} onClick={() => setCurrentView('home')} icon={<Home />} label="Início" />
          <NavButton active={currentView === 'hub'} onClick={() => setCurrentView('hub')} icon={<MessageCircle />} label="O Hub" />
          <NavButton active={currentView === 'journey'} onClick={() => setCurrentView('journey')} icon={<BookOpen />} label="Jornada" />
          <NavButton active={currentView === 'calendar'} onClick={() => setCurrentView('calendar')} icon={<CalendarDays />} label="Agenda" />
          <NavButton active={currentView === 'simulados'} onClick={() => setCurrentView('simulados')} icon={<ClipboardList />} label="Simulados" />
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
              <div className="w-20"><LogoSVG className="w-full h-auto" /></div>
              <div className="flex items-center gap-2">
                <NotificationBell userId={user.id} />
                <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
                  <LogOut size={18} />
                </button>
              </div>
            </header>

            <Suspense fallback={<LoadingScreen />}>
              {currentView === 'home' && <ViewHome student={user} classes={classes} onOpenRank={() => setShowRank(true)} onOpenStore={() => setShowStore(true)} onOpenProfile={() => setShowProfile(true)} />}
              {currentView === 'hub' && <ViewHub user={user} students={students} />}
              {currentView === 'journey' && <ViewJourney classes={classes} />}
              {currentView === 'calendar' && <ViewCalendar classes={classes} />}
              {currentView === 'simulados' && <ViewSimulados student={user} quizzes={quizzes} onCompleteQuiz={handleCompleteQuiz} />}
            </Suspense>
          </div>
        </BackgroundPaths>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-100 dark:border-slate-700 p-2 flex justify-between items-center z-50 pb-safe">
        <MobileNavButton active={currentView === 'home'} onClick={() => setCurrentView('home')} icon={<Home size={24} />} label="Início" />

        <MobileNavButton active={currentView === 'simulados'} onClick={() => setCurrentView('simulados')} icon={<ClipboardList size={24} />} label="Simulados" />
        <div className="relative -mt-8">
          <button onClick={() => setCurrentView('journey')} className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg shadow-[#a51a8f]/40 transition-transform active:scale-95 border-4 border-white dark:border-slate-900 ${currentView === 'journey' ? 'bg-[#eec00a] text-[#7d126b]' : 'bg-[#a51a8f]'}`}>
            <BookOpen size={24} />
          </button>
        </div>
        <MobileNavButton active={currentView === 'calendar'} onClick={() => setCurrentView('calendar')} icon={<CalendarDays size={24} />} label="Agenda" />
        <MobileNavButton active={currentView === 'hub'} onClick={() => setCurrentView('hub')} icon={<MessageCircle size={24} />} label="Hub" />
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

      {/* Store Modal */}
      {showStore && (
        <Suspense fallback={<LoadingScreen />}>
          <ViewStore user={user} onClose={() => setShowStore(false)} />
        </Suspense>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <Suspense fallback={<LoadingScreen />}>
          <ViewProfile user={user} onClose={() => setShowProfile(false)} />
        </Suspense>
      )}

    </div>
  );
};

export default App;
