/**
 * Quick Response Modal Component
 * Fetches and displays AI-generated quick reply suggestions
 */

import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native'
import { X } from 'lucide-react-native'
import { Auth } from '../services/auth'

interface QuickResponseModalProps {
  visible: boolean
  onClose: () => void
  roomId: number
  onSelect: (text: string) => void
}

export function QuickResponseModal({
  visible,
  onClose,
  roomId,
  onSelect,
}: QuickResponseModalProps) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!visible) {
      setSuggestions([])
      return
    }

    const fetchSuggestions = async () => {
      try {
        setIsLoading(true)
        const token = await Auth.getToken()
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/chat/rooms/${roomId}/quick-replies`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          },
        )

        const data = await response.json()
        if (response.ok && data.ok) {
          setSuggestions(data.suggestions || [])
        }
      } catch (error) {
        console.error('Failed to fetch quick replies:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestions()
  }, [visible, roomId])

  const handleSelect = (text: string) => {
    onSelect(text)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>빠른 답장</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#000000" />
                <Text style={styles.loadingText}>생성 중…</Text>
              </View>
            )}

            {!isLoading && suggestions.length === 0 && (
              <Text style={styles.emptyText}>제안이 없습니다.</Text>
            )}

            {!isLoading &&
              suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={() => handleSelect(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  closeIcon: {
    padding: 4,
  },
  content: {
    minHeight: 100,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    paddingVertical: 40,
  },
  suggestionButton: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 15,
    color: '#374151',
  },
})
