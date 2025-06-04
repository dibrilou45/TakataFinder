'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SkipAuthPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleSkipAuth = () => {
    // Créer un faux utilisateur pour le développement
    const mockUser = {
      id: 'dev-user-123',
      email: 'dev@blogeasy.test',
      name: 'Développeur Test',
      avatar_url: null
    }
    
    // Sauvegarder les informations utilisateur en localStorage
    localStorage.setItem('mockUser', JSON.stringify(mockUser))
    
    // Notification de réussite
    toast({
      title: "Mode développement activé",
      description: "Connexion automatique en tant qu'utilisateur test",
    })
    
    // Rediriger vers le dashboard
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-turquoise/10 rounded-full">
              <Sparkles className="h-8 w-8 text-turquoise" />
            </div>
          </div>
          <CardTitle className="text-2xl">Mode Développement</CardTitle>
          <CardDescription>
            Contournez l'authentification pour tester l'application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleSkipAuth}
            className="w-full"
            variant="turquoise"
            size="lg"
          >
            Accéder sans authentification
          </Button>
          <p className="mt-4 text-xs text-center text-gray-500">
            Pour développement uniquement. Retirer cette fonctionnalité en production.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
