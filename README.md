# Ieum Mobile - React Native App

React Native mobile application for the Ieum chat platform, converted from the Next.js web application.

## Features

- Real-time messaging with Socket.io
- Friends management
- Group and direct messaging
- Media sharing (images, videos, audio, files)
- Push notifications
- Cross-platform (iOS & Android)

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- iOS: Xcode (for iOS development)
- Android: Android Studio and Android SDK (for Android development)
- Expo CLI (installed automatically)

## Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd /Users/dho/Kaist/2025_fall/TechForImpact/Ieum-Mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## Running the App

### Development Mode

Start the Expo development server:
```bash
npm start
```

This will open Expo DevTools in your browser. From there you can:
- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go app on your physical device

### Run on iOS Simulator:
```bash
npm run ios
```

### Run on Android Emulator:
```bash
npm run android
```

### Run on Web (for testing):
```bash
npm run web
```

## Project Structure

```
Ieum-Mobile/
├── src/
│   ├── screens/          # Main app screens
│   │   ├── LoginScreen.tsx
│   │   ├── ChatListScreen.tsx
│   │   ├── ChatRoomScreen.tsx
│   │   ├── FriendsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/       # Reusable components
│   │   └── ui/          # UI components
│   ├── navigation/      # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── services/        # API and Socket.io clients
│   │   ├── apiClient.ts
│   │   ├── socketClient.ts
│   │   └── auth.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   └── assets/          # Images, fonts, etc.
├── App.tsx              # Main app entry point
├── package.json
└── .env                 # Environment variables (create from .env.example)
```

## Key Technologies

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and tools
- **React Navigation**: Navigation library
  - Bottom Tabs Navigator
  - Stack Navigator
- **Socket.io Client**: Real-time communication
- **React Native Paper**: Material Design UI components
- **AsyncStorage**: Local data persistence
- **Lucide React Native**: Icon library

## Backend Connection

The app connects to the existing Ieum backend:
- **API Server**: REST API for data operations (default: port 4000)
- **Socket.io Server**: WebSocket for real-time messaging (default: port 4001)

Make sure the backend servers are running before testing the app.

## Building for Production

### iOS

1. Configure app.json with your bundle identifier
2. Build the app:
   ```bash
   eas build --platform ios
   ```
3. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

### Android

1. Configure app.json with your package name
2. Build the app:
   ```bash
   eas build --platform android
   ```
3. Submit to Google Play:
   ```bash
   eas submit --platform android
   ```

**Note**: You'll need an Expo account to use EAS Build. Run `eas login` first.

## Testing

- Test on iOS Simulator for iOS-specific features
- Test on Android Emulator for Android-specific features
- Test on physical devices for best performance testing
- Test real-time messaging with multiple devices

## Common Issues

### Cannot connect to backend

- Make sure you're using your computer's local IP address in `.env`, not `localhost`
- Ensure the backend servers are running
- Check firewall settings

### Socket.io connection fails

- Verify `EXPO_PUBLIC_SOCKET_URL` is correct
- Check that the Socket.io server is accessible from your device/emulator
- Look for Socket connection logs in the console

### Build errors

- Clear cache: `npx expo start -c`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Clear watchman: `watchman watch-del-all`

## Development Tips

1. **Hot Reload**: Changes to code will automatically reload the app
2. **Developer Menu**: 
   - iOS: Cmd+D
   - Android: Cmd+M or shake device
3. **Logs**: Use `console.log()` - they appear in the terminal
4. **Debugging**: Use React Native Debugger or Flipper

## Contributing

This app is part of the Tech for Impact 2025F project - Team 이음 (Ieum).

## License

[Your License Here]
