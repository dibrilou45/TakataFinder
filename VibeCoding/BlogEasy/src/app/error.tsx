'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h2 className="mb-4 text-2xl font-bold">Une erreur est survenue</h2>
        <p className="mb-6 text-gray-600">
          {error.message || "Désolé, quelque chose s'est mal passé."}
        </p>
        <Button
          onClick={() => reset()}
          className="bg-primary hover:bg-primary/90"
        >
          Réessayer
        </Button>
      </div>
    </div>
  )
}
