# Specification

## Summary
**Goal:** Add Privacy Policy support end-to-end and publish the provided legal texts for PrimePost (Customer Terms, Store Owner/Service Provider Terms, and Privacy Policy).

**Planned changes:**
- Extend backend legal-documents storage/APIs to include a Privacy Policy document with public read access and Super Admin-only write access, keeping existing Terms APIs unchanged.
- Set/publish the stored legal content for Customer Terms, Store Owner/Service Provider Terms, and Privacy Policy exactly as provided by the user, replacing any “[App Name]” token with “PrimePost”.
- Add a new frontend Privacy Policy screen that displays the stored Privacy Policy text with the same scroll/readability treatment as the existing terms display and is reachable from anywhere in the app via a “Privacy Policy” link/entry for all roles.
- Update the Super Admin legal-documents management UI to include a Privacy Policy editor (load/edit/save) alongside existing editors, including cache invalidation/refetch so updates appear immediately.

**User-visible outcome:** Users of any role can open and read the Privacy Policy in-app, and Super Admins can view/edit/save the Privacy Policy (and the published Terms) from the admin legal-documents area.
