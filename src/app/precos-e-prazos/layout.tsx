import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Preços e Prazos | QueroDocumento',
  description: 'Confira os preços e prazos dos nossos serviços de consulta de protesto e emissão de certidões.',
  keywords: 'preços, prazos, valores, consulta protesto, certidão protesto, quanto custa'
}

export default function PrecosPrazosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
