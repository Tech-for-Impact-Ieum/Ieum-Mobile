/**
 * Chat Room Screen for React Native
 * Adapted from Next.js chat/[id]/page.tsx
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native'
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { ApiClient } from '../services/apiClient'
import { Auth } from '../services/auth'
import {
  initSocketClient,
  joinRoom,
  leaveRoom,
  onNewMessage,
  onMessagesRead,
} from '../services/socketClient'
import type { Message, ChatRoom, MediaItem } from '../types'
import type { RootStackParamList } from '../navigation/AppNavigator'
import { ActionButtons } from '../components/ActionButtons'
import { EmojiPickerModal } from '../components/EmojiPickerModal'
import { QuickResponseModal } from '../components/QuickResponseModal'
import { VoiceInputModal } from '../components/VoiceInputModal'
import { ChatSummary } from '../components/ChatSummary'

type ChatRoomRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>
type ChatRoomNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ChatRoom'
>

export default function ChatRoomScreen() {
  const route = useRoute<ChatRoomRouteProp>()
  const navigation = useNavigation<ChatRoomNavigationProp>()
  const { roomId, roomName } = route.params

  const [messages, setMessages] = useState<Message[]>([])
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [showEmojiModal, setShowEmojiModal] = useState(false)
  const [showQuickResponseModal, setShowQuickResponseModal] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  // Set navigation title
  useEffect(() => {
    navigation.setOptions({ title: roomName })
  }, [navigation, roomName])

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      const userId = await Auth.getUserId()
      setCurrentUserId(userId)
    }
    loadUser()
  }, [])

  // Load chat room details
  useEffect(() => {
    const loadChatRoom = async () => {
      try {
        const token = await Auth.getToken()
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/chat/rooms/${roomId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        if (response.ok) {
          const data = await response.json()
          if (data.ok && data.room) {
            setChatRoom(data.room)
          }
        }
      } catch (error) {
        console.error('Error loading chat room:', error)
      }
    }
    loadChatRoom()
  }, [roomId])

  // Load messages
  useEffect(() => {
    if (!currentUserId) return

    const loadMessages = async () => {
      try {
        const token = await Auth.getToken()
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/chat/rooms/${roomId}/messages?currentUserId=${currentUserId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        if (response.ok) {
          const data = await response.json()
          if (data.ok && data.messages) {
            setMessages(data.messages)
          }
        }
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }

    loadMessages()
  }, [roomId, currentUserId])

  // Initialize socket and join room
  useEffect(() => {
    if (!currentUserId || !chatRoom?.id) return

    const initSocket = async () => {
      const token = await Auth.getToken()
      if (!token) return

      // Initialize socket
      initSocketClient(token)
      joinRoom(roomId)

      // Listen for new messages
      const unsubscribe = onNewMessage((message: Message) => {
        if (Number(message.roomId) !== Number(roomId)) return
        if (message.senderId === currentUserId) return // Skip own messages

        setMessages((prev) => {
          if (prev.some((msg) => msg.id === message.id)) return prev
          return [...prev, message]
        })
      })

      // Listen for messages-read events
      const unsubscribeMessagesRead = onMessagesRead((data) => {
        setMessages((prev) =>
          prev.map((msg) => {
            if (msg.id === data.messageId) {
              const alreadyRead = msg.readBy.some((r) => r.userId === data.userId)
              if (!alreadyRead) {
                return {
                  ...msg,
                  readBy: [
                    ...msg.readBy,
                    { userId: data.userId, readAt: new Date().toISOString() },
                  ],
                }
              }
            }
            return msg
          }),
        )
      })

      return () => {
        unsubscribe()
        unsubscribeMessagesRead()
        leaveRoom(roomId)
      }
    }

    initSocket()
  }, [roomId, currentUserId, chatRoom?.id])

  const sendMessageToAPI = async (text: string, media: MediaItem[] = []) => {
    if (!currentUserId) return

    try {
      const token = await Auth.getToken()
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/chat/rooms/${roomId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text,
            media,
          }),
        },
      )

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const data = await response.json()

      if (data.ok && data.message) {
        setMessages((prev) => [...prev, data.message])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !currentUserId) return

    setIsLoading(true)
    try {
      await sendMessageToAPI(inputMessage.trim(), [])
      setInputMessage('')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmojiSelect = async (emoji: string) => {
    await sendMessageToAPI(emoji, [])
  }

  const handleVoiceInputSelect = async (
    text: string,
    audioMedia?: MediaItem,
  ) => {
    const media = audioMedia ? [audioMedia] : []
    await sendMessageToAPI(text, media)
  }

  const handleQuickResponseSelect = async (text: string) => {
    await sendMessageToAPI(text, [])
  }

  const handleMarkMessagesAsRead = useCallback(async () => {
    if (messages.length === 0) return

    const lastMessage = messages[messages.length - 1]
    try {
      const token = await Auth.getToken()
      await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/chat/rooms/${roomId}/read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            messageId: lastMessage.id,
          }),
        },
      )
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }, [messages, roomId])

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = currentUserId === item.senderId

    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        ]}
      >
        {!isMyMessage && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        {item.text && (
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
        <Text style={styles.messageTime}>{formatTime(item.createdAt)}</Text>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
            {isLoading ? '전송중' : '보내기'}
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
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#B3E5FC',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: '#FEE500',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  myMessageText: {
    color: '#000000',
  },
  otherMessageText: {
    color: '#000000',
  },
  messageTime: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    paddingHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
