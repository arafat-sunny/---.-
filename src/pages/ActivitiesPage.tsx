import React, { useEffect, useState } from 'react';
import {
  Bell,
  Calendar,
  Check,
  CheckCircle2,
  Handshake,
  MapPin,
  MessageSquare,
  Pin,
  Plus,
  Send,
  Users,
  X,
} from 'lucide-react';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';
import { CAMPUS_PHOTOS, COLLABORATION_TYPES } from '../constants/bengali';
import { useAlumni } from '../context/AlumniContext';
import { db } from '../firebase';
import { CollaborationPost, CollaborationReply, CollaborationType, EventItem } from '../types';
import { formatBengaliDate, toBengaliNumber } from '../utils/formatters';
import { SafeImage } from '../components/CommonUI';

const EventCard: React.FC<{ event: EventItem; onOpenAuth: () => void }> = ({
  event,
  onOpenAuth,
}) => {
  const { user, isApprovedMember, toggleEventRsvp, pushToast } = useAlumni();
  const [registered, setRegistered] = useState(false);
  const [rsvpModal, setRsvpModal] = useState(false);
  const [attendance, setAttendance] = useState<'confirmed' | 'interested'>('confirmed');
  const [guestsCount, setGuestsCount] = useState(1);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (event.isDemo || !user) {
      setRegistered(false);
      return;
    }
    const unsub = onSnapshot(
      doc(db, 'events', event.id, 'rsvps', user.uid),
      (snap) => setRegistered(snap.exists()),
      () => setRegistered(false)
    );
    return () => unsub();
  }, [event.id, event.isDemo, user]);

  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await toggleEventRsvp(event, false, { attendance, guestsCount, note });
      setRsvpModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="bg-white border border-[#E4DFD2] rounded-xl overflow-hidden flex flex-col md:flex-row">
      <div className="md:w-72 shrink-0 bg-[#0B3B28]">
        <SafeImage
          src={event.bannerUrl || CAMPUS_PHOTOS.courtyard}
          alt={event.title}
          className="w-full h-full object-cover min-h-[200px]"
        />
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-xs font-medium text-[#8B641E]">
            {event.isPast ? 'পূর্ববর্তী অনুষ্ঠানের স্মৃতি' : 'আসন্ন অনুষ্ঠান ও পুনর্মিলনী'}
            {event.isDemo ? ' · নমুনা অনুষ্ঠান' : ''}
          </p>
          <h3 className="font-editorial text-xl font-bold text-[#0B3B28] mt-1">{event.title}</h3>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#4A5951] mt-2">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#0D4A32]" />
              {event.date} {event.time ? `· ${event.time}` : ''}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0D4A32]" />
              {event.location}
            </span>
          </div>
          <p className="text-sm text-[#4A5951] leading-relaxed mt-3">{event.description}</p>
        </div>

        <div className="pt-4 border-t border-[#F0ECE1] flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#5E6D65] tabular-nums">
            <Users className="w-4 h-4 text-[#8B641E]" />
            অংশগ্রহণ নিশ্চিত করেছেন: {toBengaliNumber(event.rsvpCount)} জন
          </span>

          {!event.isPast && (
            <button
              type="button"
              onClick={() => {
                if (event.isDemo) {
                  toggleEventRsvp(event, false);
                  return;
                }
                if (!user) {
                  onOpenAuth();
                  return;
                }
                if (!isApprovedMember) {
                  pushToast('info', 'অনুষ্ঠানে নিবন্ধনের জন্য আপনার সদস্যপদ অনুমোদিত হতে হবে।');
                  return;
                }
                if (registered) {
                  toggleEventRsvp(event, true);
                } else {
                  setRsvpModal(true);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                registered
                  ? 'bg-[#EFECE3] text-[#0B3B28] border border-[#0D4A32]'
                  : 'bg-[#0D4A32] text-white hover:bg-[#093624]'
              }`}
            >
              {registered ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  উপস্থিতি নিশ্চিত (বাতিল করুন)
                </>
              ) : (
                'উপস্থিতি নিশ্চিত করুন'
              )}
            </button>
          )}
        </div>
      </div>

      {rsvpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4DFD2] rounded-xl max-w-md w-full p-6 relative">
            <button
              type="button"
              onClick={() => setRsvpModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-[#4A5951] hover:bg-[#F3F0E7] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h4 className="font-editorial text-lg font-bold text-[#0B3B28] mb-1">
              অনুষ্ঠানে অংশগ্রহণের নিবন্ধন
            </h4>
            <p className="text-xs text-[#5E6D65] mb-4">{event.title}</p>
            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">অংশগ্রহণের অবস্থা</label>
                <select
                  value={attendance}
                  onChange={(e) => setAttendance(e.target.value as 'confirmed' | 'interested')}
                  className="w-full px-3 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                >
                  <option value="confirmed">ইনশাআল্লাহ উপস্থিত থাকব</option>
                  <option value="interested">অংশগ্রহণে আগ্রহী</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">মোট অংশগ্রহণকারী (নিজেসহ)</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">বিশেষ কোনো মন্তব্য (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="যেমন: মিরপুর থেকে আসছি..."
                  className="w-full px-3 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRsvpModal(false)}
                  className="px-4 py-2 text-xs text-[#4A5951] rounded-lg hover:bg-[#F3F0E7] cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] cursor-pointer"
                >
                  {saving ? 'সংরক্ষণ হচ্ছে...' : 'নিশ্চিত করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </article>
  );
};

const CollabCard: React.FC<{ post: CollaborationPost }> = ({ post }) => {
  const { user, isApprovedMember, isAdmin, replyCollaboration, resolveCollaboration, pushToast } =
    useAlumni();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<CollaborationReply[]>([]);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    if (post.isDemo || !showReplies || !user) return;
    const unsub = onSnapshot(
      query(collection(db, 'collaborations', post.id, 'replies'), where('collaborationId', '==', post.id)),
      (snap) => {
        setReplies(
          snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CollaborationReply, 'id'>) }))
        );
      },
      () => setReplies([])
    );
    return () => unsub();
  }, [post.id, post.isDemo, showReplies, user]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    if (post.isDemo) {
      pushToast('info', 'এটি একটি নমুনা পোস্ট। নতুন পোস্টে সরাসরি সহযোগিতার বার্তা দেওয়া যাবে।');
      return;
    }
    await replyCollaboration(post.id, replyText.trim());
    setReplyText('');
  };

  return (
    <article className="bg-white border border-[#E4DFD2] rounded-xl p-6 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-[#8B641E] font-medium">
            {post.type} · {post.authorName}
            {post.authorDistrict ? ` (${post.authorDistrict})` : ''} · {formatBengaliDate(post.createdAt)}
            {post.isDemo ? ' · নমুনা' : ''}
          </p>
          <h3 className="font-editorial text-lg font-bold text-[#0B3B28] mt-1">{post.title}</h3>
        </div>
        <span className="text-xs font-medium text-[#0D4A32] shrink-0">
          {post.status === 'resolved' ? 'সম্পন্ন' : 'চলমান'}
        </span>
      </div>

      <p className="text-sm text-[#3A4841] leading-relaxed">{post.content}</p>

      {post.skills.length > 0 && (
        <p className="text-xs text-[#5E6D65]">সম্পর্কিত দক্ষতা: {post.skills.join(' · ')}</p>
      )}
      {post.contactMethod && (
        <p className="text-xs text-[#4A5951]">যোগাযোগের মাধ্যম: {post.contactMethod}</p>
      )}

      <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-between gap-3 text-xs">
        <button
          type="button"
          onClick={() => setShowReplies((v) => !v)}
          className="inline-flex items-center gap-1.5 font-semibold text-[#0D4A32] hover:text-[#8B641E] cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          সহযোগিতা / মতামত দিন
        </button>

        {!post.isDemo &&
          post.status === 'open' &&
          user &&
          (user.uid === post.authorId || isAdmin) && (
            <button
              type="button"
              onClick={() => resolveCollaboration(post.id)}
              className="inline-flex items-center gap-1 text-[#0D4A32] hover:underline cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              সম্পন্ন হিসেবে চিহ্নিত করুন
            </button>
          )}
      </div>

      {showReplies && (
        <div className="pt-3 border-t border-[#F0ECE1] space-y-3">
          {replies.map((r) => (
            <div key={r.id} className="bg-[#F8F6F0] rounded-lg px-3.5 py-2.5 text-xs">
              <p className="font-semibold text-[#0B3B28]">
                {r.authorName} <span className="font-normal text-[#6B7A72]">· {formatBengaliDate(r.createdAt)}</span>
              </p>
              <p className="text-[#3A4841] mt-1">{r.message}</p>
            </div>
          ))}

          {isApprovedMember ? (
            <form onSubmit={handleReply} className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="সহযোগিতার প্রস্তাব বা পরামর্শ লিখুন..."
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
          ) : (
            <p className="text-xs text-[#5E6D65]">মতামত জানাতে অনুমোদিত সদস্য হিসেবে লগইন করুন।</p>
          )}
        </div>
      )}
    </article>
  );
};

export const ActivitiesPage: React.FC<{ onOpenAuth: () => void }> = ({ onOpenAuth }) => {
  const { announcements, events, collaborations, user, isApprovedMember, createCollaboration, pushToast } =
    useAlumni();

  const [tab, setTab] = useState<'notices' | 'events' | 'collaboration'>('notices');
  const [collabModal, setCollabModal] = useState(false);

  // New Collaboration Form
  const [type, setType] = useState<CollaborationType>('সহযোগিতার অনুরোধ');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [skillsText, setSkillsText] = useState('');
  const [contactMethod, setContactMethod] = useState('');
  const [saving, setSaving] = useState(false);

  const sortedAnnouncements = [...announcements].sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

  const handleCreateCollab = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createCollaboration({
        type,
        title,
        content,
        skills: skillsText
          .split(/[,،]+/)
          .map((s) => s.trim())
          .filter(Boolean),
        contactMethod,
      });
      setTitle('');
      setContent('');
      setSkillsText('');
      setContactMethod('');
      setCollabModal(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E4DFD2]">
        <div>
          <p className="text-xs font-medium text-[#8B641E] mb-1">কমিউনিটি কার্যক্রম ও পারস্পরিক সহায়তা</p>
          <h1 className="font-editorial text-3xl sm:text-4xl font-bold text-[#0B3B28]">
            ঘোষণা, অনুষ্ঠান ও সহযোগিতা
          </h1>
          <p className="text-sm text-[#4A5951] mt-1">
            ব্যাচের গুরুত্বপূর্ণ নোটিশ, পুনর্মিলনী নিবন্ধন এবং ভাইদের পারস্পরিক সহযোগিতার মঞ্চ।
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#EFECE3] rounded-lg self-start">
          <button
            type="button"
            onClick={() => setTab('notices')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
              tab === 'notices' ? 'bg-white text-[#0B3B28] shadow-sm' : 'text-[#4A5951]'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            নোটিশ বোর্ড ({toBengaliNumber(announcements.length)})
          </button>
          <button
            type="button"
            onClick={() => setTab('events')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
              tab === 'events' ? 'bg-white text-[#0B3B28] shadow-sm' : 'text-[#4A5951]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            অনুষ্ঠান ({toBengaliNumber(events.length)})
          </button>
          <button
            type="button"
            onClick={() => setTab('collaboration')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md cursor-pointer whitespace-nowrap ${
              tab === 'collaboration' ? 'bg-white text-[#0B3B28] shadow-sm' : 'text-[#4A5951]'
            }`}
          >
            <Handshake className="w-3.5 h-3.5" />
            সহযোগিতা ({toBengaliNumber(collaborations.length)})
          </button>
        </div>
      </div>

      {/* TAB 1: ANNOUNCEMENTS */}
      {tab === 'notices' && (
        <div className="space-y-4">
          {sortedAnnouncements.map((ann) => (
            <article
              key={ann.id}
              className={`bg-white border rounded-xl p-6 space-y-2.5 ${
                ann.isUrgent ? 'border-[#C9A24D]' : 'border-[#E4DFD2]'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#8B641E] font-medium">
                {ann.isPinned && <Pin className="w-3.5 h-3.5" />}
                <span>{ann.category}</span>
                {ann.isUrgent && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-rose-700 font-semibold">জরুরি বিজ্ঞপ্তি</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span className="text-[#5E6D65]">{formatBengaliDate(ann.createdAt)}</span>
                <span aria-hidden="true">·</span>
                <span className="text-[#5E6D65]">{ann.authorName}</span>
                {ann.isDemo && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#5E6D65]">নমুনা</span>
                  </>
                )}
              </div>
              <h2 className="font-editorial text-xl font-bold text-[#0B3B28]">{ann.title}</h2>
              <p className="text-sm text-[#3A4841] leading-relaxed whitespace-pre-line">{ann.content}</p>
            </article>
          ))}
        </div>
      )}

      {/* TAB 2: EVENTS */}
      {tab === 'events' && (
        <div className="space-y-6">
          {events.map((ev) => (
            <EventCard key={ev.id} event={ev} onOpenAuth={onOpenAuth} />
          ))}
        </div>
      )}

      {/* TAB 3: COLLABORATION & MUTUAL AID */}
      {tab === 'collaboration' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#E4DFD2] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-editorial text-lg font-bold text-[#0B3B28]">
                পারস্পরিক সহযোগিতা, দক্ষতা ও কাজের সুযোগ
              </h2>
              <p className="text-xs text-[#4A5951] mt-0.5">
                চাকরি বা শিক্ষকতার সুযোগ শেয়ার করুন, নিজের দক্ষতা জানান, অথবা যেকোনো বিষয়ে ভাইদের পরামর্শ নিন।
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (!user) onOpenAuth();
                else if (!isApprovedMember) pushToast('info', 'পোস্ট করতে অনুমোদিত সদস্য হতে হবে।');
                else setCollabModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] whitespace-nowrap self-start cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              নতুন পোস্ট করুন
            </button>
          </div>

          {collaborations.map((post) => (
            <CollabCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* New Collaboration Modal */}
      {collabModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4DFD2] rounded-xl max-w-lg w-full p-6 relative">
            <button
              type="button"
              onClick={() => setCollabModal(false)}
              className="absolute top-4 right-4 p-2 rounded-lg text-[#4A5951] hover:bg-[#F3F0E7] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-editorial text-xl font-bold text-[#0B3B28] mb-4">
              সহযোগিতা বা পরামর্শের পোস্ট লিখুন
            </h3>
            <form onSubmit={handleCreateCollab} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">পোস্টের ধরন</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as CollaborationType)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                >
                  {COLLABORATION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">শিরোনাম *</label>
                <input
                  type="text"
                  required
                  minLength={3}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17211C] mb-1">বিস্তারিত বিবরণ *</label>
                <textarea
                  required
                  minLength={10}
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">দক্ষতা (কমা দিয়ে)</label>
                  <input
                    type="text"
                    value={skillsText}
                    onChange={(e) => setSkillsText(e.target.value)}
                    placeholder="যেমন: শিক্ষকতা, ডিজাইন"
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211C] mb-1">যোগাযোগের মাধ্যম</label>
                  <input
                    type="text"
                    value={contactMethod}
                    onChange={(e) => setContactMethod(e.target.value)}
                    placeholder="মন্তব্যে বা ফোনে যোগাযোগ"
                    className="w-full px-3.5 py-2 text-sm bg-[#FCFBF8] border border-[#D8D1C1] rounded-lg"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCollabModal(false)}
                  className="px-4 py-2 text-xs text-[#4A5951] rounded-lg hover:bg-[#F3F0E7] cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-lg bg-[#0D4A32] text-white text-xs font-semibold hover:bg-[#093624] cursor-pointer"
                >
                  {saving ? 'প্রকাশ হচ্ছে...' : 'প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
