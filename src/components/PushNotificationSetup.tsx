'use client'

import { useState } from 'react'
import { usePushNotifications } from '../hooks/usePushNotifications'

export default function PushNotificationSetup() {
  const { isSupported, isSubscribed, loading, subscribeToPush, unsubscribeFromPush, sendNotification } = usePushNotifications()
  const [testTitle, setTestTitle] = useState('テスト通知')
  const [testBody, setTestBody] = useState('これはテスト通知です')

  const handleSubscribe = async () => {
    const success = await subscribeToPush()
    if (success) {
      alert('プッシュ通知の許可が設定されました！')
    } else {
      alert('プッシュ通知の設定に失敗しました')
    }
  }

  const handleUnsubscribe = async () => {
    const success = await unsubscribeFromPush()
    if (success) {
      alert('プッシュ通知を無効にしました')
    } else {
      alert('プッシュ通知の無効化に失敗しました')
    }
  }

  const handleTestNotification = async () => {
    // ブラウザのNotification APIを使用して直接通知を表示
    try {
      if (Notification.permission === 'granted') {
        new Notification(testTitle, {
          body: testBody,
          icon: "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3e%3crect width='100' height='100' fill='%23000'/%3e%3ctext x='50' y='55' text-anchor='middle' fill='white' font-size='30' font-family='Arial'%3e予%3c/text%3e%3c/svg%3e",
          tag: 'test-notification'
        })
        alert('テスト通知を送信しました')
      } else {
        alert('通知の許可が必要です')
      }
    } catch (error) {
      console.error('Test notification error:', error)
      alert('テスト通知の送信に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 p-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black mx-auto"></div>
      </div>
    )
  }

  if (!isSupported) {
    return (
      <div className="bg-gray-100 border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-2">プッシュ通知</h3>
        <p className="text-gray-600">お使いのブラウザはプッシュ通知をサポートしていません。</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-black mb-4">プッシュ通知設定</h3>

      {!isSubscribed && (
        <div className="bg-blue-50 border border-blue-200 p-4 mb-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-blue-800 font-medium mb-1">通知を有効にしませんか？</h4>
              <p className="text-blue-700 text-sm">
                予約完了やイベント更新などの重要な情報をリアルタイムで受け取れます。
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-black font-medium">
              通知状態: {isSubscribed ? '有効' : '無効'}
            </p>
            <p className="text-sm text-gray-600">
              {isSubscribed
                ? '新しい予約や更新情報を受け取ります'
                : '通知を受け取るには有効にしてください'
              }
            </p>
          </div>

          {isSubscribed ? (
            <button
              onClick={handleUnsubscribe}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              無効にする
            </button>
          ) : (
            <button
              onClick={handleSubscribe}
              className="px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
            >
              有効にする
            </button>
          )}
        </div>

        {isSubscribed && (
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-black mb-3">テスト通知</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  タイトル
                </label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-black"
                  placeholder="通知のタイトル"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  メッセージ
                </label>
                <textarea
                  value={testBody}
                  onChange={(e) => setTestBody(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 focus:outline-none focus:border-black text-black"
                  rows={3}
                  placeholder="通知の内容"
                />
              </div>
              <button
                onClick={handleTestNotification}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                テスト通知を送信
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}