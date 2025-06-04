'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { Sparkles, Globe, Users, Palette, Target, ArrowRight, Check } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { LandingPageAnalysis } from '@/types'

export default function AnalyzePage() {
  const [loading, setLoading] = useState(true)
  const [analysis, setAnalysis] = useState<LandingPageAnalysis | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  const steps = [
    { name: 'Récupération du contenu', icon: Globe },
    { name: 'Analyse de la marque', icon: Palette },
    { name: 'Identification du persona', icon: Users },
    { name: 'Extraction des USP', icon: Target },
    { name: 'Analyse SEO', icon: Sparkles },
  ]

  useEffect(() => {
    // Vérifier qu'on est côté client avant d'accéder à localStorage
    if (typeof window === 'undefined') return

    const domain = localStorage.getItem('currentDomain')
    if (!domain) {
      router.push('/dashboard')
      return
    }
    analyzeLandingPage(domain)
  }, [])

  const analyzeLandingPage = async (url: string) => {
    try {
      // Phase 1: Analyse de la landing page
      setCurrentStep(0)
      
      const landingPageResponse = await fetch('/api/analyze-landing-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      if (!landingPageResponse.ok) throw new Error('Erreur lors de l\'analyse de la landing page')
      
      const landingPageData = await landingPageResponse.json()
      
      // Sauvegarder l'analyse de landing page dans localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('landingPageAnalysis', JSON.stringify(landingPageData))
      }
      
      // Mettre à jour l'état avec les données de landing page
      setAnalysis(landingPageData)
      setCurrentStep(2)
      
      // Phase 2: Analyse SEO avec streaming
      setCurrentStep(4)
      const seoResponse = await fetch('/api/seo-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: url }),
      })

      if (!seoResponse.ok) throw new Error('Erreur lors de l\'analyse SEO')
      
      // Gérer le streaming des résultats SEO
      const reader = seoResponse.body?.getReader()
      if (!reader) throw new Error('Erreur de lecture du stream')
      
      // Fonction pour traiter les morceaux de données
      const processChunks = async () => {
        let receivedAnalysis = false
        
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          
          // Convertir le chunk en texte
          const chunk = new TextDecoder().decode(value)
          const lines = chunk.split('\n').filter(line => line.trim() !== '')
          
          for (const line of lines) {
            try {
              const data = JSON.parse(line)
              
              // Traiter les messages de statut
              if (data.type === 'status') {
                // On reste sur l'étape SEO
                // Notification optionnelle pour garder l'utilisateur informé
                toast({
                  title: 'Analyse SEO en cours',
                  description: data.message,
                })
              }
              
              // Traiter les résultats finaux
              if (data.type === 'result') {
                // Sauvegarder l'analyse SEO dans localStorage
                if (typeof window !== 'undefined') {
                  localStorage.setItem('seoAnalysis', JSON.stringify(data.data))
                }
                setLoading(false)
                receivedAnalysis = true
                
                // Mettre à jour l'analyse avec les données SEO
                setAnalysis(prev => {
                  if (!prev) return null
                  return { ...prev, seoAnalysis: data.data }
                })
                
                toast({
                  title: 'Analyse terminée !',
                  description: 'Votre analyse SEO est prête.',
                })
              }
            } catch (error) {
              console.error('Erreur dans le traitement du chunk:', error)
            }
          }
        }
      }
      
      // Lancer le traitement des chunks
      processChunks().catch(error => {
        console.error('Erreur lors du traitement des chunks:', error)
        setLoading(false)
      })
      
    } catch (error) {
      console.error('Erreur d\'analyse:', error)
      setLoading(false)
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'analyse',
        variant: 'destructive',
      })
    }
  }

  // Nouvelle fonction simplifiée pour sauvegarder les données d'analyse
  const saveAnalysisData = () => {
    console.log('[NAVIGATION DEBUG] saveAnalysisData appelé')
    
    if (!analysis) {
      console.log('[NAVIGATION DEBUG] Erreur: analysis est null')
      toast({
        title: 'Erreur',
        description: 'Analyse incomplète. Veuillez réessayer.',
        variant: 'destructive'
      })
      return false
    }
    
    try {
      // Sauvegarder dans localStorage et sessionStorage
      if (typeof window !== 'undefined') {
        const serializedData = JSON.stringify(analysis)
        console.log('[NAVIGATION DEBUG] Sauvegarde analysis dans storage')
        
        // Effacer les données existantes d'abord pour éviter les problèmes de mémoire
        localStorage.removeItem('landingPageAnalysis')
        sessionStorage.removeItem('landingPageAnalysis')
        
        // Sauvegarder les nouvelles données
        localStorage.setItem('landingPageAnalysis', serializedData)
        sessionStorage.setItem('landingPageAnalysis', serializedData)
        localStorage.setItem('navigationTest', 'true-' + Date.now()) // Indicateur pour tester le localStorage
        
        // Vérifier si les données sont bien enregistrées
        const savedData = localStorage.getItem('landingPageAnalysis')
        console.log('[NAVIGATION DEBUG] Données sauvegardées avec succès:', !!savedData)
        
        // Stocker aussi dans une variable globale pour assurer le transfert
        if (typeof window !== 'undefined') {
          // @ts-ignore - définir une propriété globale temporaire
          window.__ANALYSIS_DATA__ = analysis
        }
        
        return true
      }
      return false
    } catch (error) {
      console.error('[NAVIGATION DEBUG] Erreur lors de la sauvegarde:', error)
      toast({
        title: 'Erreur technique',
        description: 'Une erreur est survenue lors de la sauvegarde des données.',
        variant: 'destructive'
      })
      return false
    }
  }

  // Afficher le loader pendant l'analyse
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Analyse en cours</CardTitle>
            <CardDescription>
              Notre IA analyse votre landing page...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => {
                const Icon = step.icon
                const isActive = index === currentStep
                const isComplete = index < currentStep
                
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                      isActive ? 'bg-turquoise/10' : isComplete ? 'opacity-50' : 'opacity-30'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      isActive ? 'bg-turquoise text-white' : 'bg-gray-100'
                    }`}>
                      {isComplete ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <span className={`text-sm ${isActive ? 'font-medium' : ''}`}>
                      {step.name}
                    </span>
                    {isActive && <Loading />}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-turquoise" />
            <span className="text-xl font-bold">BlogEasy</span>
          </div>
        </div>
      </nav>

      {/* Results */}
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analyse terminée !
            </h1>
            <p className="text-gray-600">
              Voici ce que nous avons découvert sur votre marque
            </p>
          </div>

          <div className="grid gap-6 mb-8">
            {/* Brand Identity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-turquoise" />
                  Identité de marque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {analysis?.brandIdentity || 'Marque professionnelle axée sur la qualité et la simplicité'}
                </p>
              </CardContent>
            </Card>

            {/* Target Audience */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-turquoise" />
                  Audience cible
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {analysis?.persona || 'Entrepreneurs et professionnels du digital cherchant à optimiser leur présence en ligne'}
                </p>
              </CardContent>
            </Card>

            {/* Unique Selling Points */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-turquoise" />
                  Points forts identifiés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {(analysis?.uniqueSellingPoints || [
                    'Génération automatique',
                    'SEO optimisé',
                    'Alignement marque',
                    'Gain de temps'
                  ]).map((usp, index) => (
                    <Badge key={index} variant="turquoise">
                      {usp}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* SECTION NAVIGATION VERS TOPICS - Solution entièrement revue */}
          <div className="mt-10">
            <div className="flex flex-col items-center gap-8">
              {/* Solution principale - Bouton simple avec navigation forcée */}
              <div className="flex justify-center">
                <Button
                  size="lg"
                  variant="turquoise"
                  className="gap-2"
                  onClick={() => {
                    // Indiquer visuellement que le clic a fonctionné
                    const button = document.querySelector('button');
                    if (button) {
                      button.innerText = 'Redirection en cours...';
                      button.setAttribute('disabled', 'true');
                    }
                    
                    // Sauvegarder les données d'analyse
                    console.log('[NAVIGATION DEBUG] Bouton cliqué, sauvegarde des données');
                    saveAnalysisData();
                    
                    // Informer l'utilisateur
                    toast({
                      title: 'Données sauvegardées',
                      description: 'Redirection vers la page des topics...'
                    });
                    
                    // Forcer la navigation après un court délai pour s'assurer que les données sont sauvegardées
                    setTimeout(() => {
                      console.log('[NAVIGATION DEBUG] Redirection forcée');
                      window.location.href = '/dashboard/topics';
                    }, 500);
                  }}
                >
                  Continuer vers la stratégie SEO
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Solution alternative - Lien simple */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-3">Si le bouton ne fonctionne pas, cliquez sur ce lien :</p>
                <a 
                  href="/dashboard/topics"
                  className="text-turquoise hover:underline"
                  onClick={(e) => {
                    e.preventDefault();
                    saveAnalysisData();
                    window.location.href = '/dashboard/topics';
                  }}
                >
                  Accéder directement aux suggestions de topics →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
