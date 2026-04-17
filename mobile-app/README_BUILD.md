# Build APK Instructions

This React Native Expo app can be built into an APK using several methods:

## Method 1: GitHub Actions (FREE - Recommended)

1. Push this code to a GitHub repository
2. Go to the "Actions" tab in your GitHub repo
3. Run the "Build Android APK" workflow
4. Download the APK from the workflow artifacts

This is completely free and runs on GitHub's servers!

## Method 2: Expo EAS Build (FREE TIER)

1. Install EAS CLI:
   ```bash
   npm install -g eas-cli
   ```

2. Login to Expo:
   ```bash
   eas login
   ```

3. Configure project (already done - see `eas.json`)

4. Build APK:
   ```bash
   eas build --platform android --profile preview
   ```

   - Free tier: 30 builds/month
   - Builds run on Expo's cloud servers
   - Download link provided when complete

## Method 3: Local Build (Requires Setup)

### Prerequisites:
- Node.js 20+
- Java 17 JDK
- Android SDK
- Android Studio (optional but recommended)

### Steps:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Prebuild Android project:
   ```bash
   npx expo prebuild --platform android
   ```

3. Build APK:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

4. Find APK at:
   ```
   android/app/build/outputs/apk/release/app-release-unsigned.apk
   ```

## App Configuration

- **Package Name**: com.yourcompany.gamemobileapp
- **Version**: 1.0.0
- **Permissions**: INTERNET

## Customize Before Building

1. Update `app.json` with your:
   - App name
   - Package name
   - Version

2. Replace icons in `assets/` folder:
   - icon.png (1024x1024)
   - adaptive-icon.png (1024x1024)
   - splash.png (1024x1024)
   - favicon.png (64x64)

3. For signed release builds, add signing configuration in `android/app/build.gradle`
