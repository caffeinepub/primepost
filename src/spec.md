# Specification

## Summary
**Goal:** Update PrimePost to support exactly three role entry points, full English/French bilingual UI, and the required security/onboarding, profile, store/marketplace, and order-tracking flows for a mobile-first multi-vendor POS/marketplace.

**Planned changes:**
- Restrict the public home screen to exactly three login entry points (Customer, Store Owner, Super Admin) and remove/hide any other role references across the UI.
- Add full bilingual (English/French) UI coverage across customer/owner/admin screens, including an in-app language switch in settings/profile with persisted preference.
- Implement sequential, unique, non-editable 5-digit numeric IDs for Customers and Store Owners, generated on first registration and displayed read-only in profiles.
- Gate Customer and Store Owner account creation behind mandatory acceptance of both Terms & Conditions and Privacy Policy (not required for Super Admin), and store acceptance state to gate protected actions.
- Add PIN-based security for Customers and Store Owners (4-digit PIN setup on registration, hashed storage, PIN verification for future access, and PIN change from settings).
- Add Super Admin first-login password setup (no password required initially, then forced password creation, hashed storage, and password verification for future admin access; allow password change in admin settings).
- Add Customer/Owner profile management (update phone, email, optional profile photo; switch language; change PIN) while preventing edits to the assigned 5-digit ID.
- Add customer store discovery via Store ID entry, name search, category filtering, and “near me” filtering using device geolocation when permitted.
- Update checkout to include basket review, optional table number, special instructions, payment method (Cash/Mobile Money), and show the store’s Mobile Money number when Mobile Money is selected.
- Implement order tracking statuses (Pending, In Progress, On The Way, Completed) with near-real-time in-app updates (polling/refetch) and in-app notifications while open; map owner actions to status transitions as specified.
- Add Store Owner store registration/details management (name, category, location, Mobile Money number) with ownership enforcement and blocked-store order prevention.
- Add Store Owner product management (add/edit/delete, image upload, price, stock quantity, out-of-stock flag) plus low-stock alerts in the owner UI.
- Add Marketplace: owners can publish promotional/discounted items and offers; customers can browse/search items, filter by nearest location, and see discounted items distinguished visually.
- Expand Super Admin in-app tools: view customers/owners, monitor orders/transactions, suspend/block users, view analytics summary, and manage system settings (including legal documents).
- Apply a cohesive, consistent mobile-first visual theme across all screens with light/dark mode support.

**User-visible outcome:** Users see only three role-based entry points, can use the app in English or French, complete secure onboarding (IDs, terms/privacy, PIN/password), manage profiles, discover stores and marketplace items (including “near me”), place orders with the required checkout options, and track orders with timely in-app status updates; store owners can manage stores/products/orders and admins can oversee users, stores, orders, and settings in-app.
