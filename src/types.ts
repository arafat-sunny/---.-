import { Timestamp } from 'firebase/firestore';

export type MemberStatus = 'pending' | 'approved' | 'rejected' | 'suspended' | 'inactive';
export type ModerationStatus = 'pending' | 'approved' | 'rejected';

export type ProfessionCategory =
  | 'শিক্ষকতা'
  | 'ইমামতি ও খতিব'
  | 'ব্যবসা ও উদ্যোক্তা'
  | 'চাকরি'
  | 'গবেষণা ও উচ্চশিক্ষা'
  | 'লেখালেখি ও অনুবাদ'
  | 'প্রযুক্তি ও ফ্রিল্যান্সিং'
  | 'অন্যান্য';

export type MemoryCategory =
  | 'স্মৃতিচারণ'
  | 'পুরোনো ছবি'
  | 'উস্তাদদের স্মৃতি'
  | 'সহপাঠীদের স্মৃতি'
  | 'মাদরাসার অনুষ্ঠান'
  | 'মজার ঘটনা'
  | 'বিশেষ অনুভূতি';

export type BookCategory =
  | 'ইসলামিক বই'
  | 'গবেষণামূলক বই'
  | 'অনুবাদ'
  | 'সাহিত্য'
  | 'ইতিহাস'
  | 'অন্যান্য';

export type BusinessCategory =
  | 'অনলাইন শপ'
  | 'পোশাক'
  | 'বই ও প্রকাশনা'
  | 'প্রযুক্তি ও আইটি'
  | 'শিক্ষা ও প্রশিক্ষণ'
  | 'কৃষি'
  | 'খাদ্যপণ্য'
  | 'অন্যান্য';

export type AnnouncementCategory =
  | 'ব্যাচের সভা'
  | 'পুনর্মিলনী'
  | 'বিশেষ দাওয়াত'
  | 'আর্থিক সহযোগিতা'
  | 'জরুরি সংবাদ'
  | 'অন্যান্য';

export type CollaborationType =
  | 'দক্ষতা প্রকাশ'
  | 'সহযোগিতার অনুরোধ'
  | 'চাকরি ও কাজের সুযোগ'
  | 'পরামর্শ';

export type MaritalStatus = 'অবিবাহিত' | 'বিবাহিত' | 'প্রকাশে অনিচ্ছুক';

export interface Member {
  id: string;
  uid: string;
  fullName: string;
  photoUrl?: string;
  profession?: string;
  professionCategory?: ProfessionCategory;
  workplace?: string;
  studyInstitution?: string;
  currentArea?: string;
  district: string;
  upazila?: string;
  jamaats: string[];
  studyStartYear?: string;
  studyEndYear?: string;
  lastJamaat: string;
  completedDawra: boolean;
  connectedToMadrasah: boolean;
  bio?: string;
  skills?: string[];
  website?: string;
  facebook?: string;
  otherSocial?: string;
  birthDatePublic?: string;
  showPhoneToMembers?: boolean;
  showAddressToMembers?: boolean;
  showFamilyToMembers?: boolean;
  status: MemberStatus;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  isDemo?: boolean;
}

export interface MemberPrivateInfo {
  uid: string;
  fatherName: string;
  motherName?: string;
  birthDate?: string;
  phone: string;
  altPhone?: string;
  email?: string;
  presentAddress?: string;
  permanentAddress?: string;
  maritalStatus?: MaritalStatus;
  marriageYear?: string;
  childrenCount?: number;
  sonsCount?: number;
  daughtersCount?: number;
  consentGiven: boolean;
  updatedAt?: Timestamp | string;
}

export interface MemberSharedContact {
  uid: string;
  sharedPhone?: string;
  sharedAltPhone?: string;
  sharedAddress?: string;
  sharedMaritalStatus?: string;
  sharedMarriageYear?: string;
  sharedChildrenSummary?: string;
  updatedAt?: Timestamp | string;
}

