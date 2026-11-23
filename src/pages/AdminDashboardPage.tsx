import React, { useMemo, useState } from 'react';
import {
  Bell,
  BookOpen,
  Briefcase,
  Check,
  Eye,
  Flag,
  Heart,
  Printer,
  Settings,
  Shield,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { ANNOUNCEMENT_CATEGORIES, STATUS_LABELS_BN } from '../constants/bengali';
import { useAlumni } from '../context/AlumniContext';
import { AdminRecord, AnnouncementCategory, MemberPrivateInfo } from '../types';
import { compressImageFile, formatBengaliDate, toBengaliNumber } from '../utils/formatters';

type AdminTab =
  | 'overview'
  | 'members'
  | 'memories'
  | 'books'
  | 'businesses'
  | 'notices_events'
  | 'reports'
  | 'admins_settings';

export const AdminDashboardPage: React.FC = () => {
  const {
    isAdmin,
    siteSettings,
    allMembers,
    allMemories,
    allBooks,
    allBusinesses,
    allReports,
    allAdmins,
    announcements,
    events,
    fetchMemberPrivateForAdmin,
    adminUpdateMemberStatus,
    adminDeleteMember,
    adminModerateMemory,
    deleteMemory,
    adminModerateBook,
    deleteBook,
    adminModerateBusiness,
    deleteBusiness,
    adminCreateAnnouncement,
    adminDeleteAnnouncement,
    adminCreateEvent,
    adminDeleteEvent,
    adminUpdateReportStatus,
    adminAddModerator,
    adminRemoveModerator,
    adminSaveSiteSettings,
    pushToast,
  } = useAlumni();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [memberSearch, setMemberSearch] = useState('');
  const [inspectPii, setInspectPii] = useState<{ name: string; info: MemberPrivateInfo | null } | null>(
    null
  );

  // Announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<AnnouncementCategory>('ব্যাচের সভা');
  const [annPinned, setAnnPinned] = useState(false);
  const [annUrgent, setAnnUrgent] = useState(false);

  // Event form
  const [evTitle, setEvTitle] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evTime, setEvTime] = useState('');
  const [evLocation, setEvLocation] = useState('');
  const [evDesc, setEvDesc] = useState('');
  const [evIsPast, setEvIsPast] = useState(false);

  // Moderator form
  const [modUid, setModUid] = useState('');
  const [modEmail, setModEmail] = useState('');
  const [modName, setModName] = useState('');
  const [modRole, setModRole] = useState<AdminRecord['role']>('moderator');

  // Site Settings form
  const [sName, setSName] = useState(siteSettings.siteName);
  const [sSub, setSSub] = useState(siteSettings.subtitle);
  const [sLogo, setSLogo] = useState(siteSettings.logoUrl || '');
  const [sHero, setSHero] = useState(siteSettings.heroQuote);
  const [sBatch, setSBatch] = useState(siteSettings.batchInfo);
  const [sMadrasah, setSMadrasah] = useState(siteSettings.madrasahName);
  const [sLocation, setSLocation] = useState(siteSettings.madrasahLocation);
  const [sFooter, setSFooter] = useState(siteSettings.footerMotto);
  const [sDemo, setSDemo] = useState(siteSettings.showDemoData);

  const pendingCounts = useMemo(
    () => ({
      members: allMembers.filter((m) => m.status === 'pending').length,
      memories: allMemories.filter((m) => m.status === 'pending').length,
      books: allBooks.filter((b) => b.status === 'pending').length,
      businesses: allBusinesses.filter((b) => b.status === 'pending').length,
      reports: allReports.filter((r) => r.status === 'open').length,
    }),
    [allMembers, allMemories, allBooks, allBusinesses, allReports]
  );

  const filteredMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return allMembers;
    return allMembers.filter((m) =>
      `${m.fullName} ${m.district} ${m.lastJamaat} ${m.profession || ''}`.toLowerCase().includes(q)
    );
  }, [allMembers, memberSearch]);

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-3">
        <Shield className="w-10 h-10 mx-auto text-[#8B641E]" />
        <h1 className="font-editorial text-2xl font-bold text-[#0B3B28]">প্রবেশাধিকার সংরক্ষিত</h1>
        <p className="text-sm text-[#4A5951]">
          শুধুমাত্র অনুমোদিত প্রশাসক ও মডারেটররাই এই প্যানেলটি ব্যবহার করতে পারবেন।
        </p>
      </div>
    );
  }

  const handleInspectPii = async (uid: string, name: string) => {
    const info = await fetchMemberPrivateForAdmin(uid);
    setInspectPii({ name, info });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await compressImageFile(file, 300, 0.85);
      setSLogo(url);
      pushToast('success', 'লোগো আপলোড হয়েছে। নিচে সংরক্ষণ বাটনে ক্লিক করুন।');
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'লোগো আপলোড ব্যর্থ হয়েছে।');
    }
  };

  const TABS: { id: AdminTab; label: string; badge?: number; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'পরিসংখ্যান', icon: <Shield className="w-4 h-4" /> },
    { id: 'members', label: 'সদস্য ব্যবস্থাপনা', badge: pendingCounts.members, icon: <Users className="w-4 h-4" /> },
    { id: 'memories', label: 'স্মৃতিচারণ', badge: pendingCounts.memories, icon: <Heart className="w-4 h-4" /> },
    { id: 'books', label: 'বই অনুমোদন', badge: pendingCounts.books, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'businesses', label: 'ব্যবসা অনুমোদন', badge: pendingCounts.businesses, icon: <Briefcase className="w-4 h-4" /> },
    { id: 'notices_events', label: 'নোটিশ ও অনুষ্ঠান', icon: <Bell className="w-4 h-4" /> },
    { id: 'reports', label: 'রিপোর্ট', badge: pendingCounts.reports, icon: <Flag className="w-4 h-4" /> },
    { id: 'admins_settings', label: 'প্রশাসক ও সেটিংস', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD2] no-print">
        <div>
          <p className="text-xs font-medium text-[#8B641E] mb-1">প্রশাসনিক নিয়ন্ত্রণ কেন্দ্র</p>
          <h1 className="font-editorial text-3xl font-bold text-[#0B3B28]">অ্যাডমিন ড্যাশবোর্ড</h1>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] self-start cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          সদস্য তালিকা প্রিন্ট / পিডিএফ
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-1.5 no-print">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              tab === t.id
                ? 'bg-[#0D4A32] text-white border-[#0D4A32]'
                : 'bg-white text-[#3A4841] border-[#E4DFD2] hover:border-[#0D4A32]'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.badge && t.badge > 0 ? (
              <span className="ml-1 font-bold text-[#E5C987] tabular-nums">
                ({toBengaliNumber(t.badge)})
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* PRINT-ONLY OFFICIAL MEMBER DIRECTORY TABLE */}
      <div className="hidden print-only space-y-4">
        <div className="border-b-2 border-black pb-3 text-center">
          <h2 className="text-2xl font-bold">{siteSettings.siteName}</h2>
          <p className="text-sm">{siteSettings.madrasahName}, {siteSettings.madrasahLocation} — নিবন্ধিত সদস্য তালিকা</p>
        </div>
        <table className="w-full text-xs border-collapse border border-gray-400">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-400 p-2 text-left">ক্রম</th>
              <th className="border border-gray-400 p-2 text-left">নাম</th>
              <th className="border border-gray-400 p-2 text-left">জেলা</th>
              <th className="border border-gray-400 p-2 text-left">সর্বশেষ জামাত</th>
              <th className="border border-gray-400 p-2 text-left">পেশা</th>
              <th className="border border-gray-400 p-2 text-left">অবস্থা</th>
            </tr>
          </thead>
          <tbody>
            {allMembers.map((m, idx) => (
              <tr key={m.id}>
                <td className="border border-gray-400 p-2">{toBengaliNumber(idx + 1)}</td>
                <td className="border border-gray-400 p-2">{m.fullName}</td>
                <td className="border border-gray-400 p-2">{m.district}</td>
                <td className="border border-gray-400 p-2">{m.lastJamaat}</td>
                <td className="border border-gray-400 p-2">{m.profession || m.professionCategory}</td>
                <td className="border border-gray-400 p-2">{STATUS_LABELS_BN[m.status]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TAB 1: OVERVIEW */}
      {tab === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 no-print">
          <div className="bg-white border border-[#E4DFD2] rounded-xl p-6">
            <p className="text-xs text-[#5E6D65]">মোট নিবন্ধিত সদস্য (বাস্তব)</p>
            <p className="font-editorial text-3xl font-bold text-[#0B3B28] mt-1 tabular-nums">
              {toBengaliNumber(allMembers.length)}
            </p>
            <p className="text-xs text-[#8B641E] mt-1">
              অনুমোদনের অপেক্ষায়: {toBengaliNumber(pendingCounts.members)} জন
            </p>
          </div>
          <div className="bg-white border border-[#E4DFD2] rounded-xl p-6">
            <p className="text-xs text-[#5E6D65]">মোট স্মৃতিচারণ পোস্ট</p>
            <p className="font-editorial text-3xl font-bold text-[#0B3B28] mt-1 tabular-nums">
              {toBengaliNumber(allMemories.length)}
            </p>
            <p className="text-xs text-[#8B641E] mt-1">
              অপেক্ষমাণ: {toBengaliNumber(pendingCounts.memories)} টি
            </p>
          </div>
          <div className="bg-white border border-[#E4DFD2] rounded-xl p-6">
            <p className="text-xs text-[#5E6D65]">বই ও ব্যবসা</p>
            <p className="font-editorial text-3xl font-bold text-[#0B3B28] mt-1 tabular-nums">
              {toBengaliNumber(allBooks.length + allBusinesses.length)}
            </p>
            <p className="text-xs text-[#8B641E] mt-1">
              অপেক্ষমাণ: {toBengaliNumber(pendingCounts.books + pendingCounts.businesses)} টি
            </p>
          </div>
          <div className="bg-white border border-[#E4DFD2] rounded-xl p-6">
            <p className="text-xs text-[#5E6D65]">অমীমাংসিত রিপোর্ট</p>
            <p className="font-editorial text-3xl font-bold text-[#0B3B28] mt-1 tabular-nums">
              {toBengaliNumber(pendingCounts.reports)}
            </p>
            <p className="text-xs text-[#5E6D65] mt-1">
              মোট রিপোর্ট: {toBengaliNumber(allReports.length)} টি
            </p>
          </div>
        </div>
      )}

      {/* TAB 2: MEMBERS MANAGEMENT */}
      {tab === 'members' && (
        <div className="bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-5 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">সদস্য ব্যবস্থাপনা</h2>
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="নাম বা জেলা দিয়ে খুঁজুন..."
              className="px-3.5 py-2 text-xs bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg sm:w-64"
            />
          </div>

          {filteredMembers.length === 0 ? (
            <p className="text-sm text-[#5E6D65]">এখনো কোনো বাস্তব সদস্য নিবন্ধন করেননি।</p>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-lg border border-[#EFECE3] flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-[#0B3B28]">
                      {m.fullName}{' '}
                      <span className="text-xs font-medium text-[#8B641E]">
                        · {STATUS_LABELS_BN[m.status]}
                      </span>
                    </p>
                    <p className="text-xs text-[#4A5951]">
                      {m.district} · {m.lastJamaat} · {m.profession || m.professionCategory} · UID: {m.uid.slice(0, 10)}...
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleInspectPii(m.uid, m.fullName)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-[#D8D1C1] text-[#0B3B28] hover:bg-[#F3F0E7] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> ব্যক্তিগত তথ্য
                    </button>
                    {m.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => adminUpdateMemberStatus(m.id, 'approved')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#0D4A32] text-white hover:bg-[#093624] cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> অনুমোদন
                      </button>
                    )}
                    {m.status !== 'suspended' && (
                      <button
                        type="button"
                        onClick={() => adminUpdateMemberStatus(m.id, 'suspended')}
                        className="px-2.5 py-1.5 rounded-md border border-amber-300 text-amber-800 hover:bg-amber-50 cursor-pointer"
                      >
                        স্থগিত
                      </button>
                    )}
                    {m.status !== 'inactive' && (
                      <button
                        type="button"
                        onClick={() => adminUpdateMemberStatus(m.id, 'inactive')}
                        className="px-2.5 py-1.5 rounded-md border border-[#D8D1C1] text-[#4A5951] hover:bg-[#F3F0E7] cursor-pointer"
                      >
                        নিষ্ক্রিয়
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => adminDeleteMember(m.id)}
                      className="p-1.5 rounded-md text-rose-700 hover:bg-rose-50 cursor-pointer"
                      aria-label="মুছে ফেলুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: MEMORIES MODERATION */}
      {tab === 'memories' && (
        <div className="bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4 no-print">
          <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">স্মৃতিচারণ পোস্ট ব্যবস্থাপনা</h2>
          {allMemories.length === 0 ? (
            <p className="text-sm text-[#5E6D65]">কোনো পোস্ট জমা হয়নি।</p>
          ) : (
            allMemories.map((m) => (
              <div key={m.id} className="p-4 rounded-lg border border-[#EFECE3] flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <p className="text-xs text-[#8B641E]">
                    {m.authorName} · {m.category} · {STATUS_LABELS_BN[m.status]}
                  </p>
                  <p className="font-editorial text-base font-bold text-[#0B3B28]">{m.title}</p>
                  <p className="text-xs text-[#4A5951] mt-1 line-clamp-2">{m.content}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-xs">
                  {m.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => adminModerateMemory(m.id, 'approved')}
                      className="px-3 py-1.5 rounded-md bg-[#0D4A32] text-white cursor-pointer"
                    >
                      অনুমোদন
                    </button>
                  )}
                  {m.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => adminModerateMemory(m.id, 'rejected')}
                      className="px-3 py-1.5 rounded-md border border-amber-300 text-amber-800 cursor-pointer"
                    >
                      বাতিল
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteMemory(m.id)}
                    className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: BOOKS MODERATION */}
      {tab === 'books' && (
        <div className="bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4 no-print">
          <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">বই ব্যবস্থাপনা</h2>
          {allBooks.length === 0 ? (
            <p className="text-sm text-[#5E6D65]">কোনো বই জমা হয়নি।</p>
          ) : (
            allBooks.map((b) => (
              <div key={b.id} className="p-4 rounded-lg border border-[#EFECE3] flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <p className="text-xs text-[#8B641E]">
                    {b.authorName} · {b.category} · {STATUS_LABELS_BN[b.status]}
                  </p>
                  <p className="font-editorial text-base font-bold text-[#0B3B28]">{b.title}</p>
                  <p className="text-xs text-[#4A5951] mt-1 line-clamp-2">{b.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-xs">
                  {b.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => adminModerateBook(b.id, 'approved')}
                      className="px-3 py-1.5 rounded-md bg-[#0D4A32] text-white cursor-pointer"
                    >
                      অনুমোদন
                    </button>
                  )}
                  {b.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => adminModerateBook(b.id, 'rejected')}
                      className="px-3 py-1.5 rounded-md border border-amber-300 text-amber-800 cursor-pointer"
                    >
                      বাতিল
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteBook(b.id)}
                    className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: BUSINESSES MODERATION */}
      {tab === 'businesses' && (
        <div className="bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4 no-print">
          <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">ব্যবসা ও উদ্যোগ ব্যবস্থাপনা</h2>
          {allBusinesses.length === 0 ? (
            <p className="text-sm text-[#5E6D65]">কোনো ব্যবসা জমা হয়নি।</p>
          ) : (
            allBusinesses.map((biz) => (
              <div key={biz.id} className="p-4 rounded-lg border border-[#EFECE3] flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <p className="text-xs text-[#8B641E]">
                    {biz.ownerName} · {biz.category} · {STATUS_LABELS_BN[biz.status]}
                  </p>
                  <p className="font-editorial text-base font-bold text-[#0B3B28]">{biz.name}</p>
                  <p className="text-xs text-[#4A5951] mt-1 line-clamp-2">{biz.description}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 text-xs">
                  {biz.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => adminModerateBusiness(biz.id, 'approved')}
                      className="px-3 py-1.5 rounded-md bg-[#0D4A32] text-white cursor-pointer"
                    >
                      অনুমোদন
                    </button>
                  )}
                  {biz.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => adminModerateBusiness(biz.id, 'rejected')}
                      className="px-3 py-1.5 rounded-md border border-amber-300 text-amber-800 cursor-pointer"
                    >
                      অপসারণ / বাতিল
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deleteBusiness(biz.id)}
                    className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-md cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 6: NOTICES & EVENTS */}
      {tab === 'notices_events' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
          {/* Publish Announcement */}
          <div className="bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4">
            <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">নতুন নোটিশ প্রকাশ করুন</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await adminCreateAnnouncement({
                  title: annTitle,
                  content: annContent,
                  category: annCategory,
                  isPinned: annPinned,
                  isUrgent: annUrgent,
                });
                setAnnTitle('');
                setAnnContent('');
                setAnnPinned(false);
                setAnnUrgent(false);
              }}
              className="space-y-3"
            >
              <input
                type="text"
                required
                minLength={3}
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="নোটিশের শিরোনাম..."
                className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
              />
              <select
                value={annCategory}
                onChange={(e) => setAnnCategory(e.target.value as AnnouncementCategory)}
                className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
              >
                {ANNOUNCEMENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <textarea
                required
                minLength={5}
                rows={4}
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                placeholder="বিস্তারিত ঘোষণা লিখুন..."
                className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
              />
              <div className="flex gap-4 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={annPinned} onChange={(e) => setAnnPinned(e.target.checked)} className="accent-[#0D4A32]" />
                  হোমপেজে পিন করুন
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={annUrgent} onChange={(e) => setAnnUrgent(e.target.checked)} className="accent-[#0D4A32]" />
                  জরুরি বিজ্ঞপ্তি
                </label>
              </div>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] cursor-pointer"
              >
                নোটিশ প্রকাশ করুন
              </button>
            </form>

            <div className="pt-4 border-t border-[#F0ECE1] space-y-2">
              {announcements
                .filter((a) => !a.isDemo)
                .map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#F8F6F0]">
                    <span className="truncate font-medium text-[#0B3B28]">{a.title}</span>
                    <button
                      type="button"
                      onClick={() => adminDeleteAnnouncement(a.id)}
                      className="text-rose-700 hover:underline ml-2 cursor-pointer"
                    >
                      মুছুন
                    </button>
                  </div>
                ))}
            </div>
          </div>

          {/* Create Event */}
          <div className="bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4">
            <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">নতুন অনুষ্ঠান তৈরি করুন</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await adminCreateEvent({
                  title: evTitle,
                  date: evDate,
                  time: evTime,
                  location: evLocation,
                  description: evDesc,
                  isPast: evIsPast,
                });
                setEvTitle('');
                setEvDate('');
                setEvTime('');
                setEvLocation('');
                setEvDesc('');
                setEvIsPast(false);
              }}
              className="space-y-3"
            >
              <input
                type="text"
                required
                minLength={3}
                value={evTitle}
                onChange={(e) => setEvTitle(e.target.value)}
                placeholder="অনুষ্ঠানের নাম..."
                className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  value={evDate}
                  onChange={(e) => setEvDate(e.target.value)}
                  placeholder="তারিখ (যেমন: ২০ জানুয়ারি ২০২৭)"
                  className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                />
                <input
                  type="text"
                  value={evTime}
                  onChange={(e) => setEvTime(e.target.value)}
                  placeholder="সময় (যেমন: সকাল ১০টা)"
                  className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                />
              </div>
              <input
                type="text"
                required
                value={evLocation}
                onChange={(e) => setEvLocation(e.target.value)}
                placeholder="স্থান..."
                className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
              />
              <textarea
                required
                minLength={10}
                rows={3}
                value={evDesc}
                onChange={(e) => setEvDesc(e.target.value)}
                placeholder="অনুষ্ঠানের বিস্তারিত বিবরণ..."
                className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
              />
              <label className="flex items-center gap-2 text-xs cursor-pointer">
                <input type="checkbox" checked={evIsPast} onChange={(e) => setEvIsPast(e.target.checked)} className="accent-[#0D4A32]" />
                পূর্ববর্তী অনুষ্ঠান (আর্কাইভ হিসেবে যোগ করুন)
              </label>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] cursor-pointer"
              >
                অনুষ্ঠান যুক্ত করুন
              </button>
            </form>

            <div className="pt-4 border-t border-[#F0ECE1] space-y-2">
              {events
                .filter((ev) => !ev.isDemo)
                .map((ev) => (
                  <div key={ev.id} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-[#F8F6F0]">
                    <span className="truncate font-medium text-[#0B3B28]">
                      {ev.title} ({toBengaliNumber(ev.rsvpCount)} জন)
                    </span>
                    <button
                      type="button"
                      onClick={() => adminDeleteEvent(ev.id)}
                      className="text-rose-700 hover:underline ml-2 cursor-pointer"
                    >
                      মুছুন
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: REPORTS */}
      {tab === 'reports' && (
        <div className="bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4 no-print">
          <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">অভিযোগ ও রিপোর্ট পর্যালোচনা</h2>
          {allReports.length === 0 ? (
            <p className="text-sm text-[#5E6D65]">কোনো রিপোর্ট জমা নেই।</p>
          ) : (
            allReports.map((r) => (
              <div key={r.id} className="p-4 rounded-lg border border-[#EFECE3] flex flex-col sm:flex-row justify-between gap-4">
                <div>
                  <p className="text-xs text-[#8B641E]">
                    রিপোর্টকারী: {r.reporterName} · {STATUS_LABELS_BN[r.status]} · {formatBengaliDate(r.createdAt)}
                  </p>
                  <p className="text-sm font-bold text-[#0B3B28] mt-0.5">
                    {r.targetTitle || r.targetId} ({r.targetType})
                  </p>
                  <p className="text-xs text-[#4A5951] mt-1">{r.reason}</p>
                </div>
                <div className="flex items-center gap-2 text-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => adminUpdateReportStatus(r.id, 'reviewed')}
                    className="px-3 py-1.5 rounded-md bg-[#0D4A32] text-white cursor-pointer"
                  >
                    পর্যালোচিত
                  </button>
                  <button
                    type="button"
                    onClick={() => adminUpdateReportStatus(r.id, 'dismissed')}
                    className="px-3 py-1.5 rounded-md border border-[#D8D1C1] text-[#4A5951] cursor-pointer"
                  >
                    খারিজ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 8: ADMINS & SITE SETTINGS */}
      {tab === 'admins_settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 no-print">
          {/* Site Settings */}
          <div className="lg:col-span-7 bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4">
            <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">
              ওয়েবসাইটের নাম, লোগো ও সাধারণ সেটিংস
            </h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await adminSaveSiteSettings({
                  siteName: sName,
                  subtitle: sSub,
                  logoUrl: sLogo,
                  heroQuote: sHero,
                  batchInfo: sBatch,
                  madrasahName: sMadrasah,
                  madrasahLocation: sLocation,
                  footerMotto: sFooter,
                  showDemoData: sDemo,
                });
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">ওয়েবসাইটের নাম</label>
                <input
                  type="text"
                  required
                  value={sName}
                  onChange={(e) => setSName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">সাবটাইটেল</label>
                  <input
                    type="text"
                    value={sSub}
                    onChange={(e) => setSSub(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">ব্যাচ পরিচিতি</label>
                  <input
                    type="text"
                    value={sBatch}
                    onChange={(e) => setSBatch(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">হিরো পরিচিতিমূলক বক্তব্য</label>
                <textarea
                  rows={3}
                  value={sHero}
                  onChange={(e) => setSHero(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">ফুটার মূল লক্ষ্য বাণী</label>
                <input
                  type="text"
                  value={sFooter}
                  onChange={(e) => setSFooter(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-[#D8D1C1] bg-[#F8F6F0] text-xs font-semibold text-[#0B3B28] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  কাস্টম লোগো আপলোড
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {sLogo && (
                  <button
                    type="button"
                    onClick={() => setSLogo('')}
                    className="text-xs text-rose-700 hover:underline cursor-pointer"
                  >
                    লোগো মুছুন
                  </button>
                )}
              </div>

              <label className="flex items-center gap-2.5 p-3 rounded-lg bg-[#F8F6F0] border border-[#E4DFD2] text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={sDemo}
                  onChange={(e) => setSDemo(e.target.checked)}
                  className="accent-[#0D4A32]"
                />
                ডেমো / নমুনা কার্ডগুলো প্রদর্শন চালু রাখুন (পর্যাপ্ত বাস্তব সদস্য যুক্ত হলে বন্ধ করা যাবে)
              </label>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] cursor-pointer"
              >
                সেটিংস সংরক্ষণ করুন
              </button>
            </form>
          </div>

          {/* Moderator Assignment */}
          <div className="lg:col-span-5 bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4">
            <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">প্রশাসক ও মডারেটর নিয়োগ</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await adminAddModerator({ uid: modUid, email: modEmail, name: modName, role: modRole });
                setModUid('');
                setModEmail('');
                setModName('');
              }}
              className="space-y-3"
            >
              <input
                type="text"
                required
                value={modUid}
                onChange={(e) => setModUid(e.target.value)}
                placeholder="সদস্যের UID (ড্যাশবোর্ড সেটিংস থেকে)"
                className="w-full px-3 py-2 text-xs bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
              />
              <input
                type="text"
                required
                value={modName}
                onChange={(e) => setModName(e.target.value)}
                placeholder="নাম"
                className="w-full px-3 py-2 text-xs bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
              />
              <input
                type="email"
                required
                value={modEmail}
                onChange={(e) => setModEmail(e.target.value)}
                placeholder="ইমেইল ঠিকানা"
                className="w-full px-3 py-2 text-xs bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
              />
              <select
                value={modRole}
                onChange={(e) => setModRole(e.target.value as AdminRecord['role'])}
                className="w-full px-3 py-2 text-xs bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
              >
                <option value="moderator">মডারেটর</option>
                <option value="admin">প্রশাসক (অ্যাডমিন)</option>
                <option value="super_admin">প্রধান প্রশাসক</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] cursor-pointer"
              >
                নিয়োগ দিন
              </button>
            </form>

            <div className="pt-3 border-t border-[#F0ECE1] space-y-2">
              {allAdmins.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8F6F0] text-xs">
                  <div>
                    <p className="font-semibold text-[#0B3B28]">{a.name}</p>
                    <p className="text-[#5E6D65]">{a.email} · {a.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => adminRemoveModerator(a.id)}
                    className="text-rose-700 hover:underline cursor-pointer"
                  >
                    অপসারণ
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inspect Private PII Modal (Admin Only) */}
      {inspectPii && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 no-print">
          <div className="bg-white border border-[#E4DFD2] rounded-xl max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={() => setInspectPii(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-[#4A5951] hover:bg-[#F3F0E7] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-editorial text-lg font-bold text-[#0B3B28] mb-3">
              ব্যক্তিগত তথ্য যাচাই: {inspectPii.name}
            </h3>
            {inspectPii.info ? (
              <dl className="space-y-2 text-xs">
                <p><strong>পিতার নাম:</strong> {inspectPii.info.fatherName}</p>
                {inspectPii.info.motherName && <p><strong>মাতার নাম:</strong> {inspectPii.info.motherName}</p>}
                <p><strong>মোবাইল:</strong> {inspectPii.info.phone} {inspectPii.info.altPhone ? `/ ${inspectPii.info.altPhone}` : ''}</p>
                {inspectPii.info.email && <p><strong>ইমেইল:</strong> {inspectPii.info.email}</p>}
                {inspectPii.info.presentAddress && <p><strong>বর্তমান ঠিকানা:</strong> {inspectPii.info.presentAddress}</p>}
                {inspectPii.info.permanentAddress && <p><strong>স্থায়ী ঠিকানা:</strong> {inspectPii.info.permanentAddress}</p>}
                {inspectPii.info.maritalStatus && <p><strong>বৈবাহিক অবস্থা:</strong> {inspectPii.info.maritalStatus}</p>}
              </dl>
            ) : (
              <p className="text-xs text-[#5E6D65]">ব্যক্তিগত তথ্যের নথি খুঁজে পাওয়া যায়নি।</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
