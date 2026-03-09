import LoginForm from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-0.5">Sign in to continue learning</p>
      </div>
      <LoginForm />
    </>
  )
}