export interface MemberEducation {
  uid: string;
  jamaats: string[];
  startYear?: string;
  endYear?: string;
  lastJamaat: string;
  completedDawra: boolean;
  connectedToMadrasah: boolean;
  favoriteUstads?: string;
  academicNotes?: string;
  status: 'pending' | 'approved';
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface MemoryPost {
  id: string;
  authorId: string;
  authorName: string;
  authorPhoto?: string;
  title: string;
  content: string;
  category: MemoryCategory;
  imageUrls: string[];
  status: ModerationStatus;
  likesCount: number;
  commentsCount: number;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  isDemo?: boolean;
}

export interface MemoryComment {
  id: string;
  memoryId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt?: Timestamp | string;
}

export interface BookItem {
  id: string;
  authorId: string;
  title: string;
  authorName: string;
  publisher?: string;
  publishDate?: string;
  subject?: string;
  category: BookCategory;
  description: string;
  coverUrl?: string;
  buyLink?: string;
  contactInfo?: string;
  status: ModerationStatus;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  isDemo?: boolean;
}

export interface BusinessItem {
  id: string;
  ownerId: string;
  ownerName: string;
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  category: BusinessCategory;
  description: string;
  productsServices?: string;
  address?: string;
  phone?: string;
  facebookPage?: string;
  website?: string;
  orderLink?: string;
  shariahCompliantDeclared: boolean;
  status: ModerationStatus;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  isDemo?: boolean;
}

export interface AnnouncementItem {
  id: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  isPinned: boolean;
  isUrgent: boolean;
  published: boolean;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  isDemo?: boolean;
}

export interface EventItem {
  id: string;
  authorId: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  description: string;
  bannerUrl?: string;
  galleryUrls?: string[];
  isPast: boolean;
  published: boolean;
  rsvpCount: number;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  isDemo?: boolean;
}

export interface EventRsvp {
  id: string;
  eventId: string;
  userId: string;
  memberName: string;
  attendance: 'confirmed' | 'interested';
  guestsCount: number;
  note?: string;
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface CollaborationPost {
  id: string;
  authorId: string;
  authorName: string;
  authorDistrict?: string;
  type: CollaborationType;
  title: string;
  content: string;
  skills: string[];
  contactMethod?: string;
  status: 'open' | 'resolved';
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
  isDemo?: boolean;
}

export interface CollaborationReply {
  id: string;
  collaborationId: string;
  authorId: string;
  authorName: string;
  message: string;
  createdAt?: Timestamp | string;
}

export interface BookmarkItem {
  id: string;
  userId: string;
  targetType: 'memory' | 'book' | 'business' | 'collaboration';
  targetId: string;
  targetTitle: string;
  createdAt?: Timestamp | string;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  senderId: string;
  type: 'registration' | 'approval' | 'book' | 'memory' | 'announcement' | 'event' | 'system';
  title: string;
  message: string;
  linkSection?: string;
  isRead: boolean;
  createdAt?: Timestamp | string;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: 'memory' | 'book' | 'business' | 'collaboration' | 'member';
  targetId: string;
  targetTitle?: string;
  reason: string;
  status: 'open' | 'reviewed' | 'dismissed';
  createdAt?: Timestamp | string;
  updatedAt?: Timestamp | string;
}

export interface AdminRecord {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  addedBy: string;
  createdAt?: Timestamp | string;
}

export interface SiteSettings {
  siteName: string;
  subtitle: string;
  logoUrl?: string;
  heroQuote: string;
  batchInfo: string;
  madrasahName: string;
  madrasahLocation: string;
  footerMotto: string;
  showDemoData: boolean;
  updatedBy?: string;
  updatedAt?: Timestamp | string;
}

export type ActiveRoute =
  | 'home'
  | 'directory'
  | 'memories'
  | 'books'
  | 'businesses'
  | 'activities'
  | 'register'
  | 'dashboard'
  | 'admin'
  | 'profile';
