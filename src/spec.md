# Specification

## Summary
**Goal:** Add secure first super admin initialization, expanded first-time onboarding, local PIN/biometric unlock, and admin-managed Terms & Conditions with per-role acceptance gating.

**Planned changes:**
- Backend: Add a one-time “first super admin bootstrap” operation that only works when no superAdmin exists; reject after initialization and continue preventing self-assignment of superAdmin via normal profile updates.
- Backend: Extend the UserProfile model to persist onboarding fields (full name, phone number, email, date of birth, nationality, state of residence) and return them in profile read APIs.
- Backend: Store and serve Terms & Conditions content for Customers and Store Owners (separate entries), readable by all users but editable only by super admins, with versioning or updated-at metadata.
- Backend: Track per-user acceptance state for Customer terms and Store Owner terms (accepted flag plus timestamp and/or version identifier).
- Frontend: Add/extend first-login onboarding UI to collect and validate the required profile fields.
- Frontend: Add Terms & Conditions acceptance screens and route gating so Customers can’t access /customer pages and Store Owners can’t access /owner pages until they accept the relevant terms; show a clear blocked state if terms are missing/unpublished.
- Frontend: Add Admin UI to view/edit/publish Customer and Store Owner Terms & Conditions (English text), restricted to admins and saved using the super admin identity.
- Frontend: Add 4-digit PIN setup after initial Internet Identity auth + profile creation; require PIN to unlock the app on subsequent opens and to confirm checkout/placing orders; store PIN only locally on the device.
- Frontend: Add optional biometric unlock/confirmation (when supported) with fallback to PIN; keep all biometric handling on-device and out of the backend.

**User-visible outcome:** On first use, users complete an expanded profile setup, accept the appropriate Terms & Conditions, and set up a local PIN (optionally biometrics) used to unlock the app and confirm checkout; super admins can be initialized once via a secure bootstrap and can manage/publish separate Customer and Store Owner terms in the admin UI.
