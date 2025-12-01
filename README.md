# 이음

**이음**은 발달장애청년들이 쉽게 온라인으로 소통하도록 돕는 솔루션입니다.

## 팀 소개

<img width="543" height="339" alt="image" src="https://github.com/user-attachments/assets/0035bf57-0f44-4031-b1e4-1003a66446af" />


| 이름    | 소개                       | Email                     | GitHub ID   | 역할           |
|---------|----------------------------|----------------------------|-------------|----------------|
| 김정우   | KAIST 전산학부 24학번        | placeholder                | placeholder | 팀장           |
| 안시현   | KAIST 전기및전자공학부 20학번 | sihyun.ahn@kaist.ac.kr    | sihyun-ahn | Frontend       |
| 이리아   | KAIST 전산학부 21학번        | placeholder                | placeholder | UI/UX Design   |
| 손주호   | KAIST 산업및시스템공학과 24학번 | placeholder                | placeholder | Backend        |
| 정다호   | KAIST 전산학부 17학번        | placeholder                | placeholder | Full Stack     |


## 프로젝트 개요

### 문제 정의

### 우리의 해결책

## 프로젝트 결과

### 데모 영상

### 특징 및 장점

## 기대 효과

## 설치 및 실행 방법

### Installation

1. **Clone the repository** (if not already done):

   ```bash
   cd /Users/dho/Kaist/2025_fall/TechForImpact/Ieum-Mobile
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

### How to run (development mode)

Start the Expo development server:

```bash
npm start
```

This will open Expo DevTools in your browser. From there you can:

- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go app on your physical device

**Run on iOS Simulator:**

```bash
npm run ios
```

**Run on Android Emulator:**

```bash
npm run android
```

**Run on Web (for testing):**

```bash
npm run web
```

### How to build for production

**iOS**

1. Configure app.json with your bundle identifier
2. Build the app:
   ```bash
   eas build --platform ios
   ```
3. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

**Android**

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

## 개발 환경

- Node.js (v18 or higher)
- npm
- iOS: Xcode (for iOS development)
- Android: Android Studio and Android SDK (for Android development)
- Expo CLI

### Project Structure

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

### Key Technologies

For frontend:

- **React Native**: Cross-platform mobile framework
- **Expo**: Development platform and tools
- **React Navigation**: Navigation library
  - Bottom Tabs Navigator
  - Stack Navigator
- **Socket.io Client**: Real-time communication
- **React Native Paper**: Material Design UI components
- **AsyncStorage**: Local data persistence
- **Lucide React Native**: Icon library

For backend:

- **API Server**: REST API for data operations (default: port 4000)
- **Socket.io Server**: WebSocket for real-time messaging (default: port 4001)

## 관련 프로젝트
- **Web-based frontend (version 0.0.1)**: https://github.com/Tech-for-Impact-Ieum/Ieum
- **App-based frontend (version 1.0.0)**: https://github.com/Tech-for-Impact-Ieum/Ieum-Mobile
- **Server**: https://github.com/Tech-for-Impact-Ieum/Ieum-backend
- **Figma**:
