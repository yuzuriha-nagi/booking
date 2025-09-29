import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

const VAPID_PUBLIC_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa40HI2BN9XS9T4WDGQW8x4qFg3w5J8QhVxF3L8U2K7D2cDqJ4x6wHNFr9y2nM'

export const usePushNotifications = () => {
  const { user } = useAuth()
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    } else {
      setLoading(false)
    }
  }, [user])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)
    } catch (error) {
      console.error('Error checking subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToPush = async () => {
    if (!isSupported || !user) return false

    try {
      setLoading(true)

      // Service Workerの登録
      const registration = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      // 通知許可をリクエスト
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        throw new Error('Notification permission denied')
      }

      // プッシュ通知にサブスクライブ
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      })

      // サブスクリプション情報をFirestoreに保存
      await setDoc(doc(db, 'pushSubscriptions', user.uid), {
        subscription: subscription.toJSON(),
        userId: user.uid,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      setIsSubscribed(true)
      return true
    } catch (error) {
      console.error('Error subscribing to push:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const unsubscribeFromPush = async () => {
    if (!isSupported || !user) return false

    try {
      setLoading(true)

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
      }

      // Firestoreからサブスクリプション情報を削除
      await setDoc(doc(db, 'pushSubscriptions', user.uid), {
        subscription: null,
        userId: user.uid,
        updatedAt: new Date()
      })

      setIsSubscribed(false)
      return true
    } catch (error) {
      console.error('Error unsubscribing from push:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const sendNotification = async (userIds: string[], title: string, body: string, data?: Record<string, unknown>) => {
    try {
      for (const userId of userIds) {
        const subscriptionDoc = await getDoc(doc(db, 'pushSubscriptions', userId))

        if (subscriptionDoc.exists() && subscriptionDoc.data().subscription) {
          await fetch('/api/send-notification', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              subscription: subscriptionDoc.data().subscription,
              payload: {
                title,
                body,
                data
              }
            })
          })
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error)
    }
  }

  return {
    isSupported,
    isSubscribed,
    loading,
    subscribeToPush,
    unsubscribeFromPush,
    sendNotification
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}