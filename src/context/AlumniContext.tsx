import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import {
  BOOTSTRAPPED_ADMIN_EMAIL,
  OperationType,
  auth,
  db,
  googleProvider,
  handleFirestoreError,
} from '../firebase';
import { DEFAULT_SITE_SETTINGS } from '../constants/bengali';
import {
  DEMO_ANNOUNCEMENTS,
  DEMO_BOOKS,
  DEMO_BUSINESSES,
  DEMO_COLLABORATIONS,
  DEMO_EVENTS,
  DEMO_MEMBERS,
  DEMO_MEMORIES,
} from '../data/demoData';
import {
  AdminRecord,
  AnnouncementItem,
  BookItem,
  BookmarkItem,
  BusinessItem,
  CollaborationPost,
  EventItem,
  Member,
  MemberEducation,
  MemberPrivateInfo,
  MemberSharedContact,
  MemoryPost,
  NotificationItem,
  ReportItem,
  SiteSettings,
} from '../types';
import { clampString } from '../utils/formatters';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface AlumniContextValue {
  authReady: boolean;
  user: User | null;
  myMember: Member | null;
  myPrivateInfo: MemberPrivateInfo | null;
  myEducation: MemberEducation | null;
  isAdmin: boolean;
  isApprovedMember: boolean;
  siteSettings: SiteSettings;

  // Live combined data (real + clearly flagged sample data if enabled)
  members: Member[];
  realMembersCount: number;
  memories: MemoryPost[];
  books: BookItem[];
  businesses: BusinessItem[];
  announcements: AnnouncementItem[];
  events: EventItem[];
  collaborations: CollaborationPost[];
  bookmarks: BookmarkItem[];
  notifications: NotificationItem[];

  // Admin full collections
  allMembers: Member[];
  allMemories: MemoryPost[];
  allBooks: BookItem[];
  allBusinesses: BusinessItem[];
  allReports: ReportItem[];
  allAdmins: AdminRecord[];

  // Toast system
  toasts: ToastMessage[];
  pushToast: (type: ToastMessage['type'], text: string) => void;
  dismissToast: (id: number) => void;

  // Auth actions
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  // Core data actions
  saveMemberProfile: (
    memberInput: Omit<Member, 'id' | 'uid' | 'status' | 'createdAt' | 'updatedAt' | 'isDemo'>,
    privateInput: Omit<MemberPrivateInfo, 'uid' | 'updatedAt'>,
    educationExtra?: { favoriteUstads?: string; academicNotes?: string }
  ) => Promise<void>;
  fetchMemberSharedContact: (memberId: string) => Promise<MemberSharedContact | null>;
  fetchMemberPrivateForAdmin: (memberId: string) => Promise<MemberPrivateInfo | null>;
  createMemory: (input: {
    title: string;
    content: string;
    category: MemoryPost['category'];
    imageUrls: string[];
  }) => Promise<void>;
  toggleMemoryReaction: (memory: MemoryPost, hasReacted: boolean) => Promise<void>;
  addMemoryComment: (memory: MemoryPost, content: string) => Promise<void>;
  deleteMemory: (memoryId: string) => Promise<void>;
  createBook: (input: Omit<BookItem, 'id' | 'authorId' | 'status' | 'createdAt' | 'updatedAt' | 'isDemo'>) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  createBusiness: (
    input: Omit<BusinessItem, 'id' | 'ownerId' | 'ownerName' | 'status' | 'createdAt' | 'updatedAt' | 'isDemo'>
  ) => Promise<void>;
  deleteBusiness: (businessId: string) => Promise<void>;
  createCollaboration: (input: {
    type: CollaborationPost['type'];
    title: string;
    content: string;
    skills: string[];
    contactMethod?: string;
  }) => Promise<void>;
  replyCollaboration: (postId: string, message: string) => Promise<void>;
  resolveCollaboration: (postId: string) => Promise<void>;
  toggleEventRsvp: (
    event: EventItem,
    currentlyRegistered: boolean,
    details?: { attendance: 'confirmed' | 'interested'; guestsCount: number; note?: string }
  ) => Promise<void>;
  toggleBookmark: (
    targetType: BookmarkItem['targetType'],
    targetId: string,
    targetTitle: string
  ) => Promise<void>;
  submitReport: (input: {
    targetType: ReportItem['targetType'];
    targetId: string;
    targetTitle?: string;
    reason: string;
  }) => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;

  // Admin actions
  adminUpdateMemberStatus: (memberId: string, status: Member['status']) => Promise<void>;
  adminDeleteMember: (memberId: string) => Promise<void>;
  adminModerateMemory: (memoryId: string, status: MemoryPost['status']) => Promise<void>;
  adminModerateBook: (bookId: string, status: BookItem['status']) => Promise<void>;
  adminModerateBusiness: (businessId: string, status: BusinessItem['status']) => Promise<void>;
  adminCreateAnnouncement: (input: {
    title: string;
    content: string;
    category: AnnouncementItem['category'];
    isPinned: boolean;
    isUrgent: boolean;
  }) => Promise<void>;
  adminDeleteAnnouncement: (id: string) => Promise<void>;
  adminCreateEvent: (input: {
    title: string;
    date: string;
    time?: string;
    location: string;
    description: string;
    bannerUrl?: string;
    isPast: boolean;
  }) => Promise<void>;
  adminDeleteEvent: (id: string) => Promise<void>;
  adminUpdateReportStatus: (reportId: string, status: ReportItem['status']) => Promise<void>;
  adminAddModerator: (input: { uid: string; email: string; name: string; role: AdminRecord['role'] }) => Promise<void>;
  adminRemoveModerator: (adminId: string) => Promise<void>;
  adminSaveSiteSettings: (settings: Omit<SiteSettings, 'updatedAt' | 'updatedBy'>) => Promise<void>;
}

const AlumniContext = createContext<AlumniContextValue | null>(null);

