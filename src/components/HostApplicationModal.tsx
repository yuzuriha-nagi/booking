'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useUserRole'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface HostApplicationModalProps {
  onClose: () => void
  onSubmit: () => void
}

export default function HostApplicationModal({
  onClose,
  onSubmit,
}: HostApplicationModalProps) {
  const { user } = useAuth()
  const { userRole } = useUserRole()
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !reason.trim()) return

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'roleApplications'), {
        userId: user.uid,
        userName: user.displayName || '名無し',
        userEmail: user.email || '',
        currentRole: userRole,
        requestedRole: 'host',
        reason: reason.trim(),
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      alert('主催者申請を送信しました。管理者の審査をお待ちください。')
      onSubmit()
    } catch (error) {
      console.error('申請の送信に失敗しました:', error)
      alert('申請の送信に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">主催者申請</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              主催者になると、クラスの出し物を管理・設定できるようになります。
              申請理由を詳しく記入してください。
            </p>

            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              申請理由 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="例：3年A組の文化祭出し物「プログラミング体験教室」の責任者として申請いたします。"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
              disabled={submitting}
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  申請について
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>申請は管理者によって審査されます</li>
                    <li>承認まで数日かかる場合があります</li>
                    <li>申請結果はメールでお知らせします</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              disabled={submitting}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || submitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? '送信中...' : '申請する'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}