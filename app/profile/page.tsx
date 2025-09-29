'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useUserRole'
import { updateProfile } from 'firebase/auth'
import { doc, updateDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'
import NotificationSettings from '../../src/components/NotificationSettings'

export default function ProfilePage() {
  const { user, loading } = useAuth()
  const { userRole } = useUserRole()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [updating, setUpdating] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !displayName.trim()) return

    setUpdating(true)
    try {
      // Firebase Authのプロファイルを更新
      await updateProfile(user, {
        displayName: displayName.trim()
      })

      // Firestoreのユーザードキュメントも更新
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        updatedAt: new Date()
      })

      // このユーザーが主催する全てのイベントの主催者名も更新
      if (userRole === 'host' || userRole === 'admin') {
        const eventsQuery = query(
          collection(db, 'classEvents'),
          where('hostUserId', '==', user.uid)
        )
        const eventsSnapshot = await getDocs(eventsQuery)

        if (!eventsSnapshot.empty) {
          const batch = writeBatch(db)

          eventsSnapshot.docs.forEach((eventDoc) => {
            batch.update(eventDoc.ref, {
              hostUserName: displayName.trim(),
              updatedAt: new Date()
            })
          })

          await batch.commit()
        }
      }

      alert('表示名を更新しました！主催イベントの情報も同時に更新されました。')
    } catch (error) {
      console.error('表示名の更新に失敗しました:', error)
      alert('表示名の更新に失敗しました。もう一度お試しください。')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">
            ログインが必要です
          </h2>
          <p className="text-black mb-6">
            プロフィール設定にはログインしてください。
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-2xl font-bold text-black">
                高専祭予約
              </Link>
              <nav className="flex space-x-4">
                <Link href="/classes" className="text-black hover:text-gray-600">
                  クラス一覧
                </Link>
                <Link href="/profile" className="text-black font-medium border-b-2 border-black">
                  プロフィール設定
                </Link>
              </nav>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-black">
                {user.displayName || '名無し'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/classes"
            className="inline-flex items-center text-black hover:text-gray-600 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            クラス一覧に戻る
          </Link>
        </div>

        <div className="bg-white border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">
              プロフィール設定
            </h1>
            <p className="text-black">
              アカウント情報を管理できます。
            </p>
          </div>

          <div className="bg-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold text-black mb-4">現在の情報</h2>
            <div className="space-y-3">
              <div>
                <p className="text-black"><strong>メールアドレス:</strong> {user.email}</p>
                <p className="text-black"><strong>現在の表示名:</strong> {user.displayName || '未設定'}</p>
                <p className="text-black"><strong>役割:</strong> {userRole || 'visitor'}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="displayName" className="block text-base font-medium text-black mb-3">
                表示名 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="表示名を入力してください"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black text-black text-lg"
                required
                disabled={updating}
                maxLength={50}
              />
              <p className="mt-2 text-sm text-black">
                この名前が他のユーザーに表示されます（最大50文字）
              </p>
            </div>

            <div className="bg-gray-100 p-4">
              <h3 className="font-medium text-black mb-2">注意事項</h3>
              <ul className="text-sm text-black space-y-1">
                <li>• 表示名は他のユーザーに公開されます</li>
                <li>• 不適切な名前は管理者によって変更される場合があります</li>
                <li>• 変更後は即座に反映されます</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Link
                href="/classes"
                className="flex-1 px-6 py-4 text-black bg-white border border-black hover:bg-black hover:text-white transition-colors text-center text-lg font-medium"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={!displayName.trim() || updating}
                className="flex-1 px-6 py-4 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-medium"
              >
                {updating ? '更新中...' : '表示名を更新'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <NotificationSettings />
          </div>
        </div>
      </main>
    </div>
  )
}