import { usePushNotifications } from '../hooks/usePushNotifications'

export default function NotificationSettings() {
  const { isSupported, isSubscribed, loading, subscribeToPush, unsubscribeFromPush } = usePushNotifications()

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
        <p className="text-sm text-yellow-800">
          お使いのブラウザはプッシュ通知をサポートしていません。
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 p-4">
      <h3 className="text-lg font-medium text-black mb-4">プッシュ通知設定</h3>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-black mb-2">
            予約開始や定員間近などの重要な通知をスマホに受け取れます。
          </p>

          <div className="flex items-center space-x-3">
            <span className="text-sm text-black">
              状態: {isSubscribed ? '有効' : '無効'}
            </span>

            {isSubscribed ? (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                通知ON
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                通知OFF
              </span>
            )}
          </div>
        </div>

        <div>
          {isSubscribed ? (
            <button
              onClick={unsubscribeFromPush}
              disabled={loading}
              className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '処理中...' : '通知を無効にする'}
            </button>
          ) : (
            <button
              onClick={subscribeToPush}
              disabled={loading}
              className="px-4 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '処理中...' : '通知を有効にする'}
            </button>
          )}
        </div>

        <div className="text-xs text-gray-600">
          <p>• 通知を有効にするには、ブラウザの通知許可が必要です</p>
          <p>• 設定はいつでも変更できます</p>
        </div>
      </div>
    </div>
  )
}