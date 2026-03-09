import SignupForm from '@/components/auth/SignupForm'

export default function SignupPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Get started</h1>
        <p className="text-sm text-slate-500 mt-0.5">Create your free account</p>
      </div>
      <SignupForm />
    </>
  )
}
