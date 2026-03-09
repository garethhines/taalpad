export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-blue-900 to-blue-800 flex flex-col items-center justify-center p-4">
      {/* Wordmark */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2.5 mb-2">
          <span className="text-3xl font-bold text-white tracking-tight">Taalpad</span>
        </div>
        <p className="text-blue-200 text-sm">Your path to learning Dutch</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl shadow-black/20 p-6">
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-blue-300/60 text-xs text-center">
        Taalpad · Learn Dutch at your own pace
      </p>
    </div>
  )
}
