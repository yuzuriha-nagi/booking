'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useUserRole'
import { collection, getDocs, doc, getDoc, updateDoc, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function HostNameSync() {
  const { user } = useAuth()
  const { isAdmin } = useUserRole()
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<string>('')

  const syncHostNames = async () => {
    if (!user || !isAdmin) return

    setSyncing(true)
    setResult('')

    try {
      // 全イベントを取得
      const eventsSnapshot = await getDocs(collection(db, 'classEvents'))
      let updatedCount = 0
      const batch = writeBatch(db)

      for (const eventDoc of eventsSnapshot.docs) {
        const eventData = eventDoc.data()
        const hostUserId = eventData.hostUserId

        if (!hostUserId) continue

        // ユーザー情報を取得
        const userDoc = await getDoc(doc(db, 'users', hostUserId))

        if (userDoc.exists()) {
          const userData = userDoc.data()
          const currentDisplayName = userData.displayName || '名無し'

          // 主催者名が異なる場合は更新をバッチに追加
          if (eventData.hostUserName !== currentDisplayName) {
            batch.update(eventDoc.ref, {
              hostUserName: currentDisplayName,
              hostUserEmail: userData.email || eventData.hostUserEmail || '',
              updatedAt: new Date()
            })
            updatedCount++
          }
        }
      }

      if (updatedCount > 0) {
        await batch.commit()
        setResult(`${updatedCount}件のイベントの主催者名を更新しました`)
      } else {
        setResult('すべてのイベントの主催者名は最新です')
      }

    } catch (error) {
      console.error('主催者名の同期でエラーが発生しました:', error)
      setResult('エラーが発生しました。もう一度お試しください。')
    } finally {
      setSyncing(false)
    }
  }

  if (!isAdmin) return null

  return (
    <div className="bg-white border border-gray-200 p-4 mb-6">
      <h3 className="text-lg font-medium text-black mb-4">
        主催者名の同期
      </h3>
      <p className="text-sm text-black mb-4">
        すべてのイベントの主催者名を最新のユーザー表示名に同期します。
      </p>

      <button
        onClick={syncHostNames}
        disabled={syncing}
        className="px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {syncing ? '同期中...' : '主催者名を同期'}
      </button>

      {result && (
        <div className="mt-4 p-3 bg-gray-100">
          <p className="text-sm text-black">{result}</p>
        </div>
      )}
    </div>
  )
}