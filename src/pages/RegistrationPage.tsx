import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  QrCode,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { BANGLADESH_DISTRICTS, JAMAAT_LIST, PROFESSION_CATEGORIES } from '../constants/bengali';
import { useAlumni } from '../context/AlumniContext';
import { MaritalStatus, ProfessionCategory } from '../types';
import { compressImageFile, toBengaliNumber } from '../utils/formatters';
import { Avatar } from '../components/CommonUI';

interface RegistrationPageProps {
  onComplete: () => void;
  onOpenAuth: () => void;
  onOpenRegistrationQr: () => void;
}

const STEPS = [
  '১. ব্যক্তিগত পরিচয়',
  '২. মাদরাসায় অধ্যয়ন',
  '৩. বর্তমান অবস্থা',
  '৪. পারিবারিক তথ্য',
  '৫. অতিরিক্ত ও সম্মতি',
];

export const RegistrationPage: React.FC<RegistrationPageProps> = ({
  onComplete,
  onOpenAuth,
  onOpenRegistrationQr,
}) => {
  const { user, myMember, myPrivateInfo, myEducation, saveMemberProfile, pushToast } = useAlumni();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Personal Identity
  const [fullName, setFullName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [shareBirthdayGreeting, setShareBirthdayGreeting] = useState(false);
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [presentAddress, setPresentAddress] = useState('');
  const [permanentAddress, setPermanentAddress] = useState('');
  const [district, setDistrict] = useState('ঢাকা');
  const [upazila, setUpazila] = useState('');
  const [profession, setProfession] = useState('');

  // Step 2: Madrasah Education
  const [jamaats, setJamaats] = useState<string[]>(['দাওরায়ে হাদিস']);
  const [studyStartYear, setStudyStartYear] = useState('২০১৭');
  const [studyEndYear, setStudyEndYear] = useState('২০২৩');
  const [lastJamaat, setLastJamaat] = useState('দাওরায়ে হাদিস');
  const [completedDawra, setCompletedDawra] = useState(true);
  const [connectedToMadrasah, setConnectedToMadrasah] = useState(false);
  const [favoriteUstads, setFavoriteUstads] = useState('');
  const [academicNotes, setAcademicNotes] = useState('');

  // Step 3: Current Status
  const [professionCategory, setProfessionCategory] = useState<ProfessionCategory>('শিক্ষকতা');
  const [workplace, setWorkplace] = useState('');
  const [studyInstitution, setStudyInstitution] = useState('');
  const [currentArea, setCurrentArea] = useState('');
  const [bio, setBio] = useState('');

  // Step 4: Family Information (Optional + Privacy Controlled)
  const [maritalStatus, setMaritalStatus] = useState<MaritalStatus>('প্রকাশে অনিচ্ছুক');
  const [marriageYear, setMarriageYear] = useState('');
  const [childrenCount, setChildrenCount] = useState(0);
  const [sonsCount, setSonsCount] = useState(0);
  const [daughtersCount, setDaughtersCount] = useState(0);

  // Step 5: Additional + Privacy Controls + Consent
  const [website, setWebsite] = useState('');
  const [facebook, setFacebook] = useState('');
  const [otherSocial, setOtherSocial] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [showPhoneToMembers, setShowPhoneToMembers] = useState(true);
  const [showAddressToMembers, setShowAddressToMembers] = useState(false);
  const [showFamilyToMembers, setShowFamilyToMembers] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);

  // Hydrate form if editing existing profile
  useEffect(() => {
    if (myMember) {
      setFullName(myMember.fullName || '');
      setPhotoUrl(myMember.photoUrl || '');
      setDistrict(myMember.district || 'ঢাকা');
      setUpazila(myMember.upazila || '');
      setProfession(myMember.profession || '');
      setProfessionCategory(myMember.professionCategory || 'শিক্ষকতা');
      setWorkplace(myMember.workplace || '');
      setStudyInstitution(myMember.studyInstitution || '');
      setCurrentArea(myMember.currentArea || '');
      setJamaats(myMember.jamaats?.length ? myMember.jamaats : ['দাওরায়ে হাদিস']);
      setStudyStartYear(myMember.studyStartYear || '');
      setStudyEndYear(myMember.studyEndYear || '২০২৩');
      setLastJamaat(myMember.lastJamaat || 'দাওরায়ে হাদিস');
      setCompletedDawra(Boolean(myMember.completedDawra));
      setConnectedToMadrasah(Boolean(myMember.connectedToMadrasah));
      setBio(myMember.bio || '');
      setSkillsText((myMember.skills || []).join(', '));
      setWebsite(myMember.website || '');
      setFacebook(myMember.facebook || '');
      setOtherSocial(myMember.otherSocial || '');
      setShareBirthdayGreeting(Boolean(myMember.birthDatePublic));
      setShowPhoneToMembers(Boolean(myMember.showPhoneToMembers));
      setShowAddressToMembers(Boolean(myMember.showAddressToMembers));
      setShowFamilyToMembers(Boolean(myMember.showFamilyToMembers));
    } else if (user) {
      setFullName((prev) => prev || user.displayName || '');
      setEmail((prev) => prev || user.email || '');
      setPhotoUrl((prev) => prev || user.photoURL || '');
    }
  }, [myMember, user]);

  useEffect(() => {
    if (myPrivateInfo) {
      setFatherName(myPrivateInfo.fatherName || '');
      setMotherName(myPrivateInfo.motherName || '');
      setBirthDate(myPrivateInfo.birthDate || '');
      setPhone(myPrivateInfo.phone || '');
      setAltPhone(myPrivateInfo.altPhone || '');
      setEmail(myPrivateInfo.email || user?.email || '');
      setPresentAddress(myPrivateInfo.presentAddress || '');
      setPermanentAddress(myPrivateInfo.permanentAddress || '');
      setMaritalStatus(myPrivateInfo.maritalStatus || 'প্রকাশে অনিচ্ছুক');
      setMarriageYear(myPrivateInfo.marriageYear || '');
      setChildrenCount(myPrivateInfo.childrenCount || 0);
      setSonsCount(myPrivateInfo.sonsCount || 0);
      setDaughtersCount(myPrivateInfo.daughtersCount || 0);
      setConsentGiven(Boolean(myPrivateInfo.consentGiven));
    }
  }, [myPrivateInfo, user]);

  useEffect(() => {
    if (myEducation) {
      setFavoriteUstads(myEducation.favoriteUstads || '');
      setAcademicNotes(myEducation.academicNotes || '');
    }
  }, [myEducation]);

  const toggleJamaat = (j: string) => {
    setJamaats((prev) => (prev.includes(j) ? prev.filter((item) => item !== j) : [...prev, j]));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageFile(file, 480, 0.8);
      setPhotoUrl(dataUrl);
      pushToast('success', 'প্রোফাইল ছবি সফলভাবে যুক্ত হয়েছে।');
    } catch (err) {
      pushToast('error', err instanceof Error ? err.message : 'ছবি আপলোড করতে সমস্যা হয়েছে।');
    }
  };

  const validateCurrentStep = (): boolean => {
    if (step === 0) {
      if (fullName.trim().length < 2) {
        pushToast('error', 'অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
        return false;
      }
      if (fatherName.trim().length < 2) {
        pushToast('error', 'অনুগ্রহ করে পিতার নাম লিখুন।');
        return false;
      }
      if (phone.trim().length < 6) {
        pushToast('error', 'অনুগ্রহ করে সঠিক মোবাইল নম্বর লিখুন।');
        return false;
      }
      if (!district) {
        pushToast('error', 'অনুগ্রহ করে আপনার জেলা নির্বাচন করুন।');
        return false;
      }
    }
    if (step === 1) {
      if (jamaats.length === 0) {
        pushToast('error', 'অনুগ্রহ করে কমপক্ষে একটি অধ্যয়নকৃত জামাত নির্বাচন করুন।');
        return false;
      }
      if (!lastJamaat) {
        pushToast('error', 'অনুগ্রহ করে সর্বশেষ অধ্যয়নরত জামাত নির্বাচন করুন।');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!consentGiven) {
      pushToast('error', 'নিবন্ধন সম্পন্ন করতে গোপনীয়তা নীতিমালা ও তথ্য সংরক্ষণের সম্মতি প্রদান করুন।');
      return;
    }
    if (!validateCurrentStep()) return;

    setSubmitting(true);
    try {
      const skills = skillsText
        .split(/[,،]+/)
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 15);

      await saveMemberProfile(
        {
          fullName,
          photoUrl,
          profession,
          professionCategory,
          workplace,
          studyInstitution,
          currentArea,
          district,
          upazila,
          jamaats,
          studyStartYear,
          studyEndYear,
          lastJamaat,
          completedDawra,
          connectedToMadrasah,
          bio,
          skills,
          website,
          facebook,
          otherSocial,
          birthDatePublic: shareBirthdayGreeting && birthDate ? birthDate : '',
          showPhoneToMembers,
          showAddressToMembers,
          showFamilyToMembers,
        },
        {
          fatherName,
          motherName,
          birthDate,
          phone,
          altPhone,
          email: email || user.email || '',
          presentAddress,
          permanentAddress,
          maritalStatus,
          marriageYear,
          childrenCount,
          sonsCount,
          daughtersCount,
          consentGiven: true,
        },
        {
          favoriteUstads,
          academicNotes,
        }
      );
      onComplete();
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="bg-white border border-[#E4DFD2] rounded-xl p-8 sm:p-10 text-center space-y-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#0D4A32] text-[#E5C987] flex items-center justify-center">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0B3B28]">
            সদস্য নিবন্ধন ও প্রোফাইল তৈরি
          </h1>
          <p className="text-sm text-[#4A5951] max-w-lg mx-auto leading-relaxed">
            জামেউল উলুম ২০২২-২৩ ঈ. শিক্ষাবর্ষের ফারেগিন ও সহপাঠী ভাই হিসেবে নিবন্ধন করতে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন। এরপর ৫টি সহজ ধাপে আপনার তথ্য যুক্ত করতে পারবেন।
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onOpenAuth}
              className="px-6 py-3 rounded-lg bg-[#0D4A32] text-white text-sm font-semibold hover:bg-[#093624] transition-colors cursor-pointer"
            >
              লগইন করে নিবন্ধন শুরু করুন
            </button>
            <button
              type="button"
              onClick={onOpenRegistrationQr}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg border border-[#D8D1C1] text-[#0B3B28] text-sm font-medium hover:bg-[#F3F0E7] transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4" />
              নিবন্ধন কিউআর কোড
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD2]">
        <div>
          <p className="text-xs font-medium text-[#8B641E] mb-1">
            {myMember ? 'প্রোফাইল হালনাগাদ' : 'নতুন সদস্য নিবন্ধন ফর্ম'}
          </p>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold text-[#0B3B28]">
            {myMember ? 'আমার প্রোফাইল সম্পাদনা করুন' : '৫ ধাপে ফারেগিন সদস্য নিবন্ধন'}
          </h1>
          <p className="text-xs text-[#4A5951] mt-1">
            আপনার ব্যক্তিগত ও পারিবারিক তথ্যের গোপনীয়তা সম্পূর্ণ আপনার নিয়ন্ত্রণে থাকবে।
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenRegistrationQr}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D8D1C1] bg-white text-xs font-semibold text-[#0B3B28] hover:bg-[#F3F0E7] transition-colors self-start cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-[#8B641E]" />
          নিবন্ধন লিংক ও কিউআর কোড
        </button>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {STEPS.map((label, idx) => {
          const active = idx === step;
          const completed = idx < step;
          return (
            <button
              key={label}
              type="button"
              onClick={() => {
                if (idx <= step || validateCurrentStep()) setStep(idx);
              }}
              className={`px-3 py-2.5 rounded-lg text-xs font-medium text-left border transition-colors cursor-pointer ${
                active
                  ? 'bg-[#0D4A32] text-white border-[#0D4A32]'
                  : completed
                    ? 'bg-[#EFECE3] text-[#0B3B28] border-[#D8D1C1]'
                    : 'bg-white text-[#5E6D65] border-[#E4DFD2]'
              }`}
            >
              <span className="flex items-center gap-1.5">
                {completed && <Check className="w-3.5 h-3.5 shrink-0 text-[#0D4A32]" />}
                <span className="truncate">{label}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="bg-white border border-[#E4DFD2] rounded-xl p-6 sm:p-8 space-y-6">
        {/* STEP 1: PERSONAL IDENTITY */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="font-editorial text-xl font-bold text-[#0B3B28] pb-3 border-b border-[#F0ECE1]">
              প্রথম ধাপ: ব্যক্তিগত পরিচয়
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-4 rounded-xl bg-[#F8F6F0] border border-[#E4DFD2]">
              <Avatar name={fullName || 'সদস্য'} src={photoUrl} size="lg" />
              <div className="space-y-1.5">
                <p className="text-sm font-semibold text-[#0B3B28]">প্রোফাইল ছবি আপলোড করুন</p>
                <p className="text-xs text-[#5E6D65]">JPG বা PNG ছবি দিন; স্বয়ংক্রিয়ভাবে অপ্টিমাইজ হয়ে সংরক্ষিত হবে।</p>
                <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-[#D8D1C1] text-xs font-semibold text-[#0B3B28] hover:bg-[#EFECE3] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  ছবি নির্বাচন করুন
                  <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="যেমন: মাওলানা মুহাম্মদ আবদুল্লাহ"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">পিতার নাম *</label>
                <input
                  type="text"
                  required
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="পিতার পূর্ণ নাম"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">মাতার নাম (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="মাতার নাম (সম্পূর্ণ গোপন থাকবে)"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">জন্মতারিখ (ঐচ্ছিক)</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
                <label className="flex items-center gap-2 mt-1.5 text-xs text-[#4A5951] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shareBirthdayGreeting}
                    onChange={(e) => setShareBirthdayGreeting(e.target.checked)}
                    className="accent-[#0D4A32]"
                  />
                  জন্মদিনের শুভেচ্ছার জন্য তারিখটি প্রকাশে সম্মতি দিচ্ছি
                </label>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">মোবাইল নম্বর *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="০১৭XXXXXXXX"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">বিকল্প মোবাইল নম্বর (ঐচ্ছিক)</label>
                <input
                  type="tel"
                  value={altPhone}
                  onChange={(e) => setAltPhone(e.target.value)}
                  placeholder="বিকল্প / হোয়াটসঅ্যাপ নম্বর"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">ইমেইল (ঐচ্ছিক)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">পেশাগত পরিচয়</label>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="যেমন: মুহাদ্দিস / খতিব / উদ্যোক্তা / লেখক"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">জেলা *</label>
                <select
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                >
                  {BANGLADESH_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">উপজেলা / থানা</label>
                <input
                  type="text"
                  value={upazila}
                  onChange={(e) => setUpazila(e.target.value)}
                  placeholder="আপনার উপজেলা বা থানার নাম"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#17211C] mb-1">বর্তমান ঠিকানা</label>
                <input
                  type="text"
                  value={presentAddress}
                  onChange={(e) => setPresentAddress(e.target.value)}
                  placeholder="বাসা/প্রতিষ্ঠান, রোড, এলাকা, জেলা"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#17211C] mb-1">স্থায়ী ঠিকানা</label>
                <input
                  type="text"
                  value={permanentAddress}
                  onChange={(e) => setPermanentAddress(e.target.value)}
                  placeholder="গ্রাম, ডাকঘর, উপজেলা, জেলা"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: MADRASAH EDUCATION */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="font-editorial text-xl font-bold text-[#0B3B28] pb-3 border-b border-[#F0ECE1]">
              দ্বিতীয় ধাপ: মাদরাসায় অধ্যয়নের তথ্য
            </h2>

            <div>
              <p className="text-xs font-semibold text-[#17211C] mb-2">
                জামেউল উলুম মাদরাসায় কোন কোন জামাতে পড়েছেন? (একাধিক নির্বাচন করা যাবে) *
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {JAMAAT_LIST.map((j, index) => {
                  const selected = jamaats.includes(j);
                  return (
                    <button
                      key={j}
                      type="button"
                      onClick={() => toggleJamaat(j)}
                      className={`px-3 py-2.5 rounded-lg text-xs font-medium border text-left transition-colors cursor-pointer ${
                        selected
                          ? 'bg-[#0D4A32] text-white border-[#0D4A32]'
                          : 'bg-[#FCFBF8] text-[#17211C] border-[#D8D1C1] hover:border-[#0D4A32]'
                      }`}
                    >
                      {toBengaliNumber(index + 1)}. {j}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">শুরুর শিক্ষাবর্ষ</label>
                <input
                  type="text"
                  value={studyStartYear}
                  onChange={(e) => setStudyStartYear(e.target.value)}
                  placeholder="যেমন: ২০১৬"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">সমাপ্তির শিক্ষাবর্ষ</label>
                <input
                  type="text"
                  value={studyEndYear}
                  onChange={(e) => setStudyEndYear(e.target.value)}
                  placeholder="যেমন: ২০২৩"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">সর্বশেষ অধ্যয়নরত জামাত *</label>
                <select
                  value={lastJamaat}
                  onChange={(e) => setLastJamaat(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                >
                  {JAMAAT_LIST.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <label className="flex items-start gap-3 p-4 rounded-lg border border-[#E4DFD2] bg-[#FCFBF8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={completedDawra}
                  onChange={(e) => setCompletedDawra(e.target.checked)}
                  className="mt-1 accent-[#0D4A32]"
                />
                <div>
                  <p className="text-sm font-semibold text-[#0B3B28]">দাওরায়ে হাদিস সম্পন্ন করেছেন</p>
                  <p className="text-xs text-[#5E6D65]">
                    দাওরার আগেই চলে গিয়ে থাকলে এটি আনচেক রাখুন এবং উপরের সর্বশেষ জামাত নির্বাচন করুন।
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 rounded-lg border border-[#E4DFD2] bg-[#FCFBF8] cursor-pointer">
                <input
                  type="checkbox"
                  checked={connectedToMadrasah}
                  onChange={(e) => setConnectedToMadrasah(e.target.checked)}
                  className="mt-1 accent-[#0D4A32]"
                />
                <div>
                  <p className="text-sm font-semibold text-[#0B3B28]">বর্তমানে মাদরাসার সঙ্গে সম্পর্কিত</p>
                  <p className="text-xs text-[#5E6D65]">শিক্ষকতা, উচ্চতর বিভাগ বা প্রশাসনিকভাবে যুক্ত থাকলে টিক দিন।</p>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">প্রিয় উস্তাদদের নাম (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={favoriteUstads}
                  onChange={(e) => setFavoriteUstads(e.target.value)}
                  placeholder="মুহতারাম উস্তাদদের নাম..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">অধ্যয়নকালীন বিশেষ তথ্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={academicNotes}
                  onChange={(e) => setAcademicNotes(e.target.value)}
                  placeholder="যেমন: বোর্ড মেধাতালিকা বা কক্ষ নম্বর"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: CURRENT STATUS */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="font-editorial text-xl font-bold text-[#0B3B28] pb-3 border-b border-[#F0ECE1]">
              তৃতীয় ধাপ: বর্তমান অবস্থা ও কর্মজীবন
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">পেশার ধরন</label>
                <select
                  value={professionCategory}
                  onChange={(e) => setProfessionCategory(e.target.value as ProfessionCategory)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                >
                  {PROFESSION_CATEGORIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">বর্তমানে কোন এলাকায় বসবাস করছেন?</label>
                <input
                  type="text"
                  value={currentArea}
                  onChange={(e) => setCurrentArea(e.target.value)}
                  placeholder="যেমন: মিরপুর-১০, ঢাকা"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">কোথায় কর্মরত? (মাদরাসা/মসজিদ/প্রতিষ্ঠান)</label>
                <input
                  type="text"
                  value={workplace}
                  onChange={(e) => setWorkplace(e.target.value)}
                  placeholder="কর্মস্থলের নাম ও অবস্থান"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">বর্তমানে কোনো প্রতিষ্ঠানে পড়াশোনা করছেন?</label>
                <input
                  type="text"
                  value={studyInstitution}
                  onChange={(e) => setStudyInstitution(e.target.value)}
                  placeholder="যেমন: ইফতা / তাফসির / বিশ্ববিদ্যালয় (ঐচ্ছিক)"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#17211C] mb-1">নিজের সম্পর্কে সংক্ষিপ্ত পরিচিতি</label>
                <textarea
                  rows={4}
                  maxLength={1200}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="আপনার বর্তমান কর্মব্যস্ততা, আগ্রহের ক্ষেত্র এবং সহপাঠীদের উদ্দেশ্যে কিছু কথা লিখুন..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: FAMILY INFORMATION (OPTIONAL) */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="font-editorial text-xl font-bold text-[#0B3B28] pb-3 border-b border-[#F0ECE1]">
              চতুর্থ ধাপ: পারিবারিক তথ্য (সম্পূর্ণ ঐচ্ছিক)
            </h2>
            <p className="text-xs text-[#4A5951]">
              এই অংশের সকল তথ্য সম্পূর্ণ ঐচ্ছিক। আপনি চাইলে এগুলো গোপন রাখতে পারবেন; পরের ধাপে এর দৃশ্যমানতা নিয়ন্ত্রণ করা যাবে।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">বৈবাহিক অবস্থা</label>
                <select
                  value={maritalStatus}
                  onChange={(e) => setMaritalStatus(e.target.value as MaritalStatus)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                >
                  <option value="প্রকাশে অনিচ্ছুক">প্রকাশে অনিচ্ছুক</option>
                  <option value="অবিবাহিত">অবিবাহিত</option>
                  <option value="বিবাহিত">বিবাহিত</option>
                </select>
              </div>

              {maritalStatus === 'বিবাহিত' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#17211C] mb-1">বিয়ের সাল (ঐচ্ছিক)</label>
                    <input
                      type="text"
                      value={marriageYear}
                      onChange={(e) => setMarriageYear(e.target.value)}
                      placeholder="যেমন: ২০২৪"
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#17211C] mb-1">মোট সন্তানের সংখ্যা</label>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={childrenCount}
                      onChange={(e) => setChildrenCount(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#17211C] mb-1">ছেলে সন্তান</label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={sonsCount}
                        onChange={(e) => setSonsCount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#17211C] mb-1">মেয়ে সন্তান</label>
                      <input
                        type="number"
                        min={0}
                        max={20}
                        value={daughtersCount}
                        onChange={(e) => setDaughtersCount(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: EXTRA INFO, PRIVACY CONTROLS & CONSENT */}
        {step === 4 && (
          <div className="space-y-6">
            <h2 className="font-editorial text-xl font-bold text-[#0B3B28] pb-3 border-b border-[#F0ECE1]">
              পঞ্চম ধাপ: অতিরিক্ত তথ্য, গোপনীয়তা ও সম্মতি
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">ব্যক্তিগত ওয়েবসাইট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">ফেসবুক প্রোফাইল লিংক (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">অন্যান্য সামাজিক যোগাযোগমাধ্যম</label>
                <input
                  type="text"
                  value={otherSocial}
                  onChange={(e) => setOtherSocial(e.target.value)}
                  placeholder="ইউটিউব / লিংকডইন / টেলিগ্রাম লিংক"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">বিশেষ দক্ষতা (কমা দিয়ে লিখুন)</label>
                <input
                  type="text"
                  value={skillsText}
                  onChange={(e) => setSkillsText(e.target.value)}
                  placeholder="যেমন: আরবি অনুবাদ, গ্রাফিক ডিজাইন, হাদিস পাঠদান"
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg focus:border-[#0D4A32] focus:outline-none"
                />
              </div>
            </div>

            {/* Individual Privacy Controls */}
            <div className="p-5 rounded-xl bg-[#F8F6F0] border border-[#E4DFD2] space-y-3">
              <p className="text-sm font-bold text-[#0B3B28]">গোপনীয়তা নিয়ন্ত্রণ (শুধুমাত্র অনুমোদিত সদস্যদের জন্য)</p>
              <label className="flex items-center gap-2.5 text-xs text-[#17211C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPhoneToMembers}
                  onChange={(e) => setShowPhoneToMembers(e.target.checked)}
                  className="accent-[#0D4A32]"
                />
                অনুমোদিত ব্যাচ সদস্যদের কাছে আমার মোবাইল নম্বর প্রদর্শন করুন
              </label>
              <label className="flex items-center gap-2.5 text-xs text-[#17211C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAddressToMembers}
                  onChange={(e) => setShowAddressToMembers(e.target.checked)}
                  className="accent-[#0D4A32]"
                />
                অনুমোদিত ব্যাচ সদস্যদের কাছে আমার বর্তমান ঠিকানা প্রদর্শন করুন
              </label>
              <label className="flex items-center gap-2.5 text-xs text-[#17211C] cursor-pointer">
                <input
                  type="checkbox"
                  checked={showFamilyToMembers}
                  onChange={(e) => setShowFamilyToMembers(e.target.checked)}
                  className="accent-[#0D4A32]"
                />
                অনুমোদিত ব্যাচ সদস্যদের কাছে আমার পারিবারিক তথ্য প্রদর্শন করুন
              </label>
            </div>

            {/* Mandatory Consent */}
            <label className="flex items-start gap-3 p-4 rounded-xl border border-[#DFD5BE] bg-white cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                className="mt-1 accent-[#0D4A32]"
              />
              <span className="text-xs text-[#17211C] leading-relaxed">
                আমি সজ্ঞানে প্রত্যয়ন করছি যে উপরে প্রদত্ত সকল তথ্য সঠিক এবং আমি জামেউল উলুম ২০২২-২৩ শিক্ষাবর্ষের অ্যালামনাই ডেটাবেজে আমার নির্ধারিত গোপনীয়তা সেটিংস অনুযায়ী প্রোফাইল সংরক্ষণের সম্মতি প্রদান করছি।
              </span>
            </label>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-6 border-t border-[#F0ECE1] flex items-center justify-between">
          <button
            type="button"
            disabled={step === 0}
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#D8D1C1] text-sm font-medium text-[#0B3B28] hover:bg-[#F3F0E7] disabled:opacity-40 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            পূর্ববর্তী ধাপ
          </button>

          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                if (validateCurrentStep()) setStep((s) => Math.min(STEPS.length - 1, s + 1));
              }}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#0D4A32] text-white text-sm font-semibold hover:bg-[#093624] transition-colors cursor-pointer"
            >
              পরবর্তী ধাপ
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#0D4A32] text-white text-sm font-semibold hover:bg-[#093624] disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {submitting ? 'সংরক্ষণ হচ্ছে...' : myMember ? 'পরিবর্তন সংরক্ষণ করুন' : 'নিবন্ধন জমা দিন'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
