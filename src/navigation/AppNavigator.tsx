/**
 * Main App Navigator with Authentication Flow
 * Uses React Navigation with Bottom Tabs and Stack Navigation
 */

import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Auth } from "../services/auth";
import { Colors } from "@/constants/colors";
import ChatIcon from "@/assets/navigator-chat.svg";
import FriendIcon from "@/assets/navigator-friend.svg";
import SettingIcon from "@/assets/navigator-setting.svg";

// Import screens (will be created next)
import LoginScreen from "../screens/LoginScreen";
import ChatListScreen from "../screens/ChatListScreen";
import ChatRoomScreen from "../screens/ChatRoomScreen";
import FriendsScreen from "../screens/FriendsScreen";
import SettingsScreen from "../screens/SettingsScreen";

// Type definitions for navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  ChatRoom: { roomId: number; roomName: string };
};

export type AuthStackParamList = {
  Login: undefined;
};

export type MainTabParamList = {
  ChatList: undefined;
  Friends: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Auth Stack Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

// Main Bottom Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === "ChatList") {
            return <ChatIcon width={size} height={size} color={color} />;
          } else if (route.name === "Friends") {
            return <FriendIcon width={size} height={size} color={color} />;
          } else if (route.name === "Settings") {
            return <SettingIcon width={size} height={size} color={color} />;
          }
          return null;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.primaryDeactivated,
        tabBarIconStyle: {
          marginBottom: 4,
        },
        tabBarLabelStyle: {
          fontSize: 20,
          fontWeight: "700",
          marginTop: -8,
        },
        tabBarStyle: {
          height: 76,
          paddingBottom: 12,
          backgroundColor: "white",
        },
      })}
    >
      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{ tabBarLabel: "친구" }}
      />
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{ tabBarLabel: "채팅" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: "설정" }}
      />
    </Tab.Navigator>
  );
}

// Main App Navigator
export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication status on app start
    checkAuthStatus();

    // Listen for auth state changes
    const unsubscribe = Auth.addAuthListener(() => {
      checkAuthStatus();
    });

    return unsubscribe;
  }, []);

  const checkAuthStatus = async () => {
    const authenticated = await Auth.isAuthenticated();
    setIsAuthenticated(authenticated);
  };

  // Show loading screen while checking auth
  if (isAuthenticated === null) {
    return null; // Could show a loading screen here
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen
              name="ChatRoom"
              component={ChatRoomScreen}
              options={{ headerShown: true }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
