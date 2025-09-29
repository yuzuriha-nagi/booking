self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json()

    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: data.data,
      actions: [
        {
          action: 'view',
          title: '詳細を見る',
          icon: '/icon-72x72.png'
        },
        {
          action: 'close',
          title: '閉じる',
          icon: '/icon-72x72.png'
        }
      ]
    }

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/classes')
    )
  }
})

self.addEventListener('install', function(event) {
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim())
})