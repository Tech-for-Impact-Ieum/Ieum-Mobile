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
  StyleSheet,
  RefreshControl,
  Image,
} from "react-native";
import { userApi } from "../utils/userApi";
import type { User } from "../types";
import { AddFriendModal } from "../components/AddFriendModal";
import { Plus, User as UserIcon } from "lucide-react-native";
import { Colors } from "@/constants/colors";
import { SearchBar } from "@/components/SearchBar";

const AVATAR_SIZE = 55;

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

  const onRefresh = () => {
    setRefreshing(true);
    fetchFriends();
  };

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderAvatar = (user: User) => {
    const isDefaultAvatar = user.setting?.imageUrl?.includes("ui-avatars.com");
    const hasCustomImage = user.setting?.imageUrl && !isDefaultAvatar;

    if (hasCustomImage) {
      return (
        <Image
          source={{ uri: user.setting?.imageUrl }}
          style={styles.friendImage}
        />
      );
    }

    return (
      <View style={styles.friendImagePlaceholder}>
        <UserIcon size={28} color="#000000" />
      </View>
    );
  };

  const renderFriend = ({ item }: { item: User }) => {
    const displayName = item.setting?.nickname || item.name;

    return (
      <View style={styles.friendItem}>
        {renderAvatar(item)}
        <View style={styles.friendInfo}>
          <Text style={styles.friendName}>{displayName}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>친구</Text>
      </View>

      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

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
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
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
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    marginRight: 12,
  },
  friendImagePlaceholder: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
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
  emptyContainer: {
    paddingTop: 60,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#9CA3AF",
  },
});
