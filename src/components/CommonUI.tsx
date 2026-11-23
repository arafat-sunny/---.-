import React, { useState } from 'react';
import { BookOpen, Check, Copy, Flag, Image as ImageIcon, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { getInitials } from '../utils/formatters';

export const Avatar: React.FC<{
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ name, src, size = 'md', className = '' }) => {
  const [failed, setFailed] = useState(false);
  const sizeClass =
    size === 'sm'
      ? 'w-9 h-9 text-xs'
      : size === 'lg'
        ? 'w-20 h-20 text-xl'
        : size === 'xl'
          ? 'w-28 h-28 text-2xl'
          : 'w-12 h-12 text-sm';

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`${sizeClass} rounded-full object-cover border border-[#D8D1C1] shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-[#0D4A32] text-[#F8F6F0] border border-[#C9A24D]/40 flex items-center justify-center font-editorial font-semibold shrink-0 select-none ${className}`}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
};

export const SafeImage: React.FC<{
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}> = ({ src, alt, className = '', fallbackTitle }) => {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={className}
      />
    );
  }

  return (
    <div
      className={`bg-[#EFECE3] islamic-lattice-light flex flex-col items-center justify-center text-[#4A5951] p-6 text-center ${className}`}
    >
      <ImageIcon className="w-7 h-7 text-[#0D4A32]/40 mb-2" />
      <span className="text-xs font-medium text-[#4A5951]">{fallbackTitle || alt}</span>
    </div>
  );
};

export const BookCoverDisplay: React.FC<{
  title: string;
  authorName: string;
  category: string;
  coverUrl?: string;
  className?: string;
}> = ({ title, authorName, category, coverUrl, className = 'aspect-[3/4]' }) => {
  const [failed, setFailed] = useState(false);

  if (coverUrl && !failed) {
    return (
      <img
        src={coverUrl}
        alt={title}
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        className={`w-full object-cover rounded-lg border border-[#E4DFD2] ${className}`}
      />
    );
  }

  return (
    <div
      className={`w-full rounded-lg bg-[#0B3B28] islamic-lattice border border-[#C9A24D]/40 p-5 flex flex-col justify-between text-[#F8F6F0] relative overflow-hidden ${className}`}
    >
      <div className="flex items-center justify-between text-[11px] text-[#E5C987]">
        <span>{category}</span>
        <BookOpen className="w-4 h-4 opacity-75" />
      </div>
      <div className="my-auto py-4 border-y border-[#C9A24D]/30">
        <h4 className="font-editorial text-lg font-bold leading-snug text-white line-clamp-3">{title}</h4>
      </div>
      <div className="text-xs text-[#D6E2DC] truncate">{authorName}</div>
    </div>
  );
};

export const QrShareModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  shareUrl: string;
}> = ({ isOpen, onClose, title, subtitle, shareUrl }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white border border-[#E4DFD2] rounded-xl max-w-md w-full p-6 relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="absolute top-4 right-4 p-2 rounded-lg text-[#4A5951] hover:bg-[#F3F0E7] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-[#0D4A32] mb-1">
          <QrCode className="w-5 h-5" />
          <h3 className="font-editorial text-lg font-bold">{title}</h3>
        </div>
        <p className="text-sm text-[#4A5951] mb-6">{subtitle}</p>

        <div className="bg-[#F8F6F0] border border-[#E4DFD2] rounded-xl p-6 flex flex-col items-center justify-center mb-5">
          <div className="bg-white p-4 rounded-lg border border-[#E4DFD2]">
            <QRCodeSVG value={shareUrl} size={184} fgColor="#0B3B28" bgColor="#FFFFFF" level="M" />
          </div>
          <p className="text-xs text-[#5E6D65] mt-3 text-center">
            মোবাইলের ক্যামেরা দিয়ে কিউআর কোডটি স্ক্যান করুন অথবা নিচের লিংক কপি করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 text-xs bg-[#F8F6F0] border border-[#DFD9C9] rounded-lg px-3 py-2.5 text-[#17211C] focus:outline-none"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0D4A32] text-white text-xs font-medium rounded-lg hover:bg-[#093624] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'কপি হয়েছে' : 'লিংক কপি'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ReportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  targetTitle: string;
  onSubmit: (reason: string) => Promise<void>;
}> = ({ isOpen, onClose, targetTitle, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim().length < 5) return;
    setSubmitting(true);
    try {
      await onSubmit(reason.trim());
      setReason('');
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      <div className="bg-white border border-[#E4DFD2] rounded-xl max-w-md w-full p-6 relative">
        <button
          type="button"
          onClick={onClose}
          aria-label="বন্ধ করুন"
          className="absolute top-4 right-4 p-2 rounded-lg text-[#4A5951] hover:bg-[#F3F0E7] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-rose-800 mb-1">
          <Flag className="w-5 h-5" />
          <h3 className="font-editorial text-lg font-bold">অভিযোগ / রিপোর্ট জমা দিন</h3>
        </div>
        <p className="text-xs text-[#4A5951] mb-4">বিষয়: {targetTitle}</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#17211C] mb-1.5">
              রিপোর্টের কারণ বিস্তারিত লিখুন
            </label>
            <textarea
              required
              minLength={5}
              maxLength={800}
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="কেন এই পোস্ট বা তথ্যটি অনুপযুক্ত, অসত্য বা শরিয়াহবিরোধী মনে করছেন তা লিখুন..."
              className="w-full rounded-lg border border-[#D8D1C1] bg-[#FCFBF8] px-3.5 py-2.5 text-sm focus:border-[#0D4A32] focus:outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-[#4A5951] hover:bg-[#F3F0E7] rounded-lg transition-colors cursor-pointer"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={submitting || reason.trim().length < 5}
              className="px-4 py-2 bg-rose-700 text-white text-sm font-medium rounded-lg hover:bg-rose-800 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {submitting ? 'জমা হচ্ছে...' : 'রিপোর্ট পাঠান'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
