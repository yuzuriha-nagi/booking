self.addEventListener('push', function(event) {
  console.log('Push event received:', event)

  try {
    let notificationData = {
      title: '高専祭予約システム',
      body: 'プッシュ通知が届きました',
      icon: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%23000'/%3e%3ctext x='50' y='55' text-anchor='middle' fill='white' font-size='30' font-family='Arial'%3e予%3c/text%3e%3c/svg%3e",
      badge: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%23000'/%3e%3ctext x='50' y='55' text-anchor='middle' fill='white' font-size='20' font-family='Arial'%3e予%3c/text%3e%3c/svg%3e",
      vibrate: [100, 50, 100],
      data: {},
      actions: [
        {
          action: 'view',
          title: '詳細を見る'
        },
        {
          action: 'close',
          title: '閉じる'
        }
      ]
    }

    if (event.data) {
      try {
        const data = event.data.json()
        notificationData = {
          ...notificationData,
          title: data.title || notificationData.title,
          body: data.body || notificationData.body,
          data: data.data || notificationData.data
        }
      } catch (parseError) {
        console.error('Error parsing push data:', parseError)
      }
    }

    event.waitUntil(
      self.registration.showNotification(notificationData.title, {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        vibrate: notificationData.vibrate,
        data: notificationData.data,
        actions: notificationData.actions
      }).catch(error => {
        console.error('Error showing notification:', error)
      })
    )
  } catch (error) {
    console.error('Error in push event listener:', error)
  }
})

self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event)

  try {
    event.notification.close()

    if (event.action === 'close') {
      return
    }

    const urlToOpen = event.action === 'view' ? '/classes' : '/'

    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then(function(windowClients) {
        // 既存のウィンドウが開いている場合は、そのウィンドウをフォーカス
        for (let i = 0; i < windowClients.length; i++) {
          const client = windowClients[i]
          if (client.url.includes(self.location.origin)) {
            return client.focus().then(() => {
              return client.navigate ? client.navigate(urlToOpen) : null
            }).catch(error => {
              console.error('Error focusing client:', error)
            })
          }
        }

        // 新しいウィンドウを開く
        return clients.openWindow(urlToOpen).catch(error => {
          console.error('Error opening new window:', error)
        })
      }).catch(error => {
        console.error('Error in notification click handler:', error)
      })
    )
  } catch (error) {
    console.error('Error in notification click event:', error)
  }
})

self.addEventListener('install', function(event) {
  console.log('Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...')
  event.waitUntil(clients.claim())
})

// エラーハンドリング
self.addEventListener('error', function(event) {
  console.error('Service Worker error:', event.error)
})

// メッセージエラーハンドリング
self.addEventListener('messageerror', function(event) {
  console.error('Service Worker message error:', event)
})