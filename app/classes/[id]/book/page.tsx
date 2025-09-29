'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useUserRole'
import { ClassEvent, BookingFormData } from '@/types'
import { doc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'

export default function BookEventPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, loading } = useAuth()
  const { isVisitor } = useUserRole()

  const [event, setEvent] = useState<ClassEvent | null>(null)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentReservations, setCurrentReservations] = useState(0)
  const [formData, setFormData] = useState<BookingFormData>({
    numberOfPeople: 1,
    specialRequests: ''
  })

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfPeople' ? parseInt(value) || 1 : value
    }))
  }

  const generateReservationCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !event) return

    setSubmitting(true)
    try {
      const reservationData = {
        userId: user.uid,
        classEventId: event.id,
        userName: user.displayName || '名無し',
        userEmail: user.email || '',
        numberOfPeople: formData.numberOfPeople,
        specialRequests: formData.specialRequests || '',
        status: 'confirmed' as const,
        reservationCode: generateReservationCode(),
        eventName: event.eventName,
        className: event.className,
        location: event.location,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, 'reservations'), reservationData)

      alert(`予約が完了しました！\n予約コード: ${reservationData.reservationCode}`)
      router.push('/classes')
    } catch (error) {
      console.error('Error creating reservation:', error)
      alert('予約に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || loadingEvent) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!user || !isVisitor) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">
            予約権限がありません
          </h2>
          <p className="text-black mb-6">
            予約機能は来場者アカウントでのみ利用できます。
          </p>
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

  if (!event) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">
            予約情報が見つかりません
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={`/classes/${event.id}`}
            className="inline-flex items-center text-black hover:text-gray-600 mb-4"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            出し物詳細に戻る
          </Link>
        </div>

        <div className="bg-white border border-gray-200 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black mb-2">
              予約確認
            </h1>
            <p className="text-black">
              以下の内容で予約を行います。内容をご確認の上、予約を確定してください。
            </p>
          </div>

          {/* Reservation Summary */}
          <div className="bg-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold text-black mb-4">予約内容</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-black">出し物名</span>
                <span className="font-medium text-black">{event.eventName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">クラス</span>
                <span className="font-medium text-black">{event.className}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">場所</span>
                <span className="font-medium text-black">{event.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">最大収容人数</span>
                <span className="font-medium text-black">{event.maxCapacity}人</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">現在の予約数</span>
                <span className="font-medium text-black">{currentReservations}人</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">空き状況</span>
                <span className="font-medium text-black">
                  {currentReservations >= event.maxCapacity
                    ? `定員超過中 (+${currentReservations - event.maxCapacity}人)`
                    : `残り${event.maxCapacity - currentReservations}人`
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-black">体験時間</span>
                <span className="font-medium text-black">{event.duration}分</span>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="numberOfPeople" className="block text-base font-medium text-black mb-3">
                参加人数 <span className="text-black">*</span>
              </label>
              <select
                id="numberOfPeople"
                name="numberOfPeople"
                value={formData.numberOfPeople}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black text-black text-lg"
                required
                disabled={submitting}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>{num}人</option>
                ))}
              </select>
              <p className="mt-2 text-sm text-black">
                最大10人まで選択可能です
              </p>
            </div>

            <div>
              <label htmlFor="specialRequests" className="block text-base font-medium text-black mb-3">
                特別な要望・備考
              </label>
              <textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                placeholder="車椅子での参加、アレルギーなど、特別な配慮が必要な場合はお書きください..."
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black text-black text-lg placeholder-gray-500"
                rows={4}
                disabled={submitting}
              />
            </div>

            <div className="bg-gray-100 p-4">
              <h3 className="font-medium text-black mb-2">予約についての注意事項</h3>
              <ul className="text-sm text-black space-y-1">
                <li>• 予約は確定後にキャンセルできません</li>
                <li>• 遅刻される場合は事前にご連絡ください</li>
                <li>• 予約コードは当日受付で必要になります</li>
                <li>• 定員に達した場合は予約をお受けできません</li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Link
                href={`/classes/${event.id}`}
                className="flex-1 px-6 py-4 text-black bg-white border border-black hover:bg-black hover:text-white transition-colors text-center text-lg font-medium"
              >
                キャンセル
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-4 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-medium"
              >
                {submitting ? '予約中...' : '予約を確定する'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}