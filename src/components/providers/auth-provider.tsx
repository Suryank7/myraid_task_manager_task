'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import { useRouter, usePathname } from 'next/navigation'

type User = { id: string; email: string; name: string; role: string }

type AuthContextType = {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, setUser: () => {}, logout: () => {} })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await apiFetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } catch (e) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    loadUser()
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    router.push('/login')
  }

  // Protect routes client-side
  useEffect(() => {
    if (!loading) {
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register')
      if (!user && !isAuthPage) {
        router.push('/login')
      }
      if (user && isAuthPage) {
        router.push('/')
      }
    }
  }, [user, loading, pathname, router])

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
