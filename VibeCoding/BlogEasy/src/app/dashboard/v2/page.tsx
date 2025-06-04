'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Search, Filter, ChevronRight, Globe, Calendar, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
// import { ScrollArea } from '@/components/ui/scroll-area' // Commenté pour éviter l'erreur de build
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'

interface Article {
  id: string
  title: string
  domain: string
  date: string
  status: 'draft' | 'published'
  tags: string[]
  content?: string
  seoScore?: number
}

interface Domain {
  url: string
  name: string
  articlesCount: number
}

export default function DashboardV2() {
  const [articles, setArticles] = useState<Article[]>([])
  const [domains, setDomains] = useState<Domain[]>([])
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null)
  const [selectedDomain, setSelectedDomain] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [message, setMessage] = useState('')
  const { toast } = useToast()

  // Charger les articles depuis localStorage
  useEffect(() => {
    const savedArticles = localStorage.getItem('articles')
    if (savedArticles) {
      const parsed = JSON.parse(savedArticles)
      setArticles(parsed)
      
      // Extraire les domaines uniques
      const uniqueDomains = Array.from(new Set(parsed.map((a: Article) => a.domain)))
      setDomains(uniqueDomains.map(d => ({
        url: d as string, // Forcer le type string
        name: new URL(d as string).hostname,
        articlesCount: parsed.filter((a: Article) => a.domain === d).length
      })))
    }

    // Articles de démonstration
    const demoArticles: Article[] = [
      {
        id: '1',
        title: 'Comment Nike révolutionne le marketing sportif en 2024',
        domain: 'https://nike.com',
        date: new Date().toISOString(),
        status: 'draft',
        tags: ['marketing', 'sport', 'innovation'],
        content: 'Nike continue de dominer le marché...',
        seoScore: 85
      },
      {
        id: '2',
        title: 'Les meilleures chaussures de running Nike pour débutants',
        domain: 'https://nike.com',
        date: new Date(Date.now() - 86400000).toISOString(),
        status: 'published',
        tags: ['running', 'guide', 'débutant'],
        content: 'Découvrez notre sélection...',
        seoScore: 92
      }
    ]
    
    if (!savedArticles) {
      setArticles(demoArticles)
      setDomains([{
        url: 'https://nike.com',
        name: 'nike.com',
        articlesCount: 2
      }])
    }
  }, [])

  const filteredArticles = articles.filter(article => {
    const matchesDomain = selectedDomain === 'all' || article.domain === selectedDomain
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesDomain && matchesSearch
  })

  const handleSendMessage = async () => {
    if (!message.trim()) return

    // Analyser le message pour déterminer l'action
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('analyse') || lowerMessage.includes('nouveau domaine')) {
      // Extraire l'URL du message
      const urlMatch = message.match(/https?:\/\/[^\s]+/i)
      if (urlMatch) {
        toast({
          title: "Analyse en cours",
          description: `Analyse de ${urlMatch[0]} démarrée...`
        })
        
        // Simuler l'ajout d'un nouveau domaine
        setTimeout(() => {
          const newDomain = {
            url: urlMatch[0],
            name: new URL(urlMatch[0]).hostname,
            articlesCount: 0
          }
          setDomains([...domains, newDomain])
          toast({
            title: "Analyse terminée",
            description: `${newDomain.name} a été ajouté à vos domaines`
          })
        }, 2000)
      }
    } else if (lowerMessage.includes('génère') || lowerMessage.includes('article')) {
      toast({
        title: "Génération d'article",
        description: "Je vais générer un nouvel article pour vous"
      })
      
      // Simuler la génération d'un article
      setTimeout(() => {
        const newArticle: Article = {
          id: Date.now().toString(),
          title: "Nouvel article généré par IA",
          domain: domains[0]?.url || 'https://example.com',
          date: new Date().toISOString(),
          status: 'draft',
          tags: ['nouveau', 'ia'],
          content: 'Contenu généré...',
          seoScore: 78
        }
        setArticles([newArticle, ...articles])
        setSelectedArticle(newArticle)
        toast({
          title: "Article généré",
          description: "Votre nouvel article est prêt"
        })
      }, 3000)
    }

    setMessage('')
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Panneau gauche - Liste des articles */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold mb-4">BlogEasy</h1>
          
          {/* Barre de recherche */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un article..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtre par domaine */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Domaines</span>
              <Button variant="ghost" size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant={selectedDomain === 'all' ? 'secondary' : 'ghost'}
              size="sm"
              className="w-full justify-start"
              onClick={() => setSelectedDomain('all')}
            >
              <Globe className="h-4 w-4 mr-2" />
              Tous les domaines
              <span className="ml-auto text-gray-500">{articles.length}</span>
            </Button>

            {domains.map((domain) => (
              <Button
                key={domain.url}
                variant={selectedDomain === domain.url ? 'secondary' : 'ghost'}
                size="sm"
                className="w-full justify-start"
                onClick={() => setSelectedDomain(domain.url)}
              >
                <Globe className="h-4 w-4 mr-2" />
                {domain.name}
                <span className="ml-auto text-gray-500">{domain.articlesCount}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Liste des articles */}
        {/* <ScrollArea className="flex-1"> */}
          <div className="p-4 space-y-2">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className={`p-3 cursor-pointer transition-colors ${
                  selectedArticle?.id === article.id ? 'bg-turquoise/10 border-turquoise' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedArticle(article)}
              >
                <h3 className="font-medium text-sm mb-1 line-clamp-2">{article.title}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(article.date).toLocaleDateString('fr-FR')}
                  <Badge 
                    variant={article.status === 'published' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {article.status === 'published' ? 'Publié' : 'Brouillon'}
                  </Badge>
                </div>
                {article.seoScore && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600">Score SEO</span>
                      <span className={`font-medium ${
                        article.seoScore >= 80 ? 'text-green-600' : 
                        article.seoScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {article.seoScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${
                          article.seoScore >= 80 ? 'bg-green-600' : 
                          article.seoScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{ width: `${article.seoScore}%` }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        {/* </ScrollArea> */}
      </div>

      {/* Panneau central - Zone de message */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Assistant BlogEasy</h2>
            <p className="text-gray-600 mb-8">
              Je peux vous aider à analyser des domaines, générer des articles, ou répondre à vos questions sur le SEO.
            </p>

            {/* Suggestions */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="p-4 cursor-pointer hover:bg-gray-50">
                <h3 className="font-medium mb-2">Analyser un nouveau domaine</h3>
                <p className="text-sm text-gray-600">
                  Exemple: "Analyse le site https://apple.com"
                </p>
              </Card>
              <Card className="p-4 cursor-pointer hover:bg-gray-50">
                <h3 className="font-medium mb-2">Générer un article</h3>
                <p className="text-sm text-gray-600">
                  Exemple: "Génère un article sur les tendances 2024"
                </p>
              </Card>
              <Card className="p-4 cursor-pointer hover:bg-gray-50">
                <h3 className="font-medium mb-2">Optimiser le SEO</h3>
                <p className="text-sm text-gray-600">
                  Exemple: "Comment améliorer le SEO de mon article?"
                </p>
              </Card>
              <Card className="p-4 cursor-pointer hover:bg-gray-50">
                <h3 className="font-medium mb-2">Planifier du contenu</h3>
                <p className="text-sm text-gray-600">
                  Exemple: "Suggère 10 idées d'articles pour Nike"
                </p>
              </Card>
            </div>
          </div>
        </div>

        {/* Zone de saisie */}
        <div className="border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto flex gap-4">
            <Textarea
              placeholder="Demandez-moi quelque chose..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="flex-1 resize-none"
              rows={2}
            />
            <Button 
              onClick={handleSendMessage}
              variant="turquoise"
              disabled={!message.trim()}
            >
              Envoyer
            </Button>
          </div>
        </div>
      </div>

      {/* Panneau droit - Détails de l'article */}
      {selectedArticle && (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-medium">Détails de l'article</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedArticle(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* <ScrollArea className="flex-1 p-4"> */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-2">{selectedArticle.title}</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Globe className="h-4 w-4" />
                  {new URL(selectedArticle.domain).hostname}
                  <span>•</span>
                  <Calendar className="h-4 w-4" />
                  {new Date(selectedArticle.date).toLocaleDateString('fr-FR')}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedArticle.seoScore && (
                <div>
                  <h4 className="font-medium mb-2">Analyse SEO</h4>
                  <Card className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Score global</span>
                        <span className={`font-bold ${
                          selectedArticle.seoScore >= 80 ? 'text-green-600' : 
                          selectedArticle.seoScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {selectedArticle.seoScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            selectedArticle.seoScore >= 80 ? 'bg-green-600' : 
                            selectedArticle.seoScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${selectedArticle.seoScore}%` }}
                        />
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Mots-clés bien optimisés</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span>Méta-description présente</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                          <span>Liens internes à ajouter</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Aperçu du contenu</h4>
                <Card className="p-4">
                  <p className="text-sm text-gray-600 line-clamp-4">
                    {selectedArticle.content || 'Contenu non disponible...'}
                  </p>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" variant="turquoise">
                  Éditer l'article
                </Button>
                <Button className="flex-1" variant="outline">
                  Exporter
                </Button>
              </div>
            </div>
          {/* </ScrollArea> */}
        </div>
      )}
    </div>
  )
}
