import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAlumni } from '../context/AlumniContext';
import { ActiveRoute } from '../types';

interface NavbarProps {
  activeRoute: ActiveRoute;
  onNavigate: (route: ActiveRoute) => void;
  onOpenAuth: () => void;
}

const NAV_ITEMS: { route: ActiveRoute; label: string }[] = [
  { route: 'directory', label: 'সদস্যবৃন্দ' },
  { route: 'memories', label: 'স্মৃতির পাতা' },
  { route: 'books', label: 'বই ও প্রকাশনা' },
  { route: 'businesses', label: 'ব্যবসা ও উদ্যোগ' },
  { route: 'activities', label: 'ঘোষণা ও অনুষ্ঠান' },
];

export const Navbar: React.FC<NavbarProps> = ({ activeRoute, onNavigate, onOpenAuth }) => {
  const { user, myMember, isAdmin, siteSettings } = useAlumni();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (route: ActiveRoute) => {
    setMobileOpen(false);
    onNavigate(route);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F6F0]/95 backdrop-blur-md border-b border-[#E4DFD2] no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleNav('home')}
          className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0D4A32] rounded-md"
        >
          {siteSettings.logoUrl ? (
            <img
              src={siteSettings.logoUrl}
              alt={siteSettings.siteName}
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-md object-cover border border-[#D8D1C1]"
            />
          ) : (
            <span
              className="w-8 h-8 rounded-md bg-[#0D4A32] text-[#E5C987] flex items-center justify-center font-editorial font-bold text-sm border border-[#C9A24D]/40"
              aria-hidden="true"
            >
              জ
            </span>
          )}
          <span className="font-editorial text-base sm:text-lg font-bold tracking-tight text-[#0B3B28] truncate max-w-[200px] sm:max-w-none">
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
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <button
              type="button"
              onClick={() => handleNav(isAdmin && !myMember ? 'admin' : 'dashboard')}
              className="px-4 py-2 text-xs sm:text-sm font-medium bg-[#0D4A32] text-[#F8F6F0] rounded-lg hover:bg-[#093624] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {isAdmin && activeRoute === 'dashboard' ? 'অ্যাডমিন প্যানেল' : 'আমার ড্যাশবোর্ড'}
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs sm:text-sm font-medium bg-[#0D4A32] text-[#F8F6F0] rounded-lg hover:bg-[#093624] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              লগইন ও নিবন্ধন
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="মেনু খুলুন"
            className="lg:hidden p-2 rounded-lg text-[#0B3B28] hover:bg-[#EFECE3] transition-colors cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E4DFD2] bg-[#F8F6F0] px-4 py-4 space-y-1">
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
          <div className="pt-2 mt-2 border-t border-[#E4DFD2] space-y-1">
            <button
              type="button"
              onClick={() => handleNav('register')}
              className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#0B3B28] hover:bg-[#EFECE3] cursor-pointer"
            >
              সদস্য নিবন্ধন ফর্ম
            </button>
            {user && (
              <button
                type="button"
                onClick={() => handleNav('dashboard')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#0B3B28] hover:bg-[#EFECE3] cursor-pointer"
              >
                আমার ড্যাশবোর্ড
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => handleNav('admin')}
                className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm font-medium text-[#8B641E] hover:bg-[#EFECE3] cursor-pointer"
              >
                প্রশাসনিক প্যানেল (অ্যাডমিন)
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
