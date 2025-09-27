'use client'

import { useEffect, useState } from 'react'
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, GithubAuthProvider, signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('Google sign-in error:', error)
    }
  }

  const signInWithGithub = async () => {
    const provider = new GithubAuthProvider()
    try {
      await signInWithPopup(auth, provider)
    } catch (error) {
      console.error('GitHub sign-in error:', error)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Sign-out error:', error)
    }
  }

  return {
    user,
    loading,
    signInWithGoogle,
    signInWithGithub,
    logout
  }
}