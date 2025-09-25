'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useUserRole'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function CreateEventPage() {
  const { user, loading } = useAuth()
  const { isHost, roleLoading } = useUserRole()
  const router = useRouter()

  const [formData, setFormData] = useState({
    className: '',
    eventName: '',
    description: '',
    location: '',
    maxCapacity: '',
    duration: '',
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // ファイルタイプチェック（より厳密に）
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      alert('JPEG、PNG、WebP形式の画像ファイルを選択してください')
      e.target.value = ''
      return
    }

    // ファイルサイズチェック（5MB制限）
    if (file.size > 5 * 1024 * 1024) {
      alert('ファイルサイズは5MB以下にしてください')
      e.target.value = ''
      return
    }

    setSelectedImage(file)

    // プレビュー用のDataURLを作成
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.onerror = () => {
      alert('画像の読み込みに失敗しました')
      setSelectedImage(null)
      setImagePreview('')
    }
    reader.readAsDataURL(file)
  }

  const uploadImageToCloudinary = async (file: File): Promise<string> => {
    try {
      console.log('Cloudinaryアップロード開始:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        userId: user?.uid
      })

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'アップロードに失敗しました')
      }

      const result = await response.json()
      console.log('Cloudinaryアップロード完了:', result)

      return result.url
    } catch (error) {
      console.error('Cloudinary画像アップロードエラー:', error)
      console.error('エラーの詳細:', {
        message: error instanceof Error ? error.message : String(error),
      })
      throw new Error('画像のアップロードに失敗しました')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    try {
      // 最新のユーザー情報を取得（displayNameを優先）
      const currentUserName = user.displayName || '名無し'

      // 画像をアップロード（選択されている場合）
      let imageUrl: string | undefined = undefined
      if (selectedImage) {
        try {
          imageUrl = await uploadImageToCloudinary(selectedImage)
        } catch {
          alert('画像のアップロードに失敗しました。もう一度お試しください。')
          setSubmitting(false)
          return
        }
      }

      const eventData = {
        className: formData.className,
        eventName: formData.eventName,
        description: formData.description,
        location: formData.location,
        maxCapacity: parseInt(formData.maxCapacity),
        duration: parseInt(formData.duration),
        imageUrl: imageUrl,
        hostUserId: user.uid,
        hostUserName: currentUserName,
        hostUserEmail: user.email || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await addDoc(collection(db, 'classEvents'), eventData)
      alert('出し物を登録しました！')
      router.push('/classes')
    } catch (error) {
      console.error('Error creating event:', error)
      alert('出し物の登録に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!user || !isHost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            アクセス権限がありません
          </h2>
          <p className="text-gray-600 mb-6">
            このページは主催者のみアクセス可能です。
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
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
                <Link href="/host/create-event" className="text-black font-medium border-b-2 border-black">
                  出し物登録
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-black mb-4">
            出し物を登録
          </h1>
          <p className="text-black text-lg">
            クラスの文化祭出し物情報を入力してください。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-8 space-y-8">
          <div>
            <label htmlFor="className" className="block text-base font-medium text-black mb-3">
              クラス名 <span className="text-black">*</span>
            </label>
            <input
              type="text"
              id="className"
              name="className"
              value={formData.className}
              onChange={handleInputChange}
              placeholder="例：3A、4B、専攻科1年"
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black text-black text-lg"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="eventName" className="block text-base font-medium text-black mb-3">
              出し物名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="eventName"
              name="eventName"
              value={formData.eventName}
              onChange={handleInputChange}
              placeholder="例：プログラミング体験教室"
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black text-black text-lg"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-base font-medium text-black mb-3">
              説明 <span className="text-black">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="出し物の詳細な説明を入力してください..."
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black text-black text-lg"
              rows={4}
              required
              disabled={submitting}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="location" className="block text-base font-medium text-black mb-3">
                場所 <span className="text-black">*</span>
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="例：3A教室"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black text-black text-lg"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="maxCapacity" className="block text-base font-medium text-black mb-3">
                最大収容人数 <span className="text-black">*</span>
              </label>
              <input
                type="number"
                id="maxCapacity"
                name="maxCapacity"
                value={formData.maxCapacity}
                onChange={handleInputChange}
                placeholder="例：20"
                min="1"
                className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black text-black text-lg"
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div>
            <label htmlFor="duration" className="block text-base font-medium text-black mb-3">
              体験時間（分） <span className="text-black">*</span>
            </label>
            <input
              type="number"
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              placeholder="例：30"
              min="1"
              max="180"
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black text-black text-lg"
              required
              disabled={submitting}
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-base font-medium text-black mb-3">
              出し物画像
            </label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black text-black text-lg file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-black file:text-white hover:file:bg-gray-800"
              disabled={submitting}
            />
            <p className="mt-2 text-sm text-black">
              出し物の画像をアップロードしてください（任意・5MB以下）
            </p>
            {imagePreview && (
              <div className="mt-3">
                <p className="text-sm text-black mb-2">プレビュー:</p>
                <img
                  src={imagePreview}
                  alt="プレビュー"
                  className="w-full h-48 object-cover border border-gray-300"
                />
              </div>
            )}
          </div>


          <div className="flex space-x-4">
            <Link
              href="/classes"
              className="flex-1 px-6 py-4 text-black bg-white border border-black hover:bg-black hover:text-white transition-colors text-center text-lg font-medium"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-4 bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg font-medium"
            >
              {submitting ? '登録中...' : '出し物を登録'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}