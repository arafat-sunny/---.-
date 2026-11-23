import React, { useEffect, useMemo, useState } from 'react';
import {
  Bookmark,
  Flag,
  Heart,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Search,
  Send,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { CAMPUS_PHOTOS, MEMORY_CATEGORIES } from '../constants/bengali';
import { useAlumni } from '../context/AlumniContext';
import { OperationType, db, handleFirestoreError } from '../firebase';
import { MemoryCategory, MemoryComment, MemoryPost } from '../types';
import { compressImageFile, formatBengaliDate, toBengaliNumber } from '../utils/formatters';
import { Avatar, ReportModal, SafeImage } from '../components/CommonUI';

const MemoryCard: React.FC<{
  memory: MemoryPost;
  onOpenLightbox: (imgUrl: string, caption: string) => void;
  onReport: (memory: MemoryPost) => void;
}> = ({ memory, onOpenLightbox, onReport }) => {
  const {
    user,
    isApprovedMember,
    isAdmin,
    bookmarks,
    toggleMemoryReaction,
    addMemoryComment,
    toggleBookmark,
    deleteMemory,
  } = useAlumni();

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<MemoryComment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [hasReacted, setHasReacted] = useState(false);

  const isBookmarked = bookmarks.some(
    (b) => b.targetType === 'memory' && b.targetId === memory.id
  );

  // Listen to reactions & comments for real Firestore memories
  useEffect(() => {
    if (memory.isDemo) return;
    const unsubReact = onSnapshot(
      query(collection(db, 'memories', memory.id, 'reactions'), where('memoryId', '==', memory.id)),
      (snap) => {
        if (user) {
          setHasReacted(snap.docs.some((d) => d.id === user.uid));
        } else {
          setHasReacted(false);
        }
      },
      () => setHasReacted(false)
    );
    return () => unsubReact();
  }, [memory.id, memory.isDemo, user]);

  useEffect(() => {
    if (memory.isDemo || !showComments) return;
    const unsubComments = onSnapshot(
      query(collection(db, 'memories', memory.id, 'comments'), where('memoryId', '==', memory.id)),
      (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<MemoryComment, 'id'>),
        }));
        setComments(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `memories/${memory.id}/comments`)
    );
    return () => unsubComments();
  }, [memory.id, memory.isDemo, showComments]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    await addMemoryComment(memory, commentText.trim());
    setCommentText('');
  };

  return (
    <article className="bg-white border border-[#E4DFD2] rounded-xl overflow-hidden">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={memory.authorName} src={memory.authorPhoto} size="sm" />
            <div>
              <p className="text-sm font-semibold text-[#0B3B28]">{memory.authorName}</p>
              <p className="text-xs text-[#5E6D65]">
                {memory.category} · {formatBengaliDate(memory.createdAt)}
                {memory.isDemo ? ' · নমুনা স্মৃতিচারণ' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {user && (
              <button
                type="button"
                onClick={() => toggleBookmark('memory', memory.id, memory.title)}
                aria-label="বুকমার্ক করুন"
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isBookmarked ? 'text-[#8B641E] bg-[#F8F3E6]' : 'text-[#5E6D65] hover:bg-[#F3F0E7]'
                }`}
              >
                <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
              </button>
            )}
            {!memory.isDemo && user && (
              <button
                type="button"
                onClick={() => onReport(memory)}
                aria-label="রিপোর্ট করুন"
                className="p-2 rounded-lg text-[#5E6D65] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Flag className="w-4 h-4" />
              </button>
            )}
            {!memory.isDemo && user && (isAdmin || user.uid === memory.authorId) && (
              <button
                type="button"
                onClick={() => deleteMemory(memory.id)}
                aria-label="মুছে ফেলুন"
                className="p-2 rounded-lg text-[#5E6D65] hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div>
          <h2 className="font-editorial text-xl font-bold text-[#0B3B28] leading-snug mb-2">
            {memory.title}
          </h2>
          <p className="text-sm text-[#3A4841] leading-relaxed whitespace-pre-line">
            {memory.content}
          </p>
        </div>

        {memory.imageUrls.length > 0 && (
          <div
            className={`grid gap-2.5 ${
              memory.imageUrls.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            }`}
          >
            {memory.imageUrls.map((url, idx) => (
              <button
                key={`${memory.id}-img-${idx}`}
                type="button"
                onClick={() => onOpenLightbox(url, memory.title)}
                className="overflow-hidden rounded-lg border border-[#E4DFD2] bg-[#EFECE3] cursor-pointer text-left"
              >
                <SafeImage
                  src={url}
                  alt={`${memory.title} ছবি ${idx + 1}`}
                  className="w-full max-h-[380px] object-cover hover:scale-[1.02] transition-transform duration-300"
                />
              </button>
            ))}
          </div>
        )}

        <div className="pt-4 border-t border-[#F0ECE1] flex items-center gap-6 text-xs">
          <button
            type="button"
            onClick={() => toggleMemoryReaction(memory, hasReacted)}
            className={`inline-flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
              hasReacted ? 'text-rose-700' : 'text-[#4A5951] hover:text-[#0B3B28]'
            }`}
          >
            <Heart className="w-4 h-4" fill={hasReacted ? 'currentColor' : 'none'} />
            <span className="tabular-nums">{toBengaliNumber(memory.likesCount)} প্রতিক্রিয়া</span>
          </button>

          <button
            type="button"
            onClick={() => setShowComments((v) => !v)}
            className="inline-flex items-center gap-1.5 font-medium text-[#4A5951] hover:text-[#0B3B28] transition-colors cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span className="tabular-nums">{toBengaliNumber(memory.commentsCount)} মন্তব্য</span>
          </button>
        </div>

        {showComments && (
          <div className="pt-4 border-t border-[#F0ECE1] space-y-3">
            {memory.isDemo ? (
              <p className="text-xs text-[#5E6D65]">
                এটি একটি নমুনা স্মৃতিচারণ। অনুমোদিত সদস্যদের বাস্তব পোস্টে মন্তব্য ও আলোচনা সরাসরি সংরক্ষিত হয়।
              </p>
            ) : (
              <>
                {comments.length === 0 ? (
                  <p className="text-xs text-[#5E6D65]">এখনো কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনি করুন।</p>
                ) : (
                  <div className="space-y-2.5">
                    {comments.map((c) => (
                      <div key={c.id} className="bg-[#F8F6F0] rounded-lg px-3.5 py-2.5">
                        <p className="text-xs font-semibold text-[#0B3B28]">
                          {c.authorName}{' '}
                          <span className="font-normal text-[#6B7A72]">
                            · {formatBengaliDate(c.createdAt)}
                          </span>
                        </p>
                        <p className="text-xs text-[#3A4841] mt-1">{c.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {isApprovedMember && (
                  <form onSubmit={handleCommentSubmit} className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="আপনার অনুভূতি বা মন্তব্য লিখুন..."
                      className="flex-1 text-xs bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg px-3 py-2 focus:border-[#0D4A32] focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg bg-[#0D4A32] text-white text-xs font-medium hover:bg-[#093624] cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      পাঠান
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export const MemoriesPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { memories, user, isApprovedMember, createMemory, submitReport, pushToast } = useAlumni();

  const [tab, setTab] = useState<'feed' | 'gallery'>('feed');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);

  // Composer form
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('স্মৃতিচারণ');
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Lightbox & Report
  const [lightbox, setLightbox] = useState<{ url: string; caption: string } | null>(null);
  const [reportTarget, setReportTarget] = useState<MemoryPost | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return memories.filter((m) => {
      if (categoryFilter && m.category !== categoryFilter) return false;
      if (q) {
        const hay = `${m.title} ${m.content} ${m.authorName} ${m.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [memories, search, categoryFilter]);

  const galleryItems = useMemo(() => {
    const base = [
      { url: CAMPUS_PHOTOS.sunset, caption: 'আসরের পর মিরপুর-১৪ মাঠ ও জামেউল উলুম মিনার' },
      { url: CAMPUS_PHOTOS.courtyard, caption: 'জামেউল উলুম মাদরাসার পরিচিত সবুজ-নীল প্রাঙ্গণ ও বারান্দা' },
      { url: CAMPUS_PHOTOS.aerial, caption: 'উপর থেকে দেখা জামেউল উলুম মাদরাসা ক্যাম্পাস, মিরপুর-১৪' },
    ];
    const fromMemories = memories.flatMap((m) =>
      m.imageUrls.map((url) => ({ url, caption: `${m.title} — ${m.authorName}` }))
    );
    const seen = new Set<string>();
    return [...base, ...fromMemories].filter((item) => {
      if (seen.has(item.url)) return false;
      seen.add(item.url);
      return true;
    });
  }, [memories]);

  const handleUploadPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 4 - imageUrls.length);
    for (const file of files) {
      try {
        const dataUrl = await compressImageFile(file, 900, 0.76);
        setImageUrls((prev) => [...prev.slice(0, 3), dataUrl]);
      } catch (err) {
        pushToast('error', err instanceof Error ? err.message : 'ছবি আপলোড ব্যর্থ হয়েছে।');
      }
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 3 || content.trim().length < 10) {
      pushToast('error', 'অনুগ্রহ করে শিরোনাম ও বিস্তারিত স্মৃতিচারণ লিখুন।');
      return;
    }
    setSaving(true);
    try {
      await createMemory({ title, content, category, imageUrls });
      setTitle('');
      setContent('');
      setImageUrls([]);
      setComposerOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD2]">
        <div>
          <p className="text-xs font-medium text-[#8B641E] mb-1">মাদরাসা জীবনের স্মৃতি আর্কাইভ</p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0B3B28]">স্মৃতির পাতা</h1>
          <p className="text-sm text-[#4A5951] mt-1">
            উস্তাদদের সান্নিধ্য, সহপাঠীদের গল্প, পুরোনো ছবি ও জামেউল উলুমের অবিস্মরণীয় মুহূর্তসমূহ।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#EFECE3] rounded-lg">
            <button
              type="button"
              onClick={() => setTab('feed')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                tab === 'feed' ? 'bg-white text-[#0B3B28] shadow-sm' : 'text-[#4A5951]'
              }`}
            >
              স্মৃতিচারণ ({toBengaliNumber(filtered.length)})
            </button>
            <button
              type="button"
              onClick={() => setTab('gallery')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md cursor-pointer ${
                tab === 'gallery' ? 'bg-white text-[#0B3B28] shadow-sm' : 'text-[#4A5951]'
              }`}
            >
              ছবি গ্যালারি ({toBengaliNumber(galleryItems.length)})
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!user) {
                onOpenAuth();
              } else if (!isApprovedMember) {
                pushToast('info', 'স্মৃতিচারণ পোস্ট করতে আপনার সদস্যপদ অনুমোদিত হতে হবে।');
              } else {
                setComposerOpen(true);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            নতুন স্মৃতি শেয়ার করুন
          </button>
        </div>
      </div>

      {/* Composer Modal */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E4DFD2] rounded-xl max-w-xl w-full p-6 relative my-8">
            <button
              type="button"
              onClick={() => setComposerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-[#4A5951] hover:bg-[#F3F0E7] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-editorial text-xl font-bold text-[#0B3B28] mb-4">
              মাদরাসার স্মৃতি শেয়ার করুন
            </h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">শিরোনাম *</label>
                  <input
                    type="text"
                    required
                    minLength={3}
                    maxLength={200}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="স্মৃতির একটি সুন্দর শিরোনাম..."
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">বিভাগ</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MemoryCategory)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  >
                    {MEMORY_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">বিস্তারিত লেখা *</label>
                <textarea
                  required
                  minLength={10}
                  maxLength={6000}
                  rows={5}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="মাদরাসার দিনগুলোর সেই মধুর স্মৃতি বিস্তারিত লিখুন..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#D8D1C1] bg-[#F8F6F0] text-xs font-semibold text-[#0B3B28] hover:bg-[#EFECE3] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  ছবি যুক্ত করুন (সর্বোচ্চ ৪টি)
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={imageUrls.length >= 4}
                    onChange={handleUploadPhotos}
                    className="hidden"
                  />
                </label>

                {imageUrls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-1">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-[#E4DFD2]">
                        <img src={url} alt="প্রিভিউ" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setImageUrls((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setComposerOpen(false)}
                  className="px-4 py-2 text-xs text-[#4A5951] hover:bg-[#F3F0E7] rounded-lg cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] disabled:opacity-50 cursor-pointer"
                >
                  {saving ? 'জমা হচ্ছে...' : 'পোস্ট জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab === 'feed' ? (
        <>
          {/* Search & Category Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#5E6D65] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="পুরোনো স্মৃতি, শিরোনাম বা লেখকের নাম খুঁজুন..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm bg-white border border-[#D8D1C1] rounded-lg px-3.5 py-2.5 focus:border-[#0D4A32] focus:outline-none"
            >
              <option value="">সকল বিভাগ</option>
              {MEMORY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-6">
            {filtered.map((mem) => (
              <MemoryCard
                key={mem.id}
                memory={mem}
                onOpenLightbox={(url, caption) => setLightbox({ url, caption })}
                onReport={(m) => setReportTarget(m)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {galleryItems.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setLightbox(item)}
              className="group bg-white border border-[#E4DFD2] rounded-xl overflow-hidden text-left hover:border-[#0D4A32]/50 transition-colors cursor-pointer"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#EFECE3]">
                <SafeImage
                  src={item.url}
                  alt={item.caption}
                  className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                />
              </div>
              <p className="p-4 text-xs text-[#3A4841] line-clamp-2 flex items-start gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-[#8B641E] shrink-0 mt-0.5" />
                <span>{item.caption}</span>
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="max-w-4xl w-full bg-[#0B1C14] rounded-xl overflow-hidden border border-white/15 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              aria-label="বন্ধ করুন"
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightbox.url}
              alt={lightbox.caption}
              className="w-full max-h-[75vh] object-contain bg-black"
            />
            <p className="p-4 text-sm text-[#E2ECE7]">{lightbox.caption}</p>
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
                targetType: 'memory',
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
