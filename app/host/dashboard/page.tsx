'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useUserRole'
import { ClassEvent } from '@/types'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'

export default function HostDashboardPage() {
  const { user, loading } = useAuth()
  const { isHost, roleLoading } = useUserRole()
  const [myEvents, setMyEvents] = useState<ClassEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  useEffect(() => {
    if (!user || !isHost || loading || roleLoading) return

    const q = query(
      collection(db, 'classEvents'),
      where('hostUserId', '==', user.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as ClassEvent[]

      setMyEvents(events)
      setLoadingEvents(false)
    }, (error) => {
      console.error('Error fetching my events:', error)
      setLoadingEvents(false)
    })

    return () => unsubscribe()
  }, [user, isHost, loading, roleLoading])

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!user || !isHost) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">
            アクセス権限がありません
          </h2>
          <p className="text-black mb-6">
            このページは主催者のみアクセス可能です。
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
                高専文化祭 予約システム
              </Link>
              <nav className="flex space-x-4">
                <Link href="/classes" className="text-black hover:text-gray-600">
                  クラス一覧
                </Link>
                <Link href="/host/dashboard" className="text-black font-medium border-b-2 border-black">
                  主催者ダッシュボード
                </Link>
                <Link href="/host/create-event" className="text-black hover:text-gray-600">
                  出し物登録
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-black mb-2">
              主催者ダッシュボード
            </h1>
            <p className="text-black">
              あなたが登録した出し物を管理できます。
            </p>
          </div>
          <Link
            href="/host/create-event"
            className="bg-black text-white px-4 py-2 hover:bg-gray-800 transition-colors"
          >
            新しい出し物を登録
          </Link>
        </div>

        {loadingEvents ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : myEvents.length === 0 ? (
          <div className="bg-white border border-gray-200 p-6 text-center">
            <p className="text-black mb-4">まだ出し物を登録していません</p>
            <Link
              href="/host/create-event"
              className="inline-flex items-center px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
            >
              最初の出し物を登録する
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {myEvents.map((event) => (
              <div key={event.id} className="bg-white border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-xl font-semibold text-black">
                        {event.eventName}
                      </h3>
                      <span className="inline-flex items-center px-4 py-2 text-lg font-medium bg-black text-white border border-black">
                        {event.className}
                      </span>
                    </div>
                    <p className="text-black mb-2">{event.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-black mb-2">
                      <span>📍 {event.location}</span>
                      <span>👥 最大{event.maxCapacity}人</span>
                      <span>⏱️ {event.duration}分</span>
                    </div>
                    <div className="text-xs text-gray-600">
                      主催者: {event.hostUserName}
                      {event.hostUserEmail && ` (${event.hostUserEmail})`}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      href={`/classes/${event.id}`}
                      className="px-3 py-1 text-sm bg-white text-black border border-black hover:bg-black hover:text-white transition-colors"
                    >
                      詳細
                    </Link>
                    <Link
                      href={`/host/events/${event.id}/edit`}
                      className="px-3 py-1 text-sm bg-black text-white hover:bg-gray-800 transition-colors"
                    >
                      編集
                    </Link>
                  </div>
                </div>


                <div className="mt-4 text-xs text-black">
                  登録日: {event.createdAt.toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}