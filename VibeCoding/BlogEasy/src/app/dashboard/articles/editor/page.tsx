'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Save, Download, ArrowLeft, Eye, EyeOff, FileText, Code, Image as ImageIcon } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Article } from '@/types'

export default function EditorPage() {
  const [article, setArticle] = useState<Article | null>(null)
  const [editing, setEditing] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageAlt, setImageAlt] = useState<string>('')
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    // Vérifier qu'on est côté client avant d'accéder à localStorage
    if (typeof window === 'undefined') return
    
    const savedArticle = localStorage.getItem('currentArticle')
    if (!savedArticle) {
      router.push('/dashboard')
      return
    }
    setArticle(JSON.parse(savedArticle))
  }, [])

  const handleSave = () => {
    if (article && typeof window !== 'undefined') {
      localStorage.setItem('currentArticle', JSON.stringify(article))
      toast({
        title: "Article sauvegardé",
        description: "Les modifications ont été enregistrées",
      })
    }
  }

  const handleExport = (format: 'html' | 'markdown' | 'txt') => {
    if (!article) return

    let content = ''
    let mimeType = ''
    let extension = ''

    switch (format) {
      case 'html':
        content = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title}</title>
  <meta name="description" content="${article.metaDescription}">
  <meta name="keywords" content="${article.keywords.join(', ')}">
</head>
<body>
  <article>
    <h1>${article.title}</h1>
    ${article.content.replace(/\n/g, '<br>')}
  </article>
</body>
</html>`
        mimeType = 'text/html'
        extension = 'html'
        break
      case 'markdown':
        content = `# ${article.title}\n\n${article.content}`
        mimeType = 'text/markdown'
        extension = 'md'
        break
      case 'txt':
        content = `${article.title}\n\n${article.content.replace(/[#*`]/g, '')}`
        mimeType = 'text/plain'
        extension = 'txt'
        break
    }

    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${article.slug}.${extension}`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleGenerateImage = async () => {
    try {
      toast({
        title: "Génération en cours",
        description: "Création de l'image avec DALL-E 3...",
      })

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: article?.title,
          description: article?.metaDescription,
        }),
      })

      if (!response.ok) throw new Error('Erreur de génération')

      const data = await response.json()
      
      if (article) {
        // Stocker l'image dans le state local au lieu de l'object article
        setImageUrl(data.imageUrl)
        setImageAlt(data.imageAlt)
        toast({
          title: "Image générée",
          description: "L'image a été créée avec succès",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de générer l'image",
        variant: "destructive",
      })
    }
  }

  if (!article) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard/articles')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-turquoise" />
              <span className="text-xl font-bold">BlogEasy</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
              {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
              {editing ? 'Aperçu' : 'Éditer'}
            </Button>
            <Button variant="turquoise" size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {editing ? (
              <Card>
                <CardHeader>
                  <CardTitle>Éditer l'article</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={article.title}
                      onChange={(e) => setArticle({ ...article, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Contenu</Label>
                    <Textarea
                      id="content"
                      value={article.content}
                      onChange={(e) => setArticle({ ...article, content: e.target.value })}
                      className="min-h-[500px] font-mono text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="prose prose-lg max-w-none p-8">
                  {showPreview ? (
                    <>
                      <h1>{article.title}</h1>
                      {imageUrl && (
                        <img 
                          src={imageUrl} 
                          alt={imageAlt || article.title}
                          className="w-full rounded-lg shadow-lg mb-8"
                        />
                      )}
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {article.content}
                      </ReactMarkdown>
                    </>
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-sm">
                      {article.content}
                    </pre>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* SEO Metadata */}
            <Card>
              <CardHeader>
                <CardTitle>Métadonnées SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    value={article.metaDescription}
                    onChange={(e) => setArticle({ ...article, metaDescription: e.target.value })}
                    className="text-sm"
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Mots-clés</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {article.keywords.map((keyword, i) => (
                      <Badge key={i} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>URL Slug</Label>
                  <Input
                    value={article.slug}
                    onChange={(e) => setArticle({ ...article, slug: e.target.value })}
                    className="text-sm font-mono"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Image Generation */}
            <Card>
              <CardHeader>
                <CardTitle>Image de couverture</CardTitle>
              </CardHeader>
              <CardContent>
                {imageUrl ? (
                  <div className="space-y-4">
                    <img 
                      src={imageUrl} 
                      alt={imageAlt || article.title}
                      className="w-full rounded-lg shadow-md"
                    />
                    <Button 
                      onClick={handleGenerateImage}
                      variant="outline"
                      className="w-full"
                    >
                      Régénérer l'image
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleGenerateImage}
                    variant="turquoise"
                    className="w-full"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Générer une image
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Exporter</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={() => handleExport('html')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Code className="h-4 w-4 mr-2" />
                  Export HTML
                </Button>
                <Button 
                  onClick={() => handleExport('markdown')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Markdown
                </Button>
                <Button 
                  onClick={() => handleExport('txt')}
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Texte
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Statistiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mots</span>
                    <span className="font-medium">{article.content.split(/\s+/).length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temps de lecture</span>
                    <span className="font-medium">{article.readTime} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date</span>
                    <span className="font-medium">
                      {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('fr-FR') : 'Non publié'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
