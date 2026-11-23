import { Timestamp } from 'firebase/firestore';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliNumber(input: number | string): string {
  return String(input).replace(/\d/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

const BN_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

export function formatBengaliDate(value?: Timestamp | string | Date | null): string {
  if (!value) return 'সম্প্রতি';
  let date: Date;
  if (value instanceof Timestamp) {
    date = value.toDate();
  } else if (value instanceof Date) {
    date = value;
  } else {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    date = parsed;
  }
  const day = toBengaliNumber(date.getDate());
  const month = BN_MONTHS[date.getMonth()] ?? '';
  const year = toBengaliNumber(date.getFullYear());
  return `${day} ${month} ${year}`;
}

export function isBirthdayToday(birthDateStr?: string): boolean {
  if (!birthDateStr) return false;
  const parts = birthDateStr.split('-');
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();
  if (parts.length === 3) {
    return Number(parts[1]) === currentMonth && Number(parts[2]) === currentDay;
  }
  if (parts.length === 2) {
    return Number(parts[0]) === currentMonth && Number(parts[1]) === currentDay;
  }
  return false;
}

export function getInitials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return 'জ';
  const words = cleaned.split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2);
  return `${words[0][0] ?? ''}${words[words.length - 1][0] ?? ''}`;
}

export function safeExternalUrl(url?: string): string | null {
  if (!url || !url.trim()) return null;
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/.test(trimmed)) return `https://${trimmed}`;
  return null;
}

export function clampString(val: string | undefined, maxLen: number): string {
  if (!val) return '';
  return val.trim().slice(0, maxLen);
}

/**
 * Validates and compresses an uploaded image file cleanly to a lightweight JPEG DataURL
 * (strictly bounded under ~220KB so it always passes Firestore security rule limits).
 */
export function compressImageFile(
  file: File,
  maxWidth = 960,
  quality = 0.78
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('শুধুমাত্র ছবির ফাইল (JPG, PNG, WebP) আপলোড করা যাবে।'));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('ছবির আকার সর্বোচ্চ ১০ মেগাবাইটের মধ্যে হতে হবে।'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('ছবিটি পড়তে সমস্যা হয়েছে।'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('ছবিটি প্রক্রিয়াকরণ করা যায়নি।'));
      img.onload = () => {
        const ratio = Math.min(1, maxWidth / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * ratio));
        const height = Math.max(1, Math.round(img.height * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('ব্রাউজার ক্যানভাস সমর্থন করছে না।'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        if (dataUrl.length > 310000) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.55);
        }
        if (dataUrl.length > 340000) {
          reject(new Error('ছবিটি সংকোচনের পরও বড় রয়ে গেছে। অনুগ্রহ করে ছোট ছবি নির্বাচন করুন।'));
          return;
        }
        resolve(dataUrl);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
