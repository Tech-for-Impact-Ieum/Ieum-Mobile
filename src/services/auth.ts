/**
 * Authentication utilities for React Native
 * Adapted from Next.js version - uses AsyncStorage instead of localStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { ApiClient } from './apiClient'
import { User } from '../types'

export interface AuthResponse {
  ok: boolean
  user: User
  token: string
}

export interface RegisterParams {
  name: string
  email: string
  password: string
  phone?: string
  nickname?: string
  imageUrl?: string
  isSpecial?: boolean
}

export class Auth {
  private static authListeners: (() => void)[] = []

  /**
   * Add a listener for auth state changes
   */
  static addAuthListener(listener: () => void): () => void {
    this.authListeners.push(listener)
    // Return unsubscribe function
    return () => {
      this.authListeners = this.authListeners.filter((l) => l !== listener)
    }
  }

  /**
   * Notify all listeners of auth state change
   */
  private static notifyAuthChange(): void {
    this.authListeners.forEach((listener) => listener())
  }

  /**
   * Register a new user
   * @param params Registration parameters (name, email, password required)
   */
  static async register(params: RegisterParams): Promise<AuthResponse> {
    const data = await ApiClient.post('/auth/register', params)

    if (data.token && data.user) {
      await AsyncStorage.setItem('token', data.token)
      await AsyncStorage.setItem('user', JSON.stringify(data.user))
      this.notifyAuthChange()
    }

    return data
  }

  /**
   * Login with email and password
   * @param email User email
   * @param password User password
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    const data = await ApiClient.post('/auth/login', { email, password })

    if (data.token && data.user) {
      await AsyncStorage.setItem('token', data.token)
      await AsyncStorage.setItem('user', JSON.stringify(data.user))
      this.notifyAuthChange()
    }

    return data
  }

  /**
   * Logout current user
   */
  static async logout(): Promise<void> {
    try {
      await ApiClient.post('/auth/logout')
    } finally {
      await AsyncStorage.removeItem('token')
      await AsyncStorage.removeItem('user')
      this.notifyAuthChange()
    }
  }

  /**
   * Get current user from API
   */
  static async getCurrentUser(): Promise<User | null> {
    try {
      const data = await ApiClient.get('/auth/me')
      return data.user
    } catch (error) {
      return null
    }
  }

  /**
   * Get JWT token from AsyncStorage
   */
  static async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem('token')
  }

  /**
   * Get user from AsyncStorage
   */
  static async getUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken()
    return !!token
  }

  /**
   * Get current user ID
   */
  static async getUserId(): Promise<number | null> {
    const user = await this.getUser()
    return user ? user.id : null
  }

  /**
   * Get profile image URL (from UserSetting)
   */
  static async getProfileImage(): Promise<string | null> {
    const user = await this.getUser()
    return user?.setting?.imageUrl || null
  }

  /**
   * Check if user is special needs user
   */
  static async isSpecialUser(): Promise<boolean> {
    const user = await this.getUser()
    return user?.setting?.isSpecial || false
  }
}
