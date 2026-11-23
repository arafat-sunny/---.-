import React, { useMemo } from 'react';
import {
  ArrowRight,
  Bell,
  BookOpen,
  Briefcase,
  Calendar,
  Gift,
  Heart,
  MapPin,
  QrCode,
  Search,
  UserPlus,
  Users,
} from 'lucide-react';
import { CAMPUS_PHOTOS } from '../constants/bengali';
import { useAlumni } from '../context/AlumniContext';
import { ActiveRoute, Member } from '../types';
import { formatBengaliDate, isBirthdayToday, toBengaliNumber } from '../utils/formatters';
import { Avatar, BookCoverDisplay, SafeImage } from '../components/CommonUI';

interface HomePageProps {
  onNavigate: (route: ActiveRoute) => void;
  onSelectMember: (member: Member) => void;
  onOpenRegistrationQr: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectMember,
  onOpenRegistrationQr,
}) => {
  const {
    siteSettings,
    members,
    realMembersCount,
    memories,
    books,
    businesses,
    announcements,
    events,
  } = useAlumni();

  const distinctDistricts = useMemo(() => {
    return new Set(members.map((m) => m.district).filter(Boolean)).size;
  }, [members]);

  const urgentAnnouncements = useMemo(
    () => announcements.filter((a) => a.isPinned || a.isUrgent).slice(0, 2),
    [announcements]
  );

  const birthdayMembers = useMemo(
    () => members.filter((m) => !m.isDemo && isBirthdayToday(m.birthDatePublic)),
    [members]
  );

  const upcomingEvent = useMemo(
    () => events.find((e) => !e.isPast) || events[0] || null,
    [events]
  );

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden bg-[#07261A] text-white">
        <img
          src={CAMPUS_PHOTOS.sunset}
          alt="জামেউল উলুম মাদরাসা মিরপুর-১৪ গোধূলি দৃশ্য"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#062217]/95 via-[#093222]/85 to-[#093222]/45" />
        <div className="absolute inset-0 islamic-lattice opacity-40 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
          <div className="max-w-3xl space-y-5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#E5C987]">
              <span className="font-arabic text-base">بسم الله الرحمن الرحيم</span>
              <span aria-hidden="true">·</span>
              <span>{siteSettings.madrasahName}, {siteSettings.madrasahLocation}</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm sm:text-base font-medium text-[#D2DFD8] tracking-wide">
                {siteSettings.batchInfo}
              </p>
              <h1 className="font-editorial text-3xl sm:text-5xl lg:text-[54px] font-bold leading-[1.18] text-white">
                {siteSettings.siteName}
              </h1>
              <p className="font-editorial text-lg sm:text-xl text-[#E5C987] pt-1">
                {siteSettings.subtitle}
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#E2ECE7] leading-relaxed max-w-2xl pt-2">
              {siteSettings.heroQuote}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C9A24D] text-[#082419] text-sm font-semibold hover:bg-[#D8B463] transition-colors whitespace-nowrap cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                নিবন্ধন করুন
              </button>
              <button
                type="button"
                onClick={() => onNavigate('directory')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-white/12 text-white border border-white/25 text-sm font-medium hover:bg-white/20 transition-colors whitespace-nowrap cursor-pointer"
              >
                <Search className="w-4 h-4" />
                সদস্য খুঁজুন
              </button>
              <button
                type="button"
                onClick={() => onNavigate('memories')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-transparent text-[#E5C987] border border-[#C9A24D]/45 text-sm font-medium hover:bg-[#C9A24D]/15 transition-colors whitespace-nowrap cursor-pointer"
              >
                স্মৃতির পাতায়
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Full-Width Quantitative Batch Summary Strip below Hero */}
        <div className="relative border-t border-white/15 bg-[#061F15]/85 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-2xl sm:text-3xl font-editorial font-bold text-white tabular-nums">
                {toBengaliNumber(realMembersCount > 0 ? realMembersCount : members.length)}
                {realMembersCount === 0 && siteSettings.showDemoData && (
                  <span className="text-xs font-sans font-normal text-[#E5C987] ml-1.5">(নমুনা)</span>
                )}
              </p>
              <p className="text-xs text-[#B6CBC0] mt-0.5">আমাদের ব্যাচের সদস্য</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-editorial font-bold text-white tabular-nums">
                {toBengaliNumber(distinctDistricts)} জেলা
              </p>
              <p className="text-xs text-[#B6CBC0] mt-0.5">সারা দেশে ছড়িয়ে থাকা ভাইয়েরা</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-editorial font-bold text-white tabular-nums">
                {toBengaliNumber(memories.length)} টি
              </p>
              <p className="text-xs text-[#B6CBC0] mt-0.5">সংরক্ষিত স্মৃতিচারণ ও ছবি</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-editorial font-bold text-white tabular-nums">
                {toBengaliNumber(books.length + businesses.length)} টি
              </p>
              <p className="text-xs text-[#B6CBC0] mt-0.5">প্রকাশিত বই ও হালাল উদ্যোগ</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== URGENT NOTICES & BIRTHDAYS ==================== */}
      {(urgentAnnouncements.length > 0 || birthdayMembers.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          {urgentAnnouncements.map((ann) => (
            <div
              key={ann.id}
              className="bg-white border border-[#DFD5BE] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#8B641E] font-medium">
                  <Bell className="w-3.5 h-3.5" />
                  <span>গুরুত্বপূর্ণ বিজ্ঞপ্তি</span>
                  <span aria-hidden="true">·</span>
                  <span>{ann.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatBengaliDate(ann.createdAt)}</span>
                  {ann.isDemo && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="text-[#5E6D65]">নমুনা ঘোষণা</span>
                    </>
                  )}
                </div>
                <h2 className="font-editorial text-lg font-bold text-[#0B3B28]">{ann.title}</h2>
                <p className="text-sm text-[#4A5951] line-clamp-2">{ann.content}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('activities')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#0D4A32] text-[#0D4A32] text-xs font-semibold hover:bg-[#0D4A32] hover:text-white transition-colors whitespace-nowrap shrink-0 self-start sm:self-center cursor-pointer"
              >
                বিস্তারিত নোটিশ
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {birthdayMembers.length > 0 && (
            <div className="bg-[#EFECE3] border border-[#DFD5BE] rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-[#8B641E] shrink-0" />
                <div>
                  <p className="text-xs font-medium text-[#8B641E]">জন্মদিনের শুভেচ্ছা ও দুআ</p>
                  <p className="text-sm font-semibold text-[#0B3B28]">
                    আজ {birthdayMembers.map((m) => m.fullName).join(', ')} ভাইয়ের জন্মদিন! আল্লাহ তাঁর হায়াতে বরকত দান করুন।
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ==================== LATEST REGISTERED BROTHERS ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD2] mb-8">
          <div>
            <p className="text-xs font-medium text-[#8B641E] mb-1">০১. কেন্দ্রীয় ফারেগিন পরিচিতি</p>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0B3B28]">
              সর্বশেষ নিবন্ধিত ভাইয়েরা
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('directory')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D4A32] hover:text-[#8B641E] transition-colors cursor-pointer"
          >
            সকল সদস্য দেখুন ({toBengaliNumber(members.length)})
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.slice(0, 6).map((member) => (
            <article
              key={member.id}
              className="bg-white border border-[#E4DFD2] rounded-xl p-6 flex flex-col justify-between hover:border-[#0D4A32]/40 transition-colors"
            >
              <div>
                <div className="flex items-start gap-4">
                  <Avatar name={member.fullName} src={member.photoUrl} size="md" />
                  <div className="min-w-0">
                    <h3 className="font-editorial text-lg font-bold text-[#0B3B28] truncate">
                      {member.fullName}
                    </h3>
                    <p className="text-xs text-[#5E6D65] mt-0.5 truncate">
                      {member.profession || member.professionCategory || 'আলেমে দ্বীন'}
                    </p>
                    <p className="text-xs text-[#4A5951] mt-1">
                      {member.district} · {member.lastJamaat}
                      {member.isDemo ? ' · নমুনা' : ''}
                    </p>
                  </div>
                </div>
                {member.bio && (
                  <p className="text-sm text-[#4A5951] leading-relaxed mt-4 line-clamp-2">
                    {member.bio}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-[#F0ECE1] flex items-center justify-between text-xs">
                <span className="text-[#5E6D65] truncate max-w-[170px]">
                  {member.currentArea || member.district}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectMember(member)}
                  className="font-semibold text-[#0D4A32] hover:text-[#8B641E] transition-colors cursor-pointer whitespace-nowrap"
                >
                  প্রোফাইল দেখুন →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ==================== MADRASAH MEMORIES & CAMPUS ARCHIVE ==================== */}
      <section className="bg-[#EFECE3]/70 border-y border-[#E4DFD2] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#DCD6C6] mb-8">
            <div>
              <p className="text-xs font-medium text-[#8B641E] mb-1">০২. জামেউল উলুম স্মৃতি আর্কাইভ</p>
              <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0B3B28]">
                মাদরাসার স্মৃতিচারণ ও সাম্প্রতিক পোস্ট
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('memories')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D4A32] hover:text-[#8B641E] transition-colors cursor-pointer"
            >
              সব স্মৃতি ও গ্যালারি দেখুন
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {memories[0] && (
              <article className="lg:col-span-7 bg-white border border-[#E4DFD2] rounded-xl overflow-hidden flex flex-col">
                <div className="aspect-[16/10] w-full overflow-hidden bg-[#0B3B28]">
                  <SafeImage
                    src={memories[0].imageUrls[0] || CAMPUS_PHOTOS.sunset}
                    alt={memories[0].title}
                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-300"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-xs text-[#5E6D65] mb-2">
                      {memories[0].category} · {memories[0].authorName} · {formatBengaliDate(memories[0].createdAt)}
                      {memories[0].isDemo ? ' · নমুনা' : ''}
                    </p>
                    <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[#0B3B28] leading-snug mb-2">
                      {memories[0].title}
                    </h3>
                    <p className="text-sm text-[#4A5951] leading-relaxed line-clamp-3">
                      {memories[0].content}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-[#F0ECE1] flex items-center justify-between text-xs text-[#5E6D65]">
                    <span className="inline-flex items-center gap-1.5 tabular-nums">
                      <Heart className="w-3.5 h-3.5 text-[#8B641E]" />
                      {toBengaliNumber(memories[0].likesCount)} প্রতিক্রিয়া · {toBengaliNumber(memories[0].commentsCount)} মন্তব্য
                    </span>
                    <button
                      type="button"
                      onClick={() => onNavigate('memories')}
                      className="font-semibold text-[#0D4A32] hover:text-[#8B641E] cursor-pointer"
                    >
                      সম্পূর্ণ পড়ুন →
                    </button>
                  </div>
                </div>
              </article>
            )}

            <div className="lg:col-span-5 flex flex-col gap-6">
              {memories.slice(1, 3).map((mem) => (
                <article
                  key={mem.id}
                  className="bg-white border border-[#E4DFD2] rounded-xl overflow-hidden flex flex-col sm:flex-row flex-1"
                >
                  <div className="sm:w-44 aspect-[4/3] sm:aspect-auto shrink-0 bg-[#EFECE3]">
                    <SafeImage
                      src={mem.imageUrls[0] || CAMPUS_PHOTOS.courtyard}
                      alt={mem.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-[#5E6D65] mb-1">
                        {mem.category} · {formatBengaliDate(mem.createdAt)}
                        {mem.isDemo ? ' · নমুনা' : ''}
                      </p>
                      <h3 className="font-editorial text-base font-bold text-[#0B3B28] leading-snug mb-1.5 line-clamp-2">
                        {mem.title}
                      </h3>
                      <p className="text-xs text-[#4A5951] leading-relaxed line-clamp-3">
                        {mem.content}
                      </p>
                    </div>
                    <p className="text-xs text-[#5E6D65] mt-3">{mem.authorName}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ==================== BOOKS & PUBLICATIONS ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD2] mb-8">
          <div>
            <p className="text-xs font-medium text-[#8B641E] mb-1">০৩. ইলমি অবদান ও সাহিত্য</p>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0B3B28]">
              ভাইদের নতুন প্রকাশিত বই
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('books')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D4A32] hover:text-[#8B641E] transition-colors cursor-pointer"
          >
            সব বই ও প্রকাশনা দেখুন
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {books.slice(0, 3).map((book) => (
            <article
              key={book.id}
              className="bg-white border border-[#E4DFD2] rounded-xl p-5 flex gap-4 hover:border-[#0D4A32]/40 transition-colors"
            >
              <div className="w-24 shrink-0">
                <BookCoverDisplay
                  title={book.title}
                  authorName={book.authorName}
                  category={book.category}
                  coverUrl={book.coverUrl}
                  className="aspect-[3/4] text-xs"
                />
              </div>
              <div className="flex flex-col justify-between min-w-0">
                <div>
                  <p className="text-xs text-[#8B641E]">
                    {book.category}
                    {book.isDemo ? ' · নমুনা' : ''}
                  </p>
                  <h3 className="font-editorial text-base font-bold text-[#0B3B28] mt-1 leading-snug line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-xs text-[#5E6D65] mt-1">{book.authorName}</p>
                  <p className="text-xs text-[#4A5951] mt-2 line-clamp-3 leading-relaxed">
                    {book.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('books')}
                  className="text-xs font-semibold text-[#0D4A32] hover:text-[#8B641E] text-left mt-3 cursor-pointer"
                >
                  বিস্তারিত দেখুন →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ==================== BUSINESSES & VENTURES ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD2] mb-8">
          <div>
            <p className="text-xs font-medium text-[#8B641E] mb-1">০৪. হালাল উপার্জন ও পারস্পরিক সহযোগিতা</p>
            <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0B3B28]">
              ভাইদের ব্যবসা ও উদ্যোগ
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('businesses')}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0D4A32] hover:text-[#8B641E] transition-colors cursor-pointer"
          >
            সকল ব্যবসা দেখুন
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {businesses.slice(0, 3).map((biz) => (
            <article
              key={biz.id}
              className="bg-white border border-[#E4DFD2] rounded-xl p-6 flex flex-col justify-between hover:border-[#0D4A32]/40 transition-colors"
            >
              <div>
                <p className="text-xs text-[#8B641E]">
                  {biz.category}
                  {biz.isDemo ? ' · নমুনা উদ্যোগ' : ''}
                </p>
                <h3 className="font-editorial text-lg font-bold text-[#0B3B28] mt-1">{biz.name}</h3>
                <p className="text-xs text-[#5E6D65] mt-0.5">পরিচালনায়: {biz.ownerName}</p>
                <p className="text-sm text-[#4A5951] leading-relaxed mt-3 line-clamp-3">
                  {biz.description}
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-[#F0ECE1] flex items-center justify-between text-xs text-[#5E6D65]">
                <span className="truncate max-w-[180px]">{biz.address || 'বাংলাদেশ'}</span>
                <button
                  type="button"
                  onClick={() => onNavigate('businesses')}
                  className="font-semibold text-[#0D4A32] hover:text-[#8B641E] cursor-pointer whitespace-nowrap"
                >
                  যোগাযোগ →
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ==================== UPCOMING EVENT + QR INVITATION SPLIT ==================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {upcomingEvent && (
            <div className="lg:col-span-7 bg-white border border-[#E4DFD2] rounded-xl overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-56 shrink-0 bg-[#0B3B28]">
                <SafeImage
                  src={upcomingEvent.bannerUrl || CAMPUS_PHOTOS.courtyard}
                  alt={upcomingEvent.title}
                  className="w-full h-full object-cover min-h-[180px]"
                />
              </div>
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-[#8B641E] mb-1">
                    {upcomingEvent.isPast ? 'অনুষ্ঠান আর্কাইভ' : 'আসন্ন অনুষ্ঠান ও পুনর্মিলনী'}
                    {upcomingEvent.isDemo ? ' · নমুনা' : ''}
                  </p>
                  <h3 className="font-editorial text-xl font-bold text-[#0B3B28] leading-snug mb-2">
                    {upcomingEvent.title}
                  </h3>
                  <div className="space-y-1 text-xs text-[#4A5951] mb-3">
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0D4A32]" />
                      {upcomingEvent.date} {upcomingEvent.time ? `· ${upcomingEvent.time}` : ''}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0D4A32]" />
                      {upcomingEvent.location}
                    </p>
                  </div>
                  <p className="text-sm text-[#4A5951] line-clamp-2">{upcomingEvent.description}</p>
                </div>
                <div className="mt-5 flex items-center justify-between">
                  <span className="text-xs text-[#5E6D65] tabular-nums">
                    উপস্থিতি নিশ্চিত করেছেন: {toBengaliNumber(upcomingEvent.rsvpCount)} জন
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('activities')}
                    className="px-4 py-2 rounded-lg bg-[#0D4A32] text-white text-xs font-medium hover:bg-[#093624] transition-colors cursor-pointer"
                  >
                    অংশগ্রহণ করুন
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="lg:col-span-5 bg-[#0B3B28] text-white islamic-lattice border border-[#C9A24D]/35 rounded-xl p-7 flex flex-col justify-between">
            <div>
              <p className="text-xs font-medium text-[#E5C987] mb-1">ব্যাচের সকল ভাইকে যুক্ত করুন</p>
              <h3 className="font-editorial text-2xl font-bold text-white leading-snug mb-2">
                এখনো নিবন্ধন করেননি?
              </h3>
              <p className="text-sm text-[#D2DFD8] leading-relaxed">
                মক্তব থেকে দাওরায়ে হাদিস কিংবা ইফতা—যেকোনো জামাতে আমাদের সাথে জামেউল উলুমে পড়ে থাকলে আজই নিবন্ধন করুন এবং সহপাঠী ভাইদের সাথে কিউআর কোডটি শেয়ার করুন।
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C9A24D] text-[#082419] text-xs font-semibold hover:bg-[#D8B463] transition-colors cursor-pointer"
              >
                <Users className="w-4 h-4" />
                নিবন্ধন শুরু করুন
              </button>
              <button
                type="button"
                onClick={onOpenRegistrationQr}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/25 text-white text-xs font-medium hover:bg-white/10 transition-colors cursor-pointer"
              >
                <QrCode className="w-4 h-4" />
                কিউআর কোড শেয়ার
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
