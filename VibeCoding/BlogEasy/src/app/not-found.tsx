import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="mx-auto max-w-md text-center">
        <h2 className="mb-4 text-4xl font-bold">404</h2>
        <p className="mb-6 text-xl text-gray-600">
          Page non trouvée
        </p>
        <p className="mb-8 text-gray-500">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Link href="/">
          <Button className="bg-primary hover:bg-primary/90">
            Retour à l'accueil
          </Button>
        </Link>
      </div>
    </div>
  )
}
