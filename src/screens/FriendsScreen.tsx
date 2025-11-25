/**
 * Friends Screen for React Native
 * Adapted from Next.js friends page
 */

import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native'
import { ApiClient } from '../services/apiClient'
import type { User } from '../types'

export default function FriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('')
  const [friends, setFriends] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchFriends()
  }, [])

  const fetchFriends = async () => {
    try {
      setLoading(true)
      const data = await ApiClient.get('/friends')
      setFriends(data.friends || [])
    } catch (error) {
      console.error('Failed to fetch friends:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const removeFriend = async (friendId: number) => {
    Alert.alert('친구 삭제', '정말 친구를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await ApiClient.delete(`/friends/${friendId}`)
            Alert.alert('성공', '친구가 삭제되었습니다')
            fetchFriends()
          } catch (error) {
            console.error('Failed to remove friend:', error)
            Alert.alert('오류', '친구 삭제에 실패했습니다')
          }
        },
      },
    ])
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchFriends()
  }

  const filteredFriends = friends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const renderFriend = ({ item }: { item: User }) => (
    <View style={styles.friendItem}>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendEmail}>{item.email || '이메일 없음'}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeFriend(item.id)}
      >
        <Text style={styles.deleteButtonText}>삭제</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>친구</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="검색"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
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
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  searchInput: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  friendEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
})
