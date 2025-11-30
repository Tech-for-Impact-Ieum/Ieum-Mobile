/**
 * Type definitions for Ieum Chat Application
 * Identical to web version - platform agnostic
 */

// ============================================
// User Types
// ============================================

export interface UserSetting {
  nickname?: string;
  imageUrl?: string;
  isSpecial: boolean; // 발달장애인 인터페이스
  isTest: boolean; // 테스트 계정
  enableNotifications: boolean;
  enableSummary: boolean;
  isOnline?: boolean;
  lastSeenAt?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  setting?: UserSetting;
  createdAt?: string;
  friendshipStatus?: "none" | "pending" | "accepted" | "blocked";
}

export interface Friend {
  id: number;
  name: string;
  email?: string;
  setting?: UserSetting;
}

// ============================================
// Message Types
// ============================================

export interface MediaItem {
  type: "audio" | "image" | "video" | "file";
  key: string; // S3 파일 키 (DB 저장용)
  url?: string; // Signed URL (백엔드가 자동 생성, 표시용)
  fileName?: string;
  fileSize?: number;
  duration?: number; // 음성/비디오
  width?: number; // 이미지/비디오
  height?: number;
  mimeType?: string;
}

export interface ReadByUser {
  userId: number;
  readAt: string;
}

export interface Message {
  id: string; // MongoDB ObjectId
  roomId: number; // MySQL Room.id (number)
  senderId: number;
  senderName: string;
  senderNickname?: string;
  senderImageUrl?: string;
  text?: string;
  media: MediaItem[];
  readBy: ReadByUser[];
  createdAt: string;
  updatedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

// ============================================
// Chat Room Types
// ============================================

export interface LastMessage {
  id: string;
  text?: string;
  senderId: number;
  senderName: string;
  createdAt: string;
}

export interface ChatRoom {
  id: number; // MySQL Room.id (number)
  name: string;
  imageUrl?: string;
  participantCount: number;
  roomType: "direct" | "group";
  unreadCount: number;
  lastMessage?: LastMessage;
  lastMessageAt?: string;
  participants: User[];
  isPinned?: boolean;
  isMuted?: boolean;
  // Legacy fields
  messages?: Message[];
  unread?: number;
  time?: string;
}

// ============================================
// Summary Types
// ============================================

export interface ChatSummary {
  id: number;
  text: string;
  audioUrl: string;
  messageCount: number;
  createdAt: string;
}

// ============================================
// Socket Event Types
// ============================================

export interface UserStatusChangedEvent {
  userId: number;
  isOnline: boolean;
  lastSeenAt?: string;
}

export interface UserJoinedEvent {
  userId: number;
  roomId: number;
  userName: string;
}

export interface UserLeftEvent {
  userId: number;
  roomId: number;
  userName: string;
}

export interface UnreadCountUpdateEvent {
  roomId: number;
  unreadCount: number;
}

export interface MessagesReadEvent {
  roomId: number;
  messageId: string;
  userId: number;
}

export interface UserTypingEvent {
  roomId: number;
  userId: number;
  userName: string;
  isTyping: boolean;
}

// ============================================
// Error Types
// ============================================

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AuthError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code, 401);
    this.name = "AuthError";
  }
}

export class NetworkError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code, 500);
    this.name = "NetworkError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code?: string) {
    super(message, code, 400);
    this.name = "ValidationError";
  }
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  ok: boolean;
  error?: string;
  [key: string]: unknown;
}

export interface RoomsResponse extends ApiResponse {
  rooms: ChatRoom[];
}

export interface MessagesResponse extends ApiResponse {
  messages: Message[];
  hasMore?: boolean;
}

export interface RoomResponse extends ApiResponse {
  room: ChatRoom;
}

export interface MessageResponse extends ApiResponse {
  message: Message;
}
