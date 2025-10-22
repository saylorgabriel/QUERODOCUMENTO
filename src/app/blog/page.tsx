import { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Calendar, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog | QueroDocumento',
  description: 'Artigos e guias sobre consulta e certidão de protesto, legislação e orientações para manter sua situação regularizada.',
  keywords: 'blog, protesto, certidão, consulta, cartório, guia, orientação'
}

export default function BlogPage() {
  const posts = [
    {
      slug: 'consulta-certidao-protesto-guia-completo',
      title: 'Consulta e Certidão de Protesto: Guia Completo 2025',
      excerpt: 'Entenda tudo sobre protestos em cartório, a diferença entre consulta e certidão, quando você precisa desses documentos e como obtê-los de forma rápida e segura.',
      date: '2025-01-15',
      readTime: '8 min',
      category: 'Guia Completo'
    }
  ]

  return (
    <main className="min-h-screen bg-neutral-50 py-8">
      <div className="container-padded max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">
            Blog QueroDocumento
          </h1>
          <p className="text-lg text-neutral-600 max-w-3xl mx-auto">
            Artigos, guias e informações essenciais sobre protestos, certidões e regularização de documentos.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl shadow-soft border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              {/* Category Badge */}
              <div className="p-6 pb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold mb-4">
                  {post.category}
                </span>

                {/* Title */}
                <h2 className="text-xl font-bold text-neutral-900 mb-3 group-hover:text-primary-600 transition-colors">
                  {post.title}
                </h2>

                {/* Excerpt */}
                <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>

              {/* Read More */}
              <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100">
                <span className="text-sm font-semibold text-primary-600 group-hover:text-primary-700">
                  Ler artigo completo →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State for Future Posts */}
        <div className="mt-12 text-center p-8 bg-white rounded-2xl shadow-soft border border-neutral-200">
          <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            Mais conteúdo em breve
          </h3>
          <p className="text-neutral-600">
            Estamos preparando mais artigos e guias para ajudar você.
          </p>
        </div>
      </div>
    </main>
  )
}
