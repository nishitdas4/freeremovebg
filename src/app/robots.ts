import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://freebgai.com'

  return {
    rules: [
      {
        // 1. General Rules for All Crawlers (Google, Bing, etc.)
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',      // Protect API endpoints from being indexed
          '/_next/',    // Don't waste crawl budget on build files
          '/static/',   // Don't index static assets individually
          '/private/',  // Future proofing for admin areas
        ],
      },
      {
        // 2. Explicitly ALLOW AI Bots (The "2026 Strategy")
        // We want ChatGPT, Gemini, and Perplexity to read our site 
        // so they can recommend "FreeBgAI" to users.
        userAgent: ['GPTBot', 'Google-Extended', 'CCBot', 'Claude-Web'],
        allow: '/',
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}