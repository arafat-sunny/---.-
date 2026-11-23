import React, { useEffect, useState } from 'react';
import {
  Bell,
  BookOpen,
  Bookmark,
  Briefcase,
  Edit3,
  Heart,
  LogOut,
  Settings,
  Share2,
  Shield,
  Trash2,
  User,
} from 'lucide-react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { STATUS_LABELS_BN } from '../constants/bengali';
import { useAlumni } from '../context/AlumniContext';
import { db } from '../firebase';
import { ActiveRoute, BookItem, BusinessItem, Member, MemoryPost } from '../types';
import { formatBengaliDate, toBengaliNumber } from '../utils/formatters';
import { Avatar, QrShareModal } from '../components/CommonUI';

interface MemberDashboardPageProps {
  onNavigate: (route: ActiveRoute) => void;
  onSelectMember: (member: Member) => void;
}

type DashTab = 'overview' | 'memories' | 'books' | 'businesses' | 'bookmarks' | 'notifications' | 'settings';

export const MemberDashboardPage: React.FC<MemberDashboardPageProps> = ({
  onNavigate,
  onSelectMember,
}) => {
  const {
    user,
    myMember,
    myPrivateInfo,
    isAdmin,
    bookmarks,
    notifications,
    logout,
    deleteMemory,
    deleteBook,
    deleteBusiness,
    toggleBookmark,
    markNotificationRead,
  } = useAlumni();

  const [tab, setTab] = useState<DashTab>('overview');
  const [myMemories, setMyMemories] = useState<MemoryPost[]>([]);
  const [myBooks, setMyBooks] = useState<BookItem[]>([]);
  const [myBusinesses, setMyBusinesses] = useState<BusinessItem[]>([]);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const u1 = onSnapshot(
      query(collection(db, 'memories'), where('authorId', '==', user.uid)),
      (snap) => setMyMemories(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MemoryPost, 'id'>) }))),
      () => setMyMemories([])
    );
    const u2 = onSnapshot(
      query(collection(db, 'books'), where('authorId', '==', user.uid)),
      (snap) => setMyBooks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BookItem, 'id'>) }))),
      () => setMyBooks([])
    );
    const u3 = onSnapshot(
      query(collection(db, 'businesses'), where('ownerId', '==', user.uid)),
      (snap) => setMyBusinesses(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BusinessItem, 'id'>) }))),
      () => setMyBusinesses([])
    );
    return () => {
      u1();
      u2();
      u3();
    };
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-sm text-[#4A5951]">ড্যাশবোর্ড দেখতে অনুগ্রহ করে লগইন করুন।</p>
      </div>
    );
  }

  const unreadNotifs = notifications.filter((n) => !n.isRead).length;
  const shareUrl = `${window.location.origin}/?profile=${encodeURIComponent(user.uid)}`;

  const NAV: { id: DashTab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'আমার প্রোফাইল', icon: <User className="w-4 h-4" /> },
    { id: 'memories', label: 'আমার স্মৃতিচারণ', icon: <Heart className="w-4 h-4" />, count: myMemories.length },
    { id: 'books', label: 'আমার প্রকাশিত বই', icon: <BookOpen className="w-4 h-4" />, count: myBooks.length },
    { id: 'businesses', label: 'আমার ব্যবসা', icon: <Briefcase className="w-4 h-4" />, count: myBusinesses.length },
    { id: 'bookmarks', label: 'বুকমার্ক', icon: <Bookmark className="w-4 h-4" />, count: bookmarks.length },
    { id: 'notifications', label: 'আমার বিজ্ঞপ্তি', icon: <Bell className="w-4 h-4" />, count: unreadNotifs },
    { id: 'settings', label: 'অ্যাকাউন্ট সেটিংস', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-white border border-[#E4DFD2] rounded-xl p-5">
            <div className="flex items-center gap-3 pb-4 border-b border-[#F0ECE1]">
              <Avatar
                name={myMember?.fullName || user.displayName || 'সদস্য'}
                src={myMember?.photoUrl || user.photoURL || undefined}
                size="md"
              />
              <div className="min-w-0">
                <p className="font-editorial text-base font-bold text-[#0B3B28] truncate">
                  {myMember?.fullName || user.displayName || 'নতুন সদস্য'}
                </p>
                <p className="text-xs text-[#8B641E]">
                  {myMember ? STATUS_LABELS_BN[myMember.status] || myMember.status : 'প্রোফাইল অসম্পূর্ণ'}
                </p>
              </div>
            </div>

            <nav className="mt-3 space-y-1">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    tab === item.id
                      ? 'bg-[#0D4A32] text-white'
                      : 'text-[#3A4841] hover:bg-[#F3F0E7]'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    {item.label}
                  </span>
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="tabular-nums opacity-80">{toBengaliNumber(item.count)}</span>
                  )}
                </button>
              ))}

              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-[#0D4A32] hover:bg-[#F3F0E7] transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                {myMember ? 'প্রোফাইল সম্পাদনা' : 'নিবন্ধন সম্পন্ন করুন'}
              </button>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onNavigate('admin')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-[#8B641E] bg-[#F8F3E6] hover:bg-[#EFE6CE] transition-colors mt-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  প্রশাসনিক ড্যাশবোর্ড (অ্যাডমিন)
                </button>
              )}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <section className="lg:col-span-9 space-y-6">
          {tab === 'overview' && (
            <div className="bg-white border border-[#E4DFD2] rounded-xl p-6 sm:p-8 space-y-6">
              {!myMember ? (
                <div className="text-center py-8 space-y-4">
                  <h2 className="font-editorial text-2xl font-bold text-[#0B3B28]">
                    স্বাগতম! আপনার ফারেগিন প্রোফাইল এখনো তৈরি হয়নি
                  </h2>
                  <p className="text-sm text-[#4A5951] max-w-md mx-auto">
                    ৫টি সহজ ধাপে আপনার ব্যক্তিগত পরিচয় ও জামেউল উলুমে অধ্যয়নের তথ্য যুক্ত করে নিবন্ধন সম্পন্ন করুন।
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('register')}
                    className="px-6 py-3 rounded-lg bg-[#0D4A32] text-white text-sm font-semibold hover:bg-[#093624] cursor-pointer"
                  >
                    নিবন্ধন ফর্ম পূরণ করুন
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F0ECE1]">
                    <div>
                      <p className="text-xs text-[#8B641E] font-medium">
                        সদস্য অবস্থান: {STATUS_LABELS_BN[myMember.status]}
                      </p>
                      <h1 className="font-editorial text-2xl font-bold text-[#0B3B28] mt-0.5">
                        {myMember.fullName}
                      </h1>
                      <p className="text-xs text-[#5E6D65] mt-1">
                        {myMember.district} · {myMember.lastJamaat} · {myMember.profession || myMember.professionCategory}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectMember(myMember)}
                        className="px-4 py-2 rounded-lg border border-[#D8D1C1] text-xs font-semibold text-[#0B3B28] hover:bg-[#F3F0E7] cursor-pointer"
                      >
                        পাবলিক প্রোফাইল দেখুন
                      </button>
                      <button
                        type="button"
                        onClick={() => setShareOpen(true)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        প্রোফাইল শেয়ার
                      </button>
                    </div>
                  </div>

                  {myMember.status === 'pending' && (
                    <div className="p-4 rounded-lg bg-[#F8F3E6] border border-[#E5D3A6] text-xs text-[#6B4E16]">
                      আপনার নিবন্ধনটি বর্তমানে প্রশাসকের পর্যালোচনায় রয়েছে। অনুমোদনের সাথে সাথেই আপনার প্রোফাইল ডিরেক্টরিতে প্রকাশিত হবে এবং আপনি সকল সুবিধা ব্যবহার করতে পারবেন।
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-4 rounded-lg bg-[#F8F6F0] border border-[#EFECE3]">
                      <p className="text-xs text-[#5E6D65]">অধ্যয়নকৃত জামাতসমূহ</p>
                      <p className="font-medium text-[#0B3B28] mt-1">{myMember.jamaats.join(' · ')}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-[#F8F6F0] border border-[#EFECE3]">
                      <p className="text-xs text-[#5E6D65]">ব্যক্তিগত যোগাযোগ (গোপনীয়)</p>
                      <p className="font-medium text-[#0B3B28] mt-1">
                        {myPrivateInfo?.phone || 'যুক্ত করা হয়নি'}
                      </p>
                      <p className="text-xs text-[#5E6D65] mt-0.5">
                        দৃশ্যমানতা: ফোন ({myMember.showPhoneToMembers ? 'সদস্যদের জন্য খোলা' : 'গোপন'}), ঠিকানা (
                        {myMember.showAddressToMembers ? 'খোলা' : 'গোপন'}), পরিবার (
                        {myMember.showFamilyToMembers ? 'খোলা' : 'গোপন'})
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === 'memories' && (
            <div className="bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
                <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">আমার স্মৃতিচারণসমূহ</h2>
                <button
                  type="button"
                  onClick={() => onNavigate('memories')}
                  className="text-xs font-semibold text-[#0D4A32] hover:underline cursor-pointer"
                >
                  নতুন স্মৃতিচারণ লিখুন →
                </button>
              </div>
              {myMemories.length === 0 ? (
                <p className="text-sm text-[#5E6D65]">আপনি এখনো কোনো স্মৃতিচারণ পোস্ট করেননি।</p>
              ) : (
                myMemories.map((m) => (
                  <div key={m.id} className="p-4 rounded-lg border border-[#EFECE3] flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#8B641E]">
                        {m.category} · {STATUS_LABELS_BN[m.status]} · {formatBengaliDate(m.createdAt)}
                      </p>
                      <h3 className="font-editorial text-base font-bold text-[#0B3B28] mt-0.5">{m.title}</h3>
                      <p className="text-xs text-[#4A5951] mt-1 line-clamp-2">{m.content}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteMemory(m.id)}
                      className="p-2 text-[#5E6D65] hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'books' && (
            <div className="bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
                <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">আমার প্রকাশিত বই</h2>
                <button
                  type="button"
                  onClick={() => onNavigate('books')}
                  className="text-xs font-semibold text-[#0D4A32] hover:underline cursor-pointer"
                >
                  নতুন বই যুক্ত করুন →
                </button>
              </div>
              {myBooks.length === 0 ? (
                <p className="text-sm text-[#5E6D65]">আপনি এখনো কোনো বই যুক্ত করেননি।</p>
              ) : (
                myBooks.map((b) => (
                  <div key={b.id} className="p-4 rounded-lg border border-[#EFECE3] flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#8B641E]">
                        {b.category} · {STATUS_LABELS_BN[b.status]}
                      </p>
                      <h3 className="font-editorial text-base font-bold text-[#0B3B28]">{b.title}</h3>
                      <p className="text-xs text-[#5E6D65] mt-0.5">{b.publisher}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteBook(b.id)}
                      className="p-2 text-[#5E6D65] hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'businesses' && (
            <div className="bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1]">
                <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">আমার ব্যবসা ও উদ্যোগ</h2>
                <button
                  type="button"
                  onClick={() => onNavigate('businesses')}
                  className="text-xs font-semibold text-[#0D4A32] hover:underline cursor-pointer"
                >
                  নতুন ব্যবসা যুক্ত করুন →
                </button>
              </div>
              {myBusinesses.length === 0 ? (
                <p className="text-sm text-[#5E6D65]">আপনি এখনো কোনো ব্যবসা যুক্ত করেননি।</p>
              ) : (
                myBusinesses.map((biz) => (
                  <div key={biz.id} className="p-4 rounded-lg border border-[#EFECE3] flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-[#8B641E]">
                        {biz.category} · {STATUS_LABELS_BN[biz.status]}
                      </p>
                      <h3 className="font-editorial text-base font-bold text-[#0B3B28]">{biz.name}</h3>
                      <p className="text-xs text-[#4A5951] mt-0.5 line-clamp-2">{biz.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteBusiness(biz.id)}
                      className="p-2 text-[#5E6D65] hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'bookmarks' && (
            <div className="bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4">
              <h2 className="font-editorial text-xl font-bold text-[#0B3B28] pb-3 border-b border-[#F0ECE1]">
                সংরক্ষিত পোস্ট (বুকমার্ক)
              </h2>
              {bookmarks.length === 0 ? (
                <p className="text-sm text-[#5E6D65]">আপনার বুকমার্ক তালিকা এখনো খালি।</p>
              ) : (
                bookmarks.map((bm) => (
                  <div key={bm.id} className="p-4 rounded-lg border border-[#EFECE3] flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#8B641E]">
                        {bm.targetType === 'memory'
                          ? 'স্মৃতিচারণ'
                          : bm.targetType === 'book'
                            ? 'বই ও প্রকাশনা'
                            : 'ব্যবসা ও উদ্যোগ'}
                      </p>
                      <p className="text-sm font-semibold text-[#0B3B28]">{bm.targetTitle}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleBookmark(bm.targetType, bm.targetId, bm.targetTitle)}
                      className="text-xs text-rose-700 hover:underline cursor-pointer"
                    >
                      সরিয়ে ফেলুন
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'notifications' && (
            <div className="bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4">
              <h2 className="font-editorial text-xl font-bold text-[#0B3B28] pb-3 border-b border-[#F0ECE1]">
                আমার বিজ্ঞপ্তি
              </h2>
              {notifications.length === 0 ? (
                <p className="text-sm text-[#5E6D65]">কোনো নতুন বিজ্ঞপ্তি নেই।</p>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-lg border flex items-start justify-between gap-3 ${
                      n.isRead ? 'border-[#EFECE3] bg-white' : 'border-[#DFD5BE] bg-[#FCFBF6]'
                    }`}
                  >
                    <div>
                      <p className="text-xs text-[#8B641E]">{formatBengaliDate(n.createdAt)}</p>
                      <p className="text-sm font-semibold text-[#0B3B28] mt-0.5">{n.title}</p>
                      <p className="text-xs text-[#4A5951] mt-1">{n.message}</p>
                    </div>
                    {!n.isRead && n.recipientId === user.uid && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id)}
                        className="text-xs font-semibold text-[#0D4A32] hover:underline whitespace-nowrap cursor-pointer"
                      >
                        পঠিত চিহ্নিত
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'settings' && (
            <div className="bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-5">
              <h2 className="font-editorial text-xl font-bold text-[#0B3B28] pb-3 border-b border-[#F0ECE1]">
                অ্যাকাউন্ট ও গোপনীয়তা সেটিংস
              </h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-[#5E6D65]">লগইন ইমেইল</dt>
                  <dd className="font-medium text-[#17211C]">{user.email}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#5E6D65]">অ্যাকাউন্ট ইউআইডি (প্রশাসনিক রেফারেন্স)</dt>
                  <dd className="font-mono text-xs text-[#4A5951]">{user.uid}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#5E6D65]">ইমেইল যাচাই অবস্থা</dt>
                  <dd className="font-medium text-[#0D4A32]">
                    {user.emailVerified ? 'যাচাইকৃত (নিরাপদ)' : 'অযাচাইকৃত'}
                  </dd>
                </div>
              </dl>

              <div className="pt-4 border-t border-[#F0ECE1] flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onNavigate('register')}
                  className="px-4 py-2.5 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] cursor-pointer"
                >
                  প্রোফাইল ও গোপনীয়তা সম্পাদনা
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    onNavigate('home');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-50 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  লগআউট করুন
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <QrShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title="আমার প্রোফাইল শেয়ার করুন"
        subtitle="সহপাঠীদের সাথে আপনার প্রোফাইল লিংক ও কিউআর কোড শেয়ার করুন"
        shareUrl={shareUrl}
      />
    </div>
  );
};
