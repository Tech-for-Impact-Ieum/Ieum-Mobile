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
  Image,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Auth } from "../services/auth";
import { disconnectSocket } from "../services/socketClient";
import { ApiClient } from "../services/apiClient";
import { MediaService } from "../services/media";
import type { User } from "../types";
import type { RootStackParamList } from "../navigation/AppNavigator";
import {
  User as UserIcon,
  Bell,
  MessageSquareText,
  Palette,
  ChevronRight,
  Camera,
  Save,
} from "lucide-react-native";
import {
  SettingsModal,
  ToggleOption,
  InfoSection,
} from "../components/SettingsModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/constants/colors";

type SettingsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "Main"
>;

type ModalType =
  | "profile"
  | "notifications"
  | "summary"
  | "special"
  | "privacy"
  | null;

const PROFILE_IMAGE_SIZE = 120;
const PROFILE_IMAGE_LARGE = 96;
const ICON_CONTAINER_SIZE = 55;

export default function SettingsScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const [user, setUser] = useState<User | null>(null);
  const [openModal, setOpenModal] = useState<ModalType>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Profile editing states
  const [nickname, setNickname] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const currentUser = await Auth.getUser();
    setUser(currentUser);
    setNickname(currentUser?.setting?.nickname || currentUser?.name || "");
  };

  const handleSettingClick = (id: string) => {
    setOpenModal(id as ModalType);
  };

  const handleImagePick = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert(
        "권한 필요",
        "사진 라이브러리에 접근하려면 권한이 필요합니다."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images" as any,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleProfileSave = async () => {
    if (!user) return;

    setIsUpdating(true);
    try {
      let imageKey: string | undefined;

      // Upload image if a new one was selected
      if (imageUri) {
        try {
          const mediaItem = await MediaService.uploadMedia(imageUri, "image");
          imageKey = mediaItem.key;
        } catch (uploadError) {
          Alert.alert("오류", "이미지 업로드에 실패했습니다");
          setIsUpdating(false);
          return;
        }
      }

      // Update user settings
      const updatePayload: { nickname: string; imageKey?: string } = {
        nickname,
      };

      if (imageKey) {
        updatePayload.imageKey = imageKey;
      }

      const response = await ApiClient.patch(
        "/users/me/settings",
        updatePayload
      );

      if (response.setting) {
        const updatedUser = {
          ...user,
          setting: {
            nickname: response.setting.nickname,
            imageUrl: response.setting.imageUrl,
            isSpecial: response.setting.isSpecial ?? false,
            isTest: response.setting.isTest ?? false,
            enableNotifications: response.setting.enableNotifications ?? false,
            enableSummary: response.setting.enableSummary ?? false,
          },
        };
        await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setImageUri(null);
        setOpenModal(null);
        Alert.alert("성공", "프로필이 저장되었습니다");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("오류", "프로필 저장에 실패했습니다");
    } finally {
      setIsUpdating(false);
    }
  };

  const getDefaultSettings = (currentSetting?: User["setting"]) => ({
    nickname: currentSetting?.nickname,
    imageUrl: currentSetting?.imageUrl,
    isSpecial: currentSetting?.isSpecial ?? false,
    isTest: currentSetting?.isTest ?? false,
    enableNotifications: currentSetting?.enableNotifications ?? false,
    enableSummary: currentSetting?.enableSummary ?? false,
  });

  const updateSetting = async (setting: Partial<User["setting"]>) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      await ApiClient.patch("/users/me/settings", setting);

      const updatedUser = {
        ...user,
        setting: {
          ...getDefaultSettings(user.setting),
          ...setting,
        },
      };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error("Failed to update setting:", error);
      Alert.alert("오류", "설정 업데이트에 실패했습니다");
    } finally {
      setIsUpdating(false);
    }
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
            navigation.replace("Auth" as any);
          } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("오류", "로그아웃에 실패했습니다");
          }
        },
      },
    ]);
  };

  const renderProfileAvatar = (imageUrl?: string, size: "small" | "large" = "small") => {
    const isDefaultAvatar = imageUrl?.includes("ui-avatars.com");
    const hasCustomImage = imageUrl && !isDefaultAvatar;
    const isLarge = size === "large";

    if (hasCustomImage) {
      return (
        <Image
          source={{ uri: imageUrl }}
          style={isLarge ? styles.profileImageLarge : styles.profileImage}
        />
      );
    }

    return (
      <View
        style={
          isLarge
            ? styles.profileImageLargePlaceholder
            : styles.profileImagePlaceholder
        }
      >
        <UserIcon size={isLarge ? 48 : 80} color={isLarge ? "#9CA3AF" : "#000000"} />
      </View>
    );
  };

  const renderSettingItem = (
    icon: React.ReactNode,
    label: string,
    value: string,
    modalType: ModalType
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={() => handleSettingClick(modalType!)}
    >
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.settingWithValue}>
          <Text style={styles.settingLabel}>{label}</Text>
          <Text style={styles.settingValue}>{value}</Text>
        </View>
      </View>
      <View style={styles.settingRight}>
        <ChevronRight size={25} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>설정</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* User Info Section */}
        <View style={styles.section}>
          <View style={styles.profileInfo}>
            {renderProfileAvatar(user?.setting?.imageUrl)}
            <Text style={styles.userMain}>
              {user?.setting?.nickname || "사용자"}
            </Text>
            <View style={styles.userInfoRow}>
              <Text style={styles.userSub}>{user?.name || "사용자"}</Text>
              <Text style={styles.bulletPoint}>•</Text>
              <Text style={styles.userSub}>{user?.email || ""}</Text>
            </View>
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => handleSettingClick("profile")}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <UserIcon fill="#000000" size={25} color="#000000" />
              </View>
              <Text style={styles.settingLabel}>프로필 설정</Text>
            </View>
            <ChevronRight size={25} color="#9CA3AF" />
          </TouchableOpacity>

          {renderSettingItem(
            <Bell fill="#000000" size={25} color="#000000" />,
            "알림 설정",
            user?.setting?.enableNotifications ? "켜짐" : "꺼짐",
            "notifications"
          )}

          {renderSettingItem(
            <MessageSquareText size={25} color="#000000" />,
            "요약 기능",
            user?.setting?.enableSummary ? "켜짐" : "꺼짐",
            "summary"
          )}

          {renderSettingItem(
            <Palette size={25} color="#000000" />,
            "접근성 모드",
            user?.setting?.isSpecial ? "활성화" : "비활성화",
            "special"
          )}
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={{ justifyContent: "center", alignItems: "center" }}
            onPress={handleLogout}
          >
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

      {/* Profile Settings Modal */}
      <SettingsModal
        isOpen={openModal === "profile"}
        onClose={() => {
          setOpenModal(null);
          setImageUri(null);
          setNickname(user?.setting?.nickname || user?.name || "");
        }}
        title="프로필 설정"
      >
        <View style={{ gap: 20 }}>
          {/* Profile Image Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>프로필 이미지</Text>
            <View style={styles.profileImageRow}>
              <View style={styles.profileImageContainer}>
                {renderProfileAvatar(imageUri || user?.setting?.imageUrl, "large")}
                <TouchableOpacity
                  style={styles.cameraButton}
                  onPress={handleImagePick}
                >
                  <Camera size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileImageHintContainer}>
                <Text style={styles.modalHint}>
                  클릭하여 프로필 이미지를 변경하세요
                </Text>
                {imageUri && (
                  <Text style={styles.imageSelectedText}>새 이미지 선택됨</Text>
                )}
              </View>
            </View>
          </View>

          {/* Nickname Section */}
          <View style={styles.modalSection}>
            <Text style={styles.modalSectionTitle}>닉네임</Text>
            <TextInput
              style={styles.input}
              value={nickname}
              onChangeText={setNickname}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={styles.modalHint}>친구들에게 표시될 이름입니다</Text>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isUpdating && styles.saveButtonDisabled]}
            onPress={handleProfileSave}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Save size={24} color="#FFFFFF" />
                <Text style={styles.saveButtonText}>저장</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </SettingsModal>

      {/* Notifications Modal */}
      <SettingsModal
        isOpen={openModal === "notifications"}
        onClose={() => setOpenModal(null)}
        title="알림 설정"
      >
        <ToggleOption
          label="알림 받기"
          description="새로운 메시지 알림을 받습니다"
          value={user?.setting?.enableNotifications ?? false}
          onChange={(value) => updateSetting({ enableNotifications: value })}
        />
      </SettingsModal>

      {/* Summary Modal */}
      <SettingsModal
        isOpen={openModal === "summary"}
        onClose={() => setOpenModal(null)}
        title="요약 기능"
      >
        <ToggleOption
          label="요약 기능 사용"
          description="대화 내용을 자동으로 요약합니다"
          value={user?.setting?.enableSummary ?? false}
          onChange={(value) => updateSetting({ enableSummary: value })}
        />
      </SettingsModal>

      {/* Special Mode Modal */}
      <SettingsModal
        isOpen={openModal === "special"}
        onClose={() => setOpenModal(null)}
        title="접근성 모드"
      >
        <ToggleOption
          label="접근성 모드 활성화"
          description="발달장애인을 위한 인터페이스를 활성화합니다"
          value={user?.setting?.isSpecial ?? false}
          onChange={(value) => updateSetting({ isSpecial: value })}
        />
      </SettingsModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: "#FFFFFF",
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
    gap: 0,
    marginVertical: 12,
    paddingHorizontal: 12,
  },
  profileInfo: {
    gap: 4,
    alignItems: "center",
  },
  userInfoRow: {
    flexDirection: "row",
    gap: 3,
    alignItems: "center",
  },
  profileImage: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    marginBottom: 12,
  },
  profileImagePlaceholder: {
    width: PROFILE_IMAGE_SIZE,
    height: PROFILE_IMAGE_SIZE,
    borderRadius: PROFILE_IMAGE_SIZE / 2,
    backgroundColor: "#0000000A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  userMain: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
  },
  userSub: {
    fontSize: 20,
    fontWeight: "400",
    color: "#6B7280",
  },
  bulletPoint: {
    fontSize: 20,
    fontWeight: "400",
    color: "#6B7280",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 12,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconContainer: {
    width: ICON_CONTAINER_SIZE,
    height: ICON_CONTAINER_SIZE,
    borderRadius: ICON_CONTAINER_SIZE / 2,
    backgroundColor: "#0000000A",
    justifyContent: "center",
    alignItems: "center",
  },
  settingWithValue: {
    gap: 2,
  },
  settingLabel: {
    fontSize: 24,
    fontWeight: "500",
    color: "#000000",
  },
  settingValue: {
    fontSize: 20,
    fontWeight: "400",
    color: "#00000080",
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
  modalSection: {
    gap: 12,
  },
  modalSectionTitle: {
    fontSize: 22,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 4,
  },
  profileImageRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  profileImageContainer: {
    position: "relative",
  },
  profileImageHintContainer: {
    flex: 1,
  },
  profileImageLarge: {
    width: PROFILE_IMAGE_LARGE,
    height: PROFILE_IMAGE_LARGE,
    borderRadius: PROFILE_IMAGE_LARGE / 2,
  },
  profileImageLargePlaceholder: {
    width: PROFILE_IMAGE_LARGE,
    height: PROFILE_IMAGE_LARGE,
    borderRadius: PROFILE_IMAGE_LARGE / 2,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  modalHint: {
    fontSize: 18,
    color: "#6B7280",
    lineHeight: 20,
  },
  imageSelectedText: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  input: {
    width: "100%",
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 20,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    color: "#000000",
  },
  saveButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
