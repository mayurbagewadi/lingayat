
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import VachanaSection from './components/VachanaSection';
import AIBioGenerator from './components/AIBioGenerator';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import Login from './components/Login';
import CreateProfile from './components/CreateProfile';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import UserDashboard from './components/UserDashboard';
import ProfileBrowsing from './components/ProfileBrowsing';
import UpgradeToPremium from './components/UpgradeToPremium';
import NotFound from './components/NotFound';
import PendingApproval from './components/PendingApproval';
import ErrorBoundary from './components/ErrorBoundary';
import { supabase } from './lib/supabase';

const PageTransition: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
    exit={{ opacity: 0, scale: 1.02, filter: 'blur(5px)' }}
    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileRole, setProfileRole] = useState<string>('user');
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  const fetchProfileData = async (userId: string) => {
    setIsProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, status, role')
        .eq('user_id', userId)
        .maybeSingle();

      console.log("Fetch result:", data, error);
      if (data) {
        setProfileId(data.id);
        setProfileStatus(data.status || 'pending_approval');
        setProfileRole(data.role || 'user');
        console.log("Set status from DB:", data.status, "Role:", data.role);

        // Auto-redirect to Admin if role is admin
        if (data.role === 'admin') {
          setCurrentView('admin');
          sessionStorage.setItem('currentView', 'admin');
        }
      } else {
        setProfileStatus('pending_approval');
        console.log("Set status default: pending_approval");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);

    const params = new URLSearchParams(window.location.search);
    const forceView = params.get('view');
    if (forceView) {
      setCurrentView(forceView);
    }

    if (localStorage.theme === 'light') {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfileData(session.user.id);
        if (!forceView) {
          const savedView = sessionStorage.getItem('currentView');
          setCurrentView(savedView || 'dashboard');
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfileData(session.user.id);
        // Note: We don't use currentView here to avoid dependencies
        // Redirect to dashboard on login only if not forced
        if (!forceView) {
          setCurrentView(prev => prev === 'login' ? 'dashboard' : prev);
        }
      } else {
        setProfileId(null);
        setProfileStatus(null);
        setIsProfileLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  const handleNavigate = (view: string) => {
    setCurrentView(view);
    sessionStorage.setItem('currentView', view);
    window.scrollTo(0, 0);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('currentView');
    sessionStorage.removeItem('adminActiveTab');
    setCurrentView('landing');
  };

  const handleDeleteAccount = async () => {
    if (!session) return;

    try {
      // 1. Delete profile record
      if (profileId) {
        await supabase.from('profiles').delete().eq('user_id', session.user.id);
      }

      // 2. Delete payment records
      await supabase.from('payments').delete().eq('profile_id', profileId);

      // 3. Delete auth user
      // Note: Using RLS to delete via user context (not admin)
      await supabase.auth.admin.deleteUser(session.user.id);

      // 4. Sign out and redirect
      await supabase.auth.signOut();
      sessionStorage.removeItem('currentView');
      sessionStorage.removeItem('adminActiveTab');
      setCurrentView('landing');
    } catch (err) {
      console.error('Delete account error:', err);
      alert('Failed to delete account. Please try again.');
    }
  };

  // Auth Guard Logic
  const showPendingScreen = session && profileStatus === 'pending_approval' && currentView !== 'landing' && profileRole !== 'admin';


  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-primary-950 text-gray-100 font-sans selection:bg-primary-200 selection:text-primary-900 transition-colors duration-500">
        <AnimatePresence mode="wait">
        {/* Unauthenticated / Public Views */}
        {currentView === 'landing' && (
          <PageTransition key="landing">
            <Navbar onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleTheme={toggleTheme} session={session} onLogout={handleLogout} />
            <main>
              <Hero onNavigate={handleNavigate} />
              <Features />
              <VachanaSection />
              <AIBioGenerator />
              <Testimonials />
            </main>
            <Footer />
          </PageTransition>
        )}

        {currentView === 'login' && !session && (
          <PageTransition key="login">
            <Login onNavigate={handleNavigate} />
          </PageTransition>
        )}

        {currentView === 'register' && !session && (
          <PageTransition key="register">
            <CreateProfile onNavigate={handleNavigate} />
          </PageTransition>
        )}

        {/* Authenticated Views */}
        {session && isProfileLoading && (
          <div key="loader" className="h-screen flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {currentView === 'admin-login' && (
          <PageTransition key="admin-login">
            <AdminLogin onNavigate={handleNavigate} />
          </PageTransition>
        )}

        {currentView === 'admin' && session && profileRole === 'admin' && (
          <PageTransition key="admin">
            <AdminDashboard onNavigate={handleNavigate} />
          </PageTransition>
        )}

        {currentView === 'admin' && (!session || profileRole !== 'admin') && (
          <PageTransition key="admin-denied">
            <AdminLogin onNavigate={handleNavigate} />
          </PageTransition>
        )}

        {showPendingScreen && !isProfileLoading && (
          <PageTransition key="pending">
            <PendingApproval onLogout={handleLogout} userName={session?.user?.user_metadata?.full_name} />
          </PageTransition>
        )}

        {currentView === 'dashboard' && session && !isProfileLoading && !showPendingScreen && (
          <PageTransition key="dashboard">
            <Navbar onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleTheme={toggleTheme} session={session} onLogout={handleLogout} />
            <UserDashboard onNavigate={handleNavigate} user={session.user} onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />
          </PageTransition>
        )}

        {currentView === 'browse' && session && !isProfileLoading && !showPendingScreen && (
          <PageTransition key="browse">
            <Navbar onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleTheme={toggleTheme} session={session} onLogout={handleLogout} />
            <ProfileBrowsing onNavigate={handleNavigate} />
          </PageTransition>
        )}

        {currentView === 'subscription' && session && (
          <PageTransition key="subscription">
            <Navbar onNavigate={handleNavigate} isDarkMode={isDarkMode} toggleTheme={toggleTheme} session={session} onLogout={handleLogout} />
            {profileId ? (
              <UpgradeToPremium onNavigate={handleNavigate} user={session.user} profileId={profileId} />
            ) : (
              <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="font-bold text-gray-500">Initializing your membership details...</p>
                </div>
              </div>
            )}
          </PageTransition>
        )}

        {currentView === 'not-found' && (
          <PageTransition key="not-found">
            <NotFound onNavigate={handleNavigate} />
          </PageTransition>
        )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
};

export default App;
