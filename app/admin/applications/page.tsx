'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useUserRole'
import { RoleApplication } from '@/types'
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Link from 'next/link'

export default function AdminApplicationsPage() {
  const { user, loading } = useAuth()
  const { isAdmin, roleLoading } = useUserRole()
  const [applications, setApplications] = useState<RoleApplication[]>([])
  const [loadingApplications, setLoadingApplications] = useState(true)

  useEffect(() => {
    if (!user || !isAdmin || loading || roleLoading) return

    const q = query(
      collection(db, 'roleApplications'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RoleApplication[]
      setApplications(apps)
      setLoadingApplications(false)
    })

    return () => unsubscribe()
  }, [user, isAdmin, loading, roleLoading])

  const handleApproval = async (applicationId: string, userId: string, approve: boolean) => {
    try {
      // 申請の状態を更新
      await updateDoc(doc(db, 'roleApplications', applicationId), {
        status: approve ? 'approved' : 'rejected',
        reviewedBy: user?.uid,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      })

      // 承認の場合、ユーザーの権限も更新
      if (approve) {
        await updateDoc(doc(db, 'users', userId), {
          role: 'host',
          updatedAt: new Date(),
        })
      }

      alert(approve ? '申請を承認しました' : '申請を却下しました')
    } catch (error) {
      console.error('申請の処理に失敗しました:', error)
      alert('申請の処理に失敗しました')
    }
  }

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            アクセス権限がありません
          </h2>
          <p className="text-gray-600 mb-6">
            このページは管理者のみアクセス可能です。
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            ホームに戻る
          </Link>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return '審査中'
      case 'approved':
        return '承認済み'
      case 'rejected':
        return '却下'
      default:
        return '不明'
    }
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
                <Link href="/classes" className="text-gray-600 hover:text-gray-900">
                  クラス一覧
                </Link>
                <Link href="/admin/applications" className="text-red-600 font-medium">
                  申請管理
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            主催者申請管理
          </h1>
          <p className="text-gray-900">
            来場者からの主催者申請を審査・管理できます。
          </p>
        </div>

        {loadingApplications ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">申請がありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {app.userName}
                    </h3>
                    <p className="text-sm text-gray-600">{app.userEmail}</p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(
                      app.status
                    )}`}
                  >
                    {getStatusLabel(app.status)}
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">申請理由</h4>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                    {app.reason}
                  </p>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    申請日: {app.createdAt ?
                      new Date(app.createdAt.toString()).toLocaleDateString()
                      : '不明'}
                  </span>
                  {app.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApproval(app.id, app.userId, false)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                      >
                        却下
                      </button>
                      <button
                        onClick={() => handleApproval(app.id, app.userId, true)}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                      >
                        承認
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}