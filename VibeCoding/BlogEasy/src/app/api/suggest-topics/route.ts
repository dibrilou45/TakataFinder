import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { ArticleTopic, LandingPageAnalysis, SEOAnalysis } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { landingPageAnalysis, seoAnalysis } = await request.json()

    if (!landingPageAnalysis || !seoAnalysis) {
      return NextResponse.json(
        { error: 'Missing required data' },
        { status: 400 }
      )
    }

    const systemPrompt = `Tu es un expert en stratégie de contenu SEO. 
    Basé sur l'analyse de la landing page et l'analyse SEO fournie, génère une liste de 10 sujets d'articles de blog optimisés pour le SEO.
    
    Chaque sujet doit:
    - Être parfaitement aligné avec la marque et le persona cible
    - Cibler des mots-clés spécifiques avec un bon potentiel de trafic
    - Combler les lacunes de contenu identifiées
    - Avoir un angle unique et apporter de la valeur
    - Être réalisable en un article de 1500-2500 mots
    
    IMPORTANT: Pour chaque sujet, tu DOIS fournir TOUS les champs suivants:
    - title: Le titre optimisé SEO (60-70 caractères)
    - description: Description courte du contenu (150-160 caractères)
    - mainKeywords: Liste de 3-5 mots-clés principaux (OBLIGATOIRE, format array)
    - secondaryKeywords: Liste de 3-5 mots-clés secondaires (format array)
    - seoScore: Score de potentiel SEO de 1 à 10 (nombre)
    - difficulty: Niveau de difficulté (Facile, Moyen, Difficile)
    - contentType: Type de contenu (OBLIGATOIRE, choisir parmi: Guide, Tutorial, Comparatif, Liste, Étude de cas)
    - targetIntent: Intention de recherche (Informationnelle, Commerciale, Transactionnelle)
    
    EXEMPLE de format pour un sujet:
    {
      "title": "Comment optimiser votre site pour le SEO en 2025",
      "description": "Découvrez les meilleures techniques d'optimisation SEO pour améliorer votre classement dans les moteurs de recherche en 2025.",
      "mainKeywords": ["optimisation SEO", "SEO 2025", "améliorer classement"],
      "secondaryKeywords": ["moteurs de recherche", "Google SEO", "techniques SEO"],
      "seoScore": 9,
      "difficulty": "Moyen",
      "contentType": "Guide",
      "targetIntent": "Informationnelle"
    }
    
    Retourne la réponse en format JSON avec une clé "topics" contenant le tableau des sujets.`

    const userPrompt = `Analyse de la landing page:
    - Domaine: ${landingPageAnalysis.domain}
    - Persona: ${landingPageAnalysis.persona}
    - Ton: ${landingPageAnalysis.tone}
    - USPs: ${landingPageAnalysis.uniqueSellingPoints.join(', ')}
    
    Analyse SEO:
    - Mots-clés principaux: ${seoAnalysis.keywords?.map((k: { keyword: string }) => k.keyword).join(', ') || 'Aucun'}
    - Opportunités de contenu: ${seoAnalysis.contentGaps?.map((g: { topic: string }) => g.topic).join(', ') || 'Aucune'}
    - Questions fréquentes: ${seoAnalysis.questions?.map((q: { question: string }) => q.question).join(', ') || 'Aucune'}
    - Concurrents: ${seoAnalysis.competitors?.map((c: { domain: string }) => c.domain).join(', ') || 'Aucun'}
    - Tendances: ${seoAnalysis.trends?.map((t: { topic: string }) => t.topic).join(', ') || 'Aucune'}
    
    Génère 10 sujets d'articles optimisés.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 4000
    })

    const result = JSON.parse(completion.choices[0].message.content!)
    
    // Ensure we have the correct structure
    if (!result.topics || !Array.isArray(result.topics)) {
      throw new Error('Invalid response structure')
    }
    
    // Add unique IDs and ensure all required fields are present
    const formattedTopics = result.topics.map((topic, index) => ({
      id: `topic-${Date.now()}-${index}`,
      title: topic.title,
      description: topic.description,
      mainKeywords: Array.isArray(topic.mainKeywords) ? topic.mainKeywords : 
                   (topic.mainKeyword ? [topic.mainKeyword] : []),
      contentType: topic.contentType || 'Article',
      // Add other fields if they exist
      ...topic
    }))
    
    console.log('Topics générés:', JSON.stringify(formattedTopics, null, 2))

    return NextResponse.json({ topics: formattedTopics })
  } catch (error) {
    console.error('Error generating topics:', error)
    return NextResponse.json(
      { error: 'Failed to generate topics' },
      { status: 500 }
    )
  }
}
