import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import LayoutWrapper from '@/components/layout/LayoutWrapper'
import AnalyticsWrapper from '@/components/analytics'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://querodocumento.com.br'),
  title: {
    default: 'QueroDocumento - Consulta e Certidão de Protesto Online',
    template: '%s | QueroDocumento'
  },
  description: 'Consulte protestos e emita certidões de forma rápida e segura em cartórios de todo o Brasil. Serviço 100% online com resultados em até 24 horas.',
  keywords: [
    'protesto',
    'certidão de protesto',
    'consulta protesto',
    'certidão negativa',
    'certidão positiva',
    'cartório',
    'protesto online',
    'consulta CPF',
    'consulta CNPJ',
    'certidão protesto cartório',
    'regularizar protesto',
    'cancelar protesto'
  ],
  authors: [{ name: 'QueroDocumento', url: 'https://querodocumento.com.br' }],
  creator: 'QueroDocumento',
  publisher: 'QueroDocumento',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://querodocumento.com.br',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://querodocumento.com.br',
    siteName: 'QueroDocumento',
    title: 'QueroDocumento - Consulta e Certidão de Protesto Online',
    description: 'Consulte protestos e emita certidões de forma rápida e segura em cartórios de todo o Brasil. Serviço 100% online.',
    images: [
      {
        url: '/iconeqdm.jpg',
        width: 1200,
        height: 630,
        alt: 'QueroDocumento - Consulta e Certidão de Protesto',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QueroDocumento - Consulta e Certidão de Protesto Online',
    description: 'Consulte protestos e emita certidões de forma rápida e segura. Serviço 100% online.',
    images: ['/iconeqdm.jpg'],
    creator: '@querodocumento',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/iconeqdm.jpg', type: 'image/jpeg' },
    ],
    shortcut: '/favicon.svg',
    apple: '/iconeqdm.jpg',
  },
  manifest: '/manifest.json',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: 'no',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'QueroDocumento',
    url: 'https://querodocumento.com.br',
    logo: 'https://querodocumento.com.br/iconeqdm.jpg',
    description: 'Consulte protestos e emita certidões de forma rápida e segura em cartórios de todo o Brasil',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BR',
      addressLocality: 'Brasil',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['pt-BR'],
    },
    sameAs: [
      'https://twitter.com/querodocumento',
    ],
    serviceType: 'Legal Services',
    areaServed: {
      '@type': 'Country',
      name: 'Brasil',
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'BRL',
      offerCount: 3,
      offers: [
        {
          '@type': 'Offer',
          name: 'Consulta de Protesto',
          description: 'Consulta rápida de protestos em cartórios do Brasil',
          price: '4.90',
          priceCurrency: 'BRL',
        },
        {
          '@type': 'Offer',
          name: 'Certidão Negativa de Protesto',
          description: 'Certidão negativa oficial emitida por cartórios',
          price: '39.90',
          priceCurrency: 'BRL',
        },
        {
          '@type': 'Offer',
          name: 'Certidão Positiva de Protesto',
          description: 'Certidão positiva com detalhes completos dos protestos',
          price: '49.90',
          priceCurrency: 'BRL',
        },
      ],
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: 'https://querodocumento.com.br',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Consulta de Protesto',
        item: 'https://querodocumento.com.br/consulta-protesto',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Certidão de Protesto',
        item: 'https://querodocumento.com.br/certidao-protesto',
      },
    ],
  }

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Preload critical images */}
        <link
          rel="preload"
          as="image"
          href="/iconeqdm.jpg"
          type="image/jpeg"
          imageSizes="40px"
        />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <LayoutWrapper>{children}</LayoutWrapper>
        <AnalyticsWrapper />
      </body>
    </html>
  )
}