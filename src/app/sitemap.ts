import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://freebgai.com' // Your actual domain

  return [
    {
      // The Main Tool (High Priority)
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily', // Tells Google to check back often for tool updates
      priority: 1.0, // Maximum priority
    },
    {
      // Strategic "About" Page (For E-E-A-T / Trust)
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      // Privacy Policy (Required for AdSense/Trust)
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      // Terms of Service (Required for AdSense/Trust)
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    }
  ]
}