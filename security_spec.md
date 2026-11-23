# Security Specification — Jameul Uloom 2022-23 Alumni Platform

## 1. Core Data Invariants
1. **Default Deny**: Every unspecified path in Firestore is strictly denied (`allow read, write: if false;`).
2. **PII Isolation**: Sensitive member PII (`phone`, `altPhone`, `email`, `fatherName`, `motherName`, `birthDate`, `presentAddress`, `permanentAddress`, `maritalStatus`, `childrenCount`) is stored strictly inside `/members/{memberId}/private/info` and is readable/writable ONLY by `isOwner(memberId)` or `isAdmin()`.
3. **Opt-In Alumni Sharing**: `/members/{memberId}/shared/contact` is readable ONLY by `isOwner(memberId)`, `isAdmin()`, or verified `isApprovedMember()` when the parent member profile exists and is `approved`.
4. **No Self-Approval / Privilege Escalation**: A registering member MUST create their `/members/{uid}` document with `status == 'pending'`. Users cannot transition their own `status` to `'approved'`, nor can they write to `/admins/{uid}`.
5. **Verified Identity**: All writes require `request.auth != null && request.auth.token.email_verified == true`.
6. **Master Gate on Subcollections**: Comments, reactions, event RSVPs, and collaboration replies verify parent document existence and active/approved status via `get()`.
7. **Strict Timestamps & Immutability**: `createdAt == request.time` on create; `updatedAt == request.time` on update; `uid`/`authorId`/`ownerId`/`createdAt` are immutable after creation.
8. **Secure List Queries**: Every `allow list` rule validates `resource.data` directly (e.g., `resource.data.status == 'approved'` or `resource.data.userId == request.auth.uid`), with zero `get()`/`exists()` inside `allow list` (except non-list or admin role check avoided where possible by using `resource.data` first). Wait: Note Pillar 8 Cost-Optimization Clause — avoid `get()`/`exists()` inside `allow list` or use `isBootstrappedAdmin()` cleanly! Let's ensure `allow list` for non-admins evaluates `resource.data` directly, and admin listing checks `isAdmin()` only after `isSignedIn()` (or uses `isBootstrappedAdmin()` / admin check cleanly). Let's verify with ESLint!

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Self-Approval Escalation**: Member tries `create` on `/members/{uid}` with `status: "approved"`. Expected: `PERMISSION_DENIED`.
2. **Shadow Field Injection**: Member updates `/members/{uid}` adding ghost field `isAdmin: true` or `role: "super_admin"`. Expected: `PERMISSION_DENIED`.
3. **Cross-User PII Scraping**: Authenticated non-owner tries `get` on `/members/{otherUid}/private/info`. Expected: `PERMISSION_DENIED`.
4. **Unverified Email Spoofing**: User with `email: "arafatsunnythree@gmail.com"` and `email_verified: false` attempts admin write on `/siteSettings/general`. Expected: `PERMISSION_DENIED`.
5. **Identity Spoofing on Memory Creation**: User `uidA` creates `/memories/{id}` with `authorId: "uidB"`. Expected: `PERMISSION_DENIED`.
6. **Direct Approval on Book Submission**: Non-admin creates `/books/{id}` with `status: "approved"`. Expected: `PERMISSION_DENIED`.
7. **Non-Shariah Business Submission**: Member creates `/businesses/{id}` with `shariahCompliantDeclared: false`. Expected: `PERMISSION_DENIED`.
8. **ID Poisoning Attack**: Attacker creates `/memories/../../evil$$$1500chars` with invalid characters/oversized ID. Expected: `PERMISSION_DENIED`.
9. **Resource Exhaustion (1MB String / Unbounded Array)**: Member submits `jamaats` array with 25 elements or `bio` of 5000 chars. Expected: `PERMISSION_DENIED`.
10. **Immutable Field Tampering**: Author updates `/memories/{id}` trying to alter `createdAt` or `authorId`. Expected: `PERMISSION_DENIED`.
11. **Terminal State Violation**: Non-admin attempts to update a `rejected` book or `dismissed` report. Expected: `PERMISSION_DENIED`.
12. **Blanket List Query Abuse**: Non-owner tries to list `/bookmarks` without matching `userId == request.auth.uid`, or list `/reports` as a regular member. Expected: `PERMISSION_DENIED`.
