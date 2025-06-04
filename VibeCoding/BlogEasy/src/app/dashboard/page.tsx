'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Globe, ArrowRight, LogOut, FileText, Clock, TrendingUp } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function DashboardPage() {
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState('')
  // Mode ouvert - pas besoin de mockUser
  const [domains, setDomains] = useState<any[]>([])
  const router = useRouter()
  const { toast } = useToast()

  // Mode ouvert - pas de vérification d'authentification

  const handleLogout = () => {
    // Simple redirection vers l'accueil sans déconnexion
    router.push('/')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return

    try {
      setLoading(true)
      // Store domain in localStorage for now
      localStorage.setItem('currentDomain', url)
      router.push('/dashboard/analyze')
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-turquoise" />
            <span className="text-xl font-bold">BlogEasy</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Mode ouvert</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bienvenue sur BlogEasy
            </h1>
            <p className="text-xl text-gray-600">
              Entrez l'URL de votre landing page pour commencer à générer du contenu SEO
            </p>
          </div>

          {/* URL Input Card */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Analyser une landing page</CardTitle>
              <CardDescription>
                Notre IA va analyser votre site pour comprendre votre marque et générer des articles parfaitement alignés
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="https://exemple.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full"
                    disabled={loading}
                  />
                </div>
                <Button type="submit" variant="turquoise" disabled={loading}>
                  {loading ? (
                    <>Analyse en cours...</>
                  ) : (
                    <>
                      Analyser
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 bg-turquoise/10 text-turquoise rounded-lg mb-4">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">3 articles offerts</h3>
                <p className="text-sm text-gray-600">
                  Générez vos 3 premiers articles gratuitement pour tester notre service
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 bg-turquoise/10 text-turquoise rounded-lg mb-4">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">Génération quotidienne</h3>
                <p className="text-sm text-gray-600">
                  Un nouvel article est généré automatiquement chaque jour
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center w-12 h-12 bg-turquoise/10 text-turquoise rounded-lg mb-4">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">SEO optimisé</h3>
                <p className="text-sm text-gray-600">
                  Articles optimisés pour les moteurs de recherche avec mots-clés ciblés
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
