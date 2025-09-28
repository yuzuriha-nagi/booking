import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore } from 'firebase/firestore'
import { getStorage, FirebaseStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'dummy-api-key',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'dummy-auth-domain',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'dummy-project-id',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'dummy-storage-bucket',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'dummy-sender-id',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || 'dummy-app-id',
}

let app: FirebaseApp | null = null
try {
  app = initializeApp(firebaseConfig)
} catch (error) {
  console.warn('Firebase initialization failed during build:', error)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth: Auth = app ? getAuth(app) : ({} as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: Firestore = app ? getFirestore(app) : ({} as any)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const storage: FirebaseStorage = app ? getStorage(app) : ({} as any)
export default app