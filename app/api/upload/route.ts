import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'ファイルが見つかりません' }, { status: 400 })
    }

    // ファイルをBase64に変換
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileBase64 = `data:${file.type};base64,${buffer.toString('base64')}`

    // Cloudinaryにアップロード
    const result = await cloudinary.uploader.upload(fileBase64, {
      folder: 'festival-events', // アップロード先フォルダ
      resource_type: 'image',
      transformation: [
        { width: 800, height: 600, crop: 'limit' }, // 最大サイズ制限
        { quality: 'auto', fetch_format: 'auto' }   // 自動最適化
      ]
    })

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id
    })

  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return NextResponse.json(
      { error: 'アップロードに失敗しました' },
      { status: 500 }
    )
  }
}