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
<br>  사용자가 대화의 맥락을 빠르게 이해할 수 있도록 요약을 제공합니다.

- **손쉬운 답장 지원**:
<br>  사용자가 손쉽게 대화에 참여할 수 있도록, 손쉬운 답장 옵션을 제공합니다.

- **직관적인 UI**:
<br>  발달장애청년들에게 익숙한 대화 상대의 별명과 사진을 확대하여, 시각적으로 실제 대화 상황임을 알려줍니다.
<br>  전반적으로 큰 글씨와 큰 컴포넌트를 사용하여 직관적인 이해를 돕습니다.

## 프로젝트 결과

### 데모 영상

### 특징 및 장점

**손쉬운 답장**

- 직관적인 이모티콘으로 답장할 수 있습니다.
- 사용자의 음성으로 답장할 수 있습니다. 이 경우 음성과, 이를 AI로 인식한 전사문이 함께 전송됩니다.
- 대화 맥락에 맞게 추천된 문장으로 답장할 수 있습니다. AI를 이용해서 추천하는 3-4개의 답장 중 하나를 선택할 수 있습니다.

**맥락 파악을 보조하는 채팅 요약**

- 기존 채팅 서비스는 '안 읽은 메세지'를 대상으로 꼼꼼한 요약을 제공하는 반면, 이음에서는 채팅방의 전반적인 메세지를 대상으로 간결한 요약을 제공합니다. 이로 인해 요약의 디테일이 부족할 수는 있으나, 1-2 문장으로 간결한 요약을 통해서 발달장애청년이 쉽고 빠르게 내용을 인지할 수 있도록 보조합니다.

**텍스트 읽어주기**
- 주요 텍스트를 음성으로 읽어줍니다. 유저 테스팅에서 발달장애청년들이 텍스트를 읽는 데 어려움을 겪는다는 피드백을 반영하여, 상대방이 보내온 메세지와 대화의 요약본을 TTS로 들을 수 있게 하였습니다. 이를 통해 발달장애청년은 채팅 내용을 보다 쉽게 이해할 수 있습니다.


## 기대 효과

### 영향

**온라인 의사소통 증진**
<br>발달장애청년이 온라인에서 더 쉽게 의사소통할 수 있도록 도와줍니다. 사용자 테스트 결과, 발달장애청년들은 이음 어플리케이션에 큰 관심을 보였고 놀이처럼 즐거워했습니다. 이를 통해 발달장애청년의 온라인 의사소통이 증진될 것으로 기대됩니다.

### 발전 방향

**주류 채팅 어플리케이션과 통합**
<br>현재는 자체적인 채팅 서비스를 운영하고 있지만, 추후 주류 채팅 서비스에 통합할 수 있습니다. 이를 통해 발달장애청년은 물론 그들과 소통하는 길동무들은 기존에 이용하던 채팅 어플리케이션 내에서 선택적으로 **이음** 모드를 이용할 수 있습니다.

## 설치 및 실행 방법

### 개발 환경 설정

#### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Tech-for-Impact-Ieum/Ieum-Mobile.git
   cd Ieum-Mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

#### Run on development mode

Start the Expo development server:

  ```bash
  npm start
  ```

This will open Expo DevTools in your browser. From there you can:

- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan the QR code with Expo Go app on your physical device

Run on iOS Simulator:

  ```bash
  npm run ios
  ```

Run on Android Emulator:

  ```bash
  npm run android
  ```

Run on Web (for testing):

  ```bash
  npm run web
  ```

#### Build for production

<ins>iOS</ins>

1. Configure app.json with your bundle identifier
2. Build the app:
   ```bash
   eas build --platform ios
   ```
3. Submit to App Store:
   ```bash
   eas submit --platform ios
   ```

<ins>Android</ins>

1. Configure app.json with your package name
2. Build the app:
   ```bash
   eas build --platform android
   ```
3. Submit to Google Play:
   ```bash
   eas submit --platform android
   ```

- Note: You'll need an Expo account to use EAS Build. Run `eas login` first.

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

For AI & Cloud Services:
- **OpenAI API**: GPT-4o chat summarization and TTS
- **AWS S3**: Media storage and hosting

## 관련 프로젝트

- **Web-based frontend (version `0.0.1`)**: https://github.com/Tech-for-Impact-Ieum/Ieum
- **App-based frontend (version `1.0.0`)**: https://github.com/Tech-for-Impact-Ieum/Ieum-Mobile
- **Server**: https://github.com/Tech-for-Impact-Ieum/Ieum-backend
- **Figma**:
