'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useUserRole'
import { ClassEvent } from '@/types'
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'

export default function ClassEventDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const { isVisitor, isHost, isAdmin } = useUserRole()
  const [event, setEvent] = useState<ClassEvent | null>(null)
  const [currentReservations, setCurrentReservations] = useState(0)
  const [loadingEvent, setLoadingEvent] = useState(true)

  useEffect(() => {
    const fetchEventAndReservations = async () => {
      if (!id) return

      try {
        const eventDoc = await getDoc(doc(db, 'classEvents', id as string))
        if (eventDoc.exists()) {
          const eventData = {
            id: eventDoc.id,
            ...eventDoc.data(),
            createdAt: eventDoc.data().createdAt?.toDate() || new Date(),
            updatedAt: eventDoc.data().updatedAt?.toDate() || new Date(),
          } as ClassEvent

          setEvent(eventData)

          // 現在の予約数を取得
          const reservationsSnapshot = await getDocs(
            query(collection(db, 'reservations'), where('classEventId', '==', id))
          )
          const totalReservations = reservationsSnapshot.docs.reduce((sum, doc) => {
            const data = doc.data()
            return sum + (data.numberOfPeople || 0)
          }, 0)
          setCurrentReservations(totalReservations)
        } else {
          router.push('/classes')
        }
      } catch (error) {
        console.error('Error fetching event:', error)
        router.push('/classes')
      } finally {
        setLoadingEvent(false)
      }
    }

    fetchEventAndReservations()
  }, [id, router])

  if (loading || loadingEvent) {
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
            出し物の詳細を見るにはログインしてください。
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

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">
            出し物が見つかりません
          </h2>
          <Link
            href="/classes"
            className="inline-flex items-center px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
          >
            クラス一覧に戻る
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
                {isHost && (
                  <Link
                    href="/host/dashboard"
                    className="text-black hover:text-gray-600"
                  >
                    主催者ダッシュボード
                  </Link>
                )}
              </nav>
            </div>
            <div className="flex items-center">
              <Link
                href="/profile"
                className="text-sm text-black hover:text-gray-600 transition-colors"
              >
                {user.displayName || '名無し'}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="bg-white border border-gray-200 overflow-hidden">
          <div className="h-64 relative overflow-hidden">
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
                  <h1 className="text-4xl font-bold">画像なし</h1>
                </div>
              </div>
            )}
          </div>

          <div className="px-8 py-6 bg-white border-b border-gray-200">
            <div className="text-center">
              <span className="inline-block px-6 py-3 bg-black text-white text-xl font-medium mb-4">
                {event.className}
              </span>
              <h1 className="text-4xl font-bold text-black">{event.eventName}</h1>
            </div>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div>
                <h2 className="text-2xl font-semibold text-black mb-4">出し物について</h2>
                <p className="text-black text-lg leading-relaxed mb-6">
                  {event.description}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-black">
                      <strong>場所:</strong> {event.location}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-black">
                      <strong>体験時間:</strong> {event.duration}分
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="text-black">
                      <strong>定員:</strong> {event.maxCapacity}人
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-black">
                      <strong>現在の予約:</strong> {currentReservations}人
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-black">
                      <strong>空き状況:</strong>
                      {currentReservations >= event.maxCapacity
                        ? ` 定員超過中 (+${currentReservations - event.maxCapacity}人)`
                        : ` 残り${event.maxCapacity - currentReservations}人`
                      }
                    </span>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-black mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-black">
                      <strong>主催者:</strong> {event.hostUserName}
                      {event.hostUserEmail && (
                        <span className="text-sm text-gray-600 ml-2">
                          ({event.hostUserEmail})
                        </span>
                      )}
                    </span>
                  </div>
                </div>

              </div>

              {isVisitor && (
                <div>
                  <h2 className="text-2xl font-semibold text-black mb-4">予約する</h2>

                  <div className="bg-white border border-gray-200 p-6">
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-black mb-2">予約状況</h3>
                      {currentReservations >= event.maxCapacity ? (
                        <div className="bg-yellow-50 border border-yellow-200 p-4">
                          <p className="text-yellow-800">
                            <strong>定員超過中</strong> (現在 {currentReservations}人 / 定員 {event.maxCapacity}人)
                          </p>
                          <p className="text-sm text-yellow-700 mt-1">
                            ※ 定員を超えていますが予約は可能です
                          </p>
                        </div>
                      ) : (
                        <div className="bg-green-50 border border-green-200 p-4">
                          <p className="text-green-800">
                            <strong>予約可能です</strong> (現在 {currentReservations}人 / 定員 {event.maxCapacity}人)
                          </p>
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/classes/${event.id}/book`}
                      className="w-full bg-black text-white py-4 px-6 font-medium hover:bg-gray-800 transition-colors text-center block text-lg"
                    >
                      この出し物を予約する
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {!isVisitor && (
              <div className="bg-gray-100 p-4">
                <p className="text-black">
                  {isHost ? '主催者として出し物の詳細を確認できます。' : isAdmin ? '管理者として出し物の詳細を確認できます。' : '予約機能は来場者アカウントで利用できます。'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}