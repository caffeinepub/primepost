# Specification

## Summary
**Goal:** Remove Terms & Conditions friction for Super Admins, ensure Terms acceptance never blocks Customer/Store when terms content is missing, and provide a public APK download page with clearer 3-role login wording.

**Planned changes:**
- Update first-time profile onboarding (ProfileSetupDialog) so selecting **Admin (Super Admin)** hides the Terms acceptance checkbox and does not require Terms acceptance to proceed; keep Terms acceptance required for **Customer** and **Store** roles.
- Update admin login + navigation flow to ensure **Super Admin** users are never routed to any Terms acceptance pages and are never blocked by missing/false terms-acceptance flags.
- Update **/terms/customer** and **/terms/owner** to never show a blocking “Terms and Conditions are not yet available” state; when backend terms content is null/empty, render fallback legal text and allow acceptance to proceed.
- Add (or verify and wire up) a **public, no-login APK download page route** with a stable APK filename served from frontend public assets, and add an obvious link/button to it from the landing experience.
- Update landing screen copy so the three login options are labeled exactly: **Customer**, **Store**, **Admin**, while keeping existing routing unchanged (Customer -> /login/customer, Store -> /login/owner, Admin -> /login/admin).

**User-visible outcome:** Admins can log in and use the admin dashboard without any Terms prompts or blocks; Customers and Stores can always view/accept Terms even when backend terms content is missing; users see three clear login options (Customer/Store/Admin) and can download the APK from a public page without logging in.
