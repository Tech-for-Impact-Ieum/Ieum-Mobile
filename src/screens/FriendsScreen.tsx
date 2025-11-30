/**
 * Friends Screen for React Native
 * Adapted from Next.js friends page
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  RefreshControl,
  Image,
} from "react-native";
import { userApi } from "../utils/userApi";
import type { User } from "../types";
import { AddFriendModal } from "../components/AddFriendModal";
import { Plus, User as UserIcon, Search } from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function FriendsScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      const data = await userApi.getFriends();
      setFriends(data.friends || []);
    } catch (error) {
      console.error("Failed to fetch friends:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const removeFriend = async (friendId: number) => {
    Alert.alert("친구 삭제", "정말 친구를 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await userApi.removeFriend(friendId);
            Alert.alert("성공", "친구가 삭제되었습니다");
            fetchFriends();
          } catch (error) {
            console.error("Failed to remove friend:", error);
            Alert.alert("오류", "친구 삭제에 실패했습니다");
          }
        },
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchFriends();
  };

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderFriend = ({ item }: { item: User }) => {
    // Check if imageUrl is the default UI Avatars URL
    const isDefaultAvatar = item.setting?.imageUrl?.includes("ui-avatars.com");
    const shouldShowImage = item.setting?.imageUrl && !isDefaultAvatar;

    return (
      <View style={styles.friendItem}>
        {/* Friend Image */}
        {shouldShowImage ? (
          <Image
            source={{ uri: item.setting?.imageUrl }}
            style={styles.friendImage}
          />
        ) : (
          <View style={styles.friendImagePlaceholder}>
            <UserIcon size={28} color="#000000" />
          </View>
        )}

        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{item.name}</Text>
        </View>
        {/* <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => removeFriend(item.id)}
        >
          <Text style={styles.deleteButtonText}>삭제</Text>
        </TouchableOpacity> */}
      </View>
    );
  };

  console.log("Rendering FriendsScreen with friends:", friends);
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>친구</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Search size={20} color="#9CA3AF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="검색"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Add Friend Button */}
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddFriend(true)}
        >
          <View style={styles.addButtonIconContainer}>
            <Plus size={20} color="#FFFFFF" />
          </View>
          <Text style={styles.addButtonText}>친구 추가</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredFriends}
        renderItem={renderFriend}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>친구가 없습니다</Text>
          </View>
        }
      />

      <AddFriendModal
        visible={showAddFriend}
        onClose={() => setShowAddFriend(false)}
        onFriendAdded={fetchFriends}
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
  searchContainer: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  searchInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 17,
    color: "#8E8E93",
  },
  addButtonContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 10,
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderColor: "#E5E7EB",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
  },
  addButtonIconContainer: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "#000000",
    fontSize: 24,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  friendImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    marginRight: 12,
  },
  friendImagePlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  friendImagePlaceholderText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "600",
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 24,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 4,
  },
  friendEmail: {
    fontSize: 14,
    color: "#6B7280",
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  deleteButtonText: {
    color: "#EF4444",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
});
