import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// VAPID keys setup (本番環境では環境変数から取得)
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI2BN9XS9T4WDGQW8x4qFg3w5J8QhVxF3L8U2K7D2cDqJ4x6wHNFr9y2nM',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'hvOQQx8EsLnPi3MU3FXYe7KpGjF_i5xOaGx8UaGx8Ua'
}

webpush.setVapidDetails(
  'mailto:your-email@domain.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

export async function POST(req: NextRequest) {
  try {
    const { subscription, payload } = await req.json()

    if (!subscription || !payload) {
      return NextResponse.json(
        { error: 'Missing subscription or payload' },
        { status: 400 }
      )
    }

    await webpush.sendNotification(subscription, JSON.stringify(payload))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending notification:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}