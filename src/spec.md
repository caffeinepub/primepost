# Specification

## Summary
**Goal:** Fix deployment so `/assets/primepost.apk` serves a valid Android APK binary (not an HTML fallback) and ensure related metadata is correctly published.

**Planned changes:**
- Ensure a real APK binary is deployed at `frontend/public/assets/primepost.apk` and metadata is deployed at `frontend/public/assets/primepost.apk.meta.json`.
- Add a pre-deploy staging/validation step that runs `frontend/scripts/stage-android-apk-assets.sh` and fails the build/deploy on missing/invalid APK or metadata.
- Configure static asset serving so `.apk` files are not rewritten to the SPA HTML entry and are served with an APK-appropriate Content-Type at `/assets/primepost.apk`.

**User-visible outcome:** Visiting `/assets/primepost.apk` downloads a valid APK (>= 1 MB and starting with `PK`), and `/assets/primepost.apk.meta.json` is accessible with a `size` that matches the deployed APK.
