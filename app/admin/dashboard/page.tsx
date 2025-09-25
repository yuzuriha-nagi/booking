'use client'

import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useUserRole'
import HostNameSync from '@/components/HostNameSync'
import Link from 'next/link'
import dynamic from 'next/dynamic'

function AdminDashboardPageComponent() {
  const { user, loading } = useAuth()
  const { isAdmin, roleLoading } = useUserRole()

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">
            アクセス権限がありません
          </h2>
          <p className="text-black mb-6">
            このページは管理者のみアクセス可能です。
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
                <Link href="/admin/applications" className="text-black hover:text-gray-600">
                  申請管理
                </Link>
                <Link href="/admin/dashboard" className="text-black font-medium border-b-2 border-black">
                  管理者ダッシュボード
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            管理者ダッシュボード
          </h1>
          <p className="text-black">
            システム全体の管理と設定を行えます。
          </p>
        </div>

        <div className="grid gap-6">
          <HostNameSync />

          <div className="bg-white border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-black mb-4">管理機能</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href="/admin/applications"
                className="p-4 border border-gray-300 hover:border-black transition-colors"
              >
                <h3 className="font-medium text-black mb-2">申請管理</h3>
                <p className="text-sm text-black">主催者申請の審査と管理</p>
              </Link>

              <div className="p-4 border border-gray-300">
                <h3 className="font-medium text-black mb-2">統計情報</h3>
                <p className="text-sm text-black">システムの利用統計（準備中）</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 p-4">
            <h3 className="font-medium text-black mb-2">管理者情報</h3>
            <div className="text-sm text-black space-y-1">
              <p><strong>ユーザー名:</strong> {user.displayName || '未設定'}</p>
              <p><strong>メールアドレス:</strong> {user.email}</p>
              <p><strong>権限:</strong> 管理者</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

const AdminDashboardPage = dynamic(() => Promise.resolve(AdminDashboardPageComponent), {
  ssr: false,
})

export default AdminDashboardPage