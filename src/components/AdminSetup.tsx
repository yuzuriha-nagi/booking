'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function AdminSetup() {
  const { user } = useAuth()
  const [setupKey, setSetupKey] = useState('')
  const [isSetupMode, setIsSetupMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasExistingAdmin, setHasExistingAdmin] = useState(false)
  const [checkingAdmins, setCheckingAdmins] = useState(true)

  // 環境変数から管理者セットアップキーを取得
  const ADMIN_SETUP_KEY = process.env.NEXT_PUBLIC_ADMIN_SETUP_KEY || 'festival-admin-2024'

  useEffect(() => {
    checkForExistingAdmins()
  }, [])

  const checkForExistingAdmins = async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'admin'))
      const snapshot = await getDocs(q)
      setHasExistingAdmin(!snapshot.empty)
    } catch (error) {
      console.error('Error checking for existing admins:', error)
    } finally {
      setCheckingAdmins(false)
    }
  }

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('管理者セットアップ開始:', {
      userExists: !!user,
      userUid: user?.uid,
      enteredKey: setupKey,
      expectedKey: ADMIN_SETUP_KEY,
      keyMatches: setupKey === ADMIN_SETUP_KEY
    })

    if (!user) {
      alert('ログインしてください')
      return
    }

    if (setupKey !== ADMIN_SETUP_KEY) {
      console.error('セットアップキー不一致:', {
        entered: setupKey,
        expected: ADMIN_SETUP_KEY
      })
      alert('セットアップキーが正しくありません')
      return
    }

    setLoading(true)
    try {
      console.log('Firestore更新開始:', {
        collection: 'users',
        docId: user.uid,
        updateData: {
          role: 'admin',
          updatedAt: new Date()
        }
      })

      // まずユーザードキュメントが存在するか確認
      const userDocRef = doc(db, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)

      if (userDocSnap.exists()) {
        // ドキュメントが存在する場合は更新
        await updateDoc(userDocRef, {
          role: 'admin',
          updatedAt: new Date(),
        })
        console.log('既存ユーザードキュメントを更新')
      } else {
        // ドキュメントが存在しない場合は作成
        await setDoc(userDocRef, {
          email: user.email || '',
          displayName: user.displayName || '管理者',
          role: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        console.log('新しいユーザードキュメントを作成')
      }

      console.log('管理者権限付与成功')
      alert('管理者権限が付与されました。ページをリロードしてください。')
      window.location.reload()
    } catch (error) {
      console.error('管理者作成エラー:', error)
      console.error('エラー詳細:', {
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        details: (error as any)?.details
      })

      // より具体的なエラーメッセージ
      let errorMessage = '管理者の作成に失敗しました。'
      if ((error as any)?.code === 'not-found') {
        errorMessage += 'ユーザードキュメントが存在しません。'
      } else if ((error as any)?.code === 'permission-denied') {
        errorMessage += 'Firestoreの権限が不足しています。'
      } else if ((error as any)?.code === 'unavailable') {
        errorMessage += 'Firestoreに接続できません。'
      }

      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (checkingAdmins) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm text-gray-600">システムを確認中...</span>
      </div>
    )
  }

  if (hasExistingAdmin || !user) {
    return null
  }

  if (!isSetupMode) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-yellow-800">
              初期セットアップが必要です
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>システムに管理者がまだ存在しません。</p>
              <p>管理者アカウントを作成するにはセットアップキーが必要です。</p>
            </div>
            <div className="mt-3">
              <button
                onClick={() => setIsSetupMode(true)}
                className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                管理者セットアップを開始
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        管理者アカウント作成
      </h3>

      <form onSubmit={handleSetupSubmit} className="space-y-4">
        <div>
          <label htmlFor="setupKey" className="block text-sm font-medium text-gray-700 mb-2">
            セットアップキー <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="setupKey"
            value={setupKey}
            onChange={(e) => setSetupKey(e.target.value)}
            placeholder="管理者セットアップキーを入力"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500">
            システム管理者から提供されたセットアップキーを入力してください
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <div className="flex">
            <svg className="w-5 h-5 text-blue-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-800">
                管理者について
              </h4>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>管理者は主催者申請の審査ができます</li>
                  <li>全システム設定にアクセスできます</li>
                  <li>この作業は一度のみ実行できます</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => setIsSetupMode(false)}
            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={!setupKey.trim() || loading}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '作成中...' : '管理者を作成'}
          </button>
        </div>
      </form>
    </div>
  )
}