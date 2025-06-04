'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { Sparkles, FileText, Check, ArrowRight, Download, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import type { Article, ArticleTopic } from '@/types'

export default function ArticlesPage() {
  const [generating, setGenerating] = useState(true)
  const [articles, setArticles] = useState<Article[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Vérifier qu'on est côté client avant d'accéder à localStorage
    if (typeof window === 'undefined') return
    
    // Charger les topics sélectionnés depuis localStorage
    try {
      console.log('[ARTICLES DEBUG] Démarrage de la page articles')
      const topicsString = localStorage.getItem('selectedTopics')
      console.log('[ARTICLES DEBUG] Topics trouvés dans localStorage:', !!topicsString)
      
      // Vérifier aussi dans sessionStorage
      const sessionTopics = sessionStorage.getItem('selectedTopics')
      console.log('[ARTICLES DEBUG] Topics trouvés dans sessionStorage:', !!sessionTopics)
      
      if ((!topicsString || topicsString === 'null' || topicsString === 'undefined') && 
          (!sessionTopics || sessionTopics === 'null' || sessionTopics === 'undefined')) {
        console.log('[ARTICLES DEBUG] Aucun topic trouvé, redirection vers dashboard')
        toast({
          title: 'Erreur',
          description: 'Aucun sujet sélectionné. Redirection vers le tableau de bord.',
          variant: 'destructive',
        })
        router.push('/dashboard')
        return
      }
      
      // Utiliser les données disponibles
      const dataToUse = topicsString || sessionTopics || '[]'
      console.log('[ARTICLES DEBUG] Utilisation des topics, longueur:', dataToUse.length)
      
      // Parser les topics et commencer la génération
      const parsedTopics = JSON.parse(dataToUse)
      console.log('[ARTICLES DEBUG] Topics parsés:', parsedTopics.length, 'topics')
      generateArticles(parsedTopics)
    } catch (error) {
      console.error('[ARTICLES ERROR]', error)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les sujets sélectionnés.',
        variant: 'destructive',
      })
      router.push('/dashboard')
    }
  }, [])

  const generateArticles = async (topics: ArticleTopic[]) => {
    try {
      console.log('[ARTICLES DEBUG] Démarrage de la génération d\'articles pour', topics.length, 'topics')
      
      // Récupérer l'analyse de landing page depuis localStorage OU sessionStorage
      let landingPageAnalysis = {}
      if (typeof window !== 'undefined') {
        const lpData = localStorage.getItem('landingPageAnalysis') || sessionStorage.getItem('landingPageAnalysis')
        console.log('[ARTICLES DEBUG] Données d\'analyse trouvées:', !!lpData)
        if (lpData) {
          try {
            landingPageAnalysis = JSON.parse(lpData)
            console.log('[ARTICLES DEBUG] Analyse parsée avec succès:', Object.keys(landingPageAnalysis))
          } catch (e) {
            console.error('[ARTICLES ERROR] Erreur parsing landing page analysis:', e)
            toast({
              title: 'Avertissement',
              description: 'Analyse de page incomplète. La génération peut être affectée.',
              variant: 'destructive',
            })
          }
        }
      }
      
      for (let i = 0; i < topics.length; i++) {
        setCurrentIndex(i)
        const topic = topics[i]
        console.log(`[ARTICLES DEBUG] Génération article ${i+1}/${topics.length}: ${topic.title}`)
        
        // Vérifier que le topic a tous les champs nécessaires
        if (!topic.title) {
          console.error(`[ARTICLES ERROR] Topic ${i} n'a pas de titre:`, topic)
          toast({
            title: 'Erreur',
            description: `Le sujet #${i+1} n'a pas de titre et ne peut pas être généré.`,
            variant: 'destructive',
          })
          continue // Passer au suivant
        }
        
        toast({
          title: 'Génération en cours',
          description: `Article ${i+1}/${topics.length}: ${topic.title}`,
        })
        
        const response = await fetch('/api/generate-article', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            topic,
            landingPageAnalysis
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error(`[ARTICLES ERROR] Erreur API pour l'article ${i+1}:`, errorData)
          toast({
            title: 'Erreur de génération',
            description: `Impossible de générer l'article: ${topic.title}`,
            variant: 'destructive',
          })
          continue // Passer au topic suivant
        }

        const article = await response.json()
        console.log(`[ARTICLES DEBUG] Article généré avec succès:`, article.title)
        setArticles(prev => [...prev, article])
        
        toast({
          title: 'Article généré',
          description: `${article.title} (${article.readTime} min de lecture)`,
        })
      }
      
      setGenerating(false)
      toast({
        title: "Génération terminée !",
        description: `${topics.length} articles ont été générés avec succès`,
      })
    } catch (error) {
      toast({
        title: "Erreur de génération",
        description: "Impossible de générer les articles",
        variant: "destructive",
      })
    }
  }

  const handleViewArticle = (article: Article) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentArticle', JSON.stringify(article))
    }
    router.push('/dashboard/articles/editor')
  }

  const handleExportAll = () => {
    // Export all articles as JSON
    const dataStr = JSON.stringify(articles, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `articles-${new Date().toISOString().split('T')[0]}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (generating) {
    const topics = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('selectedTopics') || '[]') : []
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle>Génération en cours</CardTitle>
            <CardDescription>
              Création de vos articles optimisés SEO...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topics.map((topic: ArticleTopic, index: number) => {
                const isActive = index === currentIndex
                const isComplete = index < currentIndex
                
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-4 rounded-lg transition-all ${
                      isActive ? 'bg-turquoise/10 border border-turquoise' : 
                      isComplete ? 'bg-green-50 border border-green-200' : 
                      'bg-gray-50'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      isComplete ? 'bg-green-500 text-white' :
                      isActive ? 'bg-turquoise text-white' : 
                      'bg-gray-200'
                    }`}>
                      {isComplete ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                        {topic.title}
                      </p>
                      {isActive && (
                        <p className="text-sm text-gray-500 mt-1">
                          Rédaction avec GPT-4o...
                        </p>
                      )}
                    </div>
                    {isActive && <Loading />}
                  </div>
                )
              })}
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              {currentIndex + 1} sur {topics.length} articles
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
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-turquoise" />
            <span className="text-xl font-bold">BlogEasy</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportAll}>
            <Download className="h-4 w-4 mr-2" />
            Exporter tout
          </Button>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Vos articles sont prêts !
            </h1>
            <p className="text-gray-600">
              {articles.length} articles générés avec succès
            </p>
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {articles.map((article, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {article.metaDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.keywords?.slice(0, 3).map((keyword, i) => (
                      <div key={i} className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                        {keyword}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <span>{article.content ? article.content.split(/\s+/).length : '~2000'} mots</span>
                    <span>{new Date(article.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  
                  <Button 
                    onClick={() => handleViewArticle(article)}
                    className="w-full"
                    variant="turquoise"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Voir l'article
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Continue Button */}
          <div className="mt-12 text-center">
            <Button 
              onClick={() => router.push('/dashboard')}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              Générer plus d'articles
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
