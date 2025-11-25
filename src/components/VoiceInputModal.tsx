/**
 * Voice Input Modal Component
 * Records audio, transcribes to text via API, and sends voice messages
 * Uses expo-av for audio recording and playback
 */

import React, { useState, useEffect } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Alert,
} from 'react-native'
import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system/legacy'
import { Mic, X } from 'lucide-react-native'
import { Auth } from '../services/auth'
import type { MediaItem } from '../types'

interface VoiceInputModalProps {
  visible: boolean
  onClose: () => void
  onSend: (text: string, audioMedia?: MediaItem) => void
}

const MAX_RECORDING_TIME = 30 // 30 seconds

export function VoiceInputModal({
  visible,
  onClose,
  onSend,
}: VoiceInputModalProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [audioUri, setAudioUri] = useState<string | null>(null)
  const [sound, setSound] = useState<Audio.Sound | null>(null)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1
          if (newTime >= MAX_RECORDING_TIME) {
            handleTranscribe()
            return prev
          }
          return newTime
        })
      }, 1000)
    } else {
      setRecordingTime(0)
    }
    return () => clearInterval(interval)
  }, [isRecording])

  useEffect(() => {
    if (visible) {
      // Reset state when modal opens
      setTranscript('')
      setRecordingTime(0)
      setIsRecording(false)
      setAudioUri(null)
      setIsUploading(false)
    } else {
      // Cleanup when modal closes
      stopRecording()
      if (sound) {
        sound.unloadAsync()
      }
    }
  }, [visible])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync()
      if (status !== 'granted') {
        Alert.alert('권한 필요', '음성 녹음을 위해 마이크 권한이 필요합니다.')
        return
      }

      // Set audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      )
      setRecording(newRecording)
      setIsRecording(true)
    } catch (err) {
      console.error('Failed to start recording:', err)
      Alert.alert('오류', '녹음을 시작할 수 없습니다.')
    }
  }

  const stopRecording = async () => {
    if (!recording) {
      setIsRecording(false)
      return null
    }

    try {
      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      setIsRecording(false)
      setRecording(null)
      return uri
    } catch (err) {
      console.error('Failed to stop recording:', err)
      setIsRecording(false)
      return null
    }
  }

  const handleTranscribe = async () => {
    try {
      setIsTranscribing(true)
      const uri = await stopRecording()
      if (!uri) return

      setAudioUri(uri)

      // Read the audio file
      const fileInfo = await FileSystem.getInfoAsync(uri)
      if (!fileInfo.exists) {
        throw new Error('Audio file not found')
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', {
        uri,
        name: 'audio.m4a',
        type: 'audio/m4a',
      } as any)

      const token = await Auth.getToken()
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/transcribe`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      )

      const data = await response.json()
      if (!response.ok || !data.ok) {
        console.error('Transcription failed:', data)
        setTranscript('음성을 텍스트로 변환할 수 없습니다.')
        return
      }

      setTranscript(data.text || '')
    } catch (err) {
      console.error('Failed to transcribe audio:', err)
      setTranscript('음성을 텍스트로 변환하는 중 오류가 발생했습니다.')
    } finally {
      setIsTranscribing(false)
    }
  }

  const handleRetry = () => {
    setRecordingTime(0)
    setTranscript('')
    setAudioUri(null)
    if (sound) {
      sound.unloadAsync()
      setSound(null)
    }
    handleStart()
  }

  const handleUploadAndSend = async () => {
    if (!audioUri || !transcript) return

    try {
      setIsUploading(true)

      // Read audio file
      const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
        encoding: 'base64',
      })

      // Upload to S3 via backend
      const token = await Auth.getToken()
      const uploadResponse = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            file: audioBase64,
            fileName: 'voice-message.m4a',
            mimeType: 'audio/m4a',
          }),
        },
      )

      const uploadData = await uploadResponse.json()
      if (!uploadResponse.ok || !uploadData.ok) {
        throw new Error('Upload failed')
      }

      const audioMedia: MediaItem = {
        type: 'audio',
        key: uploadData.key,
        url: uploadData.url,
        fileName: 'voice-message.m4a',
        mimeType: 'audio/m4a',
      }

      onSend(transcript, audioMedia)
      onClose()
    } catch (err) {
      console.error('Failed to upload audio:', err)
      Alert.alert('오류', '음성 업로드에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSendTextOnly = () => {
    onSend(transcript)
    onClose()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
            <X size={24} color="#6B7280" />
          </TouchableOpacity>
          <Text style={styles.title}>음성입력</Text>

          {/* Microphone Icon */}
          <View
            style={[
              styles.micContainer,
              isRecording && recordingTime >= 25 && styles.micWarning,
              isRecording && recordingTime < 25 && styles.micRecording,
            ]}
          >
            <Mic
              size={48}
              color={
                isRecording && recordingTime >= 25
                  ? '#EF4444'
                  : isRecording
                  ? '#000000'
                  : '#9CA3AF'
              }
            />
          </View>

          {/* Timer */}
          <Text
            style={[
              styles.timer,
              isRecording && recordingTime >= 25 && styles.timerWarning,
            ]}
          >
            {formatTime(recordingTime)}
          </Text>

          {/* Progress Bar */}
          {isRecording && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    recordingTime >= 25 && styles.progressFillWarning,
                    { width: `${(recordingTime / MAX_RECORDING_TIME) * 100}%` },
                  ]}
                />
              </View>
              <View style={styles.progressLabels}>
                <Text style={styles.progressLabel}>{recordingTime}초</Text>
                <Text
                  style={[
                    styles.progressLabel,
                    recordingTime >= 25 && styles.progressLabelWarning,
                  ]}
                >
                  최대 {MAX_RECORDING_TIME}초
                </Text>
              </View>
            </View>
          )}

          {/* Warning Message */}
          {isRecording && recordingTime >= 25 && (
            <Text style={styles.warningText}>
              ⚠️ 곧 자동으로 녹음이 종료됩니다
            </Text>
          )}

          {/* Initial Guide */}
          {!isRecording && !transcript && !isTranscribing && (
            <Text style={styles.guideText}>
              최대 {MAX_RECORDING_TIME}초까지 녹음 가능합니다
            </Text>
          )}

          {/* Transcription Loading */}
          {!isRecording && isTranscribing && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#000000" />
              <Text style={styles.loadingText}>텍스트 변환 중...</Text>
            </View>
          )}

          {/* Editable Transcript */}
          {!isRecording && transcript && (
            <View style={styles.transcriptContainer}>
              <Text style={styles.transcriptLabel}>
                변환된 텍스트 (수정 가능)
              </Text>
              <TextInput
                style={styles.transcriptInput}
                value={transcript}
                onChangeText={setTranscript}
                placeholder="변환된 텍스트를 수정하세요"
                multiline
              />
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {/* Initial state: start button */}
            {!isRecording && !transcript && (
              <TouchableOpacity style={styles.button} onPress={handleStart}>
                <Text style={styles.buttonText}>녹음 시작</Text>
              </TouchableOpacity>
            )}

            {/* Recording state: finish button */}
            {isRecording && (
              <TouchableOpacity
                style={styles.button}
                onPress={handleTranscribe}
                disabled={isTranscribing}
              >
                <Text style={styles.buttonText}>
                  {isTranscribing ? '처리 중…' : '녹음 완료'}
                </Text>
              </TouchableOpacity>
            )}

            {/* After transcription: retry and send options */}
            {!isRecording && transcript && (
              <>
                <TouchableOpacity
                  style={[styles.button, styles.buttonOutline]}
                  onPress={handleRetry}
                  disabled={isUploading}
                >
                  <Text style={styles.buttonOutlineText}>다시 녹음</Text>
                </TouchableOpacity>
                {audioUri ? (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleUploadAndSend}
                    disabled={!transcript || isUploading}
                  >
                    {isUploading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.buttonText}>음성 + 텍스트 전송</Text>
                    )}
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.button}
                    onPress={handleSendTextOnly}
                    disabled={!transcript}
                  >
                    <Text style={styles.buttonText}>텍스트만 전송</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </View>
        </View>
      </View>
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
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    color: '#000000',
  },
  micContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  micRecording: {
    backgroundColor: '#F3F4F6',
  },
  micWarning: {
    backgroundColor: '#FEE2E2',
  },
  timer: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  timerWarning: {
    color: '#EF4444',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  progressFillWarning: {
    backgroundColor: '#EF4444',
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressLabelWarning: {
    color: '#EF4444',
    fontWeight: '600',
  },
  warningText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
    marginBottom: 16,
  },
  guideText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  transcriptContainer: {
    width: '100%',
    marginBottom: 24,
  },
  transcriptLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  transcriptInput: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    backgroundColor: '#000000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonOutlineText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  closeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
})
