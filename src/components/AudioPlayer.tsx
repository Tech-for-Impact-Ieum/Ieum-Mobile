import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native'
import { Audio, AVPlaybackStatus } from 'expo-av'
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
  const [sound, setSound] = useState<Audio.Sound | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(initialDuration ? initialDuration * 1000 : 0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [sound])

  const loadSound = async () => {
    try {
      setIsLoading(true)
      const { sound: newSound, status } = await Audio.Sound.createAsync(
        { uri: src },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      )
      setSound(newSound)
      setIsPlaying(true)
      if (status.isLoaded && status.durationMillis) {
        setDuration(status.durationMillis)
      }
    } catch (error) {
      console.error('Error loading sound', error)
    } finally {
      setIsLoading(false)
    }
  }

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis)
      if (status.durationMillis) {
        setDuration(status.durationMillis)
      }
      setIsPlaying(status.isPlaying)
      if (status.didJustFinish) {
        setIsPlaying(false)
        setPosition(0)
        // Optional: unload or reset
      }
    }
  }

  const handlePlayPause = async () => {
    if (!sound) {
      await loadSound()
    } else {
      if (isPlaying) {
        await sound.pauseAsync()
      } else {
        if (position >= duration) {
          await sound.replayAsync()
        } else {
          await sound.playAsync()
        }
      }
    }
  }

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (position / duration) * 100 : 0

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
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : isPlaying ? (
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
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
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
