import React from 'react';
import { QrCode } from 'lucide-react';
import { useAlumni } from '../context/AlumniContext';
import { ActiveRoute } from '../types';
import { PWAInstallButton } from './PWAInstallUI';

interface FooterProps {
  onNavigate: (route: ActiveRoute) => void;
  onOpenRegistrationQr: () => void;
  onOpenPwaGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenRegistrationQr,
  onOpenPwaGuide,
}) => {
  const { siteSettings, isAdmin } = useAlumni();

  return (
    <footer className="bg-[#0B3B28] text-[#E6ECE8] islamic-lattice border-t border-[#C9A24D]/30 mt-20 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-24 lg:pb-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-white/10">
          <div className="md:col-span-5 space-y-3">
            <p className="font-arabic text-base text-[#E5C987]">جامعة العلوم — ميربور ١٤، دكا</p>
            <h2 className="font-editorial text-2xl font-bold text-white">{siteSettings.siteName}</h2>
            <p className="text-sm text-[#C7D7CE] leading-relaxed max-w-md">{siteSettings.footerMotto}</p>
            <p className="text-xs text-[#9BB4A7] pt-1">
              {siteSettings.madrasahName} · {siteSettings.madrasahLocation} · ১৪৪৩-৪৪ হিজরি / ২০২২-২৩ ঈসায়ি
            </p>
          </div>

          <div className="md:col-span-4 grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[#E5C987]">প্ল্যাটফর্ম বিভাগ</p>
              <ul className="space-y-2 text-[#C7D7CE]">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('directory')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    সদস্য ডিরেক্টরি
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('memories')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    স্মৃতির পাতা ও গ্যালারি
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('books')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    বই ও প্রকাশনা
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('businesses')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    ব্যবসা ও উদ্যোগ
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-[#E5C987]">কমিউনিটি সেবা</p>
              <ul className="space-y-2 text-[#C7D7CE]">
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('activities')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    ঘোষণা ও নোটিশ বোর্ড
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('activities')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    অনুষ্ঠান ও পুনর্মিলনী
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    নতুন সদস্য নিবন্ধন
                  </button>
                </li>
                {isAdmin && (
                  <li>
                    <button
                      type="button"
                      onClick={() => onNavigate('admin')}
                      className="text-[#E5C987] hover:text-white transition-colors cursor-pointer"
                    >
                      প্রশাসনিক প্যানেল
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <p className="text-xs font-semibold text-[#E5C987]">সহপাঠীদের আমন্ত্রণ জানান</p>
            <p className="text-xs text-[#C7D7CE] leading-relaxed">
              ব্যাচের যেকোনো ভাইয়ের কাছে সরাসরি নিবন্ধন লিংক অথবা কিউআর কোড শেয়ার করুন।
            </p>
            <div className="flex flex-col items-start gap-2.5">
              <button
                type="button"
                onClick={onOpenRegistrationQr}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#C9A24D] text-[#0B2B1E] text-xs font-semibold hover:bg-[#D8B463] transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                নিবন্ধন কিউআর কোড দেখুন
              </button>
              <PWAInstallButton variant="footer" onOpenGuide={onOpenPwaGuide} />
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#9BB4A7]">
          <p>
            © ২০২৬ {siteSettings.siteName} · {siteSettings.subtitle}
          </p>
          <p>সদস্যদের ব্যক্তিগত তথ্যের গোপনীয়তা ও নিরাপত্তা সংরক্ষিত</p>
        </div>

        <div className="pt-4 mt-4 border-t border-white/10 text-center text-xs text-[#B4C8BD]">
          ডেভেলপার:{' '}
          <a
            href="https://facebook.com/akhanesunny"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#E5C987] hover:text-white underline underline-offset-4 transition-colors"
          >
            আরাফাত সানী
          </a>
        </div>
      </div>
    </footer>
  );
};
