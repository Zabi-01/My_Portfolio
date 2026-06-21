# Portfolio Security Specification & Threat Model

This document outlines the Security Architecture for the Cybersecurity Portfolio Database, powered by Google Firebase (Firestore) and Firebase Authentication.

## 1. Authentication Authorization Matrix
- **Admin Users**: Can perform read, delete, update, and write on `/portfolio_settings/profile`, `/skills/*`, `/certs/*`, and `/blogs/*`.
- **Public Users (All/Anonymous/Signed In)**: Can read `/portfolio_settings/profile`, `/skills/*`, `/certs/*`, and `/blogs/*`.
- **Public Uploads ("for all")**: Any user (authenticated or unauthenticated) can create or read resources under `/uploaded_images/*`. To avoid denial-of-service, individual upload entries have strict field-size and quantity boundaries.

---

## 2. Dynamic Invariants & Constraints
1. **Immutable Keys**: All document edits must preserve primary key IDs (e.g. `projectId`, `id`).
2. **Schema Alignment**: No extraneous tags or "Ghost Fields" (e.g., trying to set `isAdmin: true` dynamically).
3. **Temporal Sanity**: `updatedAt` field matches server transactions (`request.time`).
4. **Limits**: All text entries and base64 strings have bound parameters to prevent Denial-of-Wallet resource exhaustion.

---

## 3. The "Dirty Dozen" Threat Payloads (Test Suite Cases)

Here are twelve payloads designed to exploit update gaps:

### Case 1: Privilege Escalation
An unauthorized user attempts to update the profile document `portfolio_settings/profile`.
- **Status**: `PERMISSION_DENIED`

### Case 2: Shadow Field Injection
An attacker inserts a `customPayload` or `ghostPrivileges` property into standard skills collection.
- **Status**: `PERMISSION_DENIED`

### Case 3: Identity Spoofing
Writing a blog post with an author field pointing to the owner while signed in with a different uid.
- **Status**: `PERMISSION_DENIED`

### Case 4: Overwriting Permanent Logs
An attacker attempts to update or delete someone else's uploaded images.
- **Status**: `PERMISSION_DENIED`

### Case 5: Infinite Text Payload
An attacker tries to upload an image data URL larger than 3MB onto `/uploaded_images/malicious` to inflate Firebase Billing.
- **Status**: `PERMISSION_DENIED` (Strictly bounded size check `< 2000000`)

### Case 6: Path Character Poisoning
An attacker attempts to inject complex nested directory traversing queries or invalid characters in document IDs.
- **Status**: `PERMISSION_DENIED`

### Case 7: Mutating Immutable Timestamp
Attempting to rewrite `createdAt` payload parameter on a blog post.
- **Status**: `PERMISSION_DENIED`

### Case 8: Unauthenticated Write To Protected Sector
Creating a skill item without logging in as administrator.
- **Status**: `PERMISSION_DENIED`

### Case 9: Altering State Bypassing Verification
Changing certification `status` from 'General' to 'Verified' without permission.
- **Status**: `PERMISSION_DENIED`

### Case 10: Array Payload Flooding
Forcing an array of tags in a blog post to have 1,000 tags.
- **Status**: `PERMISSION_DENIED` (Tags size boundary <= 10)

### Case 11: Non-image payload masquerade
Uploading raw text files to the `/uploaded_images` collection.
- **Status**: `PERMISSION_DENIED`

### Case 12: Administrative Impersonation
Trying to update `/portfolio_settings/profile` by sending dynamic custom claims or mimicking an admin configuration.
- **Status**: `PERMISSION_DENIED`
