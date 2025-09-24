'use client'

import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useUserRole'
import { ClassEvent } from '@/types'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function ClassesPage() {
  const { user, loading } = useAuth()
  const { userRole, hasPermission, isAdmin, isHost, isVisitor } = useUserRole()
  const [classEvents, setClassEvents] = useState<ClassEvent[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'classEvents'), orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as ClassEvent[]

      setClassEvents(events)
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                高専文化祭 予約システム
              </Link>

              <nav className="flex space-x-4">
                <Link
                  href="/classes"
                  className="text-blue-600 font-medium"
                >
                  クラス一覧
                </Link>

                {isHost && (
                  <Link
                    href="/host/dashboard"
                    className="text-green-600 hover:text-green-700"
                  >
                    主催者ダッシュボード
                  </Link>
                )}

                {isAdmin && (
                  <>
                    <Link
                      href="/admin/applications"
                      className="text-red-600 hover:text-red-700"
                    >
                      申請管理
                    </Link>
                    <Link
                      href="/admin/dashboard"
                      className="text-red-600 hover:text-red-700"
                    >
                      管理者ダッシュボード
                    </Link>
                  </>
                )}
              </nav>
            </div>

            <div className="flex items-center space-x-2">
              <img
                src={user.photoURL || '/default-avatar.png'}
                alt={user.displayName || 'User'}
                className="h-8 w-8 rounded-full"
              />
              <span className="text-sm text-gray-700">
                {user.displayName || user.email}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            クラス出し物一覧
          </h1>
          <p className="text-gray-600">
            気になる出し物をクリックして詳細を見て、予約しましょう！
          </p>
        </div>

        {loadingEvents ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : classEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500 mb-4">まだクラスの出し物が登録されていません</p>
            {isHost && (
              <Link
                href="/host/create-event"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                出し物を登録する
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                <div className="text-white text-center">
                  <h3 className="text-xl font-bold mb-2">{event.className}</h3>
                  <p className="text-lg">{event.eventName}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {event.grade}
                  </span>
                  <span className="text-sm text-gray-500">
                    {event.duration}分
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    最大{event.maxCapacity}人
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-2">
                  <Link
                    href={`/classes/${event.id}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
                  >
                    {isVisitor ? '詳細・予約' : '詳細を見る'}
                  </Link>

                  {isHost && (
                    <Link
                      href={`/classes/${event.id}/manage`}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors text-center block"
                    >
                      管理・設定
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      href={`/admin/classes/${event.id}`}
                      className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors text-center block"
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