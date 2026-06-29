import { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { api } from '@/lib/api'
import { setTokens, getAccessToken, getRefreshToken, clearTokens } from '@/lib/token'

interface AuthUser {
  userId: string
  email: string
  name: string | null
  phone: string | null
  role: string
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
}

type AuthAction =
  | { type: 'SET_USER'; user: AuthUser }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_LOADING'; loading: boolean }

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.user, isLoading: false }
    case 'CLEAR_USER':
      return { ...state, user: null, isLoading: false }
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading }
  }
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signup: (email: string, password: string, name?: string) => Promise<{ expiresIn: number }>
  resendVerification: (email: string) => Promise<{ expiresIn: number }>
  verifyEmail: (email: string, code: string) => Promise<{ isNewUser: boolean }>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toUser(profile: any): AuthUser {
  return {
    userId: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone,
    role: profile.role,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, { user: null, isLoading: true })

  // Hydrate user from stored access token on mount
  useEffect(() => {
    const token = getAccessToken()
    if (!token) {
      dispatch({ type: 'CLEAR_USER' })
      return
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    api.users.getProfile().then((profile: any) => {
      dispatch({ type: 'SET_USER', user: toUser(profile) })
    }).catch(() => {
      clearTokens()
      dispatch({ type: 'CLEAR_USER' })
    })
  }, [])

  const signup = useCallback(async (email: string, password: string, name?: string) => {
    const res = await api.auth.signup(email, password, name)
    return { expiresIn: res.expiresIn }
  }, [])

  const resendVerification = useCallback(async (email: string) => {
    const res = await api.auth.resendVerification(email)
    return { expiresIn: res.expiresIn }
  }, [])

  const verifyEmail = useCallback(async (email: string, code: string) => {
    const result = await api.auth.verifyEmail(email, code)
    setTokens(result.accessToken, result.refreshToken, result.expiresIn)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = await api.users.getProfile() as any
    dispatch({ type: 'SET_USER', user: toUser(profile) })
    return { isNewUser: result.isNewUser }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await api.auth.login(email, password)
    setTokens(result.accessToken, result.refreshToken, result.expiresIn)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const profile = await api.users.getProfile() as any
    dispatch({ type: 'SET_USER', user: toUser(profile) })
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    if (refreshToken) {
      await api.auth.logout(refreshToken).catch(() => {})
    }
    clearTokens()
    dispatch({ type: 'CLEAR_USER' })
  }, [])

  return (
    <AuthContext.Provider value={{
      user: state.user,
      isAuthenticated: state.user !== null,
      isLoading: state.isLoading,
      signup,
      resendVerification,
      verifyEmail,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}