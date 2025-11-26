/**
 * Chat Room Screen for React Native
 * Adapted from Next.js chat/[id]/page.tsx
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Image,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ApiClient } from "../services/apiClient";
import { Auth } from "../services/auth";
import {
  initSocketClient,
  joinRoom,
  leaveRoom,
  onNewMessage,
  onMessagesRead,
  markMessagesAsRead,
  isSocketConnected,
} from "../services/socketClient";
import type { Message, ChatRoom, MediaItem } from "../types";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { ActionButtons } from "../components/ActionButtons";
import { EmojiPickerModal } from "../components/EmojiPickerModal";
import { QuickResponseModal } from "../components/QuickResponseModal";
import { VoiceInputModal } from "../components/VoiceInputModal";
import { ChatSummary } from "../components/ChatSummary";
import { AudioPlayer } from "../components/AudioPlayer";
import { Colors } from "@/constants/colors";

type ChatRoomRouteProp = RouteProp<RootStackParamList, "ChatRoom">;
type ChatRoomNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "ChatRoom"
>;

export default function ChatRoomScreen() {
  const route = useRoute<ChatRoomRouteProp>();
  const navigation = useNavigation<ChatRoomNavigationProp>();
  const { roomId, roomName } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const [showQuickResponseModal, setShowQuickResponseModal] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Set navigation title
  useEffect(() => {
    navigation.setOptions({ title: roomName });
  }, [navigation, roomName]);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      const userId = await Auth.getUserId();
      setCurrentUserId(userId);
    };
    loadUser();
  }, []);

  // Load chat room details
  useEffect(() => {
    const loadChatRoom = async () => {
      try {
        const token = await Auth.getToken();
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/chat/rooms/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.room) {
            setChatRoom(data.room);
          }
        }
      } catch (error) {
        console.error("Error loading chat room:", error);
      }
    };
    loadChatRoom();
  }, [roomId]);

  // Load messages
  useEffect(() => {
    if (!currentUserId) return;

    const loadMessages = async () => {
      try {
        const token = await Auth.getToken();
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/chat/rooms/${roomId}/messages?currentUserId=${currentUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          if (data.ok && data.messages) {
            setMessages(data.messages);
          }
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    loadMessages();
  }, [roomId, currentUserId]);

  // Initialize socket and join room
  useEffect(() => {
    if (!currentUserId || !chatRoom?.id) return;

    const initSocket = async () => {
      const token = await Auth.getToken();
      if (!token) return;

      // Initialize socket
      initSocketClient(token);
      joinRoom(roomId);

      // Listen for new messages
      const unsubscribe = onNewMessage((message: Message) => {
        if (Number(message.roomId) !== Number(roomId)) return;
        if (message.senderId === currentUserId) return; // Skip own messages

        setMessages((prev) => {
          if (prev.some((msg) => msg.id === message.id)) return prev;
          return [...prev, message];
        });
      });

      // Listen for messages-read events
      const unsubscribeMessagesRead = onMessagesRead((data) => {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === data.messageId) {
              const alreadyRead = msg.readBy.some(
                (r) => r.userId === data.userId
              );
              if (!alreadyRead) {
                return {
                  ...msg,
                  readBy: [
                    ...msg.readBy,
                    { userId: data.userId, readAt: new Date().toISOString() },
                  ],
                };
              }
            }
            return msg;
          })
        );
      });

      return () => {
        unsubscribe();
        unsubscribeMessagesRead();
        leaveRoom(roomId);
      };
    };

    initSocket();
  }, [roomId, currentUserId, chatRoom?.id]);

  // Mark messages as read when user is viewing the chat room
  useEffect(() => {
    if (!currentUserId || messages.length === 0 || !chatRoom?.id) {
      return;
    }

    // Find the last message that's not sent by current user
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage) return;

    // Don't mark as read if the last message is from current user
    if (lastMessage.senderId === currentUserId) return;

    // Check if current user has already read this message
    const alreadyRead = lastMessage.readBy.some(
      (r) => r.userId === currentUserId
    );
    if (alreadyRead) return;

    // Mark messages as read after a short delay (to ensure user actually sees them)
    const timeoutId = setTimeout(() => {
      const numericRoomId =
        typeof chatRoom.id === "string"
          ? parseInt(chatRoom.id, 10)
          : chatRoom.id;

      console.log(
        `Auto-marking messages as read in room ${numericRoomId} (last message: ${lastMessage.id})`
      );

      // Check socket connection status before marking as read
      isSocketConnected();
      markMessagesAsRead(numericRoomId, lastMessage.id);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [messages, currentUserId, chatRoom?.id]);

  const sendMessageToAPI = async (text: string, media: MediaItem[] = []) => {
    if (!currentUserId) return;

    try {
      const token = await Auth.getToken();
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/chat/rooms/${roomId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text,
            media,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      if (data.ok && data.message) {
        setMessages((prev) => [...prev, data.message]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentUserId) return;

    setIsLoading(true);
    try {
      await sendMessageToAPI(inputMessage.trim(), []);
      setInputMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmojiSelect = async (emoji: string) => {
    await sendMessageToAPI(emoji, []);
  };

  const handleVoiceInputSelect = async (
    text: string,
    audioMedia?: MediaItem
  ) => {
    const media = audioMedia ? [audioMedia] : [];
    await sendMessageToAPI(text, media);
  };

  const handleQuickResponseSelect = async (text: string) => {
    await sendMessageToAPI(text, []);
  };

  const handleMarkMessagesAsRead = useCallback(() => {
    console.log("Marking messages as read");
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    try {
      // Convert roomId to number for socket
      const numericRoomId =
        typeof roomId === "string" ? parseInt(roomId, 10) : roomId;

      // Use socket connection to mark messages as read
      markMessagesAsRead(numericRoomId, lastMessage.id);
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, [messages, roomId]);

  const readStatus = (message: Message) => {
    console.log("numReadBy:", message.readBy);
    const numReadBy = message.readBy.filter(
      (r) => r.userId !== message.senderId
    ).length;
    const isGroupChat = chatRoom?.roomType === "group";
    if (isGroupChat) {
      return numReadBy > 0 ? readComponent(`${numReadBy}명 읽음`) : "";
    }
    return numReadBy > 0 ? readComponent(`읽음`) : "";
  };

  const readComponent = (readBy: string) => {
    return (
      <View style={styles.readByContainer}>
        <Text style={styles.readByCheckmark}>✓</Text>
        <Text style={styles.readByText}>{readBy}</Text>
      </View>
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = currentUserId === item.senderId;
    const hasMedia = item.media && item.media.length > 0;
    const hasText = item.text && item.text.trim().length > 0;

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage
            ? styles.myMessageContainer
            : styles.otherMessageContainer,
        ]}
      >
        {!isMyMessage && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}

        {/* Render Media Items */}
        {hasMedia && (
          <View style={styles.mediaContainer}>
            {item.media.map((mediaItem, index) => {
              if (!mediaItem.url) return null;

              return (
                <View key={index} style={styles.mediaItem}>
                  {/* Image */}
                  {mediaItem.type === "image" && (
                    <TouchableOpacity
                      onPress={() => {
                        // TODO: Add image lightbox/modal viewer
                        console.log("Open image:", mediaItem.url);
                      }}
                    >
                      <Image
                        source={{ uri: mediaItem.url }}
                        style={styles.imageMedia}
                        resizeMode="cover"
                      />
                    </TouchableOpacity>
                  )}

                  {/* Audio */}
                  {mediaItem.type === "audio" && (
                    <AudioPlayer
                      src={mediaItem.url}
                      duration={mediaItem.duration}
                      fileName={mediaItem.fileName}
                      isMyMessage={isMyMessage}
                    />
                  )}

                  {/* Video */}
                  {mediaItem.type === "video" && (
                    <TouchableOpacity
                      style={styles.videoContainer}
                      onPress={() => {
                        // TODO: Open video player
                        console.log("Open video:", mediaItem.url);
                      }}
                    >
                      <Text style={styles.videoIcon}>🎬</Text>
                      <Text style={styles.videoText}>Video</Text>
                    </TouchableOpacity>
                  )}

                  {/* File */}
                  {mediaItem.type === "file" && (
                    <TouchableOpacity
                      style={[
                        styles.fileContainer,
                        isMyMessage
                          ? styles.fileMyMessage
                          : styles.fileOtherMessage,
                      ]}
                      onPress={() => {
                        // TODO: Implement file download
                        console.log("Download file:", mediaItem.url);
                      }}
                    >
                      <Text style={styles.fileIcon}>📄</Text>
                      <View style={styles.fileInfo}>
                        <Text
                          style={styles.fileName}
                          numberOfLines={1}
                          ellipsizeMode="middle"
                        >
                          {mediaItem.fileName || "File"}
                        </Text>
                        {mediaItem.fileSize && (
                          <Text style={styles.fileSize}>
                            {(mediaItem.fileSize / 1024).toFixed(0)} KB
                          </Text>
                        )}
                      </View>
                      <Text style={styles.downloadText}>↓</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Render Text */}
        {hasText && (
          <View
            style={[
              styles.messageBubble,
              isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.otherMessageText,
              ]}
            >
              {item.text}
            </Text>
          </View>
        )}

        <View style={styles.messageFooter}>
          {isMyMessage && readStatus(item)}
          <Text style={styles.messageTime}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Chat Summary */}
      {chatRoom && (
        <ChatSummary
          roomId={roomId}
          onSummaryComplete={handleMarkMessagesAsRead}
          autoLoad={true}
        />
      )}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
      />

      {/* Action Buttons */}
      <ActionButtons
        onEmojiPress={() => setShowEmojiModal(true)}
        onVoicePress={() => setShowVoiceModal(true)}
        onQuickReplyPress={() => setShowQuickResponseModal(true)}
      />

      {/* Message Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="메시지 입력"
          value={inputMessage}
          onChangeText={setInputMessage}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputMessage.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading}
        >
          <Text style={styles.sendButtonText}>
            {isLoading ? "전송중" : "보내기"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Modals */}
      <VoiceInputModal
        visible={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onSend={handleVoiceInputSelect}
      />
      <EmojiPickerModal
        visible={showEmojiModal}
        onClose={() => setShowEmojiModal(false)}
        onEmojiSelect={handleEmojiSelect}
      />
      <QuickResponseModal
        visible={showQuickResponseModal}
        onClose={() => setShowQuickResponseModal(false)}
        roomId={roomId}
        onSelect={handleQuickResponseSelect}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.kakaoSkyblue,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessageContainer: {
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignItems: "flex-start",
  },
  senderName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: Colors.kakaoYellow,
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: "#000000",
  },
  otherMessageText: {
    color: "#000000",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
    paddingHorizontal: 8,
  },
  messageTime: {
    fontSize: 12,
    color: "#6B7280",
  },
  readBy: {
    fontSize: 10,
    color: "#3B82F6",
  },
  readByContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  readByCheckmark: {
    fontSize: 10,
    color: "#3B82F6",
    marginRight: 2,
  },
  readByText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#3B82F6",
  },
  inputContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: "#000000",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  // Media styles
  mediaContainer: {
    gap: 8,
    marginBottom: 8,
  },
  mediaItem: {
    maxWidth: 300,
    borderRadius: 12,
    overflow: "hidden",
  },
  // Image styles
  imageMedia: {
    width: 300,
    height: 200,
    borderRadius: 12,
  },
  // Audio styles - MOVED TO AudioPlayer component
  // Video styles
  videoContainer: {
    backgroundColor: "#F3F4F6",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
  },
  videoIcon: {
    fontSize: 48,
  },
  videoText: {
    fontSize: 16,
    color: "#374151",
  },
  // File styles
  fileContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    gap: 12,
    minWidth: 250,
  },
  fileMyMessage: {
    backgroundColor: "#FEE500",
  },
  fileOtherMessage: {
    backgroundColor: "#FFFFFF",
  },
  fileIcon: {
    fontSize: 32,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: "#6B7280",
  },
  downloadText: {
    fontSize: 20,
    color: "#3B82F6",
  },
});
