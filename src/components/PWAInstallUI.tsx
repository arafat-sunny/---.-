import React, { useState } from 'react';
import {
  Check,
  Copy,
  Download,
  MoreVertical,
  Share,
  Smartphone,
  WifiOff,
  X,
} from 'lucide-react';
import { useOnlineStatus, usePWAInstall } from '../hooks/usePWAInstall';
import { useAlumni } from '../context/AlumniContext';

interface PWAInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallGuideModal: React.FC<PWAInstallGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { siteSettings, pushToast } = useAlumni();
  const { isInstallable, isIOS, isAndroid, isInAppBrowser, install } = usePWAInstall();
  const [installing, setInstalling] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleOneTapInstall = async () => {
    setInstalling(true);
    const accepted = await install();
    setInstalling(false);
    if (accepted) {
      pushToast('success', 'অ্যাপটি আপনার হোম স্ক্রিনে সংরক্ষণ করা হয়েছে।');
      onClose();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      pushToast('success', 'ওয়েবসাইটের লিংক কপি হয়েছে — এখন Chrome বা Safari ব্রাউজারে খুলুন।');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      pushToast('error', 'লিংক কপি করা যায়নি, অনুগ্রহ করে অ্যাড্রেস বার থেকে কপি করুন।');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-xs p-0 sm:p-4 no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-[#F8F6F0] rounded-t-3xl sm:rounded-2xl border border-[#D8D1C1] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1.5 rounded-full bg-[#D8D1C1]" aria-hidden="true" />
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-4 border-b border-[#E4DFD2] flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src="/pwa-192x192.png"
              alt={siteSettings.siteName}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl border border-[#C9A24D]/40 shadow-xs shrink-0 object-cover"
            />
            <div className="min-w-0">
              <h3
                id="pwa-modal-title"
                className="font-editorial text-lg font-bold text-[#0B3B28] leading-snug"
              >
                অ্যাপ ইন্সটল করুন
              </h3>
              <p className="text-xs text-[#5D6D65] truncate">
                {siteSettings.siteName} · ইনস্টল ছাড়াই অ্যাপ অভিজ্ঞতা
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="বন্ধ করুন"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-[#5D6D65] hover:bg-[#EFECE3] hover:text-[#0B3B28] shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-[#314038] leading-relaxed">
            প্লে-স্টোর বা অ্যাপ-স্টোর থেকে ডাউনলোড না করেই আপনার ফোনের হোম স্ক্রিনে শর্টকাট হিসেবে
            সংরক্ষণ করুন। এরপর যেকোনো সময় এক ট্যাপে সাধারণ মোবাইল অ্যাপের মতো পূর্ণ স্ক্রিনে ব্যবহার
            করতে পারবেন।
          </p>

          {/* Direct One-Tap Install when browser supports beforeinstallprompt */}
          {isInstallable && (
            <button
              type="button"
              onClick={handleOneTapInstall}
              disabled={installing}
              className="w-full min-h-[48px] px-4 py-3 rounded-xl bg-[#0D4A32] text-[#F8F6F0] font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#093624] active:scale-[0.99] transition cursor-pointer disabled:opacity-60"
            >
              <Download className="w-4 h-4 text-[#E5C987]" />
              {installing ? 'অ্যাপ ইন্সটল হচ্ছে...' : 'এখনই অ্যাপ ইন্সটল করুন'}
            </button>
          )}

          {/* In-app browser notice (Messenger / Facebook / WhatsApp) */}
          {isInAppBrowser && (
            <div className="p-3.5 rounded-xl bg-[#FBF6E8] border border-[#E6D6AE] space-y-2.5">
              <p className="text-xs font-semibold text-[#7A5614]">
                ফেসবুক বা মেসেঞ্জারের ভেতরের ব্রাউজারে আছেন?
              </p>
              <p className="text-xs text-[#5D4C26] leading-relaxed">
                হোম স্ক্রিনে যোগ করার অপশনটি পেতে নিচের বাটন থেকে লিংকটি কপি করে আপনার ফোনের{' '}
                <strong>Chrome</strong> (অ্যান্ড্রয়েড) অথবা <strong>Safari</strong> (আইফোন)
                ব্রাউজারে খুলুন।
              </p>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#D8C79D] text-xs font-semibold text-[#0B3B28] hover:bg-[#F5EFE0] cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#0D4A32]" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'লিংক কপি হয়েছে' : 'ওয়েবসাইটের লিংক কপি করুন'}
              </button>
            </div>
          )}

          {/* iOS Safari Steps */}
          {(isIOS || !isAndroid) && (
            <div className="p-4 rounded-xl bg-white border border-[#E4DFD2] space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0B3B28]">
                <Share className="w-4 h-4 text-[#B68D40] shrink-0" />
                <span>আইফোন / আইপ্যাড (Safari ব্রাউজার)</span>
              </div>
              <ol className="space-y-1.5 text-xs text-[#3D4C44] leading-relaxed list-decimal list-inside">
                <li>
                  Safari ব্রাউজারের নিচে (অথবা উপরে) থাকা <strong>Share (শেয়ার)</strong> আইকনে ট্যাপ
                  করুন।
                </li>
                <li>
                  মেনুটি নিচে স্ক্রল করে <strong>“Add to Home Screen”</strong> (হোম স্ক্রিনে যোগ
                  করুন) সিলেক্ট করুন।
                </li>
                <li>
                  উপরে ডানপাশে <strong>“Add”</strong> বাটনে ট্যাপ করলেই হোম স্ক্রিনে অ্যাপ আইকন চলে
                  আসবে।
                </li>
              </ol>
            </div>
          )}

          {/* Android Chrome Steps */}
          {(isAndroid || !isIOS) && (
            <div className="p-4 rounded-xl bg-white border border-[#E4DFD2] space-y-2.5">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0B3B28]">
                <MoreVertical className="w-4 h-4 text-[#B68D40] shrink-0" />
                <span>অ্যান্ড্রয়েড ফোন (Chrome / Edge ব্রাউজার)</span>
              </div>
              <ol className="space-y-1.5 text-xs text-[#3D4C44] leading-relaxed list-decimal list-inside">
                <li>
                  ব্রাউজারের উপরে ডানপাশে থাকা <strong>তিন-ডট (⋮)</strong> মেনুতে ট্যাপ করুন।
                </li>
                <li>
                  তালিকা থেকে <strong>“Add to Home screen”</strong> অথবা{' '}
                  <strong>“Install app”</strong> (হোম স্ক্রিনে যোগ করুন) সিলেক্ট করুন।
                </li>
                <li>
                  নিশ্চিত করতে <strong>“Add / Install”</strong> ট্যাপ করুন — সাথে সাথে হোম স্ক্রিনে
                  সংরক্ষিত হয়ে যাবে।
                </li>
              </ol>
            </div>
          )}

          <div className="pt-1 flex items-center justify-between gap-3">
            {!isInAppBrowser && (
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0D4A32] hover:underline cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'লিংক কপি হয়েছে' : 'লিংক কপি করুন'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="ml-auto px-4 py-2 rounded-lg bg-[#EFECE3] text-[#17211C] text-xs font-semibold hover:bg-[#E4DFD2] transition-colors cursor-pointer"
            >
              বুঝেছি, বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PWAInstallButtonProps {
  variant?: 'drawer' | 'footer' | 'sheet';
  onOpenGuide: () => void;
  onActionComplete?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'drawer',
  onOpenGuide,
  onActionComplete,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const { pushToast } = useAlumni();

  // Hide automatically when already running as a standalone home-screen app
  if (isInstalled) return null;

  const handleClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        pushToast('success', 'অ্যাপটি আপনার হোম স্ক্রিনে সংরক্ষণ করা হয়েছে।');
        onActionComplete?.();
        return;
      }
    }
    onActionComplete?.();
    onOpenGuide();
  };

  if (variant === 'footer') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#C9A24D]/50 text-[#F8F6F0] text-xs font-semibold hover:bg-white/10 transition-colors cursor-pointer"
      >
        <Smartphone className="w-4 h-4 text-[#E5C987]" />
        অ্যাপ ইন্সটল করুন
      </button>
    );
  }

  if (variant === 'sheet') {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex items-center gap-3 p-3.5 rounded-2xl bg-[#0B3B28] text-[#F8F6F0] hover:bg-[#093020] active:scale-[0.99] transition cursor-pointer text-left"
      >
        <span className="w-10 h-10 rounded-xl bg-[#C9A24D]/20 border border-[#C9A24D]/40 flex items-center justify-center shrink-0">
          <Smartphone className="w-5 h-5 text-[#E5C987]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-tight">
            অ্যাপ ইন্সটল করুন
          </span>
          <span className="block text-[11px] text-[#C7D7CE] mt-0.5 truncate">
            {isInstallable
              ? 'এক ট্যাপে সরাসরি হোম স্ক্রিনে যোগ হবে'
              : 'হোম স্ক্রিনে অ্যাপ হিসেবে ব্যবহারের নির্দেশনা'}
          </span>
        </span>
        <Download className="w-4 h-4 text-[#E5C987] shrink-0" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-semibold text-[#0B3B28] bg-[#F8F3E6] border border-[#E4D6B4] hover:bg-[#EFE6CE] transition-colors cursor-pointer"
    >
      <Smartphone className="w-4 h-4 text-[#9B7228] shrink-0" />
      <span className="truncate">অ্যাপ ইন্সটল করুন</span>
    </button>
  );
};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 lg:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-[#0B3B28] border border-[#C9A24D]/50 px-3.5 py-2 text-xs font-medium text-[#F8F6F0] shadow-lg no-print"
    >
      <WifiOff className="w-3.5 h-3.5 text-[#E5C987] shrink-0" />
      <span>অফলাইন মোড — সংরক্ষিত তথ্য দেখানো হচ্ছে</span>
    </div>
  );
};
