/**
 * Settings Screen for React Native
 * Adapted from Next.js settings page
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Auth } from "../services/auth";
import { disconnectSocket } from "../services/socketClient";
import type { User } from "../types";
import type { RootStackParamList } from "../navigation/AppNavigator";

type SettingsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await Auth.getUser();
    setUser(currentUser);
  };

  const handleLogout = () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          try {
            await Auth.logout();
            disconnectSocket();
            // Navigation will automatically redirect to login
            navigation.replace("Auth" as any);
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("오류", "로그아웃에 실패했습니다");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>프로필</Text>
          <View style={styles.profileCard}>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || "사용자"}</Text>
              <Text style={styles.userEmail}>{user?.email || ""}</Text>
            </View>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 설정</Text>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>알림 설정</Text>
            <Text style={styles.settingValue}>
              {user?.setting?.enableNotifications ? "켜짐" : "꺼짐"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingLabel}>요약 기능</Text>
            <Text style={styles.settingValue}>
              {user?.setting?.enableSummary ? "켜짐" : "꺼짐"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>계정</Text>

          <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
            <Text style={[styles.settingLabel, styles.logoutText]}>
              로그아웃
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.appInfo}>이음 v1.0.0</Text>
          <Text style={styles.appInfo}>Tech for Impact 2025F</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#000000",
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 12,
    textTransform: "uppercase",
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileInfo: {
    gap: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000000",
  },
  userEmail: {
    fontSize: 16,
    color: "#6B7280",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  settingLabel: {
    fontSize: 18,
    color: "#000000",
  },
  settingValue: {
    fontSize: 16,
    color: "#6B7280",
  },
  logoutText: {
    color: "#EF4444",
    fontWeight: "600",
  },
  appInfo: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 8,
  },
});
