'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// Remplaçons l'import de Badge par l'utilisation directe de classes
// import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { Sparkles, Search, Target, TrendingUp, ArrowRight, Check, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { ArticleTopic, SEOAnalysis, LandingPageAnalysis } from '@/types'

export default function TopicsPage() {
  const [loading, setLoading] = useState(true)
  const [seoAnalysis, setSeoAnalysis] = useState<SEOAnalysis | null>(null)
  const [landingPageAnalysis, setLandingPageAnalysis] = useState<LandingPageAnalysis | null>(null)
  const [topics, setTopics] = useState<ArticleTopic[]>([])
  const [selectedTopics, setSelectedTopics] = useState<Set<number>>(new Set())
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Vérifier qu'on est côté client avant d'accéder à localStorage
    if (typeof window === 'undefined') return
      
    try {
      // Vérification du test de navigation
      const navTest = localStorage.getItem('navigationTest')
      console.log('[TOPICS DEBUG] Test de navigation trouvé:', navTest)
      
      // Récupérer l'analyse de landing page depuis localStorage
      console.log('[TOPICS DEBUG] Tentative de récupération des données d\'analyse')
      const lpAnalysisString = localStorage.getItem('landingPageAnalysis')
      console.log('[TOPICS DEBUG] Données trouvées:', !!lpAnalysisString)
      
      // Vérifier aussi dans sessionStorage
      const sessionData = sessionStorage.getItem('landingPageAnalysis')
      console.log('[TOPICS DEBUG] Données dans sessionStorage:', !!sessionData)
      
      if (!lpAnalysisString && !sessionData) {
        console.log('[TOPICS DEBUG] Aucune donnée trouvée, redirection vers dashboard')
        router.push('/dashboard')
        return
      }
      
      // Utiliser les données de localStorage ou sessionStorage
      const dataToUse = lpAnalysisString || sessionData
      console.log('[TOPICS DEBUG] Analyse trouvée, longueur:', dataToUse.length)
      
      const lpAnalysis = JSON.parse(dataToUse)
      console.log('[TOPICS DEBUG] Analyse parsée avec succès:', Object.keys(lpAnalysis))
      setLandingPageAnalysis(lpAnalysis)
      
      // Vérifier si l'analyse SEO existe déjà dans localStorage
      const seoAnalysisString = localStorage.getItem('seoAnalysis')
      if (seoAnalysisString) {
        const seoData = JSON.parse(seoAnalysisString)
        setSeoAnalysis(seoData)
        generateTopics(seoData, lpAnalysis)
      } else {
        // Sinon, lancer l'analyse SEO
        performSEOAnalysis()
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les analyses précédentes",
        variant: "destructive",
      })
    }
  }, [])

  const performSEOAnalysis = async () => {
    try {
      const domain = localStorage.getItem('currentDomain')
      setProgress('Démarrage de l\'analyse SEO...')
      
      const response = await fetch('/api/seo-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      })

      if (!response.ok) throw new Error('Erreur SEO')

      // Gérer le streaming de la réponse
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      if (!reader) throw new Error('Pas de reader disponible')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line)
              
              if (data.type === 'status') {
                setProgress(data.message)
              } else if (data.type === 'result') {
                setSeoAnalysis(data.data)
                localStorage.setItem('seoAnalysis', JSON.stringify(data.data))
                const lpAnalysis = JSON.parse(localStorage.getItem('landingPageAnalysis') || '{}')
                await generateTopics(data.data, lpAnalysis)
              } else if (data.type === 'error') {
                throw new Error(data.message)
              }
            } catch (parseError) {
              console.error('Erreur de parsing:', parseError)
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur analyse SEO:', error)
      toast({
        title: "Erreur d'analyse SEO",
        description: error instanceof Error ? error.message : "Impossible de réaliser l'analyse SEO",
        variant: "destructive",
      })
      setProgress('')
    }
  }

  const generateTopics = async (seoData: SEOAnalysis, lpAnalysis: LandingPageAnalysis) => {
    try {
      setProgress('Génération des sujets d\'articles...')
      const response = await fetch('/api/suggest-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          landingPageAnalysis: lpAnalysis,
          seoAnalysis: seoData 
        }),
      })

      if (!response.ok) throw new Error('Erreur génération topics')

      const data = await response.json()
      setTopics(data.topics)
      
      // Select first 3 topics by default
      const indices = data.topics.slice(0, 3).map((t: ArticleTopic, index: number) => index)
      const defaultSelected: Set<number> = new Set(indices)
      setSelectedTopics(defaultSelected)
      setLoading(false)
    } catch (error) {
      console.error('Erreur génération topics:', error)
      toast({
        title: "Erreur",
        description: "Impossible de générer les sujets",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const toggleTopic = (index: number) => {
    const newSelected = new Set(selectedTopics)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedTopics(newSelected)
  }

  const handleGenerate = () => {
    console.log('[TOPICS DEBUG] Handling generate button click')
    
    const selectedTopicsData = topics.filter((_, index) => selectedTopics.has(index))
    console.log('[TOPICS DEBUG] Topics sélectionnés:', selectedTopicsData.length)
    
    if (selectedTopicsData.length === 0) {
      toast({
        title: "Aucun sujet sélectionné",
        description: "Veuillez sélectionner au moins un sujet",
        variant: "destructive",
      })
      return
    }
    
    try {
      // Sauvegarder les topics sélectionnés dans localStorage ET sessionStorage
      const topicsJSON = JSON.stringify(selectedTopicsData)
      console.log('[TOPICS DEBUG] Sauvegarde des topics sélectionnés:', topicsJSON.substring(0, 100) + '...')
      
      // Sauvegarder dans les deux storages pour assurer la continuité
      localStorage.setItem('selectedTopics', topicsJSON)
      sessionStorage.setItem('selectedTopics', topicsJSON)
      
      // Ajouter un indicateur de navigation
      localStorage.setItem('navigationTest', 'topics-to-articles-' + Date.now())
      sessionStorage.setItem('navigationTest', 'topics-to-articles-' + Date.now())
      
      toast({
        title: 'Génération des articles',
        description: `${selectedTopicsData.length} articles vont être générés.`,
      })
      
      // Log de débogage avant redirection
      console.log('[TOPICS DEBUG] Vérification des données sauvegardées:', 
                 localStorage.getItem('selectedTopics') ? 'OK' : 'ERREUR',
                 sessionStorage.getItem('selectedTopics') ? 'OK' : 'ERREUR')
      
      // Rediriger vers la page de génération d'articles avec redirection forcée
      console.log('[TOPICS DEBUG] Redirection vers /dashboard/articles')
      
      // Utiliser router.push mais aussi une redirection forcée après un court délai
      router.push('/dashboard/articles')
      
      // Force la redirection après un court délai pour s'assurer qu'elle fonctionne
      setTimeout(() => {
        console.log('[TOPICS DEBUG] Redirection forcée après délai')
        window.location.href = '/dashboard/articles'
      }, 500)
    } catch (error) {
      console.error('[TOPICS ERROR]', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les sujets sélectionnés.',
        variant: 'destructive',
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Analyse SEO en cours</CardTitle>
            <CardDescription>
              Recherche des meilleures opportunités de contenu...
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Loading />
            </div>
            {progress && (
              <p className="text-center text-sm text-gray-600 animate-pulse">
                {progress}
              </p>
            )}
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

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Sélectionnez vos sujets d'articles
            </h1>
            <p className="text-gray-600">
              {selectedTopics.size} sujet{selectedTopics.size > 1 ? 's' : ''} sélectionné{selectedTopics.size > 1 ? 's' : ''} sur {topics.length}
            </p>
          </div>

          {/* SEO Summary */}
          {seoAnalysis && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-turquoise" />
                  Analyse SEO
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Mots-clés principaux</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {seoAnalysis.keywords?.slice(0, 3).map((kw: { keyword: string }, i: number) => (
                        <div key={i} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                          {kw.keyword}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Opportunités</p>
                    <p className="font-medium text-turquoise">
                      {seoAnalysis.contentGaps?.length || 0} trouvées
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Concurrence</p>
                    <p className="font-medium">
                      {seoAnalysis.competitors?.length || 0} analysés
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Topics Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {topics.map((topic: ArticleTopic, index: number) => (
              <Card
                key={index}
                className={`cursor-pointer transition-all ${
                  selectedTopics.has(index)
                    ? 'ring-2 ring-turquoise'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => toggleTopic(index)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg pr-2">{topic.title}</CardTitle>
                    <div className={`p-1 rounded-full ${
                      selectedTopics.has(index) 
                        ? 'bg-turquoise text-white' 
                        : 'bg-gray-200'
                    }`}>
                      {selectedTopics.has(index) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">{topic.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Target className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Score SEO: {topic.estimatedReadTime ? Math.round(topic.estimatedReadTime/10) : 7}/10</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{topic.contentType || 'Moyen'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {(topic.secondaryKeywords || []).slice(0, 3).map((kw: string, i: number) => (
                      <div key={i} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        {kw}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleGenerate}
              size="lg"
              variant="turquoise"
              disabled={selectedTopics.size === 0}
              className="gap-2"
            >
              Générer {selectedTopics.size} article{selectedTopics.size > 1 ? 's' : ''}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
