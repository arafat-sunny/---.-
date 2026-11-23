import React, { useMemo, useState } from 'react';
import {
  Bookmark,
  ExternalLink,
  Flag,
  MapPin,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { BUSINESS_CATEGORIES } from '../constants/bengali';
import { useAlumni } from '../context/AlumniContext';
import { BusinessCategory, BusinessItem } from '../types';
import { compressImageFile, safeExternalUrl, toBengaliNumber } from '../utils/formatters';
import { ReportModal, SafeImage } from '../components/CommonUI';

export const BusinessesPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const {
    businesses,
    user,
    isApprovedMember,
    isAdmin,
    bookmarks,
    createBusiness,
    deleteBusiness,
    toggleBookmark,
    submitReport,
    pushToast,
  } = useAlumni();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState<BusinessItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<BusinessCategory>('অনলাইন শপ');
  const [description, setDescription] = useState('');
  const [productsServices, setProductsServices] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [facebookPage, setFacebookPage] = useState('');
  const [website, setWebsite] = useState('');
  const [orderLink, setOrderLink] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [shariahCompliantDeclared, setShariahCompliantDeclared] = useState(false);
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return businesses.filter((b) => {
      if (categoryFilter && b.category !== categoryFilter) return false;
      if (q) {
        const hay = `${b.name} ${b.ownerName} ${b.description} ${b.productsServices || ''} ${b.address || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [businesses, search, categoryFilter]);

  const handleImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (v: string) => void,
    maxW: number
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await compressImageFile(file, maxW, 0.78);
      setter(url);
      pushToast('success', 'ছবি সফলভাবে যুক্ত হয়েছে।');
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'ছবি আপলোড ব্যর্থ হয়েছে।');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shariahCompliantDeclared) {
      pushToast('error', 'ব্যবসাটি সম্পূর্ণ হালাল ও শরিয়াহসম্মত হওয়ার প্রত্যয়ন আবশ্যক।');
      return;
    }
    setSaving(true);
    try {
      await createBusiness({
        name,
        category,
        description,
        productsServices,
        address,
        phone,
        facebookPage,
        website,
        orderLink,
        logoUrl,
        bannerUrl,
        shariahCompliantDeclared: true,
      });
      setName('');
      setDescription('');
      setProductsServices('');
      setAddress('');
      setPhone('');
      setFacebookPage('');
      setWebsite('');
      setOrderLink('');
      setLogoUrl('');
      setBannerUrl('');
      setShariahCompliantDeclared(false);
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD2]">
        <div>
          <p className="text-xs font-medium text-[#8B641E] mb-1">হালাল ব্যবসা ও পারস্পরিক সহযোগিতা</p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0B3B28]">ব্যবসা ও উদ্যোগ</h1>
          <p className="text-sm text-[#4A5951] mt-1">
            আমাদের ব্যাচের উদ্যোক্তা ভাইদের হালাল ব্যবসা ও সেবাসমূহের পরিচিতি।
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (!user) onOpenAuth();
            else if (!isApprovedMember) pushToast('info', 'ব্যবসা যুক্ত করতে অনুমোদিত সদস্য হতে হবে।');
            else setModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] transition-colors self-start cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          আপনার ব্যবসা যুক্ত করুন
        </button>
      </div>

      {/* Shariah Policy Notice */}
      <div className="bg-white border border-[#DFD5BE] rounded-xl p-4 flex items-center gap-3 text-xs text-[#3A4841]">
        <ShieldCheck className="w-5 h-5 text-[#0D4A32] shrink-0" />
        <p>
          এই বিভাগে শুধুমাত্র হালাল, বৈধ ও শরিয়াহসম্মত ব্যবসা ও উদ্যোগের প্রচার অনুমোদিত। কোনো অননুমোদিত, প্রতারণামূলক বা শরিয়াহবিরোধী বিজ্ঞাপন দেখলে অনুগ্রহ করে রিপোর্ট করুন।
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#5E6D65] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ব্যবসার নাম, পণ্য বা এলাকা খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer ${
              categoryFilter === ''
                ? 'bg-[#0D4A32] text-white border-[#0D4A32]'
                : 'bg-white text-[#4A5951] border-[#E4DFD2]'
            }`}
          >
            সব ({toBengaliNumber(businesses.length)})
          </button>
          {BUSINESS_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#0D4A32] text-white border-[#0D4A32]'
                  : 'bg-white text-[#4A5951] border-[#E4DFD2]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Business Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((biz) => {
          const isBookmarked = bookmarks.some(
            (b) => b.targetType === 'business' && b.targetId === biz.id
          );
          const safeFb = safeExternalUrl(biz.facebookPage);
          const safeWeb = safeExternalUrl(biz.website);
          const safeOrder = safeExternalUrl(biz.orderLink);

          return (
            <article
              key={biz.id}
              className="bg-white border border-[#E4DFD2] rounded-xl overflow-hidden flex flex-col justify-between"
            >
              <div>
                {biz.bannerUrl ? (
                  <div className="aspect-[16/8] bg-[#EFECE3] overflow-hidden border-b border-[#F0ECE1]">
                    <SafeImage src={biz.bannerUrl} alt={biz.name} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="h-2 bg-[#0D4A32]" />
                )}

                <div className="p-6 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {biz.logoUrl && (
                        <img
                          src={biz.logoUrl}
                          alt={biz.name}
                          className="w-11 h-11 rounded-lg object-cover border border-[#E4DFD2] shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-xs text-[#8B641E]">
                          {biz.category}
                          {biz.isDemo ? ' · নমুনা উদ্যোগ' : ''}
                        </p>
                        <h2 className="font-editorial text-lg font-bold text-[#0B3B28] truncate">
                          {biz.name}
                        </h2>
                        <p className="text-xs text-[#5E6D65] truncate">পরিচালনায়: {biz.ownerName}</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-[#4A5951] leading-relaxed">{biz.description}</p>

                  {biz.productsServices && (
                    <div className="pt-2 border-t border-[#F0ECE1]">
                      <p className="text-xs font-semibold text-[#0B3B28] mb-0.5">পণ্য ও সেবাসমূহ</p>
                      <p className="text-xs text-[#4A5951]">{biz.productsServices}</p>
                    </div>
                  )}

                  <div className="space-y-1 text-xs text-[#5E6D65] pt-1">
                    {biz.address && (
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#8B641E] shrink-0" />
                        <span>{biz.address}</span>
                      </p>
                    )}
                    {biz.phone && (
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#8B641E] shrink-0" />
                        <span>{biz.phone}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-[#FCFBF8] border-t border-[#F0ECE1] flex items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-3 font-semibold text-[#0D4A32]">
                  {safeOrder && (
                    <a href={safeOrder} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[#8B641E]">
                      অর্ডার লিংক <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {safeWeb && (
                    <a href={safeWeb} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[#8B641E]">
                      ওয়েবসাইট <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {safeFb && (
                    <a href={safeFb} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[#8B641E]">
                      ফেসবুক পেজ <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {!safeOrder && !safeWeb && !safeFb && (
                    <span className="font-normal text-[#5E6D65]">সরাসরি যোগাযোগ করুন</span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {user && (
                    <button
                      type="button"
                      onClick={() => toggleBookmark('business', biz.id, biz.name)}
                      className={`p-1.5 rounded-lg cursor-pointer ${
                        isBookmarked ? 'text-[#8B641E] bg-[#F8F3E6]' : 'text-[#5E6D65] hover:bg-[#F3F0E7]'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>
                  )}
                  {!biz.isDemo && user && (
                    <button
                      type="button"
                      onClick={() => setReportTarget(biz)}
                      className="p-1.5 rounded-lg text-[#5E6D65] hover:text-rose-700 cursor-pointer"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  )}
                  {!biz.isDemo && user && (isAdmin || user.uid === biz.ownerId) && (
                    <button
                      type="button"
                      onClick={() => deleteBusiness(biz.id)}
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

      {/* Add Business Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#E4DFD2] rounded-xl max-w-2xl w-full p-6 relative my-8">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-[#4A5951] hover:bg-[#F3F0E7] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="font-editorial text-xl font-bold text-[#0B3B28] mb-4">
              আপনার ব্যবসা ও উদ্যোগ যুক্ত করুন
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">ব্যবসার নাম *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">ব্যবসার ধরন *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BusinessCategory)}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  >
                    {BUSINESS_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">যোগাযোগ নম্বর</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">ব্যবসার ঠিকানা</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">ফেসবুক পেজ লিংক</label>
                  <input
                    type="text"
                    value={facebookPage}
                    onChange={(e) => setFacebookPage(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">ওয়েবসাইট বা অর্ডার লিংক</label>
                  <input
                    type="text"
                    value={orderLink}
                    onChange={(e) => setOrderLink(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">পণ্য বা সেবার বিবরণ</label>
                <input
                  type="text"
                  value={productsServices}
                  onChange={(e) => setProductsServices(e.target.value)}
                  placeholder="যেমন: খাঁটি মধু, পাঞ্জাবি, ওয়েবসাইট ডিজাইন..."
                  className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">বিস্তারিত পরিচিতি *</label>
                <textarea
                  required
                  minLength={10}
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#D8D1C1] bg-[#F8F6F0] text-xs font-semibold text-[#0B3B28] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  লোগো আপলোড {logoUrl ? '✓' : ''}
                  <input type="file" accept="image/*" onChange={(e) => handleImage(e, setLogoUrl, 360)} className="hidden" />
                </label>
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#D8D1C1] bg-[#F8F6F0] text-xs font-semibold text-[#0B3B28] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  ব্যানার ছবি আপলোড {bannerUrl ? '✓' : ''}
                  <input type="file" accept="image/*" onChange={(e) => handleImage(e, setBannerUrl, 960)} className="hidden" />
                </label>
              </div>

              <label className="flex items-start gap-2.5 p-3.5 rounded-lg bg-[#F8F6F0] border border-[#DFD5BE] text-xs text-[#17211C] cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={shariahCompliantDeclared}
                  onChange={(e) => setShariahCompliantDeclared(e.target.checked)}
                  className="mt-0.5 accent-[#0D4A32]"
                />
                <span>
                  আমি ঘোষণা করছি যে এই ব্যবসা বা উদ্যোগটি সম্পূর্ণ হালাল, প্রতারণামুক্ত ও ইসলামি শরিয়াহসম্মত।
                </span>
              </label>

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
                  {saving ? 'জমা হচ্ছে...' : 'ব্যবসা জমা দিন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ReportModal
        isOpen={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        targetTitle={reportTarget?.name || ''}
        onSubmit={(reason) =>
          reportTarget
            ? submitReport({
                targetType: 'business',
                targetId: reportTarget.id,
                targetTitle: reportTarget.name,
                reason,
              })
            : Promise.resolve()
        }
      />
    </div>
  );
};
