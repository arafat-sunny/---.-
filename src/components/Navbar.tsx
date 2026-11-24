import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAlumni } from '../context/AlumniContext';
import { ActiveRoute } from '../types';
import { PWAInstallButton } from './PWAInstallUI';

interface NavbarProps {
  activeRoute: ActiveRoute;
  onNavigate: (route: ActiveRoute) => void;
  onOpenAuth: () => void;
  onOpenPwaGuide: () => void;
}

const NAV_ITEMS: { route: ActiveRoute; label: string }[] = [
  { route: 'directory', label: 'সদস্যবৃন্দ' },
  { route: 'memories', label: 'স্মৃতির পাতা' },
  { route: 'books', label: 'বই ও প্রকাশনা' },
  { route: 'businesses', label: 'ব্যবসা ও উদ্যোগ' },
  { route: 'activities', label: 'ঘোষণা ও অনুষ্ঠান' },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeRoute,
  onNavigate,
  onOpenAuth,
  onOpenPwaGuide,
}) => {
  const { user, myMember, isAdmin, siteSettings } = useAlumni();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (route: ActiveRoute) => {
    setMobileOpen(false);
    onNavigate(route);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F8F6F0]/95 backdrop-blur-md border-b border-[#E4DFD2] no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 lg:h-16 flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">
        {/* Zone 1: Single-line Brand Wordmark (shrinks gracefully on narrow mobile screens) */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="flex items-center gap-2 sm:gap-2.5 text-left min-w-0 flex-1 lg:flex-none lg:shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D4A32] rounded-md"
        >
          {siteSettings.logoUrl ? (
            <img
              src={siteSettings.logoUrl}
              alt={siteSettings.siteName}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-md object-cover border border-[#D8D1C1] shrink-0"
            />
          ) : (
            <span
              className="w-8 h-8 rounded-md bg-[#0D4A32] text-[#E5C987] flex items-center justify-center font-editorial font-bold text-sm border border-[#C9A24D]/40 shrink-0"
              aria-hidden="true"
            >
              জ
            </span>
          )}
          <span className="font-editorial text-sm sm:text-base lg:text-lg font-bold tracking-tight text-[#0B3B28] truncate block">
            {siteSettings.siteName}
          </span>
        </button>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-7" aria-label="প্রধান নেভিগেশন">
          {NAV_ITEMS.map((item) => {
            const active = activeRoute === item.route;
            return (
              <button
                key={item.route}
                type="button"
                onClick={() => handleNav(item.route)}
                className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 cursor-pointer ${
                  active
                    ? 'text-[#0B3B28] border-[#B68D40]'
                    : 'text-[#4A5951] border-transparent hover:text-[#0B3B28] hover:border-[#0B3B28]/30'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action Button + Mobile Menu Trigger */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {user ? (
            <button
              type="button"
              onClick={() => handleNav(isAdmin && !myMember ? 'admin' : 'dashboard')}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-[#0D4A32] text-[#F8F6F0] rounded-lg hover:bg-[#093624] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="sm:hidden">ড্যাশবোর্ড</span>
              <span className="hidden sm:inline">
                {isAdmin && activeRoute === 'dashboard' ? 'অ্যাডমিন প্যানেল' : 'আমার ড্যাশবোর্ড'}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-[#0D4A32] text-[#F8F6F0] rounded-lg hover:bg-[#093624] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span className="sm:hidden">লগইন</span>
              <span className="hidden sm:inline">লগইন ও নিবন্ধন</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
            aria-expanded={mobileOpen}
            className="lg:hidden w-10 h-10 flex items-center justify-center rounded-lg text-[#0B3B28] hover:bg-[#EFECE3] transition-colors shrink-0 cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E4DFD2] bg-[#F8F6F0] px-4 py-4 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-lg">
          <button
            type="button"
            onClick={() => handleNav('home')}
            className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
              activeRoute === 'home' ? 'bg-[#0D4A32] text-white' : 'text-[#17211C] hover:bg-[#EFECE3]'
            }`}
          >
            হোমপেজ
          </button>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.route}
              type="button"
              onClick={() => handleNav(item.route)}
              className={`w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium cursor-pointer ${
                activeRoute === item.route ? 'bg-[#0D4A32] text-white' : 'text-[#17211C] hover:bg-[#EFECE3]'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 mt-2 border-t border-[#E4DFD2] space-y-2">
            {!user ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full text-center px-3 py-2.5 rounded-lg bg-[#0D4A32] text-white text-sm font-semibold hover:bg-[#093624] transition-colors cursor-pointer"
                >
                  লগইন করুন
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('register')}
                  className="w-full text-center px-3 py-2.5 rounded-lg border border-[#0D4A32] text-[#0D4A32] bg-white text-sm font-semibold hover:bg-[#EFECE3] transition-colors cursor-pointer"
                >
                  নিবন্ধন করুন
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleNav('register')}
                  className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#0B3B28] hover:bg-[#EFECE3] cursor-pointer"
                >
                  {myMember ? 'প্রোফাইল সম্পাদনা' : 'সদস্য নিবন্ধন ফর্ম'}
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('dashboard')}
                  className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#0B3B28] hover:bg-[#EFECE3] cursor-pointer"
                >
                  আমার ড্যাশবোর্ড
                </button>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleNav('admin')}
                    className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-semibold text-[#8B641E] bg-[#F8F3E6] hover:bg-[#EFE6CE] cursor-pointer"
                  >
                    প্রশাসনিক প্যানেল (অ্যাডমিন)
                  </button>
                )}
              </>
            )}

            <div className="pt-1">
              <PWAInstallButton
                variant="drawer"
                onOpenGuide={onOpenPwaGuide}
                onActionComplete={() => setMobileOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
