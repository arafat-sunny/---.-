import React, { useEffect, useState } from 'react';
import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { AlumniProvider, useAlumni } from './context/AlumniContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator, PWAInstallGuideModal } from './components/PWAInstallUI';
import { QrShareModal } from './components/CommonUI';
import { HomePage } from './pages/HomePage';
import { DirectoryPage } from './pages/DirectoryPage';
import { MemberProfilePage } from './pages/MemberProfilePage';
import { RegistrationPage } from './pages/RegistrationPage';
import { MemoriesPage } from './pages/MemoriesPage';
import { BooksPage } from './pages/BooksPage';
import { BusinessesPage } from './pages/BusinessesPage';
import { ActivitiesPage } from './pages/ActivitiesPage';
import { MemberDashboardPage } from './pages/MemberDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ActiveRoute, Member } from './types';

function AppShell() {
  const { members, siteSettings, toasts, dismissToast } = useAlumni();
  const [route, setRoute] = useState<ActiveRoute>('home');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [regQrOpen, setRegQrOpen] = useState(false);
  const [pwaGuideOpen, setPwaGuideOpen] = useState(false);

  // Sync page title dynamically with admin-configured siteSettings
  useEffect(() => {
    document.title = `${siteSettings.siteName} — ${siteSettings.subtitle}`;
  }, [siteSettings.siteName, siteSettings.subtitle]);

  // Support deep links (?register=1 for QR code scanning, ?profile=uid for shared profile links)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('register') === '1') {
      setRoute('register');
    } else if (params.get('profile')) {
      const uid = params.get('profile');
      const found = members.find((m) => m.uid === uid || m.id === uid);
      if (found) {
        setSelectedMember(found);
        setRoute('profile');
      }
    }
  }, [members]);

  const navigate = (nextRoute: ActiveRoute) => {
    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setRoute('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const registrationShareUrl = `${window.location.origin}/?register=1`;

  return (
    <div className="min-h-screen w-full overflow-x-clip flex flex-col bg-[#F8F6F0] text-[#17211C]">
      <Navbar
        activeRoute={route}
        onNavigate={navigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenPwaGuide={() => setPwaGuideOpen(true)}
      />

      <main className="flex-1">
        {route === 'home' && (
          <HomePage
            onNavigate={navigate}
            onSelectMember={handleSelectMember}
            onOpenRegistrationQr={() => setRegQrOpen(true)}
          />
        )}

        {route === 'directory' && (
          <DirectoryPage
            onSelectMember={handleSelectMember}
            onOpenAuth={() => setAuthModalOpen(true)}
            onGoRegister={() => navigate('register')}
          />
        )}

        {route === 'profile' && selectedMember && (
          <MemberProfilePage
            member={selectedMember}
            onBack={() => navigate('directory')}
            onEditOwnProfile={() => navigate('register')}
            onOpenAuth={() => setAuthModalOpen(true)}
          />
        )}

        {route === 'register' && (
          <RegistrationPage
            onComplete={() => navigate('dashboard')}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenRegistrationQr={() => setRegQrOpen(true)}
          />
        )}

        {route === 'memories' && <MemoriesPage onOpenAuth={() => setAuthModalOpen(true)} />}

        {route === 'books' && <BooksPage onOpenAuth={() => setAuthModalOpen(true)} />}

        {route === 'businesses' && <BusinessesPage onOpenAuth={() => setAuthModalOpen(true)} />}

        {route === 'activities' && <ActivitiesPage onOpenAuth={() => setAuthModalOpen(true)} />}

        {route === 'dashboard' && (
          <MemberDashboardPage onNavigate={navigate} onSelectMember={handleSelectMember} />
        )}

        {route === 'admin' && <AdminDashboardPage />}
      </main>

      <Footer
        onNavigate={navigate}
        onOpenRegistrationQr={() => setRegQrOpen(true)}
        onOpenPwaGuide={() => setPwaGuideOpen(true)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeRoute={route}
        onNavigate={navigate}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenRegistrationQr={() => setRegQrOpen(true)}
        onOpenPwaGuide={() => setPwaGuideOpen(true)}
      />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />

      {/* Global Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

      <PWAInstallGuideModal
        isOpen={pwaGuideOpen}
        onClose={() => setPwaGuideOpen(false)}
      />

      <QrShareModal
        isOpen={regQrOpen}
        onClose={() => setRegQrOpen(false)}
        title="সদস্য নিবন্ধন লিংক ও কিউআর কোড"
        subtitle="জামেউল উলুম ২০২২-২৩ শিক্ষাবর্ষের যেকোনো ভাইয়ের সাথে এই কিউআর কোড বা লিংক শেয়ার করুন"
        shareUrl={registrationShareUrl}
      />

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div
          className="fixed bottom-20 lg:bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-[calc(100vw-2rem)] no-print"
          aria-live="polite"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`flex items-start gap-2.5 p-3.5 rounded-xl border shadow-lg text-xs leading-relaxed ${
                t.type === 'success'
                  ? 'bg-[#0B3B28] text-white border-[#C9A24D]/40'
                  : t.type === 'error'
                    ? 'bg-rose-900 text-white border-rose-700'
                    : 'bg-white text-[#17211C] border-[#D8D1C1]'
              }`}
            >
              {t.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-[#E5C987] shrink-0 mt-0.5" />
              ) : t.type === 'error' ? (
                <XCircle className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" />
              ) : (
                <Info className="w-4 h-4 text-[#0D4A32] shrink-0 mt-0.5" />
              )}
              <p className="flex-1">{t.text}</p>
              <button
                type="button"
                onClick={() => dismissToast(t.id)}
                aria-label="বন্ধ করুন"
                className="opacity-75 hover:opacity-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AlumniProvider>
        <AppShell />
      </AlumniProvider>
    </ErrorBoundary>
  );
}
