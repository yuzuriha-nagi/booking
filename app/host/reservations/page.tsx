'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../../src/hooks/useAuth'
import { useUserRole } from '../../../src/hooks/useUserRole'
import { usePushNotifications } from '../../../src/hooks/usePushNotifications'
import { ClassEvent } from '../../../src/types'
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore'
import { db } from '../../../src/lib/firebase'
import Link from 'next/link'

interface Reservation {
  id: string
  userId: string
  classEventId: string
  timeSlotId: string
  userName: string
  userEmail: string
  numberOfPeople: number
  specialRequests: string
  status: 'confirmed' | 'cancelled'
  attended?: boolean
  reservationCode: string
  reservationDate?: string
  startTime?: string
  endTime?: string
  eventName?: string
  className?: string
  location?: string
  createdAt: Date
  updatedAt: Date
}

export default function HostReservationsPage() {
  const { user, loading, logout } = useAuth()
  const { isHost, roleLoading } = useUserRole()
  const { sendNotification } = usePushNotifications()
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [events, setEvents] = useState<Record<string, ClassEvent>>({})
  const [loadingReservations, setLoadingReservations] = useState(true)
  const [filter, setFilter] = useState<'all' | 'attended' | 'not_attended'>('all')
  const [notificationSettings, setNotificationSettings] = useState<Record<string, number>>({})
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    if (!user || !isHost || loading || roleLoading) {
      setReservations([])
      setEvents({})
      setLoadingReservations(false)
      return
    }

    let eventsUnsubscribe: (() => void) | undefined
    let reservationsUnsubscribe: (() => void) | undefined

    const loadHostReservations = async () => {
      try {
        // まず主催者のイベントを取得
        const eventsQuery = query(
          collection(db, 'classEvents'),
          where('hostUserId', '==', user.uid)
        )

        eventsUnsubscribe = onSnapshot(eventsQuery, async (eventsSnapshot) => {
          const hostEvents: Record<string, ClassEvent> = {}
          const eventIds: string[] = []

          for (const eventDoc of eventsSnapshot.docs) {
            const eventData = {
              id: eventDoc.id,
              ...eventDoc.data(),
              createdAt: eventDoc.data().createdAt?.toDate() || new Date(),
              updatedAt: eventDoc.data().updatedAt?.toDate() || new Date(),
            } as ClassEvent

            hostEvents[eventData.id] = eventData
            eventIds.push(eventData.id)
          }

          setEvents(hostEvents)

          if (eventIds.length > 0) {
            // 主催者のイベントに対する予約を取得
            const reservationsQuery = query(
              collection(db, 'reservations'),
              where('classEventId', 'in', eventIds)
            )

            reservationsUnsubscribe = onSnapshot(reservationsQuery, (reservationsSnapshot) => {
              const reservationsList = reservationsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
                updatedAt: doc.data().updatedAt?.toDate() || new Date(),
              })) as Reservation[]

              // クライアントサイドでソート
              reservationsList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

              setReservations(reservationsList)
              setLoadingReservations(false)
            }, (error) => {
              console.error('Error loading reservations:', error)
              setReservations([])
              setLoadingReservations(false)
            })
          } else {
            setReservations([])
            setLoadingReservations(false)
          }
        }, (error) => {
          console.error('Error loading events:', error)
          setEvents({})
          setLoadingReservations(false)
        })
      } catch (error) {
        console.error('Failed to load reservations:', error)
        setLoadingReservations(false)
      }
    }

    loadHostReservations()

    return () => {
      if (eventsUnsubscribe) eventsUnsubscribe()
      if (reservationsUnsubscribe) reservationsUnsubscribe()
    }
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

  const getAttendanceStatus = (reservation: Reservation) => {
    if (reservation.attended === true) {
      return { label: '来場済み', style: 'bg-green-100 text-green-800' }
    } else if (reservation.attended === false) {
      return { label: '未来場', style: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { label: '未確認', style: 'bg-gray-100 text-gray-800' }
    }
  }

  const toggleAttendance = async (reservationId: string, currentStatus: boolean | undefined) => {
    try {
      const newStatus = currentStatus === true ? false : true
      await updateDoc(doc(db, 'reservations', reservationId), {
        attended: newStatus,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating attendance:', error)
      alert('来場状態の更新に失敗しました')
    }
  }

  const filteredReservations = reservations.filter(reservation => {
    if (filter === 'attended') return reservation.attended === true
    if (filter === 'not_attended') return reservation.attended !== true
    return true
  })

  const updateNotificationSetting = async (eventId: string, threshold: number) => {
    try {
      await updateDoc(doc(db, 'classEvents', eventId), {
        notificationThreshold: threshold,
        updatedAt: new Date()
      })
      setNotificationSettings(prev => ({ ...prev, [eventId]: threshold }))
    } catch (error) {
      console.error('Error updating notification setting:', error)
      alert('通知設定の更新に失敗しました')
    }
  }

  const getReservationCounts = () => {
    const counts: Record<string, { total: number, attended: number }> = {}
    reservations.forEach(reservation => {
      const eventId = reservation.classEventId
      if (!counts[eventId]) {
        counts[eventId] = { total: 0, attended: 0 }
      }
      counts[eventId].total += reservation.numberOfPeople
      if (reservation.attended === true) {
        counts[eventId].attended += reservation.numberOfPeople
      }
    })
    return counts
  }

  const reservationCounts = getReservationCounts()

  const sendCapacityNotification = async (eventId: string) => {
    const event = events[eventId]
    const counts = reservationCounts[eventId]
    const eventReservations = reservations.filter(r => r.classEventId === eventId)

    if (!event || !counts) return

    const remaining = event.maxCapacity - counts.total
    const userIds = eventReservations.map(r => r.userId)

    await sendNotification(
      userIds,
      `【${event.eventName}】定員間近のお知らせ`,
      `残り${remaining}人となりました。お早めにご来場ください！`,
      { eventId, type: 'capacity_warning' }
    )

    alert(`${userIds.length}人に通知を送信しました`)
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
                <Link href="/host/dashboard" className="text-black hover:text-gray-600">
                  主催者ダッシュボード
                </Link>
                <Link href="/host/reservations" className="text-black font-medium border-b-2 border-black">
                  予約一覧
                </Link>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            予約一覧
          </h1>
          <p className="text-black mb-4">
            あなたの出し物への予約を確認できます。
          </p>

          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-black text-white'
                    : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                }`}
              >
                全て ({reservations.length})
              </button>
              <button
                onClick={() => setFilter('attended')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === 'attended'
                    ? 'bg-black text-white'
                    : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                }`}
              >
                来場済み ({reservations.filter(r => r.attended === true).length})
              </button>
              <button
                onClick={() => setFilter('not_attended')}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  filter === 'not_attended'
                    ? 'bg-black text-white'
                    : 'bg-white text-black border border-black hover:bg-black hover:text-white'
                }`}
              >
                未来場 ({reservations.filter(r => r.attended !== true).length})
              </button>
            </div>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 text-sm font-medium bg-white text-black border border-black hover:bg-black hover:text-white transition-colors"
            >
              通知設定
            </button>
          </div>
        </div>

        {showSettings && (
          <div className="bg-white border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-black mb-4">通知設定</h2>
            <p className="text-sm text-black mb-4">
              各出し物で残り何人になったら通知するかを設定できます。
            </p>

            {Object.entries(events).map(([eventId, event]) => {
              const counts = reservationCounts[eventId] || { total: 0, attended: 0 }
              const remaining = event.maxCapacity - counts.total

              return (
                <div key={eventId} className="border border-gray-200 p-4 mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-black">{event.eventName}</h3>
                      <p className="text-sm text-gray-600">{event.className}</p>
                      <p className="text-sm text-black">
                        現在: {counts.total}/{event.maxCapacity}人 (残り{remaining}人)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-black">残り</label>
                    <input
                      type="number"
                      min="1"
                      max={event.maxCapacity}
                      defaultValue={event.notificationThreshold || 5}
                      className="w-20 px-2 py-1 border border-gray-300 text-sm"
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        if (value > 0) {
                          updateNotificationSetting(eventId, value)
                        }
                      }}
                    />
                    <label className="text-sm text-black">人で通知</label>
                  </div>

                  {remaining <= (event.notificationThreshold || 5) && remaining > 0 && (
                    <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 text-sm rounded">
                      <div className="flex justify-between items-center">
                        <span>⚠️ 通知: 残り{remaining}人です</span>
                        <button
                          onClick={() => sendCapacityNotification(eventId)}
                          className="px-2 py-1 text-xs bg-yellow-600 text-white hover:bg-yellow-700 transition-colors ml-2"
                        >
                          通知送信
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {loadingReservations ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="bg-white border border-gray-200 p-6 text-center">
            <p className="text-black mb-4">まだ予約がありません</p>
            <Link
              href="/host/dashboard"
              className="inline-flex items-center px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors"
            >
              主催者ダッシュボードに戻る
            </Link>
          </div>
        ) : (
          <div className="bg-white border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">出し物</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">予約者</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">人数</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">コード</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">予約日時</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">来場状況</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-black">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReservations.map((reservation) => {
                  const event = events[reservation.classEventId]
                  if (!event) return null

                  const attendanceStatus = getAttendanceStatus(reservation)

                  return (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-black">
                        <div>
                          <div className="font-medium">{event.eventName}</div>
                          <div className="text-gray-600">{event.className}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-black">
                        {reservation.userName}
                      </td>
                      <td className="px-4 py-3 text-sm text-black">
                        {reservation.numberOfPeople}人
                      </td>
                      <td className="px-4 py-3 text-sm text-black font-mono">
                        {reservation.reservationCode}
                      </td>
                      <td className="px-4 py-3 text-sm text-black">
                        {reservation.createdAt.toLocaleDateString('ja-JP')} {reservation.createdAt.toLocaleTimeString('ja-JP', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${attendanceStatus.style}`}
                        >
                          {attendanceStatus.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => toggleAttendance(reservation.id, reservation.attended)}
                          className="px-3 py-1 text-xs bg-black text-white hover:bg-gray-800 transition-colors"
                        >
                          {reservation.attended === true ? '未来場にする' : '来場済みにする'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}