/**
 * Settings Modal Component for React Native
 * Adapted from Next.js SettingsModal component
 */

import React from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
} from "react-native";
import { X } from "lucide-react-native";
import { Colors } from "@/constants/colors";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function SettingsModal({
  isOpen,
  onClose,
  title,
  children,
}: SettingsModalProps) {
  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* Modal Content */}
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={28} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView style={styles.modalBody}>{children}</ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface ToggleOptionProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleOption({
  label,
  description,
  value,
  onChange,
}: ToggleOptionProps) {
  return (
    <View style={styles.toggleContainer}>
      <View style={styles.toggleTextContainer}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {description && (
          <Text style={styles.toggleDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#D1D5DB", true: Colors.primary }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#D1D5DB"
        style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }}
      />
    </View>
  );
}

interface InfoSectionProps {
  title: string;
  content: string;
}

export function InfoSection({ title, content }: InfoSectionProps) {
  return (
    <View style={styles.infoSection}>
      <Text style={styles.infoTitle}>{title}</Text>
      <Text style={styles.infoContent}>{content}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#000000",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  toggleLabel: {
    fontSize: 22,
    fontWeight: "500",
    color: "#000000",
  },
  toggleDescription: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 4,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  infoContent: {
    fontSize: 16,
    color: "#6B7280",
    lineHeight: 24,
  },
});
