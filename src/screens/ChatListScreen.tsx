/**
 * Chat List Screen for React Native
 * Adapted from Next.js home page (chat rooms list)
 */

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  RefreshControl,
} from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ApiClient } from '../services/apiClient'
import { Auth } from '../services/auth'
import {
  initSocketClient,
  onNewMessage,
  onMessagesRead,
  onUnreadCountUpdate,
  joinRoom,
} from '../services/socketClient'
import type { ChatRoom, UnreadCountUpdateEvent } from '../types'
import type { RootStackParamList } from '../navigation/AppNavigator'

type ChatListNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Main'
>

export default function ChatListScreen() {
  const navigation = useNavigation<ChatListNavigationProp>()
  const [searchQuery, setSearchQuery] = useState('')
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useFocusEffect(
    useCallback(() => {
      fetchRooms()
      initializeSocket()
    }, []),
  )

  const fetchRooms = async () => {
    try {
      setLoading(true)
      const data = await ApiClient.get('/chat/rooms')
      setRooms(data.rooms || [])

      // Join all rooms for real-time updates
      for (const room of data.rooms) {
        joinRoom(room.id)
      }
    } catch (error) {
      console.error('Failed to fetch chat rooms:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const initializeSocket = async () => {
    const token = await Auth.getToken()
    if (token) {
      initSocketClient(token)

      // Listen for new messages
      const unsubscribeNewMessage = onNewMessage((message) => {
        console.log('📨 New message in room list:', message)
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
              }
            }
            return room
          })

          // Sort by lastMessageAt
          return updated.sort((a, b) => {
            const timeA = new Date(
              a.lastMessage?.createdAt || a.lastMessageAt || 0,
            ).getTime()
            const timeB = new Date(
              b.lastMessage?.createdAt || b.lastMessageAt || 0,
            ).getTime()
            return timeB - timeA
          })
        })
      })

      // Listen for messages-read events
      const unsubscribeMessagesRead = onMessagesRead(async (data) => {
        const currentUserId = await Auth.getUserId()
        if (data.userId === currentUserId) {
          setRooms((prev) =>
            prev.map((room) => {
              if (room.id === data.roomId) {
                return { ...room, unreadCount: 0 }
              }
              return room
            }),
          )
        }
      })

      // Listen for unread count updates
      const unsubscribeUnreadCount = onUnreadCountUpdate((data: UnreadCountUpdateEvent) => {
        console.log('📊 Unread count update:', data)
        setRooms((prev) =>
          prev.map((room) => {
            if (room.id === data.roomId) {
              return { ...room, unreadCount: data.unreadCount }
            }
            return room
          }),
        )
      })

      return () => {
        unsubscribeNewMessage()
        unsubscribeMessagesRead()
        unsubscribeUnreadCount()
      }
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    fetchRooms()
  }

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const formatTime = (dateString?: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}시간 전`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity
      style={styles.roomItem}
      onPress={() =>
        navigation.navigate('ChatRoom', {
          roomId: item.id,
          roomName: item.name,
        })
      }
    >
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage?.text || '메시지 없음'}
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
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>채팅</Text>
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
  roomItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#6B7280',
  },
  roomMeta: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  unreadBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
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
