---
description: How to test and debug notification services
---

This guide explains how to test and debug push notifications in the Ieum project.

## 1. Prerequisites
-   **Expo Push Token**: You need a valid Expo Push Token from a physical device. Simulators/Emulators **cannot** receive push notifications.
    -   Run the mobile app on a physical device using Expo Go or a development build.
    -   Login or check the logs to get your device's push token (e.g., `ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]`).

## 2. Sending a Test Notification (Backend Script)
We have created a script to manually trigger a notification from the backend.

**Command:**
```bash
# From Ieum-Backend directory
node scripts/test-notification.js <Your-Expo-Push-Token>
```

**Example:**
```bash
node scripts/test-notification.js ExponentPushToken[AbC123XyZ...]
```

**What happens:**
1.  The script connects to MongoDB.
2.  It calls `notificationService.sendPushNotification`.
3.  It logs the result to the console.
4.  It saves the notification record to the `push_notifications` collection in MongoDB.

## 3. Verifying on Mobile
-   **Foreground**: If the app is open, you should see a `console.log` or an alert depending on your `Notifications.setNotificationHandler` configuration.
-   **Background**: If the app is in the background, the system notification tray should show the notification.

## 4. Debugging Steps

### A. Notification Not Received?
1.  **Check the Backend Logs**: Run the test script and check for errors.
    -   If you see "Push token ... is not a valid Expo push token", your token is malformed.
    -   If you see "Error sending push notifications chunk", there might be a network issue or Expo service issue.
2.  **Check MongoDB**:
    -   Connect to your MongoDB instance.
    -   Query the `push_notifications` collection: `db.push_notifications.find().sort({createdAt: -1}).limit(1)`
    -   Check the `status` and `tickets` fields.
        -   `status: "sent"` means Expo received the request.
        -   Check `tickets` for `status: "error"` details.
3.  **Check Expo Push Receipt Tool**:
    -   If the backend says "sent" but you didn't receive it, use [Expo's Push Notifications Tool](https://expo.dev/notifications) to manually send a notification to your token. This isolates the issue to the device/token vs. the backend.

### B. "Device not registered" Error
-   This usually means the token is old or invalid. Uninstall and reinstall the app on the device to generate a fresh token.

### C. Android Specifics
-   Ensure you have set up a Notification Channel (handled in `App.tsx` or `index.ts`).
-   On Android 13+, ensure you have requested `POST_NOTIFICATIONS` permission.
