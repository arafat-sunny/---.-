import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, X } from 'lucide-react';
import { useAlumni } from '../context/AlumniContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAlumni();
  const [mode, setMode] = useState<'google' | 'email-login' | 'email-signup'>('google');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
      onSuccess?.();
    } catch {
      // Toast already handled in context
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'email-login') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
      onClose();
      onSuccess?.();
    } catch {
      // Toast handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-[#E4DFD2] rounded-xl max-w-md w-full max-h-[92vh] overflow-y-auto p-5 sm:p-7 relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="absolute top-3.5 right-3.5 p-2 rounded-lg text-[#4A5951] hover:bg-[#F3F0E7] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5 pr-8">
          <p className="text-xs font-medium text-[#8B641E] mb-1">নিরাপদ সদস্য প্রবেশাধিকার</p>
          <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#0B3B28]">লগইন ও নিবন্ধন</h2>
          <p className="text-xs text-[#4A5951] mt-1">
            জামেউল উলুম ২০২২-২৩ ব্যাচের ডিজিটাল পরিবারে যুক্ত হতে আপনার অ্যাকাউন্টে প্রবেশ করুন।
          </p>
        </div>

        {/* Google Login (Recommended & Pre-configured) */}
        <button
          type="button"
          disabled={loading}
          onClick={handleGoogle}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg bg-[#0D4A32] text-white text-xs sm:text-sm font-semibold hover:bg-[#093624] disabled:opacity-60 transition-colors text-center cursor-pointer"
        >
          <ShieldCheck className="w-4 h-4 text-[#E5C987] shrink-0" />
          <span>{loading ? 'প্রবেশ করা হচ্ছে...' : 'গুগল অ্যাকাউন্ট দিয়ে প্রবেশ করুন'}</span>
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-[#6B7A72]">
          <div className="h-px flex-1 bg-[#E4DFD2]" />
          <span>অথবা ইমেইল ও পাসওয়ার্ড</span>
          <div className="h-px flex-1 bg-[#E4DFD2]" />
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#F3F0E7] rounded-lg mb-4">
          <button
            type="button"
            onClick={() => setMode('email-login')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              mode === 'email-login' || mode === 'google'
                ? 'bg-white text-[#0B3B28] shadow-sm'
                : 'text-[#4A5951]'
            }`}
          >
            ইমেইল লগইন
          </button>
          <button
            type="button"
            onClick={() => setMode('email-signup')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              mode === 'email-signup' ? 'bg-white text-[#0B3B28] shadow-sm' : 'text-[#4A5951]'
            }`}
          >
            নতুন ইমেইল অ্যাকাউন্ট
          </button>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#17211C] mb-1">ইমেইল ঠিকানা</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#5E6D65] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#17211C] mb-1">পাসওয়ার্ড</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#5E6D65] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড"
                className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg border border-[#0D4A32] text-[#0D4A32] text-sm font-semibold hover:bg-[#0D4A32] hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
          >
            {mode === 'email-signup' ? 'ইমেইল অ্যাকাউন্ট তৈরি করুন' : 'ইমেইল দিয়ে লগইন করুন'}
          </button>
        </form>

        <p className="text-[11px] text-[#6B7A72] leading-relaxed mt-4 text-center">
          লগইন করার পর আপনি ৫ ধাপে আপনার ফারেগিন প্রোফাইল নিবন্ধন করতে পারবেন। প্রশাসকের অনুমোদনের পর তা ডিরেক্টরিতে প্রকাশিত হবে।
        </p>
      </div>
    </div>
  );
};
