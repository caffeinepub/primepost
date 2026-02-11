# Specification

## Summary
**Goal:** Produce and deploy a valid, installable Android APK for PrimePost Version 22 and serve it correctly as a static asset.

**Planned changes:**
- Deploy a real APK binary at `/assets/primepost.apk` (not an HTML fallback) and ensure it is installable on Android.
- Deploy a matching metadata file at `/assets/primepost.apk.meta.json` containing `filename`, `size`, `sha256`, and `buildDate` for the deployed APK.
- Add/ensure a pre-deploy staging + validation step that fails the build/deploy if the APK or metadata is missing or invalid (e.g., too small or not starting with `PK`).
- Configure static hosting rules so `/assets/primepost.apk` and `/assets/primepost.apk.meta.json` are served directly with `200` and correct `Content-Type` headers (no SPA rewrite to `/index.html`).

**User-visible outcome:** Users can download `https://<site>/assets/primepost.apk` and install PrimePost Version 22 on Android; the matching metadata is available at `https://<site>/assets/primepost.apk.meta.json`.
