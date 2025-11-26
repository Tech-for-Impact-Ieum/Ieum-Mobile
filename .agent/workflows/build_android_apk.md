---
description: How to build an Android APK for Ieum-Mobile
---

To build an Android APK for your project, you can use EAS Build. Since you have `eas.json` configured, you can run a build for the `preview` profile to get an installable APK (or AAB for production).

## Prerequisites
1.  Ensure you are logged in to your Expo account:
    ```bash
    eas login
    ```
2.  Ensure you have a `google-services.json` file in the root of `Ieum-Mobile` if you are using Firebase/Google services (referenced in `app.json`).

## Build Command

To build an APK for testing (internal distribution):

```bash
eas build -p android --profile preview
```

This will create an APK that you can install on your device.

## Production Build (AAB)

If you want to build an AAB for the Google Play Store:

```bash
eas build -p android --profile production
```

## Troubleshooting
-   If the build fails, check the logs provided in the EAS dashboard link.
-   Ensure all assets (icons, splash screens) exist at the paths specified in `app.json`.
