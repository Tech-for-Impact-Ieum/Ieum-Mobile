/**
 * Chat Summary Component
 * Displays conversation summary with TTS audio playback
 * Auto-loads on room entry and triggers read receipt marking
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Play, Pause } from "lucide-react-native";
import { chatApi } from "../utils/chatApi";
import type { ChatSummary as ChatSummaryType } from "../types";
import { Colors } from "@/constants/colors";

interface ChatSummaryProps {
  roomId: number;
  onSummaryComplete: () => void;
  autoLoad?: boolean;
}

export function ChatSummary({
  roomId,
  onSummaryComplete,
  autoLoad = true,
}: ChatSummaryProps) {
  const [summary, setSummary] = useState<ChatSummaryType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use expo-audio hooks
  const player = useAudioPlayer(summary?.audioUrl || "");
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    if (autoLoad) {
      loadSummary();
    }
  }, [roomId]);

  const loadSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await chatApi.getSummary(roomId);

      if (data.ok && data.summary) {
        setSummary(data.summary);
        // Update player source if summary loaded
        if (data.summary.audioUrl) {
          player.replace(data.summary.audioUrl);
        }
      }

      onSummaryComplete();
    } catch (err: any) {
      if (err.status === 404) {
        setError("아직 생성된 요약이 없습니다.");
        await generateSummary();
      } else {
        console.error("Failed to load summary:", err);
        setError(err.message || "요약을 불러오는데 실패했습니다.");
        onSummaryComplete();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateSummary = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const data = await chatApi.generateSummary(roomId);

      if (data.ok && data.summary) {
        setSummary(data.summary);
        if (data.summary.audioUrl) {
          player.replace(data.summary.audioUrl);
        }
      }

      onSummaryComplete();
    } catch (err: any) {
      console.error("Failed to generate summary:", err);
      setError(err.message || "요약 생성에 실패했습니다.");
      onSummaryComplete();
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleAudioPlayback = () => {
    if (!summary?.audioUrl) return;

    console.log("Summary Audio URL:", summary?.audioUrl);
    console.log("Audio Player Status:", status);

    if (status.playing) {
      player.pause();
    } else {
      if (status.currentTime >= status.duration) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  // Don't render if error or no summary
  if ((error && !isLoading) || (!summary && !isLoading && !error)) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9333EA" />
          <Text style={styles.loadingText}>요약을 불러오는 중...</Text>
        </View>
      )}

      {/* Summary Content */}
      {summary && !isLoading && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryTextContainer}>
            <View style={styles.iconRow}>
              <Text style={styles.icon}>💬</Text>
              <Text style={styles.summaryText}>{summary.text}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>
                📊 {summary.messageCount}개 메시지
              </Text>
              <Text style={styles.metaText}>
                🕐{" "}
                {new Date(summary.createdAt).toLocaleDateString("ko-KR", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>

          {/* TTS Audio Player */}
          {summary.audioUrl && (
            <TouchableOpacity
              style={styles.audioButton}
              onPress={toggleAudioPlayback}
            >
              {status.playing ? (
                <Pause size={24} color="#FFFFFF" />
              ) : (
                <Play size={24} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* No Summary - Generate Button */}
      {!summary && !isLoading && !error && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📄</Text>
          <Text style={styles.emptyText}>아직 요약이 없습니다</Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateSummary}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.generateButtonText}>요약 생성하기</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 28,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  summaryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  summaryTextContainer: {
    flex: 1,
    backgroundColor: Colors.secondary,
    borderRadius: 12,
    padding: 16,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  summaryText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    color: "#1F2937",
  },
  metaRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  metaText: {
    fontSize: 12,
    color: "#6B7280",
  },
  audioButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginBottom: 16,
  },
  generateButton: {
    backgroundColor: "#000000",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 140,
    alignItems: "center",
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
