/**
 * Socket.io Client for React Native
 * Adapted from Next.js version - uses AsyncStorage for token
 */

import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Message,
  ChatRoom,
  MediaItem,
  UserStatusChangedEvent,
  UserJoinedEvent,
  UserLeftEvent,
  UnreadCountUpdateEvent,
  MessagesReadEvent,
  UserTypingEvent,
} from "../types";

let socket: Socket | null = null;
const joinedRooms: Set<number> = new Set();

export async function initSocketClient(token?: string) {
  if (socket?.connected) {
    console.log("✓ Socket already connected, reusing:", socket?.id);
    return socket;
  }

  // Get token from AsyncStorage if not provided
  if (!token) {
    token = (await AsyncStorage.getItem("token")) || undefined;
  }

  // TODO: Update with your environment variable
  const url = process.env.EXPO_PUBLIC_SOCKET_URL || "http://localhost:4001";
  console.log("🔌 Initializing socket connection to:", url);

  socket = io(url, {
    path: "/socket.io/",
    auth: {
      token: token,
    },
    transports: ["websocket", "polling"],
    autoConnect: true,
  });

  socket.on("connect", () => {
    console.log("✓ Socket connected:", socket?.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("⊖ Socket disconnected:", reason);
    // Clear joined rooms on disconnect
    joinedRooms.clear();
  });

  socket.on("connect_error", (error) => {
    console.error("✗ Socket connection error:", error.message);
  });

  socket.on("error", (error) => {
    console.error("✗ Socket error:", error);
  });

  // Add general event listener to debug all incoming events
  socket.onAny((eventName, ...args) => {
    console.log(`📨 Socket event received: "${eventName}"`, args);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function isSocketConnected() {
  const connected = socket?.connected || false;
  console.log(
    `🔍 Socket connection status: ${
      connected ? "✓ Connected" : "✗ Not connected"
    }`,
    {
      socketExists: !!socket,
      socketId: socket?.id,
      connected,
    }
  );
  return connected;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
    joinedRooms.clear();
  }
}

export function joinRoom(roomId: number | string) {
  if (!socket) {
    console.error(`❌ Cannot join room - socket not initialized`);
    return;
  }

  // Convert to number if string (for compatibility)
  const numericRoomId =
    typeof roomId === "string" ? parseInt(roomId, 10) : roomId;

  // Check if already joined this room
  if (joinedRooms.has(numericRoomId)) {
    console.log(`⏩ Already joined room: ${numericRoomId}, skipping`);
    return;
  }

  if (socket && socket.connected) {
    socket.emit("join-room", numericRoomId);
    joinedRooms.add(numericRoomId);
    console.log(`📍 Emitting join-room for: ${numericRoomId}`);
  } else {
    console.warn(`⏳ Socket not yet connected, waiting...`);
    // Wait for connection then join
    socket.once("connect", () => {
      // Check again in case it was joined while waiting
      if (!joinedRooms.has(numericRoomId)) {
        socket?.emit("join-room", numericRoomId);
        joinedRooms.add(numericRoomId);
        console.log(
          `📍 Emitting join-room for: ${numericRoomId} (after connect)`
        );
      }
    });
  }
}

export function leaveRoom(roomId: number | string) {
  if (socket && socket.connected) {
    // Convert to number if string (for compatibility)
    const numericRoomId =
      typeof roomId === "string" ? parseInt(roomId, 10) : roomId;

    socket.emit("leave-room", numericRoomId);
    joinedRooms.delete(numericRoomId);
    console.log(`Left room: ${numericRoomId}`);
  }
}

export function onNewMessage(callback: (message: Message) => void) {
  console.log('👂 Setting up listener for "new-message" event');
  if (socket) {
    socket.on("new-message", callback);
    console.log('✓ Listener registered for "new-message"');
  } else {
    console.error("❌ Cannot register listener - socket not initialized");
  }

  return () => {
    if (socket) {
      socket.off("new-message", callback);
      console.log('🔇 Unregistered "new-message" listener');
    }
  };
}

export function onRoomUpdate(callback: (room: ChatRoom) => void) {
  if (socket) {
    socket.on("room-updated", callback);
  }

  return () => {
    if (socket) {
      socket.off("room-updated", callback);
    }
  };
}

export function onUserStatusChanged(
  callback: (data: UserStatusChangedEvent) => void
) {
  if (socket) {
    socket.on("user-status-changed", callback);
  }

  return () => {
    if (socket) {
      socket.off("user-status-changed", callback);
    }
  };
}

export function onUserJoined(callback: (data: UserJoinedEvent) => void) {
  if (socket) {
    socket.on("user-joined", callback);
  }

  return () => {
    if (socket) {
      socket.off("user-joined", callback);
    }
  };
}

export function onUserLeft(callback: (data: UserLeftEvent) => void) {
  if (socket) {
    socket.on("user-left", callback);
  }

  return () => {
    if (socket) {
      socket.off("user-left", callback);
    }
  };
}

/**
 * Send a message to a chat room
 * @param roomId Room ID (number)
 * @param text Text content (optional if media is present)
 * @param media Array of media items (optional)
 */
export function sendMessage(
  roomId: number,
  text?: string,
  media: MediaItem[] = []
) {
  if (socket && socket.connected) {
    socket.emit("send-message", { roomId, text, media });
  } else {
    console.error("❌ Cannot send message - socket not connected");
  }
}

/**
 * Mark messages as read in a room
 * @param roomId Room ID
 * @param messageId Last read message ID (MongoDB ObjectId)
 */
export function markMessagesAsRead(roomId: number, messageId: string) {
  if (socket && socket.connected) {
    socket.emit("mark-read", { roomId, messageId });
  }
}

/**
 * Send typing indicator
 * @param roomId Room ID
 * @param isTyping Whether the user is typing
 */
export function sendTypingIndicator(roomId: number, isTyping: boolean) {
  if (socket && socket.connected) {
    socket.emit("typing", { roomId, isTyping });
  }
}

/**
 * Listen for unread count updates
 */
export function onUnreadCountUpdate(
  callback: (data: UnreadCountUpdateEvent) => void
) {
  if (socket) {
    socket.on("unread-count-update", callback);
  }

  return () => {
    if (socket) {
      socket.off("unread-count-update", callback);
    }
  };
}

/**
 * Listen for messages read events
 */
export function onMessagesRead(callback: (data: MessagesReadEvent) => void) {
  if (socket) {
    socket.on("message-read", callback);
  }

  return () => {
    if (socket) {
      socket.off("message-read", callback);
    }
  };
}

/**
 * Listen for typing indicator
 */
export function onUserTyping(callback: (data: UserTypingEvent) => void) {
  if (socket) {
    socket.on("user-typing", callback);
  }

  return () => {
    if (socket) {
      socket.off("user-typing", callback);
    }
  };
}
