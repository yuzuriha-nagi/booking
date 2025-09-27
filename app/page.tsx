'use client'

import AuthButton from '@/components/AuthButton'
import AdminSetup from '@/components/AdminSetup'
import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useUserRole'
import Link from 'next/link'

export default function Home() {
  const { user, logout } = useAuth()
  const { isAdmin } = useUserRole()
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-black">
              高専祭予約
            </h1>
            {user && (
              <div className="flex items-center space-x-4">
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    className="text-sm text-black hover:text-gray-600 transition-colors"
                  >
                    管理者ダッシュボード
                  </Link>
                )}
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
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AdminSetup />

        <div className="text-center">
          <div className="bg-white border border-gray-200 p-12 max-w-lg mx-auto">
            <h3 className="text-3xl font-semibold text-black mb-6">
              高専祭予約
            </h3>
            <div className="space-y-6">
              <AuthButton />
              {user && (
                <Link
                  href="/classes"
                  className="block w-full bg-black text-white py-4 px-6 text-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  クラス一覧を見る
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
