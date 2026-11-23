import React, { useMemo, useState } from 'react';
import { Lock, MapPin, RotateCcw, Search, SlidersHorizontal } from 'lucide-react';
import { BANGLADESH_DISTRICTS, JAMAAT_LIST, PROFESSION_CATEGORIES } from '../constants/bengali';
import { useAlumni } from '../context/AlumniContext';
import { Member } from '../types';
import { toBengaliNumber } from '../utils/formatters';
import { Avatar } from '../components/CommonUI';

interface DirectoryPageProps {
  onSelectMember: (member: Member) => void;
  onOpenAuth: () => void;
  onGoRegister: () => void;
}

export const DirectoryPage: React.FC<DirectoryPageProps> = ({
  onSelectMember,
  onOpenAuth,
  onGoRegister,
}) => {
  const { members, user, isApprovedMember } = useAlumni();

  const [searchText, setSearchText] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');
  const [upazilaFilter, setUpazilaFilter] = useState('');
  const [professionFilter, setProfessionFilter] = useState('');
  const [lastJamaatFilter, setLastJamaatFilter] = useState('');
  const [studiedJamaatFilter, setStudiedJamaatFilter] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'districts'>('cards');
  const [showFilters, setShowFilters] = useState(true);

  const filteredMembers = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    const upa = upazilaFilter.trim().toLowerCase();
    const sk = skillFilter.trim().toLowerCase();

    return members.filter((m) => {
      if (q) {
        const hay = [
          m.fullName,
          m.profession,
          m.workplace,
          m.currentArea,
          m.district,
          m.upazila,
          m.studyInstitution,
          ...(m.skills || []),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (districtFilter && m.district !== districtFilter) return false;
      if (upa && !(m.upazila || '').toLowerCase().includes(upa)) return false;
      if (professionFilter && m.professionCategory !== professionFilter) return false;
      if (lastJamaatFilter && m.lastJamaat !== lastJamaatFilter) return false;
      if (studiedJamaatFilter && !(m.jamaats || []).includes(studiedJamaatFilter)) return false;
      if (sk) {
        const skillsText = (m.skills || []).join(' ').toLowerCase();
        if (!skillsText.includes(sk)) return false;
      }
      return true;
    });
  }, [
    members,
    searchText,
    districtFilter,
    upazilaFilter,
    professionFilter,
    lastJamaatFilter,
    studiedJamaatFilter,
    skillFilter,
  ]);

  const districtGroups = useMemo(() => {
    const map = new Map<string, Member[]>();
    filteredMembers.forEach((m) => {
      const key = m.district || 'অনির্ধারিত';
      const arr = map.get(key) || [];
      arr.push(m);
      map.set(key, arr);
    });
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filteredMembers]);

  const resetFilters = () => {
    setSearchText('');
    setDistrictFilter('');
    setUpazilaFilter('');
    setProfessionFilter('');
    setLastJamaatFilter('');
    setStudiedJamaatFilter('');
    setSkillFilter('');
  };

  const hasActiveFilter = Boolean(
    searchText ||
      districtFilter ||
      upazilaFilter ||
      professionFilter ||
      lastJamaatFilter ||
      studiedJamaatFilter ||
      skillFilter
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD2]">
        <div>
          <p className="text-xs font-medium text-[#8B641E] mb-1">কেন্দ্রীয় ফারেগিন ডেটাবেজ</p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0B3B28]">
            সদস্য ডিরেক্টরি
          </h1>
          <p className="text-sm text-[#4A5951] mt-1">
            নাম, জেলা, উপজেলা, পেশা, জামাত অথবা বিশেষ দক্ষতা দিয়ে আমাদের ব্যাচের ভাইদের খুঁজে নিন।
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#EFECE3] rounded-lg self-start">
          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'cards' ? 'bg-white text-[#0B3B28] shadow-sm' : 'text-[#4A5951]'
            }`}
          >
            প্রোফাইল তালিকা ({toBengaliNumber(filteredMembers.length)})
          </button>
          <button
            type="button"
            onClick={() => setViewMode('districts')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === 'districts' ? 'bg-white text-[#0B3B28] shadow-sm' : 'text-[#4A5951]'
            }`}
          >
            জেলা অনুযায়ী ({toBengaliNumber(districtGroups.length)})
          </button>
        </div>
      </div>

      {/* Privacy Notice Banner for Guests / Pending Users */}
      {!isApprovedMember && (
        <div className="bg-white border border-[#DFD5BE] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#8B641E] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#0B3B28]">
                {!user
                  ? 'সদস্যদের বিস্তারিত প্রোফাইল ও যোগাযোগের তথ্য সংরক্ষিত'
                  : 'আপনার সদস্যপদ এখনো অনুমোদনের অপেক্ষায় আছে'}
              </p>
              <p className="text-xs text-[#4A5951] mt-0.5">
                {!user
                  ? 'ব্যক্তিগত তথ্যের নিরাপত্তার স্বার্থে শুধুমাত্র নিবন্ধিত ও অনুমোদিত সদস্যরাই বিস্তারিত প্রোফাইল ও যোগাযোগ নম্বর দেখতে পারবেন।'
                  : 'প্রশাসকের অনুমোদন পাওয়ার সাথে সাথেই আপনি সকল অনুমোদিত ভাইয়ের বিস্তারিত প্রোফাইল দেখতে পারবেন।'}
              </p>
            </div>
          </div>
          {!user ? (
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-lg bg-[#0D4A32] text-white text-xs font-medium hover:bg-[#093624] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              লগইন করুন
            </button>
          ) : (
            <button
              type="button"
              onClick={onGoRegister}
              className="px-4 py-2 rounded-lg bg-[#0D4A32] text-white text-xs font-medium hover:bg-[#093624] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              আমার নিবন্ধন দেখুন
            </button>
          )}
        </div>
      )}

      {/* Advanced Search & Filter Bar */}
      <div className="bg-white border border-[#E4DFD2] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#5E6D65] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="নাম, কর্মস্থল, বর্তমান এলাকা বা দক্ষতা লিখে খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border border-[#D8D1C1] rounded-lg text-[#0B3B28] hover:bg-[#F3F0E7] transition-colors whitespace-nowrap cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {showFilters ? 'ফিল্টার লুকান' : 'উন্নত ফিল্টার'}
            </button>
            {hasActiveFilter && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                রিসেট
              </button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 pt-2 border-t border-[#F0ECE1]">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              aria-label="জেলা নির্বাচন"
              className="text-xs bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg px-3 py-2.5 focus:border-[#0D4A32] focus:outline-none"
            >
              <option value="">সকল জেলা</option>
              {BANGLADESH_DISTRICTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={upazilaFilter}
              onChange={(e) => setUpazilaFilter(e.target.value)}
              placeholder="উপজেলা / থানা..."
              className="text-xs bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg px-3 py-2.5 focus:border-[#0D4A32] focus:outline-none"
            />

            <select
              value={professionFilter}
              onChange={(e) => setProfessionFilter(e.target.value)}
              aria-label="পেশা নির্বাচন"
              className="text-xs bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg px-3 py-2.5 focus:border-[#0D4A32] focus:outline-none"
            >
              <option value="">সকল পেশা</option>
              {PROFESSION_CATEGORIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>

            <select
              value={lastJamaatFilter}
              onChange={(e) => setLastJamaatFilter(e.target.value)}
              aria-label="সর্বশেষ জামাত"
              className="text-xs bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg px-3 py-2.5 focus:border-[#0D4A32] focus:outline-none"
            >
              <option value="">সর্বশেষ জামাত (সব)</option>
              {JAMAAT_LIST.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>

            <select
              value={studiedJamaatFilter}
              onChange={(e) => setStudiedJamaatFilter(e.target.value)}
              aria-label="যেকোনো অধ্যয়নকৃত জামাত"
              className="text-xs bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg px-3 py-2.5 focus:border-[#0D4A32] focus:outline-none"
            >
              <option value="">যে জামাতে পড়েছেন (সব)</option>
              {JAMAAT_LIST.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="বিশেষ দক্ষতা (যেমন: অনুবাদ)..."
              className="text-xs bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg px-3 py-2.5 focus:border-[#0D4A32] focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Results Area */}
      {filteredMembers.length === 0 ? (
        <div className="bg-white border border-[#E4DFD2] rounded-xl p-12 text-center">
          <p className="font-editorial text-lg font-bold text-[#0B3B28] mb-1">
            কোনো সদস্য খুঁজে পাওয়া যায়নি
          </p>
          <p className="text-sm text-[#5E6D65] mb-4">
            অনুগ্রহ করে আপনার সার্চ বা ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-lg bg-[#0D4A32] text-white text-xs font-medium hover:bg-[#093624] cursor-pointer"
          >
            সব ফিল্টার মুছুন
          </button>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <article
              key={member.id}
              className="bg-white border border-[#E4DFD2] rounded-xl p-6 flex flex-col justify-between hover:border-[#0D4A32]/45 transition-colors"
            >
              <div>
                <div className="flex items-start gap-4">
                  <Avatar name={member.fullName} src={member.photoUrl} size="md" />
                  <div className="min-w-0">
                    <h2 className="font-editorial text-lg font-bold text-[#0B3B28] truncate">
                      {member.fullName}
                    </h2>
                    <p className="text-xs text-[#4A5951] mt-0.5 truncate">
                      {member.profession || member.professionCategory || 'আলেমে দ্বীন'}
                    </p>
                    <p className="text-xs text-[#5E6D65] mt-1">
                      {member.district}
                      {member.upazila ? `, ${member.upazila}` : ''} · {member.lastJamaat}
                      {member.isDemo ? ' · নমুনা প্রোফাইল' : ''}
                    </p>
                  </div>
                </div>

                {member.workplace && (
                  <p className="text-xs text-[#4A5951] mt-4 truncate">
                    কর্মস্থল: <span className="text-[#17211C]">{member.workplace}</span>
                  </p>
                )}

                {member.skills && member.skills.length > 0 && (
                  <p className="text-xs text-[#5E6D65] mt-2 line-clamp-1">
                    দক্ষতা: {member.skills.join(' · ')}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-[#F0ECE1] flex items-center justify-between">
                <span className="text-xs text-[#5E6D65] inline-flex items-center gap-1 truncate max-w-[160px]">
                  <MapPin className="w-3.5 h-3.5 text-[#8B641E] shrink-0" />
                  {member.currentArea || member.district}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectMember(member)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F3F0E7] text-[#0B3B28] text-xs font-semibold hover:bg-[#0D4A32] hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                >
                  প্রোফাইল দেখুন
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {districtGroups.map(([district, list]) => (
            <div key={district} className="bg-white border border-[#E4DFD2] rounded-xl p-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0ECE1] mb-4">
                <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">{district}</h2>
                <span className="text-xs text-[#5E6D65] tabular-nums">
                  {toBengaliNumber(list.length)} জন সদস্য
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSelectMember(m)}
                    className="flex items-center gap-3 p-3 rounded-lg border border-[#EFECE3] hover:border-[#0D4A32]/40 text-left transition-colors cursor-pointer"
                  >
                    <Avatar name={m.fullName} src={m.photoUrl} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0B3B28] truncate">{m.fullName}</p>
                      <p className="text-xs text-[#5E6D65] truncate">
                        {m.upazila || m.currentArea || m.district} · {m.lastJamaat}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
