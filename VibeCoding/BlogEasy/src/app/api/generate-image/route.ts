import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json()

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const prompt = `Create a modern, professional blog header image for an article titled "${title}". 
    ${description ? `The article is about: ${description}. ` : ''}
    Style: Clean, minimalist, with a turquoise (#0be4ae) color accent. 
    Include abstract shapes or relevant visual metaphors. 
    Professional photography or illustration style. 
    No text in the image.`

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1792x1024",
      quality: "standard",
      style: "vivid",
    })

    const imageUrl = response.data?.[0]?.url || ''

    if (!imageUrl) {
      throw new Error('Failed to generate image: No URL returned')
    }

    return NextResponse.json({
      imageUrl,
      imageAlt: `Image de couverture pour l'article: ${title}`,
    })
  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    )
  }
}
