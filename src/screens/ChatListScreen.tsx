/**
 * Chat List Screen for React Native
 * Adapted from Next.js home page (chat rooms list)
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Image,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { chatApi } from "../utils/chatApi";
import { Auth } from "../services/auth";
import {
  initSocketClient,
  onNewMessage,
  onMessagesRead,
  onUnreadCountUpdate,
  joinRoom,
} from "../services/socketClient";
import type { ChatRoom, UnreadCountUpdateEvent } from "../types";
import type { RootStackParamList } from "../navigation/AppNavigator";
import { CreateChatRoomModal } from "../components/CreateChatRoomModal";
import { Plus } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { SearchBar } from "@/components/SearchBar";
import {
  DefaultGroupProfile,
  DefaultUserProfile,
} from "@/components/DefaultProfile";

type ChatListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>;

const AVATAR_SIZE = 55;
const TIME_INTERVALS = {
  MINUTE: 60000,
  HOUR: 3600000,
  DAY: 86400000,
  WEEK: 604800000,
} as const;

export default function ChatListScreen() {
  const navigation = useNavigation<ChatListNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchRooms();
      initializeSocket();
    }, [])
  );

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const data = await chatApi.getChatRooms();
      setRooms(data.rooms || []);

      // Join all rooms for real-time updates
      for (const room of data.rooms) {
        joinRoom(room.id);
      }
    } catch (error) {
      console.error("Failed to fetch chat rooms:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const sortRoomsByLastMessage = (rooms: ChatRoom[]) => {
    return rooms.sort((a, b) => {
      const timeA = new Date(
        a.lastMessage?.createdAt || a.lastMessageAt || 0
      ).getTime();
      const timeB = new Date(
        b.lastMessage?.createdAt || b.lastMessageAt || 0
      ).getTime();
      return timeB - timeA;
    });
  };

  const handleNewMessage = (message: any) => {
    console.log("📨 New message in room list:", message);
    setRooms((prev) => {
      const updated = prev.map((room) => {
        if (room.id === message.roomId) {
          return {
            ...room,
            unreadCount: room.unreadCount + 1,
            lastMessage: {
              id: message.id,
              text: message.text,
              senderId: message.senderId,
              senderName: message.senderName,
              createdAt: message.createdAt,
            },
            lastMessageAt: message.createdAt,
          };
        }
        return room;
      });
      return sortRoomsByLastMessage(updated);
    });
  };

  const handleMessagesRead = async (data: any) => {
    const currentUserId = await Auth.getUserId();
    if (data.userId === currentUserId) {
      setRooms((prev) =>
        prev.map((room) =>
          room.id === data.roomId ? { ...room, unreadCount: 0 } : room
        )
      );
    }
  };

  const handleUnreadCountUpdate = (data: UnreadCountUpdateEvent) => {
    console.log("📊 Unread count update:", data);
    setRooms((prev) =>
      prev.map((room) =>
        room.id === data.roomId ? { ...room, unreadCount: data.unreadCount } : room
      )
    );
  };

  const initializeSocket = async () => {
    const token = await Auth.getToken();
    if (token) {
      initSocketClient(token);

      const unsubscribeNewMessage = onNewMessage(handleNewMessage);
      const unsubscribeMessagesRead = onMessagesRead(handleMessagesRead);
      const unsubscribeUnreadCount = onUnreadCountUpdate(handleUnreadCountUpdate);

      return () => {
        unsubscribeNewMessage();
        unsubscribeMessagesRead();
        unsubscribeUnreadCount();
      };
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRooms();
  };

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / TIME_INTERVALS.MINUTE);

    if (minutes < 1) return "방금 전";
    if (minutes < 60) return `${minutes}분 전`;
    const hours = Math.floor(diff / TIME_INTERVALS.HOUR);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(diff / TIME_INTERVALS.DAY);
    if (days < 7) return `${days}일 전`;
    return date.toLocaleDateString("ko-KR");
  };

  const renderRoomAvatar = (room: ChatRoom) => {
    const isDefaultAvatar = room.imageUrl?.includes("ui-avatars.com");
    const hasCustomImage = room.imageUrl && !isDefaultAvatar;

    if (hasCustomImage) {
      return <Image source={{ uri: room.imageUrl }} style={styles.roomImage} />;
    }

    return room.roomType === "direct" ? (
      <DefaultUserProfile style={styles.roomImagePlaceholder} />
    ) : (
      <DefaultGroupProfile style={styles.roomImagePlaceholder} />
    );
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => {
    return (
      <TouchableOpacity
        style={styles.roomItem}
        onPress={() =>
          navigation.navigate("ChatRoom", {
            roomId: item.id,
            roomName: item.name,
          })
        }
      >
        {renderRoomAvatar(item)}

        <View style={styles.roomInfo}>
          <Text style={styles.roomName}>{item.name}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage?.text || "메시지 없음"}
          </Text>
        </View>
        <View style={styles.roomMeta}>
          <Text style={styles.time}>
            {formatTime(item.lastMessage?.createdAt || item.lastMessageAt)}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>채팅</Text>
      </View>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Create Room Button */}
      <View style={styles.createButtonContainer}>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateRoom(true)}
        >
          <View style={styles.createButtonIconContainer}>
            <Plus size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.createButtonText}>새 채팅방 만들기</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>채팅방이 없습니다</Text>
            <Text style={styles.emptySubText}>
              위의 버튼을 눌러 채팅방을 만드세요
            </Text>
          </View>
        }
      />

      <CreateChatRoomModal
        visible={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        onRoomCreated={fetchRooms}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#000000",
  },
  createButtonContainer: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderRadius: 16,
    marginHorizontal: 10,
    borderColor: "#E5E7EB",
  },
  createButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
  },
  createButtonIconContainer: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  createButtonText: {
    color: "#000000",
    fontSize: 24,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 20,
  },
  roomItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    alignItems: "center",
  },
  roomImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginRight: 12,
  },
  roomImagePlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 24,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 20,
    fontWeight: "400",
    color: "#6B7280",
  },
  roomMeta: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  time: {
    fontSize: 16,
    fontWeight: "400",
    color: "#9CA3AF",
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: "#EF4444",
    borderRadius: 13.5,
    paddingHorizontal: 8,
    paddingVertical: 2,
    width: 27,
    height: 27,
    alignItems: "center",
  },
  unreadText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400",
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  emptySubText: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 8,
  },
});
