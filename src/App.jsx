import React, { useState, useEffect, Suspense, lazy } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, updateDoc, onSnapshot, query, increment, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { SpeedInsights } from "@vercel/speed-insights/react";
import { ThemeToggle } from './components/ThemeToggle';
import { BackgroundPaths } from './components/BackgroundPaths';
import { LogoSVG } from './components/LogoSVG';
import { LoginWall } from './components/LoginWall';
import { NavButton, MobileNavButton } from './components/UIHelpers';
import { Toaster, toast } from 'sonner';
import { auth, db, appId } from './firebase';
import {
  Home, BookOpen, CalendarDays, ClipboardList, LogOut, X, Plus, Trophy, MessageCircle, ArrowLeft
} from 'lucide-react';
import { NotificationBell } from './components/NotificationBell';
import { calculateLevel, getLevelReward } from './utils/levelLogic';
import { ErrorBoundary } from './components/ErrorBoundary';
import { StudentRegistration } from './components/StudentRegistration';
import { useClassReminders } from './hooks/useClassReminders';
import { Modal } from './components/Modal';
import { GlobalBroadcastListener } from './components/GlobalBroadcastListener';

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
    // Payment Success Handler
    const handlePaymentSuccess = async () => {
      const params = new URLSearchParams(window.location.search);
      const isSuccess = params.get('billing_success');
      const planId = params.get('plan');

      if (isSuccess === 'true' && planId && user) {
        console.log("Payment confirmed for plan:", planId);

        try {
          // Import here to avoid circular dependencies if any, though likely fine at top
          const { SUBSCRIPTION_PLANS } = await import('./utils/subscriptionConstants');
          const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);

          if (!plan) throw new Error("Plano inválido no retorno do pagamento.");

          const userRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', user.id);
          await updateDoc(userRef, {
            subscription: {
              planId: planId,
              status: 'active',
              startedAt: new Date().toISOString(),
              credits: {
                privateClasses: plan.features.privateClasses,
                essayCorrections: plan.features.essayCorrections
              }
            }
          });

          // alert(`Pagamento confirmado! Bem-vindo ao plano ${plan.name}. 🚀`);
          toast.success(`Pagamento confirmado! Bem-vindo ao plano ${plan.name}. 🚀`);

          // Clear URL params
          window.history.replaceState({}, document.title, window.location.pathname);

        } catch (err) {
          console.error("Error processing payment success:", err);
          // alert("Erro ao processar ativação do plano. Contate o suporte.");
          toast.error("Erro ao processar ativação do plano. Contate o suporte.");
        }
      }
    };

    if (user) handlePaymentSuccess();
  }, [user]);

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
            setNewUserAuth(null); // Ensure we clear this if user was previously thought to be new
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
        // Update local user state if data changes in Firestore (real-time sync)
        const updated = data.find(s => s.id === user.id);
        if (updated) {
          // Check if user should be admin based on email, but DO NOT write to DB from here.
          // Just update local view state if needed, or better yet, rely on the 'role' 
          // that is already in the document (which should be set manually or via secure backend).
          // For this "minimal" version, we assume manual promotion in Console for safety, 
          // OR we allow the view to reflect admin capability if email matches, 
          // but we do NOT write 'role: admin' to the database to prevent abuse.

          const isAdminEmail = ADMIN_EMAILS.map(e => e.toLowerCase().trim()).includes(updated.email?.toLowerCase().trim());
          if (isAdminEmail && updated.role !== 'admin') {
            // Just locally verify they are admin for UI purposes
            // But strictly speaking, we should wait for the DB to say so.
            // If we want to allow "Auto-Admin" just by email, we can't do it securely client-side 
            // without writing to DB. 
            // Compromise: We won't write to DB. We will just let them see Admin Dashboard 
            // if their email is in the list, overriding the DB role locally.
            updated.role = 'admin';
          }
          setUser(updated);
        }
      }
    });

    const qClasses = query(collection(db, 'artifacts', appId, 'public', 'data', 'classes'));
    const unsubClasses = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'classes')), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      data.sort((a, b) => (a.sortOrder || 99) - (b.sortOrder || 99));
      setClasses(data);
    }, (error) => {
      console.error("Classes snapshot error:", error);
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
      toast.success(`Parabéns! Você subiu para o nível ${newLevelInfo.level} e ganhou ${rewardCoins} estrelas!`);
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
        <Toaster richColors />
      </ErrorBoundary>
    );

  }

  // Student Layout
  return (
    <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen font-sans transition-colors duration-300">

      <GlobalBroadcastListener currentUserId={user.id} />
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
            {/* Mobile Header */}
            <header className="md:hidden flex justify-between items-center mb-6 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 -mx-4 z-20 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3">
                {currentView !== 'home' ? (
                  <button onClick={() => setCurrentView('home')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <ArrowLeft size={24} />
                  </button>
                ) : (
                  <div className="w-20"><LogoSVG className="w-full h-auto" /></div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <NotificationBell userId={user.id} onNavigate={(view) => setCurrentView(view)} />
                <button onClick={handleLogout} className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400">
                  <LogOut size={18} />
                </button>
              </div>
            </header>

            <Suspense fallback={<LoadingScreen />}>
              {currentView === 'home' && <ViewHome student={user} classes={classes} onOpenRank={() => setShowRank(true)} onOpenStore={() => setShowStore(true)} onOpenProfile={() => setShowProfile(true)} onNavigate={(view) => setCurrentView(view)} />}
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
      <Modal isOpen={showRank} onClose={() => setShowRank(false)} className="max-w-lg">
        <div className="absolute top-4 right-4 z-10">
          <button onClick={() => setShowRank(false)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white"><X size={20} /></button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-2">
          <Suspense fallback={<div className="p-8 text-center text-slate-500">Carregando Ranking...</div>}>
            <ViewRank students={students} currentStudentId={user.id} />
          </Suspense>
        </div>
      </Modal>

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
