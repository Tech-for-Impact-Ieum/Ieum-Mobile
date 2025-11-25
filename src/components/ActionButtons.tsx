/**
 * Action Buttons Component
 * Row of buttons to trigger chat feature modals (emoji, voice, quick reply)
 */

import React from 'react'
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native'
import { Smile, Mic, MessageSquarePlus } from 'lucide-react-native'

interface ActionButtonsProps {
  onEmojiPress: () => void
  onVoicePress: () => void
  onQuickReplyPress: () => void
}

export function ActionButtons({
  onEmojiPress,
  onVoicePress,
  onQuickReplyPress,
}: ActionButtonsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onEmojiPress}>
        <Smile size={32} color="#374151" />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.button} onPress={onVoicePress}>
        <Mic size={32} color="#374151" />
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity style={styles.button} onPress={onQuickReplyPress}>
        <MessageSquarePlus size={32} color="#374151" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: '#D1D5DB',
  },
})
