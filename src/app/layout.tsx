import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// 1. THE SEO META TAGS
export const metadata: Metadata = {
  // 1. Base URL (Crucial for Vercel to generate correct image links)
  metadataBase: new URL('https://freebgai.com'),

  // 2. Main Title & Description (Google Search)
  title: "FreeBgAI | Unlimited Free Background Remover (No Uploads)",
  description: "Remove image backgrounds instantly in your browser. 100% Free, Private (No Server Uploads), and Unlimited HD Downloads. The best privacy-focused alternative for creators.",
  
  keywords: ["background remover", "free remove bg", "remove background local", "private background remover", "youtube thumbnail tool", "amazon photo editor", "amazon product photo editor", "ai background remover", "ai photo editor"],
  
  authors: [{ name: "FreeBgAI" }],

  // 3. Open Graph (Facebook, LinkedIn, WhatsApp, Discord)
  openGraph: {
    title: "FreeBgAI - Unlimited Free Background Remover",
    description: "Stop paying for cutouts. Remove backgrounds instantly in your browser. 100% Free & Private.",
    url: "https://freebgai.com",
    siteName: "FreeBgAI",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.jpg", // This looks in your 'public' folder
        width: 1200,
        height: 630,
        alt: "FreeBgAI Studio Interface Preview",
      },
    ],
  },

  // 4. Twitter Card (X / Twitter)
  twitter: {
    card: "summary_large_image",
    title: "FreeBgAI - The Privacy-First Background Remover",
    description: "Remove backgrounds locally in your browser. No uploads, no fees, unlimited HD.",
    images: ["/og-image.jpg"], // Re-uses the same image
  },
  
  // 5. Favicons (Optional but recommended if you have them)
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 2. GOOGLE SOFTWARE SCHEMA (JSON-LD) */}
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "AI Background Remover Studio",
              "applicationCategory": "MultimediaApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": "Background Removal, Drop Shadow, Outline Stroke, Color Adjustment"
            }),
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}