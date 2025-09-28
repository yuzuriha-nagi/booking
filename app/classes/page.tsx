'use client'

import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useUserRole'
import { ClassEvent } from '@/types'
import { collection, onSnapshot, orderBy, query, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ClassesPage() {
  const { user, loading, logout } = useAuth()
  const { isAdmin, isHost, isVisitor } = useUserRole()
  const [classEvents, setClassEvents] = useState<ClassEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [hostNames, setHostNames] = useState<Record<string, string>>({})

  useEffect(() => {
    const q = query(collection(db, 'classEvents'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as ClassEvent[]

      setClassEvents(events)

      // 各イベントの主催者の最新の表示名を取得
      const hostNameMap: Record<string, string> = {}
      for (const event of events) {
        if (event.hostUserId && !hostNameMap[event.hostUserId]) {
          try {
            const userDoc = await getDoc(doc(db, 'users', event.hostUserId))
            if (userDoc.exists()) {
              const userData = userDoc.data()
              hostNameMap[event.hostUserId] = userData.displayName || '名無し'
            } else {
              // ユーザードキュメントが存在しない場合は、イベントに保存された名前を使用
              hostNameMap[event.hostUserId] = event.hostUserName || '名無し'
            }
          } catch (error) {
            console.error('Error fetching host info:', error)
            hostNameMap[event.hostUserId] = event.hostUserName || '名無し'
          }
        }
      }

      setHostNames(hostNameMap)
      setLoadingEvents(false)
    }, (error) => {
      console.error('Error fetching class events:', error)
      setLoadingEvents(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ログインが必要です
          </h2>
          <p className="text-gray-600 mb-6">
            クラス一覧を見るにはログインしてください。
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
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
                <Link
                  href="/classes"
                  className="text-black font-medium border-b-2 border-black"
                >
                  クラス一覧
                </Link>

                {isHost && (
                  <Link
                    href="/host/dashboard"
                    className="text-black hover:text-gray-600"
                  >
                    主催者ダッシュボード
                  </Link>
                )}

                {isAdmin && (
                  <>
                    <Link
                      href="/admin/applications"
                      className="text-black hover:text-gray-600"
                    >
                      申請管理
                    </Link>
                    <Link
                      href="/admin/dashboard"
                      className="text-black hover:text-gray-600"
                    >
                      管理者ダッシュボード
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="text-sm text-black hover:text-gray-600 transition-colors"
              >
                {user.displayName || '名無し'}
              </Link>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-black text-white hover:bg-gray-800 transition-colors"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">
            クラス出し物一覧
          </h1>
          <p className="text-black text-lg">
            気になる出し物をクリックして詳細を見て、予約しましょう！
          </p>
        </div>

        {loadingEvents ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : classEvents.length === 0 ? (
          <div className="bg-white border border-gray-200 p-8 text-center">
            <p className="text-black mb-6 text-lg">まだクラスの出し物が登録されていません</p>
            {isHost && (
              <Link
                href="/host/create-event"
                className="inline-flex items-center px-6 py-3 bg-black text-white font-medium hover:bg-gray-800 transition-colors"
              >
                出し物を登録する
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white border border-gray-200 overflow-hidden hover:border-black transition-all"
            >
              <div className="h-48 relative overflow-hidden">
                {event.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={event.imageUrl}
                    alt={event.eventName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full bg-black flex items-center justify-center">
                    <div className="text-white text-center">
                      <h3 className="text-xl font-bold mb-2">画像なし</h3>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-black mb-2">{event.className}</h3>
                  <p className="text-lg font-medium text-black">{event.eventName}</p>
                </div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-900">
                    {event.duration}分
                  </span>
                </div>

                <p className="text-black text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-black">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-black">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    最大{event.maxCapacity}人
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center text-sm text-black">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    主催者: {hostNames[event.hostUserId] || event.hostUserName || '名無し'}
                  </div>
                  <div className="flex items-center text-sm text-black mt-1">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    体験時間: {event.duration}分
                  </div>
                </div>


                <div className="space-y-3">
                  <Link
                    href={`/classes/${event.id}`}
                    className="w-full bg-black text-white py-3 px-4 font-medium hover:bg-gray-800 transition-colors text-center block"
                  >
                    {isVisitor ? '詳細・予約' : '詳細を見る'}
                  </Link>

                  {isHost && (
                    <Link
                      href={`/classes/${event.id}/manage`}
                      className="w-full bg-white text-black border border-black py-3 px-4 font-medium hover:bg-black hover:text-white transition-colors text-center block"
                    >
                      管理・設定
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      href={`/admin/classes/${event.id}`}
                      className="w-full bg-white text-black border border-black py-3 px-4 font-medium hover:bg-black hover:text-white transition-colors text-center block"
                    >
                      管理者設定
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </main>
    </div>
  )
}