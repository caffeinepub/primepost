# Specification

## Summary
**Goal:** Fix the runtime error by ensuring `useLanguage()` is only used within a `LanguageProvider` context across the app.

**Planned changes:**
- Wrap the relevant React component tree in `LanguageProvider` (without changing immutable bootstrap files like `frontend/src/main.tsx`).
- Adjust `frontend/src/App.tsx` and/or `frontend/src/components/layout/AppLayout.tsx` so `useLanguage()` calls always occur under the provider.

**User-visible outcome:** Navigating to `/` and other routes renders normally, and the language selector + translated layout work without crashing or logging “useLanguage must be used within a LanguageProvider”.
