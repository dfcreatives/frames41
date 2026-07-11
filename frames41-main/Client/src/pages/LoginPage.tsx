import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

type Mode = 'login' | 'signup' | 'verify'
type FieldErrors = Partial<Record<'name' | 'email' | 'password' | 'code' | 'form', string>>

const defaultAuthError = 'Something went wrong. Please try again.'

function getErrorMessage(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const response = (err as { response?: { data?: { error?: { message?: string } } } }).response
    const message = response?.data?.error?.message

    if (message) {
      return humanizeAuthError(message)
    }
  }

  if (err instanceof Error) {
    return humanizeAuthError(err.message)
  }

  return fallback
}

function humanizeAuthError(message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes('invalid email or password') || normalized.includes('status code 401')) {
    return 'Email or password is incorrect. Please check your details and try again.'
  }

  if (normalized.includes('verify your email')) {
    return 'Please verify your email before signing in. Check your inbox for the 6-digit code.'
  }

  if (normalized.includes('already exists')) {
    return 'An account with this email already exists. Please sign in instead.'
  }

  if (normalized.includes('already verified')) {
    return 'This email is already verified. Please sign in instead.'
  }

  if (normalized.includes('verification code')) {
    return 'The verification code is incorrect or has expired. Please check the code or request a new one.'
  }

  if (normalized.includes('network')) {
    return 'We could not reach the server. Please check your connection and try again.'
  }

  if (normalized.includes('timeout')) {
    return 'The request took too long. Please try again.'
  }

  return message || defaultAuthError
}

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
  const [errors, setErrors] = useState<FieldErrors>({})
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

  function validateLogin(): FieldErrors {
    const nextErrors: FieldErrors = {}
    const cleanEmail = email.trim()

    if (!cleanEmail) {
      nextErrors.email = 'Please enter your email address.'
    } else if (!validateEmail(cleanEmail)) {
      nextErrors.email = 'Please enter a valid email address, like name@example.com.'
    }

    if (!password) {
      nextErrors.password = 'Please enter your password.'
    }

    return nextErrors
  }

  function validateSignup(): FieldErrors {
    const nextErrors = validateLogin()

    if (name.length > 100) {
      nextErrors.name = 'Name must be 100 characters or less.'
    }

    if (!password) {
      nextErrors.password = 'Please create a password.'
    } else if (password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.'
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      nextErrors.password = 'Password must include at least one letter and one number.'
    }

    return nextErrors
  }

  function validateCode(): FieldErrors {
    if (!code) return { code: 'Please enter the 6-digit verification code.' }
    if (!/^\d{6}$/.test(code)) return { code: 'Verification code must be exactly 6 digits.' }
    return {}
  }

  function hasErrors(nextErrors: FieldErrors): boolean {
    return Object.keys(nextErrors).length > 0
  }

  function updateField(field: keyof FieldErrors, value: string, setter: (value: string) => void) {
    setter(value)
    setErrors((current) => ({ ...current, [field]: undefined, form: undefined }))
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors = validateLogin()
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    setLoading(true)
    try {
      await login(email.trim(), password)
      // Navigation is handled by the useEffect below once isAuthenticated flips to true
    } catch (err: unknown) {
      setErrors({ form: getErrorMessage(err, 'We could not sign you in. Please try again.') })
    } finally {
      setLoading(false)
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors = validateSignup()
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    setLoading(true)
    try {
      const { expiresIn } = await signup(email.trim(), password, name.trim() || undefined)
      setCountdown(expiresIn)
      setMode('verify')
    } catch (err: unknown) {
      setErrors({ form: getErrorMessage(err, 'We could not create your account. Please try again.') })
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    const nextErrors = validateCode()
    setErrors(nextErrors)
    if (hasErrors(nextErrors)) return

    setLoading(true)
    try {
      await verifyEmail(email.trim(), code)
      // Navigation is handled by the useEffect below once isAuthenticated flips to true
    } catch (err: unknown) {
      setErrors({ form: getErrorMessage(err, 'We could not verify this code. Please try again.') })
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setErrors({})
    setCode('')
    setLoading(true)
    try {
      const { expiresIn } = await resendVerification(email.trim())
      setCountdown(expiresIn)
    } catch (err: unknown) {
      setErrors({ form: getErrorMessage(err, 'We could not resend the code. Please try again.') })
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
                id="verification-code"
                type="text"
                value={code}
                onChange={(e) => updateField('code', e.target.value.replace(/\D/g, '').slice(0, 6), setCode)}
                placeholder="Enter 6-digit code"
                className={`w-full border rounded-lg px-3 py-3 text-sm outline-none focus:border-[#800020] tracking-widest ${errors.code ? 'border-red-500' : 'border-[#E0E0E0]'}`}
                aria-invalid={Boolean(errors.code)}
                aria-describedby={errors.code ? 'verification-code-error' : undefined}
                autoFocus
              />
              {errors.code && <p id="verification-code-error" className="text-xs text-red-600 mt-1">{errors.code}</p>}
            </div>
            {errors.form && <p className="text-xs text-red-600">{errors.form}</p>}
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
              onClick={() => { setMode('signup'); setCode(''); setErrors({}) }}
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
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => updateField('name', e.target.value, setName)}
                  placeholder="Your name"
                  className={`w-full border rounded-lg px-3 py-3 text-sm outline-none focus:border-[#800020] ${errors.name ? 'border-red-500' : 'border-[#E0E0E0]'}`}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'name-error' : undefined}
                />
                {errors.name && <p id="name-error" className="text-xs text-red-600 mt-1">{errors.name}</p>}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => updateField('email', e.target.value, setEmail)}
                placeholder="you@example.com"
                className={`w-full border rounded-lg px-3 py-3 text-sm outline-none focus:border-[#800020] ${errors.email ? 'border-red-500' : 'border-[#E0E0E0]'}`}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                autoFocus
              />
              {errors.email && <p id="email-error" className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => updateField('password', e.target.value, setPassword)}
                placeholder={mode === 'login' ? 'Enter your password' : 'At least 8 characters'}
                className={`w-full border rounded-lg px-3 py-3 text-sm outline-none focus:border-[#800020] ${errors.password ? 'border-red-500' : 'border-[#E0E0E0]'}`}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && <p id="password-error" className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>
            {errors.form && <p className="text-xs text-red-600">{errors.form}</p>}
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
                  <button type="button" onClick={() => { setMode('signup'); setErrors({}) }} className="text-[#800020] font-medium">
                    Sign up
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => { setMode('login'); setErrors({}) }} className="text-[#800020] font-medium">
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
