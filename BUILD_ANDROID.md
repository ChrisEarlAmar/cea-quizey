# Building Quizey for Android

## Prerequisites

- [Android Studio](https://developer.android.com/studio) (with Android SDK installed)
- Node.js 18+

## Steps

```bash
# 1. Install dependencies (first time only)
npm install

# 2. Build the web app for Capacitor
npm run build:cap

# 3. Sync the web build to the Android project
npm run cap:sync

# 4. Open Android Studio to generate the APK
npm run cap:open
```

In Android Studio, go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**.  
The APK will be at `android/app/build/outputs/apk/debug/app-debug.apk`.

> **Tip**: For a release APK, use **Build → Generate Signed Bundle / APK** in Android Studio with a keystore.

## One-command build (requires Android SDK in PATH)

```bash
npm run cap:build
```

This builds the APK directly via the Capacitor CLI (non-interactive, expects Android SDK configured).

## Notes

- The `android/` directory is committed to the repository — no `npx cap init` or `npx cap add android` needed after cloning.
- Running `npm run build` (without `:cap`) generates the GitHub Pages build at `/quizey/` — only use `build:cap` before syncing to Android.

## Regenerating app icons

If you replace the logo at `public/logo.png`, regenerate the Android icons:

```bash
# The source file for icon generation is assets/icon.png (copy of logo.png)
npx capacitor-assets generate icon --android
npx cap sync
```

This generates all required icon sizes (mdpi through xxxhdpi) and adaptive icon assets.
