'use client'

import { useAuth } from './useAuth'
import { UserRole } from '@/types'
import { useEffect, useState, useCallback } from 'react'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export const useUserRole = () => {
  const { user, loading } = useAuth()
  const [userRole, setUserRole] = useState<UserRole>('visitor')
  const [roleLoading, setRoleLoading] = useState(false)

  const loadUserRole = useCallback(async () => {
    if (!user) return

    setRoleLoading(true)
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid))

      if (userDoc.exists()) {
        const userData = userDoc.data()
        setUserRole(userData.role || 'visitor')
      } else {
        // 初回ログイン時はvisitorとして登録
        const newUser = {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || '',
          photoURL: user.photoURL || '',
          role: 'visitor' as UserRole,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await setDoc(doc(db, 'users', user.uid), newUser)
        setUserRole('visitor')
      }
    } catch (error) {
      console.error('Error loading user role:', error)
      setUserRole('visitor')
    } finally {
      setRoleLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user && !loading) {
      loadUserRole()
    }
  }, [user, loading, loadUserRole])

  const updateUserRole = async (newRole: UserRole) => {
    if (!user) return false

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        role: newRole,
        updatedAt: new Date(),
      })
      setUserRole(newRole)
      return true
    } catch (error) {
      console.error('Error updating user role:', error)
      return false
    }
  }

  const hasPermission = (requiredRole: UserRole): boolean => {
    const roleHierarchy: Record<UserRole, number> = {
      visitor: 1,
      host: 2,
      admin: 3,
    }

    return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
  }

  const isRole = (role: UserRole): boolean => {
    return userRole === role
  }

  return {
    user,
    userRole,
    roleLoading: loading || roleLoading,
    updateUserRole,
    hasPermission,
    isRole,
    isVisitor: isRole('visitor'),
    isHost: isRole('host'),
    isAdmin: isRole('admin'),
  }
}