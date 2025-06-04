export interface LandingPageAnalysis {
  domain: string
  persona: string
  tone: string
  style: string
  mainProducts: string[]
  uniqueSellingPoints: string[]
  brandIdentity: {
    colors: string[]
    fonts: string[]
    logos: string[]
  }
}

export interface SEOAnalysis {
  domain: string
  keywords: {
    keyword: string
    volume: number
    difficulty: number
    relevance: number
  }[]
  competitors: {
    domain: string
    strengths: string[]
    weaknesses: string[]
    estimatedTraffic: number
  }[]
  contentGaps: {
    topic: string
    searchVolume: number
    difficulty: number
    opportunity: string
  }[]
  questions: {
    question: string
    snippet: string
    link: string
  }[]
  trends: {
    topic: string
    growthRate: number
    relevance: number
  }[]
}

export interface ArticleTopic {
  id: string
  title: string
  description: string
  mainKeyword?: string
  mainKeywords?: string[]
  secondaryKeywords?: string[]
  targetAudience?: string
  contentType?: string
  estimatedReadTime?: number
  seoScore?: number
  difficulty?: string
  targetIntent?: string
}

export interface Article {
  id: string
  topicId: string
  title: string
  slug: string
  metaDescription: string
  content: string
  keywords: string[]
  readTime: number
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
}

export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  domains: UserDomain[]
  createdAt: Date
}

export interface UserDomain {
  id: string
  userId: string
  domain: string
  landingPageAnalysis?: LandingPageAnalysis
  seoAnalysis?: SEOAnalysis
  articles: Article[]
  createdAt: Date
  updatedAt: Date
}
