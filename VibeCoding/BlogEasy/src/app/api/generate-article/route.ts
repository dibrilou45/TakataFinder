import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { Article, ArticleTopic, LandingPageAnalysis } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { topic, landingPageAnalysis } = await request.json()
    
    if (!topic || !landingPageAnalysis) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      )
    }
    
    console.log('Topic reçu:', JSON.stringify(topic, null, 2))
    console.log('Landing page analysis reçue:', JSON.stringify(landingPageAnalysis, null, 2))
    
    // S'assurer que les mots-clés sont disponibles dans le bon format
    const mainKeywords = topic.mainKeywords || 
                         (topic.mainKeyword ? [topic.mainKeyword] : []) ||
                         (topic.secondaryKeywords || [])

    // Phase 1: Generate article structure
    const structurePrompt = `Tu es un expert en rédaction SEO et marketing de contenu.
    
    Contexte de la marque:
    - Domaine: ${landingPageAnalysis.domain}
    - Persona cible: ${landingPageAnalysis.persona}
    - Ton: ${landingPageAnalysis.tone}
    - Style: ${landingPageAnalysis.style}
    - USPs: ${landingPageAnalysis.uniqueSellingPoints.join(', ')}
    
    Génère une structure détaillée pour un article de blog sur le sujet suivant:
    - Titre: ${topic.title}
    - Description: ${topic.description}
    - Mots-clés: ${mainKeywords.join(', ')}
    - Type: ${topic.contentType}
    
    La structure doit inclure:
    1. Un titre accrocheur optimisé SEO (H1)
    2. Une introduction captivante (150-200 mots)
    3. 5-7 sections principales (H2) avec 2-3 sous-sections chacune (H3)
    4. Une conclusion avec CTA
    5. Les mots-clés à intégrer naturellement
    
    Retourne la structure en format JSON.`

    const structureCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: structurePrompt },
        { role: "user", content: "Génère la structure de l'article." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    })

    const structure = JSON.parse(structureCompletion.choices[0].message.content!)

    // Phase 2: Generate full article content
    const contentPrompt = `Tu es un rédacteur expert spécialisé dans le content marketing SEO.
    
    Rédige un article complet et détaillé basé sur cette structure:
    ${JSON.stringify(structure, null, 2)}
    
    Instructions:
    - Article de 1500-2000 mots minimum
    - Ton: ${landingPageAnalysis.tone}
    - Style: ${landingPageAnalysis.style}
    - Intègre naturellement les mots-clés: ${mainKeywords.join(', ')}
    - Inclus des exemples concrets et des données si pertinent
    - Utilise des listes à puces quand approprié
    - Ajoute des transitions fluides entre les sections
    - Termine avec un CTA pertinent pour ${landingPageAnalysis.domain}
    
    Format de sortie: Markdown avec titres (# ## ###), paragraphes, listes, et emphases.
    
    IMPORTANT: Génère un article COMPLET avec TOUT le contenu, pas juste une structure.`

    const contentCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: contentPrompt },
        { role: "user", content: "Rédige l'article complet maintenant." }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    const content = contentCompletion.choices[0].message.content!

    // Phase 3: Generate SEO metadata
    const seoPrompt = `Génère les métadonnées SEO pour cet article:
    Titre: ${topic.title}
    
    Fournis:
    1. Meta title optimisé (max 60 caractères)
    2. Meta description accrocheuse (max 160 caractères)
    3. Slug URL (format: mon-article-optimise)
    4. 5-7 mots-clés principaux
    
    Retourne en format JSON.`

    const seoCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: seoPrompt },
        { role: "user", content: "Génère les métadonnées SEO." }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    })

    const seoData = JSON.parse(seoCompletion.choices[0].message.content!)

    // Count words
    const wordCount = content.split(/\s+/).length

    const article: Article = {
      id: Date.now().toString(),
      topicId: topic.id || '0',
      title: seoData.metaTitle || topic.title,
      content,
      metaDescription: seoData.metaDescription || topic.description,
      keywords: seoData.keywords || mainKeywords,
      slug: seoData.slug || topic.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status: 'draft',
      readTime: Math.ceil(wordCount / 200),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    return NextResponse.json(article)
  } catch (error) {
    // Log de du00e9bogage du00e9taillu00e9
    console.error('Error generating article:', error)
    
    // Ru00e9ponse d'erreur plus du00e9taillu00e9e
    let errorMessage = 'Failed to generate article'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    )
  }
}
