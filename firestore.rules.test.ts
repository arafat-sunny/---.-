/**
 * Security Rules Verification Spec — "Dirty Dozen" Adversarial Test Payloads
 * Matches security_spec.md & firestore.rules invariants.
 * Designed for execution against the Firebase Firestore Emulator Suite.
 */

export interface AdversarialCase {
  id: number;
  name: string;
  operation: 'create' | 'update' | 'get' | 'list';
  path: string;
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_PAYLOADS: AdversarialCase[] = [
  {
    id: 1,
    name: 'Self-Approval Escalation on Member Registration',
    operation: 'create',
    path: 'members/userA',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: {
      uid: 'userA',
      fullName: 'মোহাম্মদ আবদুল্লাহ',
      district: 'ঢাকা',
      lastJamaat: 'দাওরায়ে হাদিস',
      jamaats: ['দাওরায়ে হাদিস'],
      completedDawra: true,
      connectedToMadrasah: false,
      status: 'approved', // Forbidden on self-create; must be 'pending'
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Shadow Field Injection on Member Update',
    operation: 'update',
    path: 'members/userA',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: { fullName: 'নতুন নাম', isAdmin: true, role: 'super_admin' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Cross-User Private PII Read Attempt',
    operation: 'get',
    path: 'members/userB/private/info',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Unverified Admin Email Spoofing',
    operation: 'update',
    path: 'siteSettings/general',
    auth: { uid: 'spoofUid', email: 'arafatsunnythree@gmail.com', email_verified: false },
    payload: { siteName: 'Hacked Site', subtitle: '', heroQuote: '', showDemoData: false },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Author Identity Spoofing on Memory Create',
    operation: 'create',
    path: 'memories/mem_001',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: {
      authorId: 'userB', // Spoofed authorId
      authorName: 'অন্য সদস্য',
      title: 'ভুয়া স্মৃতি',
      content: 'এটি একটি জাল পোস্ট যা অন্যের নামে করার চেষ্টা।',
      category: 'স্মৃতিচারণ',
      imageUrls: [],
      status: 'pending',
      likesCount: 0,
      commentsCount: 0,
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Non-Admin Direct Book Approval',
    operation: 'create',
    path: 'books/book_001',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: {
      authorId: 'userA',
      title: 'নতুন বই',
      authorName: 'লেখক',
      category: 'ইসলামিক বই',
      description: 'বইয়ের বিস্তারিত বিবরণ এখানে লেখা হয়েছে।',
      status: 'approved', // Forbidden for non-admin
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Non-Shariah Business Declaration Bypass',
    operation: 'create',
    path: 'businesses/biz_001',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: {
      ownerId: 'userA',
      ownerName: 'উদ্যোক্তা',
      name: 'অননুমোদিত ব্যবসা',
      category: 'অন্যান্য',
      description: 'ব্যবসার বিস্তারিত বিবরণ এখানে।',
      shariahCompliantDeclared: false, // Must be true
      status: 'pending',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Path Variable ID Poisoning',
    operation: 'create',
    path: 'memories/bad$id!with*invalidChars',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: { title: 'Test' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Unbounded Array & Oversized String Exhaustion',
    operation: 'create',
    path: 'members/userA',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: {
      uid: 'userA',
      fullName: 'ক'.repeat(250),
      district: 'ঢাকা',
      lastJamaat: 'দাওরায়ে হাদিস',
      jamaats: Array(25).fill('দাওরায়ে হাদিস'),
      completedDawra: true,
      connectedToMadrasah: false,
      status: 'pending',
    },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immutable Field Tampering on Memory Update',
    operation: 'update',
    path: 'memories/mem_001',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: { authorId: 'userB', likesCount: 9999 },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Terminal State Modification on Rejected Book',
    operation: 'update',
    path: 'books/rejected_book_1',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    payload: { title: 'পুনরায় সম্পাদনা চেষ্টা', status: 'pending' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Unauthorized Global Reports List Scrape',
    operation: 'list',
    path: 'reports',
    auth: { uid: 'userA', email: 'a@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
];
