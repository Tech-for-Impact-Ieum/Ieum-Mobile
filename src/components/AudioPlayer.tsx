import React from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native'
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio'
import { Play, Pause } from 'lucide-react-native'

interface AudioPlayerProps {
  src: string
  duration?: number
  fileName?: string
  style?: ViewStyle
  variant?: 'compact' | 'full'
  isMyMessage?: boolean
}

export function AudioPlayer({
  src,
  duration: initialDuration,
  fileName,
  style,
  variant = 'compact',
  isMyMessage = false,
}: AudioPlayerProps) {
  const player = useAudioPlayer(src)
  const status = useAudioPlayerStatus(player)

  const handlePlayPause = () => {
    console.log("Audio Player Status:", status)
    if (status.playing) {
      player.pause()
    } else {
      if (status.currentTime >= status.duration) {
        player.seekTo(0)
      }
      player.play()
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const progress = status.duration > 0 ? (status.currentTime / status.duration) * 100 : 0

  return (
    <View
      style={[
        styles.container,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        style,
      ]}
    >
      <TouchableOpacity
        style={[
          styles.playButton,
          isMyMessage ? styles.myPlayButton : styles.otherPlayButton,
        ]}
        onPress={handlePlayPause}
        disabled={!status.isLoaded}
      >
        {!status.isLoaded ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : status.playing ? (
          <Pause size={20} color="#FFFFFF" fill="#FFFFFF" />
        ) : (
          <Play size={20} color="#FFFFFF" fill="#FFFFFF" style={{ marginLeft: 2 }} />
        )}
      </TouchableOpacity>

      <View style={styles.infoContainer}>
        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBarBackground}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progress}%` },
                isMyMessage ? styles.myProgressFill : styles.otherProgressFill,
              ]}
            />
          </View>
        </View>
        
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(status.currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(status.duration || initialDuration || 0)}</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
    minWidth: 240,
    maxWidth: 280,
  },
  myMessageContainer: {
    backgroundColor: '#FEE500', // Kakao yellow
  },
  otherMessageContainer: {
    backgroundColor: '#FFFFFF',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  myPlayButton: {
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  otherPlayButton: {
    backgroundColor: '#3B82F6', // Blue for other's messages
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: 6,
  },
  progressBarContainer: {
    height: 12,
    justifyContent: 'center',
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  myProgressFill: {
    backgroundColor: '#000000',
  },
  otherProgressFill: {
    backgroundColor: '#3B82F6',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 11,
    color: '#6B7280',
    fontVariant: ['tabular-nums'],
  },
})
