import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Briefcase,
  Edit3,
  ExternalLink,
  Flag,
  GraduationCap,
  Lock,
  MapPin,
  Phone,
  Share2,
  Users,
} from 'lucide-react';
import { useAlumni } from '../context/AlumniContext';
import { Member, MemberSharedContact } from '../types';
import { formatBengaliDate, safeExternalUrl } from '../utils/formatters';
import { Avatar, BookCoverDisplay, QrShareModal, ReportModal } from '../components/CommonUI';

interface MemberProfilePageProps {
  member: Member;
  onBack: () => void;
  onEditOwnProfile: () => void;
  onOpenAuth: () => void;
}

export const MemberProfilePage: React.FC<MemberProfilePageProps> = ({
  member,
  onBack,
  onEditOwnProfile,
  onOpenAuth,
}) => {
  const {
    user,
    isApprovedMember,
    isAdmin,
    myPrivateInfo,
    books,
    businesses,
    memories,
    fetchMemberSharedContact,
    submitReport,
  } = useAlumni();

  const [sharedContact, setSharedContact] = useState<MemberSharedContact | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const isOwnProfile = Boolean(user && user.uid === member.uid);
  const canViewDetailed = Boolean(member.isDemo || isOwnProfile || isApprovedMember || isAdmin);

  useEffect(() => {
    let mounted = true;
    if (!member.isDemo && (isApprovedMember || isOwnProfile || isAdmin)) {
      fetchMemberSharedContact(member.uid).then((data) => {
        if (mounted) setSharedContact(data);
      });
    } else {
      setSharedContact(null);
    }
    return () => {
      mounted = false;
    };
  }, [member.uid, member.isDemo, isApprovedMember, isOwnProfile, isAdmin]);

  const memberBooks = useMemo(
    () => books.filter((b) => b.authorId === member.uid),
    [books, member.uid]
  );
  const memberBusinesses = useMemo(
    () => businesses.filter((b) => b.ownerId === member.uid),
    [businesses, member.uid]
  );
  const memberMemories = useMemo(
    () => memories.filter((m) => m.authorId === member.uid),
    [memories, member.uid]
  );

  const shareUrl = `${window.location.origin}/?profile=${encodeURIComponent(member.uid)}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#4A5951] hover:text-[#0B3B28] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          সদস্য ডিরেক্টরিতে ফিরুন
        </button>

        <div className="flex items-center gap-2">
          {isOwnProfile && (
            <button
              type="button"
              onClick={onEditOwnProfile}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0D4A32] text-white text-xs font-medium hover:bg-[#093624] transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              প্রোফাইল সম্পাদনা
            </button>
          )}
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#D8D1C1] bg-white text-xs font-medium text-[#0B3B28] hover:bg-[#F3F0E7] transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            শেয়ার করুন
          </button>
          {!member.isDemo && user && !isOwnProfile && (
            <button
              type="button"
              onClick={() => setReportOpen(true)}
              aria-label="রিপোর্ট করুন"
              className="p-2 rounded-lg border border-[#E4DFD2] text-[#5E6D65] hover:text-rose-700 hover:border-rose-200 transition-colors cursor-pointer"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white border border-[#E4DFD2] rounded-xl overflow-hidden">
        <div className="h-28 bg-[#0B3B28] islamic-lattice border-b border-[#C9A24D]/35" />
        <div className="px-6 sm:px-8 pb-8 -mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5">
              <Avatar
                name={member.fullName}
                src={member.photoUrl}
                size="xl"
                className="ring-4 ring-white"
              />
              <div className="pb-1">
                <p className="text-xs text-[#8B641E] font-medium">
                  {member.professionCategory || 'আলেমে দ্বীন'}
                  {member.completedDawra ? ' · দাওরায়ে হাদিস ফারেগ (২০২২-২৩)' : ` · সর্বশেষ জামাত: ${member.lastJamaat}`}
                  {member.isDemo ? ' · নমুনা প্রোফাইল' : ''}
                </p>
                <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0B3B28] mt-0.5">
                  {member.fullName}
                </h1>
                <p className="text-sm text-[#4A5951] mt-1">
                  {member.profession || 'দ্বীনি খেদমতে নিয়োজিত'}
                  {member.workplace ? ` · ${member.workplace}` : ''}
                </p>
              </div>
            </div>
          </div>

          {member.bio && (
            <p className="text-sm text-[#3A4841] leading-relaxed mt-6 max-w-3xl">{member.bio}</p>
          )}
        </div>
      </div>

      {/* Privacy Gate if Unauthenticated / Unapproved for Real Profiles */}
      {!canViewDetailed ? (
        <div className="bg-white border border-[#DFD5BE] rounded-xl p-10 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F3F0E7] flex items-center justify-center text-[#0D4A32]">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">
            বিস্তারিত প্রোফাইল শুধুমাত্র অনুমোদিত সদস্যদের জন্য সংরক্ষিত
          </h2>
          <p className="text-sm text-[#4A5951] max-w-md mx-auto leading-relaxed">
            আমাদের ব্যাচের ভাইদের ব্যক্তিগত, শিক্ষাগত ও পারিবারিক তথ্যের নিরাপত্তা নিশ্চিত করতে অনুগ্রহ করে লগইন করুন এবং আপনার সদস্যপদ অনুমোদন নিন।
          </p>
          {!user && (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-5 py-2.5 rounded-lg bg-[#0D4A32] text-white text-sm font-medium hover:bg-[#093624] transition-colors cursor-pointer"
            >
              লগইন ও নিবন্ধন করুন
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Education History */}
            <section className="lg:col-span-7 bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#0B3B28] pb-3 border-b border-[#F0ECE1]">
                <GraduationCap className="w-5 h-5 text-[#8B641E]" />
                <h2 className="font-editorial text-lg font-bold">মাদরাসায় অধ্যয়নের ইতিহাস</h2>
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-[#5E6D65]">অধ্যয়নকাল</dt>
                  <dd className="font-medium text-[#17211C] mt-0.5">
                    {member.studyStartYear || '—'} থেকে {member.studyEndYear || '২০২৩'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#5E6D65]">সর্বশেষ অধ্যয়নরত জামাত</dt>
                  <dd className="font-medium text-[#17211C] mt-0.5">{member.lastJamaat}</dd>
                </div>
                <div>
                  <dt className="text-xs text-[#5E6D65]">দাওরায়ে হাদিস সম্পন্ন</dt>
                  <dd className="font-medium text-[#17211C] mt-0.5">
                    {member.completedDawra ? 'হ্যাঁ, জামেউল উলুম থেকে সম্পন্ন' : 'পূর্ববর্তী জামাত পর্যন্ত অধ্যয়ন'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-[#5E6D65]">বর্তমানে মাদরাসার সাথে সম্পর্ক</dt>
                  <dd className="font-medium text-[#17211C] mt-0.5">
                    {member.connectedToMadrasah ? 'হ্যাঁ, সম্পৃক্ত আছি' : 'প্রাক্তন শিক্ষার্থী (ফারেগ)'}
                  </dd>
                </div>
              </dl>

              <div className="pt-2">
                <p className="text-xs text-[#5E6D65] mb-1.5">জামেউল উলুমে অধ্যয়নকৃত জামাতসমূহ</p>
                <p className="text-sm text-[#0B3B28] font-medium leading-relaxed">
                  {(member.jamaats || []).join(' · ')}
                </p>
              </div>

              {member.studyInstitution && (
                <div className="pt-2 border-t border-[#F0ECE1]">
                  <p className="text-xs text-[#5E6D65]">উচ্চতর / বর্তমান শিক্ষাপ্রতিষ্ঠান</p>
                  <p className="text-sm font-medium text-[#17211C] mt-0.5">{member.studyInstitution}</p>
                </div>
              )}
            </section>

            {/* Location, Contact & Family (Privacy Controlled) */}
            <section className="lg:col-span-5 bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-[#0B3B28] pb-3 border-b border-[#F0ECE1]">
                <MapPin className="w-5 h-5 text-[#8B641E]" />
                <h2 className="font-editorial text-lg font-bold">অবস্থান, যোগাযোগ ও পারিবারিক তথ্য</h2>
              </div>

              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-[#5E6D65]">স্থায়ী জেলা ও উপজেলা</dt>
                  <dd className="font-medium text-[#17211C]">
                    {member.district}
                    {member.upazila ? `, ${member.upazila}` : ''}
                  </dd>
                </div>

                {member.currentArea && (
                  <div>
                    <dt className="text-xs text-[#5E6D65]">বর্তমান বসবাসের এলাকা</dt>
                    <dd className="font-medium text-[#17211C]">{member.currentArea}</dd>
                  </div>
                )}

                {isOwnProfile && myPrivateInfo && (
                  <>
                    <div>
                      <dt className="text-xs text-[#5E6D65]">পিতার নাম (ব্যক্তিগত)</dt>
                      <dd className="font-medium text-[#17211C]">{myPrivateInfo.fatherName}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-[#5E6D65]">মোবাইল নম্বর (ব্যক্তিগত)</dt>
                      <dd className="font-medium text-[#17211C]">{myPrivateInfo.phone}</dd>
                    </div>
                  </>
                )}

                {!isOwnProfile && sharedContact?.sharedPhone && (
                  <div>
                    <dt className="text-xs text-[#5E6D65] inline-flex items-center gap-1">
                      <Phone className="w-3 h-3" /> যোগাযোগ নম্বর
                    </dt>
                    <dd className="font-medium text-[#0B3B28]">
                      <a href={`tel:${sharedContact.sharedPhone}`} className="hover:underline">
                        {sharedContact.sharedPhone}
                      </a>
                      {sharedContact.sharedAltPhone ? ` / ${sharedContact.sharedAltPhone}` : ''}
                    </dd>
                  </div>
                )}

                {!isOwnProfile && sharedContact?.sharedAddress && (
                  <div>
                    <dt className="text-xs text-[#5E6D65]">বর্তমান ঠিকানা</dt>
                    <dd className="font-medium text-[#17211C]">{sharedContact.sharedAddress}</dd>
                  </div>
                )}

                {!isOwnProfile && sharedContact?.sharedMaritalStatus && (
                  <div className="pt-2 border-t border-[#F0ECE1]">
                    <dt className="text-xs text-[#5E6D65] inline-flex items-center gap-1">
                      <Users className="w-3 h-3" /> পারিবারিক তথ্য (সদস্যের অনুমতিক্রমে)
                    </dt>
                    <dd className="font-medium text-[#17211C] mt-0.5">
                      {sharedContact.sharedMaritalStatus}
                      {sharedContact.sharedMarriageYear ? ` (${sharedContact.sharedMarriageYear})` : ''}
                      {sharedContact.sharedChildrenSummary ? ` · ${sharedContact.sharedChildrenSummary}` : ''}
                    </dd>
                  </div>
                )}

                {!isOwnProfile &&
                  !member.isDemo &&
                  !sharedContact?.sharedPhone &&
                  !sharedContact?.sharedAddress && (
                    <p className="text-xs text-[#5E6D65] pt-1">
                      সদস্যের গোপনীয়তা সেটিংস অনুযায়ী ফোন নম্বর ও ব্যক্তিগত ঠিকানা গোপন রাখা হয়েছে।
                    </p>
                  )}
              </dl>

              {/* Skills & Social Links */}
              {member.skills && member.skills.length > 0 && (
                <div className="pt-3 border-t border-[#F0ECE1]">
                  <p className="text-xs text-[#5E6D65] mb-1">বিশেষ দক্ষতা</p>
                  <p className="text-sm font-medium text-[#0B3B28]">{member.skills.join(' · ')}</p>
                </div>
              )}

              {(safeExternalUrl(member.website) ||
                safeExternalUrl(member.facebook) ||
                safeExternalUrl(member.otherSocial)) && (
                <div className="pt-3 border-t border-[#F0ECE1] flex flex-wrap gap-4 text-xs font-semibold text-[#0D4A32]">
                  {safeExternalUrl(member.website) && (
                    <a
                      href={safeExternalUrl(member.website)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-[#8B641E]"
                    >
                      ওয়েবসাইট <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {safeExternalUrl(member.facebook) && (
                    <a
                      href={safeExternalUrl(member.facebook)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-[#8B641E]"
                    >
                      ফেসবুক <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {safeExternalUrl(member.otherSocial) && (
                    <a
                      href={safeExternalUrl(member.otherSocial)!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 hover:text-[#8B641E]"
                    >
                      অন্যান্য লিংক <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Member's Books, Businesses & Memories */}
          {memberBooks.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[#0B3B28]">
                <BookOpen className="w-5 h-5 text-[#8B641E]" />
                <h2 className="font-editorial text-xl font-bold">লেখালেখি ও প্রকাশিত বই</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {memberBooks.map((book) => (
                  <div key={book.id} className="bg-white border border-[#E4DFD2] rounded-xl p-5 flex gap-4">
                    <div className="w-20 shrink-0">
                      <BookCoverDisplay
                        title={book.title}
                        authorName={book.authorName}
                        category={book.category}
                        coverUrl={book.coverUrl}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-[#8B641E]">{book.category}</p>
                      <h3 className="font-editorial text-base font-bold text-[#0B3B28] mt-0.5">
                        {book.title}
                      </h3>
                      <p className="text-xs text-[#4A5951] mt-1.5 line-clamp-3">{book.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {memberBusinesses.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-[#0B3B28]">
                <Briefcase className="w-5 h-5 text-[#8B641E]" />
                <h2 className="font-editorial text-xl font-bold">ব্যবসা ও উদ্যোগ</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {memberBusinesses.map((biz) => (
                  <div key={biz.id} className="bg-white border border-[#E4DFD2] rounded-xl p-5 space-y-2">
                    <p className="text-xs text-[#8B641E]">{biz.category}</p>
                    <h3 className="font-editorial text-lg font-bold text-[#0B3B28]">{biz.name}</h3>
                    <p className="text-sm text-[#4A5951]">{biz.description}</p>
                    {biz.address && <p className="text-xs text-[#5E6D65]">ঠিকানা: {biz.address}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {memberMemories.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">স্মৃতিচারণমূলক পোস্ট</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {memberMemories.map((mem) => (
                  <div key={mem.id} className="bg-white border border-[#E4DFD2] rounded-xl p-5 space-y-2">
                    <p className="text-xs text-[#5E6D65]">
                      {mem.category} · {formatBengaliDate(mem.createdAt)}
                    </p>
                    <h3 className="font-editorial text-base font-bold text-[#0B3B28]">{mem.title}</h3>
                    <p className="text-sm text-[#4A5951] line-clamp-3">{mem.content}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <QrShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title="প্রোফাইল শেয়ার করুন"
        subtitle={`${member.fullName}-এর প্রোফাইল লিংক ও কিউআর কোড`}
        shareUrl={shareUrl}
      />

      <ReportModal
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
        targetTitle={member.fullName}
        onSubmit={(reason) =>
          submitReport({
            targetType: 'member',
            targetId: member.uid,
            targetTitle: member.fullName,
            reason,
          })
        }
      />
    </div>
  );
};
