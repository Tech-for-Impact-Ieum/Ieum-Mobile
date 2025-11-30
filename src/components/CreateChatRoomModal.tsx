import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { chatApi } from '../utils/chatApi';
import { Auth } from '../services/auth';
import type { User } from '../types';

interface CreateChatRoomModalProps {
  visible: boolean;
  onClose: () => void;
  onRoomCreated?: () => void;
}

export function CreateChatRoomModal({
  visible,
  onClose,
  onRoomCreated,
}: CreateChatRoomModalProps) {
  const [roomName, setRoomName] = useState('');
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [friendsLoading, setFriendsLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchFriends();
    }
  }, [visible]);

  const fetchFriends = async () => {
    try {
      setFriendsLoading(true);
      const data = await chatApi.getFriends();
      setFriends(data.friends || []);
    } catch (error) {
      console.error('Failed to fetch friends:', error);
      Alert.alert('오류', '친구 목록을 불러오는데 실패했습니다.');
    } finally {
      setFriendsLoading(false);
    }
  };

  const toggleFriend = (friendId: number) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('알림', '채팅방 이름을 입력하세요');
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert('알림', '최소 한 명의 친구를 선택하세요');
      return;
    }

    try {
      setLoading(true);
      const currentUserId = await Auth.getUserId();
      if (!currentUserId) {
        Alert.alert('오류', '사용자 정보를 찾을 수 없습니다');
        return;
      }

      const participantIds = [...selectedFriends, currentUserId];

      await chatApi.createRoom(roomName, participantIds);

      Alert.alert('성공', '채팅방이 생성되었습니다!');
      setRoomName('');
      setSelectedFriends([]);
      onClose();
      onRoomCreated?.();
    } catch (error) {
      console.error('Failed to create room:', error);
      Alert.alert('오류', '채팅방 생성에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  const renderFriend = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.friendItem}
      onPress={() => toggleFriend(item.id)}
    >
      <View style={styles.checkbox}>
        {selectedFriends.includes(item.id) && (
          <View style={styles.checkboxChecked} />
        )}
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        {item.email && <Text style={styles.friendEmail}>{item.email}</Text>}
      </View>
    </TouchableOpacity>
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
          <Text style={styles.modalTitle}>새 채팅방 만들기</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>채팅방 이름</Text>
            <TextInput
              style={styles.input}
              placeholder="채팅방 이름을 입력하세요"
              value={roomName}
              onChangeText={setRoomName}
            />
          </View>

          <View style={styles.friendsContainer}>
            <Text style={styles.label}>
              친구 선택 ({selectedFriends.length}명 선택됨)
            </Text>

            {friendsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={styles.loadingText}>로딩 중...</Text>
              </View>
            ) : friends.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  친구가 없습니다. 먼저 친구를 추가하세요.
                </Text>
              </View>
            ) : (
              <FlatList
                data={friends}
                renderItem={renderFriend}
                keyExtractor={(item) => item.id.toString()}
                style={styles.friendsList}
              />
            )}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.createButton,
                (loading ||
                  !roomName.trim() ||
                  selectedFriends.length === 0 ||
                  friendsLoading) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleCreateRoom}
              disabled={
                loading ||
                !roomName.trim() ||
                selectedFriends.length === 0 ||
                friendsLoading
              }
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.createButtonText}>생성</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000000',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  friendsContainer: {
    flex: 1,
    marginBottom: 20,
  },
  friendsList: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    width: 12,
    height: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  friendEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cancelButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#3B82F6',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
