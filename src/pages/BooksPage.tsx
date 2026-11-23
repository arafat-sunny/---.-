import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  ExternalLink,
  Flag,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { BOOK_CATEGORIES } from '../constants/bengali';
import { useAlumni } from '../context/AlumniContext';
import { BookCategory, BookItem } from '../types';
import { compressImageFile, safeExternalUrl, toBengaliNumber } from '../utils/formatters';
import { BookCoverDisplay, ReportModal } from '../components/CommonUI';

export const BooksPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const {
    books,
    user,
    myMember,
    isApprovedMember,
    isAdmin,
    bookmarks,
    createBook,
    deleteBook,
    toggleBookmark,
    submitReport,
    pushToast,
  } = useAlumni();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<BookItem | null>(null);

  // Add Book Form
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [publisher, setPublisher] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<BookCategory>('ইসলামিক বই');
  const [description, setDescription] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [buyLink, setBuyLink] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return books.filter((b) => {
      if (categoryFilter && b.category !== categoryFilter) return false;
      if (q) {
        const hay = `${b.title} ${b.authorName} ${b.publisher || ''} ${b.subject || ''} ${b.description}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [books, search, categoryFilter]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await compressImageFile(file, 640, 0.8);
      setCoverUrl(url);
      pushToast('success', 'বইয়ের প্রচ্ছদ যুক্ত হয়েছে।');
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'প্রচ্ছদ আপলোড ব্যর্থ হয়েছে।');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createBook({
        title,
        authorName: authorName || myMember?.fullName || user?.displayName || 'সদস্য',
        publisher,
        publishDate,
        subject,
        category,
        description,
        coverUrl,
        buyLink,
        contactInfo,
      });
      setTitle('');
      setPublisher('');
      setPublishDate('');
      setSubject('');
      setDescription('');
      setCoverUrl('');
      setBuyLink('');
      setContactInfo('');
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD2]">
        <div>
          <p className="text-xs font-medium text-[#8B641E] mb-1">ইলমি অবদান, গবেষণা ও অনুবাদ</p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0B3B28]">বই ও প্রকাশনা</h1>
          <p className="text-sm text-[#4A5951] mt-1">
            আমাদের ব্যাচের লেখক, গবেষক ও অনুবাদক ভাইদের প্রকাশিত গ্রন্থসমূহের সম্মিলিত তালিকা।
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!user) onOpenAuth();
            else if (!isApprovedMember) pushToast('info', 'বই যুক্ত করতে অনুমোদিত সদস্য হতে হবে।');
            else {
              setAuthorName(myMember?.fullName || user.displayName || '');
              setModalOpen(true);
            }
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] transition-colors self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          নতুন বই যুক্ত করুন
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#5E6D65] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="বইয়ের নাম, লেখক বা প্রকাশনী খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              categoryFilter === ''
                ? 'bg-[#0D4A32] text-white border-[#0D4A32]'
                : 'bg-white text-[#4A5951] border-[#E4DFD2] hover:border-[#0D4A32]'
            }`}
          >
            সব ({toBengaliNumber(books.length)})
          </button>
          {BOOK_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#0D4A32] text-white border-[#0D4A32]'
                  : 'bg-white text-[#4A5951] border-[#E4DFD2] hover:border-[#0D4A32]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((book) => {
          const isBookmarked = bookmarks.some(
            (b) => b.targetType === 'book' && b.targetId === book.id
          );
          const safeBuy = safeExternalUrl(book.buyLink);
          return (
            <article
              key={book.id}
              className="bg-white border border-[#E4DFD2] rounded-xl p-5 flex flex-col justify-between gap-4"
            >
              <div className="flex gap-4">
                <div className="w-28 shrink-0">
                  <BookCoverDisplay
                    title={book.title}
                    authorName={book.authorName}
                    category={book.category}
                    coverUrl={book.coverUrl}
                  />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs text-[#8B641E]">
                    {book.category}
                    {book.isDemo ? ' · নমুনা বই' : ''}
                  </p>
                  <h2 className="font-editorial text-lg font-bold text-[#0B3B28] leading-snug">
                    {book.title}
                  </h2>
                  <p className="text-xs font-medium text-[#17211C]">{book.authorName}</p>
                  {book.publisher && (
                    <p className="text-xs text-[#5E6D65]">
                      প্রকাশনী: {book.publisher}
                      {book.publishDate ? ` · ${book.publishDate}` : ''}
                    </p>
                  )}
                  {book.subject && <p className="text-xs text-[#5E6D65]">বিষয়: {book.subject}</p>}
                </div>
              </div>

              <p className="text-sm text-[#4A5951] leading-relaxed">{book.description}</p>

              <div className="pt-4 border-t border-[#F0ECE1] flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  {safeBuy ? (
                    <a
                      href={safeBuy}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-[#0D4A32] hover:text-[#8B641E]"
                    >
                      বই সংগ্রহ করুন <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-[#5E6D65] truncate block">
                      {book.contactInfo || 'লেখকের সাথে যোগাযোগ করুন'}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {user && (
                    <button
                      type="button"
                      onClick={() => toggleBookmark('book', book.id, book.title)}
                      aria-label="বুকমার্ক"
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        isBookmarked ? 'text-[#8B641E] bg-[#F8F3E6]' : 'text-[#5E6D65] hover:bg-[#F3F0E7]'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                  )}
                  {!book.isDemo && user && (
                    <button
                      type="button"
                      onClick={() => setReportTarget(book)}
                      aria-label="রিপোর্ট"
                      className="p-1.5 rounded-lg text-[#5E6D65] hover:text-rose-700 cursor-pointer"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  )}
                  {!book.isDemo && user && (isAdmin || user.uid === book.authorId) && (
                    <button
                      type="button"
                      onClick={() => deleteBook(book.id)}
                      aria-label="মুছে ফেলুন"
                      className="p-1.5 rounded-lg text-[#5E6D65] hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Add Book Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E4DFD2] rounded-xl max-w-xl w-full p-6 relative my-8">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-[#4A5951] hover:bg-[#F3F0E7] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-editorial text-xl font-bold text-[#0B3B28] mb-4">নতুন বই যুক্ত করুন</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">বইয়ের নাম *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">লেখক / অনুবাদকের নাম *</label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">বিভাগ *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BookCategory)}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  >
                    {BOOK_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">প্রকাশনীর নাম</label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">প্রকাশের তারিখ</label>
                  <input
                    type="text"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    placeholder="যেমন: ফেব্রুয়ারি ২০২৬"
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">বইয়ের বিষয়বস্তু</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="যেমন: সীরাত / ফিকহ / ইতিহাস"
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">বই কেনার লিংক</label>
                  <input
                    type="text"
                    value={buyLink}
                    onChange={(e) => setBuyLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">যোগাযোগের তথ্য</label>
                  <input
                    type="text"
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="ফোন বা প্রকাশনীর ঠিকানা"
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">বইয়ের সংক্ষিপ্ত পরিচিতি *</label>
                <textarea
                  required
                  minLength={10}
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#D8D1C1] bg-[#F8F6F0] text-xs font-semibold text-[#0B3B28] hover:bg-[#EFECE3] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  প্রচ্ছদ ছবি আপলোড (ঐচ্ছিক)
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                </label>
                {coverUrl && <span className="text-xs text-[#0D4A32]">প্রচ্ছদ যুক্ত হয়েছে</span>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs text-[#4A5951] hover:bg-[#F3F0E7] rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'জমা হচ্ছে...' : 'বই জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ReportModal
        isOpen={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        targetTitle={reportTarget?.title || ''}
        onSubmit={(reason) =>
          reportTarget
            ? submitReport({
                targetType: 'book',
                targetId: reportTarget.id,
                targetTitle: reportTarget.title,
                reason,
              })
            : Promise.resolve()
        }
      />
    </div>
  );
};
