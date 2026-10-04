import { createContext, useContext, useState, useEffect } from 'react'
import { getAccount, saveAccount } from '../lib/db'
import { generateSalt, hashPassword } from '../lib/crypto'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('parchi_active_user')
    if (stored) setUser(stored)
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const account = await getAccount(username)
    if (!account) throw new Error('Account not found on this device')
    const hash = await hashPassword(password, account.salt)
    if (hash !== account.passwordHash) throw new Error('Invalid password')
    setUser(username)
    localStorage.setItem('parchi_active_user', username)
  }

  const register = async (username, password) => {
    const existing = await getAccount(username)
    if (existing) throw new Error('Username already exists on this device')
    const salt = await generateSalt()
    const hash = await hashPassword(password, salt)
    await saveAccount(username, hash, salt)
    setUser(username)
    localStorage.setItem('parchi_active_user', username)
  }

  const verifyPassword = async (password) => {
    if (!user) return false
    const account = await getAccount(user)
    if (!account) return false
    const hash = await hashPassword(password, account.salt)
    return hash === account.passwordHash
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('parchi_active_user')
  }

  if (loading) return null

  return (
    <AuthContext.Provider value={{ user, login, register, logout, verifyPassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}