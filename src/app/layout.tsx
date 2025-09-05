import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'
import LayoutWrapper from '@/components/layout/LayoutWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'QueroDocumento - Consulta e Certidão de Protesto',
  description: 'Consulte protestos e emita certidões de forma rápida e segura em cartórios de todo o Brasil',
  keywords: 'protesto, certidão, consulta protesto, certidão negativa, certidão positiva, cartório',
  authors: [{ name: 'QueroDocumento' }],
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
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}