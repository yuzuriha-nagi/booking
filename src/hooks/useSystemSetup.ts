'use client'

import { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const useSystemSetup = () => {
  const [hasAdmin, setHasAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [adminCount, setAdminCount] = useState(0)

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'admin'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const count = snapshot.docs.length
      setAdminCount(count)
      setHasAdmin(count > 0)
      setLoading(false)
    }, (error) => {
      console.error('Error monitoring admins:', error)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return {
    hasAdmin,
    adminCount,
    loading,
    isSystemReady: hasAdmin,
  }
}