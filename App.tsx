import React, { useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { PaperProvider } from 'react-native-paper'
import * as Notifications from 'expo-notifications'
import AppNavigator from './src/navigation/AppNavigator'
import {
  registerForPushNotificationsAsync,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  removeNotificationSubscription,
} from './src/services/notification'

import { ApiClient } from './src/services/apiClient'

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>('')
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >(undefined)
  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined)
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined)

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      setExpoPushToken(token)
      if (token) {
        ApiClient.updatePushToken(token)
      }
    })

    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        setNotification(notification)
      }
    )

    responseListener.current = addNotificationResponseReceivedListener(
      (response) => {
        console.log(response)
        // Navigate to chat screen based on notification data
        // const data = response.notification.request.content.data
        // if (data.roomId) {
        //   navigation.navigate('ChatRoom', { roomId: data.roomId })
        // }
      }
    )

    return () => {
      if (notificationListener.current) {
        removeNotificationSubscription(notificationListener.current)
      }
      if (responseListener.current) {
        removeNotificationSubscription(responseListener.current)
      }
    }
  }, [])

  return (
    <PaperProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </PaperProvider>
  )
}
