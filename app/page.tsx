'use client'

import AuthButton from '@/components/AuthButton'
import AdminSetup from '@/components/AdminSetup'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function Home() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-white">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-black">
                高専文化祭 予約システム
              </h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AdminSetup />

        <div className="text-center">
          <div className="bg-white border border-gray-200 p-12 max-w-lg mx-auto">
            <h3 className="text-3xl font-semibold text-black mb-6">
              高専文化祭 予約システム
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
