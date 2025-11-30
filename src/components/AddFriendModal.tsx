import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  FlatList,
  Image,
} from "react-native";
import { userApi } from "../utils/userApi";
import type { User } from "../types";
import { Colors } from "@/constants/colors";

interface AddFriendModalProps {
  visible: boolean;
  onClose: () => void;
  onFriendAdded?: () => void;
}

export function AddFriendModal({
  visible,
  onClose,
  onFriendAdded,
}: AddFriendModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      Alert.alert("알림", "최소 2글자 이상 입력하세요");
      return;
    }

    try {
      setSearching(true);
      const data = await userApi.searchUsers(searchQuery);
      setSearchResults(data.users || []);
    } catch (error) {
      console.error("Failed to search users:", error);
      Alert.alert("오류", "사용자 검색에 실패했습니다");
    } finally {
      setSearching(false);
    }
  };

  const handleAddFriend = async (friendId: number) => {
    try {
      setLoading(true);
      await userApi.addFriend(friendId);
      Alert.alert("성공", "친구가 추가되었습니다!");
      setSearchQuery("");
      setSearchResults([]);
      onClose();
      onFriendAdded?.();
    } catch (error) {
      console.error("Failed to add friend:", error);
      Alert.alert(
        "오류",
        error instanceof Error ? error.message : "친구 추가에 실패했습니다"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userItem}>
      {/* User Image */}
      {item.setting?.imageUrl ? (
        <Image
          source={{ uri: item.setting.imageUrl }}
          style={styles.userImage}
        />
      ) : (
        <View style={styles.userImagePlaceholder}>
          <Text style={styles.userImagePlaceholderText}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>
          {item.email || item.phone || "정보 없음"}
        </Text>
      </View>

      {item.friendshipStatus === "accepted" ? (
        <Text style={styles.alreadyFriendText}>친구</Text>
      ) : (
        <TouchableOpacity
          style={[styles.addButton, loading && styles.buttonDisabled]}
          onPress={() => handleAddFriend(item.id)}
          disabled={loading}
        >
          <Text style={styles.addButtonText}>추가</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>친구 추가</Text>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="이름, 이메일, 전화번호로 검색"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={[
                styles.searchButton,
                (searching || searchQuery.length < 2) && styles.buttonDisabled,
              ]}
              onPress={handleSearch}
              disabled={searching || searchQuery.length < 2}
            >
              {searching ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.searchButtonText}>검색</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.resultsContainer}>
            {searchResults.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {searchQuery.length >= 2
                    ? "검색 결과가 없습니다"
                    : "이름, 이메일 또는 전화번호를 입력하세요"}
                </Text>
              </View>
            ) : (
              <FlatList
                data={searchResults}
                renderItem={renderUserItem}
                keyExtractor={(item) => item.id.toString()}
                style={styles.usersList}
              />
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onClose}
          >
            <Text style={styles.cancelButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#000000",
  },
  searchContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 8,
  },
  searchButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  resultsContainer: {
    marginBottom: 16,
  },
  usersList: {
    maxHeight: 300,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 8,
  },
  userImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userImagePlaceholderText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
  },
  userEmail: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 2,
  },
  alreadyFriendText: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: "#6B7280",
    textAlign: "center",
    fontSize: 14,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    color: "#000000",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
