# 이음

**이음**은 발달장애청년들이 쉽게 온라인으로 소통하도록 돕는 솔루션입니다.

## 팀 소개

<img width="543" height="339" alt="image" src="https://github.com/user-attachments/assets/0035bf57-0f44-4031-b1e4-1003a66446af" />

| 이름   | 소개                            | 연락처                                                  | 역할         |
| ------ | ------------------------------- | ------------------------------------------------------- | ------------ |
| 김정우 | KAIST 전산학부 24학번           | 📧 placeholder@kaist.ac.kr <br/> 🧑‍💻 GitHub: placeholder | 팀장         |
| 안시현 | KAIST 전기및전자공학부 20학번   | 📧 sihyun.ahn@kaist.ac.kr <br/> 🧑‍💻 GitHub: sihyun-ahn   | Frontend     |
| 이리아 | KAIST 전산학부 21학번           | 📧 placeholder@kaist.ac.kr <br/> 🧑‍💻 GitHub: placeholder | UI/UX Design |
| 손주호 | KAIST 산업및시스템공학과 24학번 | 📧 placeholder@kaist.ac.kr <br/> 🧑‍💻 GitHub: placeholder | Backend      |
| 정다호 | KAIST 전산학부 17학번           | 📧 placeholder@kaist.ac.kr <br/> 🧑‍💻 GitHub: placeholder | Full Stack   |

## 프로젝트 개요

### 문제 정의

학교를 졸업한 발달장애인은 돌봄 시설, 혹은 집에서 대부분의 시간을 보냅니다. 이로 인해 발달장애인은 홀로 많은 시간을 보내야 하고, 이 시간 동안 사회적인 교류를 이어가지 못하기 때문에 그들은 **외로움**과 **고립감**을 느낍니다.

필드트립에서 발달장애청년들을 직접 만나본 결과, 그들이 느끼는 외로움과 고립감 밑에는 **의사소통의 어려움**이 자리잡고 있었습니다. 발달장애청년들이 모인 온라인 대화 방에서도 핸드폰 사용과 대화에 능숙한 소수만 대화에 참여할 수 있었고, 그렇지 않은 이들은 자신의 뜻을 제대로 전달할 수 없었습니다.

### 우리의 해결책

발달장애청년의 온라인 의사소통을 보조합니다.

- **대화 맥락 파악 보조**:
  <br>사용자가 대화의 맥락을 빠르게 이해할 수 있도록 요약을 제공합니다.
- **손쉬운 답장 지원**:
  <br>사용자가 손쉽게 대화에 참여할 수 있도록, 손쉬운 답장 옵션을 제공합니다.
  - 직관적인 이모티콘으로 답장할 수 있습니다.
  - 사용자의 음성으로 답장할 수 있습니다. 이 경우 음성과, 이를 AI로 인식한 전사문이 함께 전송됩니다.
  - 대화 맥락에 맞게 추천된 문장으로 답장할 수 있습니다. AI를 이용해서 추천하는 3-4개의 답장 중 하나를 선택할 수 있습니다.
- **직관적인 UI**:
  <br>발달장애청년들에게 익숙한 대화 상대의 별명과 사진을 확대하여, 시각적으로 실제 대화 상황임을 알려줍니다.
  <br>전반적으로 큰 글씨와 큰 컴포넌트를 사용하여 직관적인 이해를 돕습니다.

## 프로젝트 결과

### 데모 영상

### 특징 및 장점

## 기대 효과

### 영향

### 발전 방향

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
│   │   ├── auth.ts
│   │   ├── media.ts
│   │   ├── notification.ts
│   │   └── socketClient.ts
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Utility functions
│   ├── assets/          # Images, fonts, etc.
│   └── constants/       # Constants

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

- **Web-based frontend (version `0.0.1`)**: https://github.com/Tech-for-Impact-Ieum/Ieum
- **App-based frontend (version `1.0.0`)**: https://github.com/Tech-for-Impact-Ieum/Ieum-Mobile
- **Server**: https://github.com/Tech-for-Impact-Ieum/Ieum-backend
- **Figma**: 
