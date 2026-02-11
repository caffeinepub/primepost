# Specification

## Summary
**Goal:** Fix production APK delivery so `/assets/primepost.apk` serves a valid, installable Android APK binary (not HTML) and add build/deploy safeguards to prevent stale or missing APK assets.

**Planned changes:**
- Ensure the production route `/assets/primepost.apk` serves the real APK file with correct binary headers/content type and without falling back to HTML/text.
- Update the production build/deploy workflow to explicitly stage and include `frontend/public/assets/primepost.apk` and `frontend/public/assets/primepost.apk.meta.json` from the latest Android build output, failing the build if the APK is missing/too small/invalid.
- Add an automated post-deploy verification step (triggered when `DEPLOY_URL` is provided) that validates the deployed APK header is `PK` and that the deployed APK and meta.json size/SHA-256 match, failing the pipeline with clear errors on mismatch/truncation/HTML responses.

**User-visible outcome:** Downloading `GET /assets/primepost.apk` in production returns a multi-megabyte, valid APK that installs and launches on Android without the “problem parsing the package” error.
