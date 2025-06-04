import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { chromium } from 'playwright'
import type { LandingPageAnalysis } from '@/types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  const browser = await chromium.launch({ headless: true })
  
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Extract domain from URL
    const domain = new URL(url).hostname
    
    console.log('Starting landing page analysis for:', url)

    // Create a new page
    const page = await browser.newPage()
    await page.goto(url, { waitUntil: 'networkidle' })
    
    // Prendre une capture d'écran pour l'analyse visuelle
    const screenshot = await page.screenshot({ fullPage: false })
    const screenshotBase64 = screenshot.toString('base64')
    
    // Extraire le contenu texte structuré
    const pageContent = await page.evaluate(() => {
      // Extraire les titres
      const titles = Array.from(document.querySelectorAll('h1, h2, h3')).map(el => ({
        level: el.tagName,
        text: el.textContent?.trim() || ''
      }))
      
      // Extraire les paragraphes principaux
      const paragraphs = Array.from(document.querySelectorAll('p')).map(el => 
        el.textContent?.trim() || ''
      ).filter(text => text.length > 50).slice(0, 10)
      
      // Extraire les boutons CTA
      const ctas = Array.from(document.querySelectorAll('button, a[class*="btn"], a[class*="button"]')).map(el => 
        el.textContent?.trim() || ''
      ).filter(text => text.length > 0 && text.length < 50)
      
      // Extraire les couleurs principales
      const getColors = () => {
        const elements = document.querySelectorAll('*')
        const colorMap = new Map<string, number>()
        
        elements.forEach(el => {
          const styles = window.getComputedStyle(el)
          const bgColor = styles.backgroundColor
          const color = styles.color
          
          if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            colorMap.set(bgColor, (colorMap.get(bgColor) || 0) + 1)
          }
          if (color && color !== 'rgba(0, 0, 0, 0)') {
            colorMap.set(color, (colorMap.get(color) || 0) + 1)
          }
        })
        
        return Array.from(colorMap.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([color]) => color)
      }
      
      // Extraire la meta description
      const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') || ''
      
      return {
        titles,
        paragraphs,
        ctas,
        colors: getColors(),
        metaDescription
      }
    })
    
    console.log('Page content extracted:', {
      titlesCount: pageContent.titles.length,
      paragraphsCount: pageContent.paragraphs.length,
      ctasCount: pageContent.ctas.length,
      colorsCount: pageContent.colors.length
    })

    // Analyser avec GPT-4 Vision
    const systemPrompt = `Tu es un expert en analyse de marque et marketing digital. 
    Tu vas analyser une landing page à partir d'une capture d'écran et du contenu structuré.
    
    Sois TRÈS PRÉCIS et SPÉCIFIQUE dans ton analyse. Ne donne pas de réponses génériques.
    
    Réponds en JSON avec cette structure exacte:
    {
      "persona": "Description détaillée du persona cible (ex: 'Entrepreneurs tech de 25-40 ans', 'Parents de jeunes enfants', etc.)",
      "tone": "Le ton de communication spécifique (ex: 'Énergique et motivant', 'Rassurant et expert', 'Ludique et accessible')",
      "style": "Le style d'écriture observé (ex: 'Concis avec phrases d'impact', 'Narratif avec storytelling', 'Technique avec jargon pro')",
      "mainProducts": ["Liste des produits/services identifiés"],
      "uniqueSellingPoints": ["Arguments de vente uniques et différenciateurs identifiés"],
      "brandColors": ["#hex des couleurs principales de la marque"],
      "fonts": ["Polices identifiées ou style typographique"],
      "brandPersonality": "Personnalité de la marque en quelques mots"
    }`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { 
          role: "user", 
          content: [
            {
              type: "text",
              text: `Analyse cette landing page ${url}. Voici le contenu structuré extrait:
              
              TITRES:
              ${pageContent.titles.map(t => `${t.level}: ${t.text}`).join('\n')}
              
              PARAGRAPHES PRINCIPAUX:
              ${pageContent.paragraphs.join('\n\n')}
              
              BOUTONS/CTA:
              ${pageContent.ctas.join(', ')}
              
              COULEURS DOMINANTES:
              ${pageContent.colors.join(', ')}
              
              META DESCRIPTION:
              ${pageContent.metaDescription}
              
              Analyse maintenant la capture d'écran ci-dessous pour compléter ton analyse visuelle:`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/png;base64,${screenshotBase64}`
              }
            }
          ]
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_tokens: 1000
    })

    const analysisResult = JSON.parse(completion.choices[0].message.content!)
    
    console.log('GPT-4 analysis result:', analysisResult)

    // Construire la réponse finale
    const analysis: LandingPageAnalysis = {
      domain,
      persona: analysisResult.persona,
      tone: analysisResult.tone,
      style: analysisResult.style,
      mainProducts: analysisResult.mainProducts || [],
      uniqueSellingPoints: analysisResult.uniqueSellingPoints || [],
      brandIdentity: {
        colors: analysisResult.brandColors || pageContent.colors.slice(0, 3),
        fonts: analysisResult.fonts || ["Sans-serif moderne"],
        logos: [] // Pourrait être extrait avec plus de logique
      }
    }

    console.log('Final landing page analysis:', analysis)

    return NextResponse.json(analysis)
  } catch (error) {
    console.error('Error analyzing landing page:', error)
    return NextResponse.json(
      { error: 'Failed to analyze landing page', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await browser.close()
  }
}
