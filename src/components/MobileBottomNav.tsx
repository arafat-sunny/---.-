import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CalendarDays,
  Camera,
  Home,
  LayoutDashboard,
  LayoutGrid,
  LogIn,
  QrCode,
  ShieldCheck,
  Store,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useAlumni } from '../context/AlumniContext';
import { ActiveRoute } from '../types';
import { PWAInstallButton } from './PWAInstallUI';

interface MobileBottomNavProps {
  activeRoute: ActiveRoute;
  onNavigate: (route: ActiveRoute) => void;
  onOpenAuth: () => void;
  onOpenRegistrationQr: () => void;
  onOpenPwaGuide: () => void;
}

const SECONDARY_ROUTES: ActiveRoute[] = [
  'books',
  'businesses',
  'register',
  'dashboard',
  'admin',
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeRoute,
  onNavigate,
  onOpenAuth,
  onOpenRegistrationQr,
  onOpenPwaGuide,
}) => {
  const { user, myMember, isAdmin } = useAlumni();
  const [moreOpen, setMoreOpen] = useState(false);

  // Close sheet on route change
  useEffect(() => {
    setMoreOpen(false);
  }, [activeRoute]);

  const handleNav = (route: ActiveRoute) => {
    setMoreOpen(false);
    onNavigate(route);
  };

  const isDirectoryActive = activeRoute === 'directory' || activeRoute === 'profile';
  const isMoreActive = moreOpen || SECONDARY_ROUTES.includes(activeRoute);

  return (
    <>
      {/* Slide-up "আরও" Bottom Sheet for secondary sections & Home Screen App Save */}
      {moreOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] flex items-end no-print"
          role="dialog"
          aria-modal="true"
          aria-label="আরও বিভাগ ও অপশন"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="w-full bg-[#F8F6F0] rounded-t-3xl border-t border-[#D8D1C1] shadow-2xl px-4 pt-2 pb-[calc(4.75rem+env(safe-area-inset-bottom))] max-h-[82vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="w-10 h-1.5 rounded-full bg-[#D8D1C1] mx-auto my-2" aria-hidden="true" />

            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#E4DFD2]">
              <h3 className="font-editorial text-base font-bold text-[#0B3B28]">
                সকল বিভাগ ও সেবা
              </h3>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="বন্ধ করুন"
                className="w-9 h-9 rounded-lg flex items-center justify-center text-[#5D6D65] hover:bg-[#EFECE3] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-3.5">
              <button
                type="button"
                onClick={() => handleNav('books')}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left min-h-[52px] transition-colors cursor-pointer ${
                  activeRoute === 'books'
                    ? 'bg-[#0D4A32] text-white border-[#0D4A32]'
                    : 'bg-white text-[#17211C] border-[#E4DFD2] hover:bg-[#EFECE3]'
                }`}
              >
                <BookOpen
                  className={`w-5 h-5 shrink-0 ${
                    activeRoute === 'books' ? 'text-[#E5C987]' : 'text-[#0D4A32]'
                  }`}
                />
                <span className="text-xs font-semibold leading-tight">বই ও প্রকাশনা</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('businesses')}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left min-h-[52px] transition-colors cursor-pointer ${
                  activeRoute === 'businesses'
                    ? 'bg-[#0D4A32] text-white border-[#0D4A32]'
                    : 'bg-white text-[#17211C] border-[#E4DFD2] hover:bg-[#EFECE3]'
                }`}
              >
                <Store
                  className={`w-5 h-5 shrink-0 ${
                    activeRoute === 'businesses' ? 'text-[#E5C987]' : 'text-[#0D4A32]'
                  }`}
                />
                <span className="text-xs font-semibold leading-tight">ব্যবসা ও উদ্যোগ</span>
              </button>

              <button
                type="button"
                onClick={() => handleNav('register')}
                className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left min-h-[52px] transition-colors cursor-pointer ${
                  activeRoute === 'register'
                    ? 'bg-[#0D4A32] text-white border-[#0D4A32]'
                    : 'bg-white text-[#17211C] border-[#E4DFD2] hover:bg-[#EFECE3]'
                }`}
              >
                <UserPlus
                  className={`w-5 h-5 shrink-0 ${
                    activeRoute === 'register' ? 'text-[#E5C987]' : 'text-[#0D4A32]'
                  }`}
                />
                <span className="text-xs font-semibold leading-tight">
                  {myMember ? 'প্রোফাইল সম্পাদনা' : 'সদস্য নিবন্ধন'}
                </span>
              </button>

              {user ? (
                <button
                  type="button"
                  onClick={() => handleNav('dashboard')}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left min-h-[52px] transition-colors cursor-pointer ${
                    activeRoute === 'dashboard'
                      ? 'bg-[#0D4A32] text-white border-[#0D4A32]'
                      : 'bg-white text-[#17211C] border-[#E4DFD2] hover:bg-[#EFECE3]'
                  }`}
                >
                  <LayoutDashboard
                    className={`w-5 h-5 shrink-0 ${
                      activeRoute === 'dashboard' ? 'text-[#E5C987]' : 'text-[#0D4A32]'
                    }`}
                  />
                  <span className="text-xs font-semibold leading-tight">আমার ড্যাশবোর্ড</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMoreOpen(false);
                    onOpenAuth();
                  }}
                  className="flex items-center gap-2.5 p-3 rounded-2xl border bg-white text-[#17211C] border-[#E4DFD2] hover:bg-[#EFECE3] text-left min-h-[52px] transition-colors cursor-pointer"
                >
                  <LogIn className="w-5 h-5 text-[#0D4A32] shrink-0" />
                  <span className="text-xs font-semibold leading-tight">লগইন করুন</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setMoreOpen(false);
                  onOpenRegistrationQr();
                }}
                className="flex items-center gap-2.5 p-3 rounded-2xl border bg-white text-[#17211C] border-[#E4DFD2] hover:bg-[#EFECE3] text-left min-h-[52px] transition-colors cursor-pointer"
              >
                <QrCode className="w-5 h-5 text-[#B68D40] shrink-0" />
                <span className="text-xs font-semibold leading-tight">নিবন্ধন কিউআর</span>
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => handleNav('admin')}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left min-h-[52px] transition-colors cursor-pointer ${
                    activeRoute === 'admin'
                      ? 'bg-[#0D4A32] text-white border-[#0D4A32]'
                      : 'bg-[#F8F3E6] text-[#7A5614] border-[#E4D6B4] hover:bg-[#EFE6CE]'
                  }`}
                >
                  <ShieldCheck
                    className={`w-5 h-5 shrink-0 ${
                      activeRoute === 'admin' ? 'text-[#E5C987]' : 'text-[#9B7228]'
                    }`}
                  />
                  <span className="text-xs font-semibold leading-tight">অ্যাডমিন প্যানেল</span>
                </button>
              )}
            </div>

            {/* Save as Home Screen App (PWA) Action */}
            <PWAInstallButton
              variant="sheet"
              onOpenGuide={onOpenPwaGuide}
              onActionComplete={() => setMoreOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav
        aria-label="মোবাইল নিচের নেভিগেশন"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F8F6F0]/95 backdrop-blur-md border-t border-[#E4DFD2] shadow-[0_-4px_16px_rgba(11,59,40,0.06)] pb-safe no-print"
      >
        <div className="grid grid-cols-5 items-center h-14 max-w-xl mx-auto px-1">
          <button
            type="button"
            onClick={() => handleNav('home')}
            aria-current={activeRoute === 'home' ? 'page' : undefined}
            className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors cursor-pointer ${
              activeRoute === 'home' ? 'text-[#0B3B28]' : 'text-[#5D6D65] hover:text-[#0B3B28]'
            }`}
          >
            {activeRoute === 'home' && (
              <span
                className="absolute top-0 w-7 h-0.5 rounded-full bg-[#B68D40]"
                aria-hidden="true"
              />
            )}
            <Home
              className="w-5 h-5"
              strokeWidth={activeRoute === 'home' ? 2.4 : 1.9}
            />
            <span
              className={`text-[10.5px] leading-none mt-1 whitespace-nowrap ${
                activeRoute === 'home' ? 'font-bold' : 'font-medium'
              }`}
            >
              হোম
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('directory')}
            aria-current={isDirectoryActive ? 'page' : undefined}
            className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors cursor-pointer ${
              isDirectoryActive ? 'text-[#0B3B28]' : 'text-[#5D6D65] hover:text-[#0B3B28]'
            }`}
          >
            {isDirectoryActive && (
              <span
                className="absolute top-0 w-7 h-0.5 rounded-full bg-[#B68D40]"
                aria-hidden="true"
              />
            )}
            <Users
              className="w-5 h-5"
              strokeWidth={isDirectoryActive ? 2.4 : 1.9}
            />
            <span
              className={`text-[10.5px] leading-none mt-1 whitespace-nowrap ${
                isDirectoryActive ? 'font-bold' : 'font-medium'
              }`}
            >
              সদস্য
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('memories')}
            aria-current={activeRoute === 'memories' ? 'page' : undefined}
            className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors cursor-pointer ${
              activeRoute === 'memories' ? 'text-[#0B3B28]' : 'text-[#5D6D65] hover:text-[#0B3B28]'
            }`}
          >
            {activeRoute === 'memories' && (
              <span
                className="absolute top-0 w-7 h-0.5 rounded-full bg-[#B68D40]"
                aria-hidden="true"
              />
            )}
            <Camera
              className="w-5 h-5"
              strokeWidth={activeRoute === 'memories' ? 2.4 : 1.9}
            />
            <span
              className={`text-[10.5px] leading-none mt-1 whitespace-nowrap ${
                activeRoute === 'memories' ? 'font-bold' : 'font-medium'
              }`}
            >
              স্মৃতি
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleNav('activities')}
            aria-current={activeRoute === 'activities' ? 'page' : undefined}
            className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors cursor-pointer ${
              activeRoute === 'activities'
                ? 'text-[#0B3B28]'
                : 'text-[#5D6D65] hover:text-[#0B3B28]'
            }`}
          >
            {activeRoute === 'activities' && (
              <span
                className="absolute top-0 w-7 h-0.5 rounded-full bg-[#B68D40]"
                aria-hidden="true"
              />
            )}
            <CalendarDays
              className="w-5 h-5"
              strokeWidth={activeRoute === 'activities' ? 2.4 : 1.9}
            />
            <span
              className={`text-[10.5px] leading-none mt-1 whitespace-nowrap ${
                activeRoute === 'activities' ? 'font-bold' : 'font-medium'
              }`}
            >
              কার্যক্রম
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            aria-expanded={moreOpen}
            className={`relative flex flex-col items-center justify-center min-h-[44px] py-1 transition-colors cursor-pointer ${
              isMoreActive ? 'text-[#0B3B28]' : 'text-[#5D6D65] hover:text-[#0B3B28]'
            }`}
          >
            {isMoreActive && (
              <span
                className="absolute top-0 w-7 h-0.5 rounded-full bg-[#B68D40]"
                aria-hidden="true"
              />
            )}
            <LayoutGrid
              className="w-5 h-5"
              strokeWidth={isMoreActive ? 2.4 : 1.9}
            />
            <span
              className={`text-[10.5px] leading-none mt-1 whitespace-nowrap ${
                isMoreActive ? 'font-bold' : 'font-medium'
              }`}
            >
              আরও
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
