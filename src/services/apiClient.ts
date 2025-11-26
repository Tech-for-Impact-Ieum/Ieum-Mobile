/**
 * API Client for communicating with the backend
 * Adapted for React Native - uses AsyncStorage instead of localStorage
 */

import AsyncStorage from '@react-native-async-storage/async-storage'
import { EXPO_PUBLIC_API_URL } from '../constants/urls'

export class ApiClient {
  private static async getAuthHeaders(): Promise<HeadersInit> {
    const token = await AsyncStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  static async get(endpoint: string) {
    const response = await fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`, {
      method: 'GET',
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  static async post(endpoint: string, data?: unknown) {
    const response = await fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`, {
      method: 'POST',
      headers: await this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.handleResponse(response)
  }

  static async put(endpoint: string, data: unknown) {
    const response = await fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`, {
      method: 'PUT',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  }

  static async patch(endpoint: string, data: unknown) {
    const response = await fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`, {
      method: 'PATCH',
      headers: await this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  }

  static async delete(endpoint: string) {
    const response = await fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`, {
      method: 'DELETE',
      headers: await this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  static async uploadFile(endpoint: string, formData: FormData) {
    const token = await AsyncStorage.getItem('token')
    const headers: HeadersInit = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    // Don't set Content-Type for FormData - let browser set it with boundary

    const response = await fetch(`${EXPO_PUBLIC_API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })
    return this.handleResponse(response)
  }

  private static async handleResponse(response: Response) {
    const data = await response.json()

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        // Clear auth data
        await AsyncStorage.removeItem('token')
        await AsyncStorage.removeItem('user')

        // In React Native, navigation will be handled by the calling component
        // The component should listen for auth errors and navigate to login
      }

      const error = new Error(data.error || 'Request failed') as any
      error.status = response.status
      throw error
    }

    return data
  }

  static async updatePushToken(token: string) {
    try {
      await this.post('/users/push-token', { token })
    } catch (error) {
      console.error('Failed to update push token:', error)
      // Don't throw error here to prevent blocking app flow
    }
  }
}
