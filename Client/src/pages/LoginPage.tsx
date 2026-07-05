import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

type Mode = 'login' | 'signup' | 'verify'

export default function LoginPage() {
  const { login, signup, verifyEmail, resendVerification, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const stateFrom = (location.state as {
    from?: { pathname?: string; search?: string; hash?: string }
  } | null)?.from
  const stateRedirect = stateFrom?.pathname
    ? `${stateFrom.pathname}${stateFrom.search ?? ''}${stateFrom.hash ?? ''}`
    : null
  const queryRedirect = new URLSearchParams(location.search).get('redirect')
  const requestedRedirect = stateRedirect ?? queryRedirect
  const from = requestedRedirect?.startsWith('/') && !requestedRedirect.startsWith('//')
    ? requestedRedirect
    : '/'

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated, navigate, from])

  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  function validateEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validateEmail(email)) { setError('Enter a valid email'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await login(email, password)
      // Navigation is handled by the useEffect below once isAuthenticated flips to true
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!validateEmail(email)) { setError('Enter a valid email'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const { expiresIn } = await signup(email, password, name || undefined)
      setCountdown(expiresIn)
      setMode('verify')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!/^\d{6}$/.test(code)) { setError('Enter the 6-digit code'); return }
    setLoading(true)
    try {
      await verifyEmail(email, code)
      // Navigation is handled by the useEffect below once isAuthenticated flips to true
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid verification code')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setError('')
    setCode('')
    setLoading(true)
    try {
      const { expiresIn } = await resendVerification(email)
      setCountdown(expiresIn)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend code')
    } finally {
      setLoading(false)
    }
  }

  const title =
    mode === 'login' ? 'Sign in to Frames41'
    : mode === 'signup' ? 'Create your account'
    : 'Verify your email'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8F6] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1A1A1A] tracking-tight">{title}</h1>
          <p className="text-sm text-[#6B6B6B] mt-1">
            {mode === 'verify' ? `We sent a 6-digit code to ${email}` : 'Welcome back — or create a new account'}
          </p>
        </div>

        {mode === 'verify' ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit code"
                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-3 text-sm outline-none focus:border-[#800020] tracking-widest"
                autoFocus
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#800020] text-white py-3 rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {loading ? 'Verifying…' : 'Verify email'}
            </button>
            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-xs text-[#6B6B6B]">Resend code in {countdown}s</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="text-xs text-[#800020] font-medium disabled:opacity-60"
                >
                  Resend code
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => { setMode('signup'); setCode(''); setError('') }}
              className="w-full text-xs text-[#6B6B6B] text-center"
            >
              ← Use a different email
            </button>
          </form>
        ) : (
          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Name (optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full border border-[#E0E0E0] rounded-lg px-3 py-3 text-sm outline-none focus:border-[#800020]"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-3 text-sm outline-none focus:border-[#800020]"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full border border-[#E0E0E0] rounded-lg px-3 py-3 text-sm outline-none focus:border-[#800020]"
              />
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#800020] text-white py-3 rounded-lg text-sm font-medium disabled:opacity-60"
            >
              {loading
                ? (mode === 'login' ? 'Signing in…' : 'Creating account…')
                : (mode === 'login' ? 'Sign in' : 'Create account')}
            </button>
            <p className="text-center text-xs text-[#6B6B6B]">
              {mode === 'login' ? (
                <>Don't have an account?{' '}
                  <button type="button" onClick={() => { setMode('signup'); setError('') }} className="text-[#800020] font-medium">
                    Sign up
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('login'); setError('') }} className="text-[#800020] font-medium">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
