'use client'

import AuthButton from '@/components/AuthButton'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'

export default function Home() {
  const { user } = useAuth()
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                高専文化祭 予約システム
              </h1>
            </div>
            <AuthButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            文化祭クラス予約
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            各クラスの出し物を事前に予約して、文化祭をより楽しく過ごしましょう。
            学生・保護者・企業の皆様どなたでもご利用いただけます。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">簡単予約</h3>
            <p className="text-gray-600">
              Googleアカウントで簡単ログイン。クリックするだけで予約完了。
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">リアルタイム更新</h3>
            <p className="text-gray-600">
              空席状況が即座に反映。満席になったらすぐにわかります。
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">全来場者対応</h3>
            <p className="text-gray-600">
              学生・保護者・企業の方・中学生、どなたでもご利用いただけます。
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              予約を開始
            </h3>
            <p className="text-gray-600 mb-6">
              まずはGoogleアカウントでログインして、クラス一覧をご確認ください。
            </p>
            <div className="space-y-4">
              <AuthButton />
              {user && (
                <Link
                  href="/classes"
                  className="block w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
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
