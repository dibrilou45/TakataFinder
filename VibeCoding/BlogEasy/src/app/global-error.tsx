'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center">
          <div className="mx-auto max-w-md text-center">
            <h2 className="mb-4 text-2xl font-bold">Une erreur critique est survenue</h2>
            <p className="mb-6 text-gray-600">
              L'application a rencontré une erreur inattendue.
            </p>
            <button
              onClick={() => reset()}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Recharger l'application
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
