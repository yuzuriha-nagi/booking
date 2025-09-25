'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { updateProfile } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface ProfileModalProps {
  onClose: () => void
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  const { user } = useAuth()
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

      alert('表示名を更新しました！')
      onClose()
    } catch (error) {
      console.error('表示名の更新に失敗しました:', error)
      alert('表示名の更新に失敗しました。もう一度お試しください。')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border border-gray-200 max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-black">プロフィール設定</h2>
          <button
            onClick={onClose}
            className="text-black hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
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
              この名前が他のユーザーに表示されます
            </p>
          </div>

          <div className="bg-gray-100 p-4 mb-6">
            <h3 className="font-medium text-black mb-2">現在の情報</h3>
            <div className="text-sm text-black space-y-1">
              <p><strong>メールアドレス:</strong> {user?.email}</p>
              <p><strong>現在の表示名:</strong> {user?.displayName || '未設定'}</p>
            </div>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 text-black bg-white border border-black hover:bg-black hover:text-white transition-colors text-lg font-medium"
              disabled={updating}
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={!displayName.trim() || updating}
              className="flex-1 px-6 py-4 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-medium"
            >
              {updating ? '更新中...' : '更新'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}