function makeDocId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now()}_${rand}`;
}

export const AlumniProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [myMember, setMyMember] = useState<Member | null>(null);
  const [myPrivateInfo, setMyPrivateInfo] = useState<MemberPrivateInfo | null>(null);
  const [myEducation, setMyEducation] = useState<MemberEducation | null>(null);
  const [adminDocExists, setAdminDocExists] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  const [realMembers, setRealMembers] = useState<Member[]>([]);
  const [realMemories, setRealMemories] = useState<MemoryPost[]>([]);
  const [realBooks, setRealBooks] = useState<BookItem[]>([]);
  const [realBusinesses, setRealBusinesses] = useState<BusinessItem[]>([]);
  const [realAnnouncements, setRealAnnouncements] = useState<AnnouncementItem[]>([]);
  const [realEvents, setRealEvents] = useState<EventItem[]>([]);
  const [realCollaborations, setRealCollaborations] = useState<CollaborationPost[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Admin full views
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [allMemories, setAllMemories] = useState<MemoryPost[]>([]);
  const [allBooks, setAllBooks] = useState<BookItem[]>([]);
  const [allBusinesses, setAllBusinesses] = useState<BusinessItem[]>([]);
  const [allReports, setAllReports] = useState<ReportItem[]>([]);
  const [allAdmins, setAllAdmins] = useState<AdminRecord[]>([]);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = (type: ToastMessage['type'], text: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev.slice(-3), { id, type, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const isBootstrappedAdmin = Boolean(
    user && user.email === BOOTSTRAPPED_ADMIN_EMAIL && user.emailVerified
  );
  const isAdmin = isBootstrappedAdmin || adminDocExists;
  const isApprovedMember = Boolean(isAdmin || myMember?.status === 'approved');

  // 1. Auth Listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // 2. Public Site Settings & Approved Community Listeners
  useEffect(() => {
    const unsubSettings = onSnapshot(
      doc(db, 'siteSettings', 'general'),
      (snap) => {
        if (snap.exists()) {
          setSiteSettings({ ...DEFAULT_SITE_SETTINGS, ...(snap.data() as SiteSettings) });
        }
      },
      (err) => console.warn('Site settings read skipped:', err.message)
    );

    const unsubMembers = onSnapshot(
      query(collection(db, 'members'), where('status', '==', 'approved')),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Member, 'id'>) }));
        setRealMembers(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'members')
    );

    const unsubMemories = onSnapshot(
      query(collection(db, 'memories'), where('status', '==', 'approved')),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MemoryPost, 'id'>) }));
        setRealMemories(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'memories')
    );

    const unsubBooks = onSnapshot(
      query(collection(db, 'books'), where('status', '==', 'approved')),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BookItem, 'id'>) }));
        setRealBooks(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'books')
    );

    const unsubBusinesses = onSnapshot(
      query(collection(db, 'businesses'), where('status', '==', 'approved')),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BusinessItem, 'id'>) }));
        setRealBusinesses(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'businesses')
    );

    const unsubAnnouncements = onSnapshot(
      query(collection(db, 'announcements'), where('published', '==', true)),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AnnouncementItem, 'id'>) }));
        setRealAnnouncements(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'announcements')
    );

    const unsubEvents = onSnapshot(
      query(collection(db, 'events'), where('published', '==', true)),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<EventItem, 'id'>) }));
        setRealEvents(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'events')
    );

    return () => {
      unsubSettings();
      unsubMembers();
      unsubMemories();
      unsubBooks();
      unsubBusinesses();
      unsubAnnouncements();
      unsubEvents();
    };
  }, []);

  // 3. Authenticated User Listeners
  useEffect(() => {
    if (!authReady || !user) {
      setMyMember(null);
      setMyPrivateInfo(null);
      setMyEducation(null);
      setAdminDocExists(false);
      setRealCollaborations([]);
      setBookmarks([]);
      setNotifications([]);
      return;
    }

    const uid = user.uid;

    const unsubMyMember = onSnapshot(
      doc(db, 'members', uid),
      (snap) => {
        setMyMember(snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Member, 'id'>) } : null);
      },
      (err) => handleFirestoreError(err, OperationType.GET, `members/${uid}`)
    );

    const unsubMyPrivate = onSnapshot(
      doc(db, 'members', uid, 'private', 'info'),
      (snap) => {
        setMyPrivateInfo(snap.exists() ? (snap.data() as MemberPrivateInfo) : null);
      },
      (err) => handleFirestoreError(err, OperationType.GET, `members/${uid}/private/info`)
    );

    const unsubMyEdu = onSnapshot(
      doc(db, 'memberEducation', uid),
      (snap) => {
        setMyEducation(snap.exists() ? (snap.data() as MemberEducation) : null);
      },
      (err) => handleFirestoreError(err, OperationType.GET, `memberEducation/${uid}`)
    );

    const unsubAdminCheck = onSnapshot(
      doc(db, 'admins', uid),
      (snap) => setAdminDocExists(snap.exists()),
      () => setAdminDocExists(false)
    );

    const unsubCollabs = onSnapshot(
      query(collection(db, 'collaborations'), where('status', 'in', ['open', 'resolved'])),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<CollaborationPost, 'id'>) }));
        setRealCollaborations(list);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'collaborations')
    );

    const unsubBookmarks = onSnapshot(
      query(collection(db, 'bookmarks'), where('userId', '==', uid)),
      (snap) => {
        setBookmarks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BookmarkItem, 'id'>) })));
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'bookmarks')
    );

    const unsubPersonalNotifs = onSnapshot(
      query(collection(db, 'notifications'), where('recipientId', '==', uid)),
      (snap) => {
        const personal = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationItem, 'id'>) }));
        setNotifications((prev) => {
          const broadcasts = prev.filter((n) => n.recipientId === 'all');
          return [...personal, ...broadcasts];
        });
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'notifications')
    );

    const unsubBroadcastNotifs = onSnapshot(
      query(collection(db, 'notifications'), where('recipientId', '==', 'all')),
      (snap) => {
        const broadcasts = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<NotificationItem, 'id'>) }));
        setNotifications((prev) => {
          const personal = prev.filter((n) => n.recipientId !== 'all');
          return [...personal, ...broadcasts];
        });
      },
      (err) => handleFirestoreError(err, OperationType.LIST, 'notifications')
    );

    return () => {
      unsubMyMember();
      unsubMyPrivate();
      unsubMyEdu();
      unsubAdminCheck();
      unsubCollabs();
      unsubBookmarks();
      unsubPersonalNotifs();
      unsubBroadcastNotifs();
    };
  }, [authReady, user]);

  // 4. Admin-Only Listeners (Full moderation queues)
  useEffect(() => {
    if (!authReady || !user || !isAdmin) {
      setAllMembers([]);
      setAllMemories([]);
      setAllBooks([]);
      setAllBusinesses([]);
      setAllReports([]);
      setAllAdmins([]);
      return;
    }

    const u1 = onSnapshot(
      collection(db, 'members'),
      (snap) => setAllMembers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Member, 'id'>) }))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'members')
    );
    const u2 = onSnapshot(
      collection(db, 'memories'),
      (snap) => setAllMemories(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MemoryPost, 'id'>) }))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'memories')
    );
    const u3 = onSnapshot(
      collection(db, 'books'),
      (snap) => setAllBooks(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BookItem, 'id'>) }))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'books')
    );
    const u4 = onSnapshot(
      collection(db, 'businesses'),
      (snap) => setAllBusinesses(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BusinessItem, 'id'>) }))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'businesses')
    );
    const u5 = onSnapshot(
      collection(db, 'reports'),
      (snap) => setAllReports(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReportItem, 'id'>) }))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'reports')
    );
    const u6 = onSnapshot(
      collection(db, 'admins'),
      (snap) => setAllAdmins(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdminRecord, 'id'>) }))),
      (err) => handleFirestoreError(err, OperationType.LIST, 'admins')
    );

    return () => {
      u1();
      u2();
      u3();
      u4();
      u5();
      u6();
    };
  }, [authReady, user, isAdmin]);

  // Combined views (real data first, clearly labeled sample data appended if siteSettings.showDemoData)
  const members = useMemo(
    () => (siteSettings.showDemoData ? [...realMembers, ...DEMO_MEMBERS] : realMembers),
    [realMembers, siteSettings.showDemoData]
  );
  const memories = useMemo(
    () => (siteSettings.showDemoData ? [...realMemories, ...DEMO_MEMORIES] : realMemories),
    [realMemories, siteSettings.showDemoData]
  );
  const books = useMemo(
    () => (siteSettings.showDemoData ? [...realBooks, ...DEMO_BOOKS] : realBooks),
    [realBooks, siteSettings.showDemoData]
  );
  const businesses = useMemo(
    () => (siteSettings.showDemoData ? [...realBusinesses, ...DEMO_BUSINESSES] : realBusinesses),
    [realBusinesses, siteSettings.showDemoData]
  );
  const announcements = useMemo(
    () => (siteSettings.showDemoData ? [...realAnnouncements, ...DEMO_ANNOUNCEMENTS] : realAnnouncements),
    [realAnnouncements, siteSettings.showDemoData]
  );
  const events = useMemo(
    () => (siteSettings.showDemoData ? [...realEvents, ...DEMO_EVENTS] : realEvents),
    [realEvents, siteSettings.showDemoData]
  );
  const collaborations = useMemo(
    () => (siteSettings.showDemoData ? [...realCollaborations, ...DEMO_COLLABORATIONS] : realCollaborations),
    [realCollaborations, siteSettings.showDemoData]
  );

  // ==================== AUTH METHODS ====================
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      pushToast('success', 'সফলভাবে গুগল অ্যাকাউন্টে লগইন সম্পন্ন হয়েছে।');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('popup-closed-by-user')) {
        pushToast('info', 'লগইন পপআপটি বন্ধ করা হয়েছে।');
      } else {
        pushToast('error', 'লগইন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
      }
      throw error;
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      pushToast('success', 'সফলভাবে লগইন সম্পন্ন হয়েছে।');
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('operation-not-allowed')) {
        pushToast(
          'error',
          'Firebase Console-এ Email/Password সাইন-ইন চালু করা নেই। তাৎক্ষণিক লগইনের জন্য গুগল অ্যাকাউন্ট ব্যবহার করুন।'
        );
      } else {
        pushToast('error', 'ইমেইল বা পাসওয়ার্ড সঠিক নয়। অনুগ্রহ করে যাচাই করে আবার চেষ্টা করুন।');
      }
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await sendEmailVerification(cred.user);
      pushToast(
        'success',
        'অ্যাকাউন্ট তৈরি হয়েছে! আপনার ইমেইলে পাঠানো ভেরিফিকেশন লিংকে ক্লিক করে ইমেইল যাচাই করুন।'
      );
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('operation-not-allowed')) {
        pushToast(
          'error',
          'Firebase Console-এ Email/Password চালু নেই। দ্রুত নিবন্ধনের জন্য গুগল অ্যাকাউন্ট দিয়ে লগইন করুন।'
        );
      } else if (msg.includes('email-already-in-use')) {
        pushToast('error', 'এই ইমেইলটি দিয়ে ইতিমধ্যেই অ্যাকাউন্ট খোলা হয়েছে। লগইন করুন।');
      } else {
        pushToast('error', 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে। পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      }
      throw error;
    }
  };

  const logout = async () => {
    await signOut(auth);
    pushToast('info', 'আপনি সফলভাবে লগআউট করেছেন।');
  };

  // ==================== MEMBER PROFILE & PII SAVE ====================
  const saveMemberProfile: AlumniContextValue['saveMemberProfile'] = async (
    memberInput,
    privateInput,
    educationExtra
  ) => {
    if (!user) throw new Error('প্রথমে লগইন করুন।');
    if (!user.emailVerified) {
      pushToast('error', 'প্রোফাইল সংরক্ষণের জন্য আপনার ইমেইল ভেরিফাইড হতে হবে।');
      throw new Error('ইমেইল ভেরিফাইড নয়।');
    }

    const uid = user.uid;
    const isExisting = Boolean(myMember);
    const nowTs = serverTimestamp();

    const memberPayload: Record<string, unknown> = {
      uid,
      fullName: clampString(memberInput.fullName, 120),
      photoUrl: clampString(memberInput.photoUrl, 350000),
      profession: clampString(memberInput.profession, 120),
      professionCategory: memberInput.professionCategory || 'অন্যান্য',
      workplace: clampString(memberInput.workplace, 160),
      studyInstitution: clampString(memberInput.studyInstitution, 160),
      currentArea: clampString(memberInput.currentArea, 160),
      district: clampString(memberInput.district, 80),
      upazila: clampString(memberInput.upazila, 80),
      jamaats: (memberInput.jamaats || []).slice(0, 15),
      studyStartYear: clampString(memberInput.studyStartYear, 16),
      studyEndYear: clampString(memberInput.studyEndYear, 16),
      lastJamaat: clampString(memberInput.lastJamaat, 60),
      completedDawra: Boolean(memberInput.completedDawra),
      connectedToMadrasah: Boolean(memberInput.connectedToMadrasah),
      bio: clampString(memberInput.bio, 1200),
      skills: (memberInput.skills || []).map((s) => clampString(s, 60)).filter(Boolean).slice(0, 15),
      website: clampString(memberInput.website, 250),
      facebook: clampString(memberInput.facebook, 250),
      otherSocial: clampString(memberInput.otherSocial, 250),
      birthDatePublic: clampString(memberInput.birthDatePublic, 16),
      showPhoneToMembers: Boolean(memberInput.showPhoneToMembers),
      showAddressToMembers: Boolean(memberInput.showAddressToMembers),
      showFamilyToMembers: Boolean(memberInput.showFamilyToMembers),
      status: isExisting ? myMember!.status : isAdmin ? 'approved' : 'pending',
      updatedAt: nowTs,
    };
    if (!isExisting) {
      memberPayload.createdAt = nowTs;
    }

    const privatePayload: Record<string, unknown> = {
      uid,
      fatherName: clampString(privateInput.fatherName, 120),
      motherName: clampString(privateInput.motherName, 120),
      birthDate: clampString(privateInput.birthDate, 20),
      phone: clampString(privateInput.phone, 30),
      altPhone: clampString(privateInput.altPhone, 30),
      email: clampString(privateInput.email || user.email || '', 160),
      presentAddress: clampString(privateInput.presentAddress, 300),
      permanentAddress: clampString(privateInput.permanentAddress, 300),
      maritalStatus: privateInput.maritalStatus || 'প্রকাশে অনিচ্ছুক',
      marriageYear: clampString(privateInput.marriageYear, 12),
      childrenCount: Math.max(0, Math.min(20, Number(privateInput.childrenCount || 0))),
      sonsCount: Math.max(0, Math.min(20, Number(privateInput.sonsCount || 0))),
      daughtersCount: Math.max(0, Math.min(20, Number(privateInput.daughtersCount || 0))),
      consentGiven: true,
      updatedAt: nowTs,
    };

    // Opt-in shared contact summary strictly honoring member privacy toggles
    const childrenSummary =
      memberInput.showFamilyToMembers && privateInput.maritalStatus === 'বিবাহিত'
        ? `সন্তান: ${privateInput.childrenCount || 0} জন (ছেলে ${privateInput.sonsCount || 0}, মেয়ে ${privateInput.daughtersCount || 0})`
        : '';

    const sharedPayload: Record<string, unknown> = {
      uid,
      sharedPhone: memberInput.showPhoneToMembers ? clampString(privateInput.phone, 30) : '',
      sharedAltPhone: memberInput.showPhoneToMembers ? clampString(privateInput.altPhone, 30) : '',
      sharedAddress: memberInput.showAddressToMembers ? clampString(privateInput.presentAddress, 300) : '',
      sharedMaritalStatus: memberInput.showFamilyToMembers
        ? clampString(privateInput.maritalStatus, 40)
        : '',
      sharedMarriageYear:
        memberInput.showFamilyToMembers && privateInput.maritalStatus === 'বিবাহিত'
          ? clampString(privateInput.marriageYear, 12)
          : '',
      sharedChildrenSummary: clampString(childrenSummary, 120),
      updatedAt: nowTs,
    };

    const eduPayload: Record<string, unknown> = {
      uid,
      jamaats: (memberInput.jamaats || []).slice(0, 15),
      startYear: clampString(memberInput.studyStartYear, 16),
      endYear: clampString(memberInput.studyEndYear, 16),
      lastJamaat: clampString(memberInput.lastJamaat, 60),
      completedDawra: Boolean(memberInput.completedDawra),
      connectedToMadrasah: Boolean(memberInput.connectedToMadrasah),
      favoriteUstads: clampString(educationExtra?.favoriteUstads, 400),
      academicNotes: clampString(educationExtra?.academicNotes, 600),
      status: isExisting && myEducation ? myEducation.status : isAdmin ? 'approved' : 'pending',
      updatedAt: nowTs,
    };
    if (!myEducation) {
      eduPayload.createdAt = nowTs;
    }

    try {
      const batch = writeBatch(db);
      if (isExisting) {
        batch.update(doc(db, 'members', uid), memberPayload);
      } else {
        batch.set(doc(db, 'members', uid), memberPayload);
      }
      batch.set(doc(db, 'members', uid, 'private', 'info'), privatePayload);
      batch.set(doc(db, 'members', uid, 'shared', 'contact'), sharedPayload);
      if (myEducation) {
        batch.update(doc(db, 'memberEducation', uid), eduPayload);
      } else {
        batch.set(doc(db, 'memberEducation', uid), eduPayload);
      }

      if (!isExisting && !isAdmin) {
        const notifId = makeDocId('notif');
        batch.set(doc(db, 'notifications', notifId), {
          recipientId: 'admins',
          senderId: uid,
          type: 'registration',
          title: 'নতুন সদস্য নিবন্ধনের আবেদন',
          message: `${memberPayload.fullName} (${memberPayload.district}) সদস্যপদের জন্য আবেদন করেছেন।`,
          linkSection: 'admin',
          isRead: false,
          createdAt: nowTs,
        });
      }

      await batch.commit();
      pushToast(
        'success',
        isExisting
          ? 'আপনার প্রোফাইল ও গোপনীয়তা সেটিংস সফলভাবে হালনাগাদ হয়েছে।'
          : isAdmin
            ? 'আপনার সদস্য প্রোফাইল সফলভাবে তৈরি ও প্রকাশিত হয়েছে।'
            : 'নিবন্ধন সম্পন্ন হয়েছে! প্রশাসকের অনুমোদনের পর আপনার প্রোফাইল ডিরেক্টরিতে প্রকাশিত হবে।'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `members/${uid}`);
    }
  };

  const fetchMemberSharedContact = async (memberId: string): Promise<MemberSharedContact | null> => {
    if (!user || !isApprovedMember) return null;
    try {
      const snap = await getDoc(doc(db, 'members', memberId, 'shared', 'contact'));
      return snap.exists() ? (snap.data() as MemberSharedContact) : null;
    } catch {
      return null;
    }
  };

  const fetchMemberPrivateForAdmin = async (memberId: string): Promise<MemberPrivateInfo | null> => {
    if (!user || !isAdmin) return null;
    try {
      const snap = await getDoc(doc(db, 'members', memberId, 'private', 'info'));
      return snap.exists() ? (snap.data() as MemberPrivateInfo) : null;
    } catch {
      return null;
    }
  };

  // ==================== MEMORIES ====================
  const createMemory: AlumniContextValue['createMemory'] = async (input) => {
    if (!user || !isApprovedMember) {
      pushToast('error', 'স্মৃতিচারণ পোস্ট করতে অনুমোদিত সদস্য হিসেবে লগইন থাকতে হবে।');
      return;
    }
    const id = makeDocId('mem');
    const nowTs = serverTimestamp();
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'memories', id), {
        authorId: user.uid,
        authorName: clampString(myMember?.fullName || user.displayName || 'সদস্য', 120),
        authorPhoto: clampString(myMember?.photoUrl || '', 350000),
        title: clampString(input.title, 200),
        content: clampString(input.content, 6000),
        category: input.category,
        imageUrls: input.imageUrls.slice(0, 4),
        status: isAdmin ? 'approved' : 'pending',
        likesCount: 0,
        commentsCount: 0,
        createdAt: nowTs,
        updatedAt: nowTs,
      });
      if (!isAdmin) {
        batch.set(doc(db, 'notifications', makeDocId('notif')), {
          recipientId: 'admins',
          senderId: user.uid,
          type: 'memory',
          title: 'নতুন স্মৃতিচারণ অনুমোদনের অপেক্ষায়',
          message: `${myMember?.fullName || 'একজন ভাই'} "${clampString(input.title, 80)}" শিরোনামে স্মৃতিচারণ জমা দিয়েছেন।`,
          linkSection: 'admin',
          isRead: false,
          createdAt: nowTs,
        });
      }
      await batch.commit();
      pushToast(
        'success',
        isAdmin
          ? 'স্মৃতিচারণ সফলভাবে প্রকাশিত হয়েছে।'
          : 'স্মৃতিচারণ জমা হয়েছে। প্রশাসকের অনুমোদনের পর স্মৃতির পাতায় প্রকাশিত হবে।'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `memories/${id}`);
    }
  };

  const toggleMemoryReaction = async (memory: MemoryPost, hasReacted: boolean) => {
    if (memory.isDemo) {
      pushToast('info', 'এটি একটি নমুনা স্মৃতিচারণ। বাস্তব পোস্টে প্রতিক্রিয়া সংরক্ষিত হয়।');
      return;
    }
    if (!user || !isApprovedMember) {
      pushToast('error', 'প্রতিক্রিয়া জানাতে অনুমোদিত সদস্য হিসেবে লগইন করুন।');
      return;
    }
    const reactionRef = doc(db, 'memories', memory.id, 'reactions', user.uid);
    const memoryRef = doc(db, 'memories', memory.id);
    try {
      const batch = writeBatch(db);
      if (hasReacted) {
        batch.delete(reactionRef);
        batch.update(memoryRef, {
          likesCount: Math.max(0, (memory.likesCount || 1) - 1),
          updatedAt: serverTimestamp(),
        });
      } else {
        batch.set(reactionRef, {
          memoryId: memory.id,
          userId: user.uid,
          type: 'love',
          createdAt: serverTimestamp(),
        });
        batch.update(memoryRef, {
          likesCount: (memory.likesCount || 0) + 1,
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `memories/${memory.id}/reactions/${user.uid}`);
    }
  };

  const addMemoryComment = async (memory: MemoryPost, content: string) => {
    if (memory.isDemo) {
      pushToast('info', 'এটি একটি নমুনা স্মৃতিচারণ। নতুন বাস্তব পোস্টে মন্তব্য সংরক্ষিত হয়।');
      return;
    }
    if (!user || !isApprovedMember) {
      pushToast('error', 'মন্তব্য করতে অনুমোদিত সদস্য হিসেবে লগইন করুন।');
      return;
    }
    const commentId = makeDocId('cmt');
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'memories', memory.id, 'comments', commentId), {
        memoryId: memory.id,
        authorId: user.uid,
        authorName: clampString(myMember?.fullName || user.displayName || 'সদস্য', 120),
        content: clampString(content, 1000),
        createdAt: serverTimestamp(),
      });
      batch.update(doc(db, 'memories', memory.id), {
        commentsCount: (memory.commentsCount || 0) + 1,
        updatedAt: serverTimestamp(),
      });
      await batch.commit();
      pushToast('success', 'আপনার মন্তব্য যুক্ত হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `memories/${memory.id}/comments/${commentId}`);
    }
  };

  const deleteMemory = async (memoryId: string) => {
    try {
      await deleteDoc(doc(db, 'memories', memoryId));
      pushToast('success', 'স্মৃতিচারণটি মুছে ফেলা হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `memories/${memoryId}`);
    }
  };

  // ==================== BOOKS ====================
  const createBook: AlumniContextValue['createBook'] = async (input) => {
    if (!user || !isApprovedMember) {
      pushToast('error', 'বই যুক্ত করতে অনুমোদিত সদস্য হিসেবে লগইন থাকতে হবে।');
      return;
    }
    const id = makeDocId('book');
    const nowTs = serverTimestamp();
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'books', id), {
        authorId: user.uid,
        title: clampString(input.title, 200),
        authorName: clampString(input.authorName || myMember?.fullName || 'সদস্য', 120),
        publisher: clampString(input.publisher, 160),
        publishDate: clampString(input.publishDate, 40),
        subject: clampString(input.subject, 160),
        category: input.category,
        description: clampString(input.description, 2500),
        coverUrl: clampString(input.coverUrl, 350000),
        buyLink: clampString(input.buyLink, 300),
        contactInfo: clampString(input.contactInfo, 160),
        status: isAdmin ? 'approved' : 'pending',
        createdAt: nowTs,
        updatedAt: nowTs,
      });
      if (!isAdmin) {
        batch.set(doc(db, 'notifications', makeDocId('notif')), {
          recipientId: 'admins',
          senderId: user.uid,
          type: 'book',
          title: 'নতুন বই অনুমোদনের অপেক্ষায়',
          message: `"${clampString(input.title, 80)}" বইটি অনুমোদনের জন্য জমা দেওয়া হয়েছে।`,
          linkSection: 'admin',
          isRead: false,
          createdAt: nowTs,
        });
      }
      await batch.commit();
      pushToast(
        'success',
        isAdmin ? 'বইটি সফলভাবে প্রকাশিত হয়েছে।' : 'বইয়ের তথ্য জমা হয়েছে। অ্যাডমিন অনুমোদনের পর প্রকাশিত হবে।'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `books/${id}`);
    }
  };

  const deleteBook = async (bookId: string) => {
    try {
      await deleteDoc(doc(db, 'books', bookId));
      pushToast('success', 'বইটি অপসারণ করা হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `books/${bookId}`);
    }
  };

  // ==================== BUSINESSES ====================
  const createBusiness: AlumniContextValue['createBusiness'] = async (input) => {
    if (!user || !isApprovedMember) {
      pushToast('error', 'ব্যবসা যুক্ত করতে অনুমোদিত সদস্য হিসেবে লগইন থাকতে হবে।');
      return;
    }
    if (!input.shariahCompliantDeclared) {
      pushToast('error', 'ব্যবসাটি সম্পূর্ণ হালাল ও শরিয়াহসম্মত হওয়ার প্রত্যয়ন আবশ্যক।');
      return;
    }
    const id = makeDocId('biz');
    const nowTs = serverTimestamp();
    try {
      await setDoc(doc(db, 'businesses', id), {
        ownerId: user.uid,
        ownerName: clampString(myMember?.fullName || user.displayName || 'সদস্য', 120),
        name: clampString(input.name, 160),
        logoUrl: clampString(input.logoUrl, 350000),
        bannerUrl: clampString(input.bannerUrl, 350000),
        category: input.category,
        description: clampString(input.description, 2500),
        productsServices: clampString(input.productsServices, 1000),
        address: clampString(input.address, 250),
        phone: clampString(input.phone, 40),
        facebookPage: clampString(input.facebookPage, 250),
        website: clampString(input.website, 250),
        orderLink: clampString(input.orderLink, 250),
        shariahCompliantDeclared: true,
        status: isAdmin ? 'approved' : 'pending',
        createdAt: nowTs,
        updatedAt: nowTs,
      });
      pushToast(
        'success',
        isAdmin
          ? 'ব্যবসা ও উদ্যোগের পরিচিতি প্রকাশিত হয়েছে।'
          : 'ব্যবসার তথ্য জমা হয়েছে। প্রশাসকের অনুমোদনের পর প্রকাশিত হবে।'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `businesses/${id}`);
    }
  };

  const deleteBusiness = async (businessId: string) => {
    try {
      await deleteDoc(doc(db, 'businesses', businessId));
      pushToast('success', 'ব্যবসার তথ্য মুছে ফেলা হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `businesses/${businessId}`);
    }
  };

  // ==================== COLLABORATIONS ====================
  const createCollaboration: AlumniContextValue['createCollaboration'] = async (input) => {
    if (!user || !isApprovedMember) {
      pushToast('error', 'সহযোগিতা পোস্ট করতে অনুমোদিত সদস্য হিসেবে লগইন করুন।');
      return;
    }
    const id = makeDocId('collab');
    const nowTs = serverTimestamp();
    try {
      await setDoc(doc(db, 'collaborations', id), {
        authorId: user.uid,
        authorName: clampString(myMember?.fullName || user.displayName || 'সদস্য', 120),
        authorDistrict: clampString(myMember?.district || '', 80),
        type: input.type,
        title: clampString(input.title, 200),
        content: clampString(input.content, 3000),
        skills: input.skills.map((s) => clampString(s, 60)).filter(Boolean).slice(0, 10),
        contactMethod: clampString(input.contactMethod, 200),
        status: 'open',
        createdAt: nowTs,
        updatedAt: nowTs,
      });
      pushToast('success', 'আপনার পোস্টটি সহযোগিতা বোর্ডে প্রকাশিত হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `collaborations/${id}`);
    }
  };

  const replyCollaboration = async (postId: string, message: string) => {
    if (!user || !isApprovedMember) {
      pushToast('error', 'মতামত বা সহযোগিতার বার্তা দিতে অনুমোদিত সদস্য হতে হবে।');
      return;
    }
    const replyId = makeDocId('rep');
    try {
      await setDoc(doc(db, 'collaborations', postId, 'replies', replyId), {
        collaborationId: postId,
        authorId: user.uid,
        authorName: clampString(myMember?.fullName || user.displayName || 'সদস্য', 120),
        message: clampString(message, 1000),
        createdAt: serverTimestamp(),
      });
      pushToast('success', 'আপনার সহযোগিতা বার্তা যুক্ত হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `collaborations/${postId}/replies/${replyId}`);
    }
  };

  const resolveCollaboration = async (postId: string) => {
    try {
      await updateDoc(doc(db, 'collaborations', postId), {
        status: 'resolved',
        updatedAt: serverTimestamp(),
      });
      pushToast('success', 'পোস্টটি সম্পন্ন হিসেবে চিহ্নিত করা হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `collaborations/${postId}`);
    }
  };

  // ==================== EVENTS RSVP ====================
  const toggleEventRsvp: AlumniContextValue['toggleEventRsvp'] = async (
    event,
    currentlyRegistered,
    details
  ) => {
    if (event.isDemo) {
      pushToast('info', 'এটি একটি নমুনা অনুষ্ঠান। অ্যাডমিন নতুন অনুষ্ঠান প্রকাশ করলে তাতে নিবন্ধন করা যাবে।');
      return;
    }
    if (!user || !isApprovedMember) {
      pushToast('error', 'অনুষ্ঠানে উপস্থিতি নিশ্চিত করতে অনুমোদিত সদস্য হিসেবে লগইন করুন।');
      return;
    }
    const rsvpRef = doc(db, 'events', event.id, 'rsvps', user.uid);
    const eventRef = doc(db, 'events', event.id);
    const nowTs = serverTimestamp();
    try {
      const batch = writeBatch(db);
      if (currentlyRegistered) {
        batch.delete(rsvpRef);
        batch.update(eventRef, {
          rsvpCount: Math.max(0, (event.rsvpCount || 1) - 1),
          updatedAt: nowTs,
        });
      } else {
        batch.set(rsvpRef, {
          eventId: event.id,
          userId: user.uid,
          memberName: clampString(myMember?.fullName || user.displayName || 'সদস্য', 120),
          attendance: details?.attendance || 'confirmed',
          guestsCount: Math.max(1, Math.min(10, Number(details?.guestsCount || 1))),
          note: clampString(details?.note, 300),
          createdAt: nowTs,
          updatedAt: nowTs,
        });
        batch.update(eventRef, {
          rsvpCount: (event.rsvpCount || 0) + 1,
          updatedAt: nowTs,
        });
      }
      await batch.commit();
      pushToast(
        'success',
        currentlyRegistered ? 'অনুষ্ঠানের নিবন্ধন বাতিল করা হয়েছে।' : 'অনুষ্ঠানে আপনার উপস্থিতি নিশ্চিত হয়েছে!'
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `events/${event.id}/rsvps/${user.uid}`);
    }
  };

  // ==================== BOOKMARKS & REPORTS & NOTIFICATIONS ====================
  const toggleBookmark: AlumniContextValue['toggleBookmark'] = async (
    targetType,
    targetId,
    targetTitle
  ) => {
    if (!user) {
      pushToast('info', 'পোস্ট সংরক্ষণ (বুকমার্ক) করতে অনুগ্রহ করে লগইন করুন।');
      return;
    }
    const safeTargetId = targetId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const bmId = `${user.uid}_${targetType}_${safeTargetId}`.slice(0, 120);
    const exists = bookmarks.some((b) => b.id === bmId);
    try {
      if (exists) {
        await deleteDoc(doc(db, 'bookmarks', bmId));
        pushToast('info', 'বুকমার্ক তালিকা থেকে সরানো হয়েছে।');
      } else {
        await setDoc(doc(db, 'bookmarks', bmId), {
          userId: user.uid,
          targetType,
          targetId: safeTargetId,
          targetTitle: clampString(targetTitle, 200),
          createdAt: serverTimestamp(),
        });
        pushToast('success', 'বুকমার্ক তালিকায় সংরক্ষিত হয়েছে।');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `bookmarks/${bmId}`);
    }
  };

  const submitReport: AlumniContextValue['submitReport'] = async (input) => {
    if (!user) {
      pushToast('error', 'রিপোর্ট জমা দিতে লগইন করুন।');
      return;
    }
    const id = makeDocId('rep');
    const nowTs = serverTimestamp();
    try {
      await setDoc(doc(db, 'reports', id), {
        reporterId: user.uid,
        reporterName: clampString(myMember?.fullName || user.displayName || 'সদস্য', 120),
        targetType: input.targetType,
        targetId: input.targetId.replace(/[^a-zA-Z0-9_-]/g, '_'),
        targetTitle: clampString(input.targetTitle, 200),
        reason: clampString(input.reason, 800),
        status: 'open',
        createdAt: nowTs,
        updatedAt: nowTs,
      });
      pushToast('success', 'আপনার রিপোর্টটি প্রশাসকদের কাছে পাঠানো হয়েছে। জাযাকাল্লাহু খাইরান।');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `reports/${id}`);
    }
  };

  const markNotificationRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), { isRead: true });
    } catch {
      // Broadcast notifications may not be individually mutable by non-admins; ignore cleanly
    }
  };

  // ==================== ADMIN ACTIONS ====================
  const adminUpdateMemberStatus = async (memberId: string, status: Member['status']) => {
    if (!user || !isAdmin) return;
    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'members', memberId), {
        status,
        updatedAt: serverTimestamp(),
      });
      if (status === 'approved') {
        batch.set(doc(db, 'notifications', makeDocId('notif')), {
          recipientId: memberId,
          senderId: user.uid,
          type: 'approval',
          title: 'আপনার সদস্যপদ অনুমোদিত হয়েছে!',
          message: 'আলহামদুলিল্লাহ, জামেউল উলুম ২০২২-২৩ প্ল্যাটফর্মে আপনার প্রোফাইল অনুমোদিত ও প্রকাশিত হয়েছে।',
          linkSection: 'dashboard',
          isRead: false,
          createdAt: serverTimestamp(),
        });
      }
      await batch.commit();
      pushToast('success', 'সদস্যের অবস্থান সফলভাবে হালনাগাদ হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `members/${memberId}`);
    }
  };

  const adminDeleteMember = async (memberId: string) => {
    if (!user || !isAdmin) return;
    try {
      await deleteDoc(doc(db, 'members', memberId));
      pushToast('success', 'সদস্যের প্রোফাইল অপসারণ করা হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `members/${memberId}`);
    }
  };

  const adminModerateMemory = async (memoryId: string, status: MemoryPost['status']) => {
    if (!user || !isAdmin) return;
    try {
      await updateDoc(doc(db, 'memories', memoryId), { status, updatedAt: serverTimestamp() });
      pushToast('success', 'স্মৃতিচারণের অবস্থান হালনাগাদ হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `memories/${memoryId}`);
    }
  };

  const adminModerateBook = async (bookId: string, status: BookItem['status']) => {
    if (!user || !isAdmin) return;
    try {
      await updateDoc(doc(db, 'books', bookId), { status, updatedAt: serverTimestamp() });
      pushToast('success', 'বইয়ের অনুমোদন অবস্থান হালনাগাদ হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `books/${bookId}`);
    }
  };

  const adminModerateBusiness = async (businessId: string, status: BusinessItem['status']) => {
    if (!user || !isAdmin) return;
    try {
      await updateDoc(doc(db, 'businesses', businessId), { status, updatedAt: serverTimestamp() });
      pushToast('success', 'ব্যবসার অনুমোদন অবস্থান হালনাগাদ হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `businesses/${businessId}`);
    }
  };

  const adminCreateAnnouncement: AlumniContextValue['adminCreateAnnouncement'] = async (input) => {
    if (!user || !isAdmin) return;
    const id = makeDocId('ann');
    const nowTs = serverTimestamp();
    try {
      const batch = writeBatch(db);
      batch.set(doc(db, 'announcements', id), {
        authorId: user.uid,
        authorName: clampString(myMember?.fullName || user.displayName || 'প্রশাসক', 120),
        title: clampString(input.title, 200),
        content: clampString(input.content, 5000),
        category: input.category,
        isPinned: input.isPinned,
        isUrgent: input.isUrgent,
        published: true,
        createdAt: nowTs,
        updatedAt: nowTs,
      });
      batch.set(doc(db, 'notifications', makeDocId('notif')), {
        recipientId: 'all',
        senderId: user.uid,
        type: 'announcement',
        title: `নতুন ঘোষণা: ${clampString(input.title, 100)}`,
        message: clampString(input.content, 240),
        linkSection: 'activities',
        isRead: false,
        createdAt: nowTs,
      });
      await batch.commit();
      pushToast('success', 'ঘোষণাটি নোটিশ বোর্ডে প্রকাশিত হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `announcements/${id}`);
    }
  };

  const adminDeleteAnnouncement = async (id: string) => {
    if (!user || !isAdmin) return;
    try {
      await deleteDoc(doc(db, 'announcements', id));
      pushToast('success', 'ঘোষণাটি মুছে ফেলা হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    }
  };

  const adminCreateEvent: AlumniContextValue['adminCreateEvent'] = async (input) => {
    if (!user || !isAdmin) return;
    const id = makeDocId('evt');
    const nowTs = serverTimestamp();
    try {
      await setDoc(doc(db, 'events', id), {
        authorId: user.uid,
        title: clampString(input.title, 200),
        date: clampString(input.date, 60),
        time: clampString(input.time, 60),
        location: clampString(input.location, 200),
        description: clampString(input.description, 4000),
        bannerUrl: clampString(input.bannerUrl, 350000),
        galleryUrls: [],
        isPast: input.isPast,
        published: true,
        rsvpCount: 0,
        createdAt: nowTs,
        updatedAt: nowTs,
      });
      pushToast('success', 'নতুন অনুষ্ঠান সফলভাবে যুক্ত হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `events/${id}`);
    }
  };

  const adminDeleteEvent = async (id: string) => {
    if (!user || !isAdmin) return;
    try {
      await deleteDoc(doc(db, 'events', id));
      pushToast('success', 'অনুষ্ঠানটি মুছে ফেলা হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `events/${id}`);
    }
  };

  const adminUpdateReportStatus = async (reportId: string, status: ReportItem['status']) => {
    if (!user || !isAdmin) return;
    try {
      await updateDoc(doc(db, 'reports', reportId), { status, updatedAt: serverTimestamp() });
      pushToast('success', 'রিপোর্টের অবস্থান হালনাগাদ হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reports/${reportId}`);
    }
  };

  const adminAddModerator: AlumniContextValue['adminAddModerator'] = async (input) => {
    if (!user || !isAdmin) return;
    const targetUid = input.uid.trim();
    try {
      await setDoc(doc(db, 'admins', targetUid), {
        uid: targetUid,
        email: clampString(input.email, 160),
        name: clampString(input.name, 120),
        role: input.role,
        addedBy: user.uid,
        createdAt: serverTimestamp(),
      });
      pushToast('success', 'নতুন প্রশাসক / মডারেটর নিয়োগ সম্পন্ন হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `admins/${targetUid}`);
    }
  };

  const adminRemoveModerator = async (adminId: string) => {
    if (!user || !isAdmin) return;
    try {
      await deleteDoc(doc(db, 'admins', adminId));
      pushToast('success', 'প্রশাসকের দায়িত্ব অপসারণ করা হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `admins/${adminId}`);
    }
  };

  const adminSaveSiteSettings: AlumniContextValue['adminSaveSiteSettings'] = async (settings) => {
    if (!user || !isAdmin) return;
    try {
      await setDoc(doc(db, 'siteSettings', 'general'), {
        siteName: clampString(settings.siteName, 120),
        subtitle: clampString(settings.subtitle, 160),
        logoUrl: clampString(settings.logoUrl, 350000),
        heroQuote: clampString(settings.heroQuote, 800),
        batchInfo: clampString(settings.batchInfo, 160),
        madrasahName: clampString(settings.madrasahName, 160),
        madrasahLocation: clampString(settings.madrasahLocation, 160),
        footerMotto: clampString(settings.footerMotto, 240),
        showDemoData: Boolean(settings.showDemoData),
        updatedBy: user.uid,
        updatedAt: serverTimestamp(),
      });
      pushToast('success', 'ওয়েবসাইটের সাধারণ সেটিংস সংরক্ষিত হয়েছে।');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'siteSettings/general');
    }
  };

  return (
    <AlumniContext.Provider
      value={{
        authReady,
        user,
        myMember,
        myPrivateInfo,
        myEducation,
        isAdmin,
        isApprovedMember,
        siteSettings,
        members,
        realMembersCount: realMembers.length,
        memories,
        books,
        businesses,
        announcements,
        events,
        collaborations,
        bookmarks,
        notifications,
        allMembers,
        allMemories,
        allBooks,
        allBusinesses,
        allReports,
        allAdmins,
        toasts,
        pushToast,
        dismissToast,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        saveMemberProfile,
        fetchMemberSharedContact,
        fetchMemberPrivateForAdmin,
        createMemory,
        toggleMemoryReaction,
        addMemoryComment,
        deleteMemory,
        createBook,
        deleteBook,
        createBusiness,
        deleteBusiness,
        createCollaboration,
        replyCollaboration,
        resolveCollaboration,
        toggleEventRsvp,
        toggleBookmark,
        submitReport,
        markNotificationRead,
        adminUpdateMemberStatus,
        adminDeleteMember,
        adminModerateMemory,
        adminModerateBook,
        adminModerateBusiness,
        adminCreateAnnouncement,
        adminDeleteAnnouncement,
        adminCreateEvent,
        adminDeleteEvent,
        adminUpdateReportStatus,
        adminAddModerator,
        adminRemoveModerator,
        adminSaveSiteSettings,
      }}
    >
      {children}
    </AlumniContext.Provider>
  );
};

export function useAlumni(): AlumniContextValue {
  const ctx = useContext(AlumniContext);
  if (!ctx) throw new Error('useAlumni must be used inside AlumniProvider');
  return ctx;
}
