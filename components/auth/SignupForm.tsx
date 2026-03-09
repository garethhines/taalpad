'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function SignupForm() {
  const router = useRouter()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { data, error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { display_name: displayName.trim() },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    // If email confirmation is disabled in Supabase, the user is signed in
    // immediately and data.session will be non-null.
    if (data.session) {
      router.push('/dashboard')
      router.refresh()
      return
    }

    // Otherwise, email confirmation is required.
    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center space-y-3 py-4">
        <div className="text-4xl">📬</div>
        <h3 className="font-bold text-slate-800">Check your inbox</h3>
        <p className="text-sm text-slate-500">
          We sent a confirmation link to <strong>{email}</strong>.
          Click it to activate your account.
        </p>
        <Link
          href="/login"
          className="inline-block text-sm text-primary-900 font-medium hover:underline mt-2"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {error}
        </div>
      )}

      <Input
        label="Your name"
        type="text"
        autoComplete="name"
        placeholder="What should we call you?"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        icon={<User size={16} />}
        required
      />

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail size={16} />}
        required
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="new-password"
        placeholder="At least 6 characters"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock size={16} />}
        hint="Minimum 6 characters"
        rightElement={
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
        required
      />

      <Button
        type="submit"
        fullWidth
        size="lg"
        disabled={loading || !displayName || !email || !password}
        className="mt-2"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin" />
            Creating account…
          </span>
        ) : (
          'Create Account'
        )}
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link
          href="/login"
          className="text-primary-900 font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>
    </form>
  )
}
