'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { User, UserRole } from '@/types'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

// SafeStorage team members with updated email addresses and roles
const safeStorageUsers: User[] = [
  { id: '1', name: 'Kushal', role: 'Tech Manager', email: 'kushal@safestorage.in', userRole: 'admin' },
  { id: '2', name: 'Niranjan', role: 'QA Manager', email: 'niranjan@safestorage.in', userRole: 'admin' },
  { id: '3', name: 'Anush', role: 'Logistics Manager', email: 'anush@safestorage.in', userRole: 'member' },
  { id: '4', name: 'Harsha', role: 'Operations Manager', email: 'harsha@safestorage.in', userRole: 'member' },
  { id: '5', name: 'Kiran', role: 'Technical Architect', email: 'kiran@safestorage.in', userRole: 'member' },
  { id: '6', name: 'Manish', role: 'HR', email: 'manish@safestorage.in', userRole: 'admin' },
  { id: '7', name: 'Ramesh', role: 'CEO', email: 'ramesh@safestorage.in', userRole: 'admin' },
]

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    default:
      return state
  }
}

export const AuthContext = createContext<{
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
  login: (email: string) => boolean
  logout: () => void
  canEditTask: (taskAssigneeId?: string) => boolean
  canEditDailyReport: (reportAuthorId: string) => boolean
} | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load authentication state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      dispatch({ type: 'SET_LOADING', payload: false })
      return
    }

    try {
      const savedUser = localStorage.getItem('safestorage_user')
      if (savedUser) {
        const user = JSON.parse(savedUser)
        // Verify user still exists in our system
        const validUser = safeStorageUsers.find(u => u.id === user.id && u.email === user.email)
        if (validUser) {
          dispatch({ type: 'LOGIN_SUCCESS', payload: validUser })
        } else {
          localStorage.removeItem('safestorage_user')
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } catch (error) {
      console.error('Error loading auth state:', error)
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  // Save authentication state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    try {
      if (state.user) {
        localStorage.setItem('safestorage_user', JSON.stringify(state.user))
      } else {
        localStorage.removeItem('safestorage_user')
      }
    } catch (error) {
      console.error('Error saving auth state:', error)
    }
  }, [state.user])

  const login = (email: string): boolean => {
    const user = safeStorageUsers.find(u => u.email.toLowerCase() === email.toLowerCase())
    if (user) {
      dispatch({ type: 'LOGIN_SUCCESS', payload: user })
      return true
    }
    return false
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
  }

  const canEditTask = (taskAssigneeId?: string): boolean => {
    if (!state.user) return false
    if (state.user.userRole === 'admin') return true
    return taskAssigneeId === state.user.id
  }

  const canEditDailyReport = (reportAuthorId: string): boolean => {
    if (!state.user) return false
    if (state.user.userRole === 'admin') return true
    return reportAuthorId === state.user.id
  }

  return (
    <AuthContext.Provider value={{
      state,
      dispatch,
      login,
      logout,
      canEditTask,
      canEditDailyReport,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export { safeStorageUsers }