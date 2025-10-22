import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cities, getCityBySlug } from '@/data/cities'
import {
  MapPin,
  Clock,
  CheckCircle,
  Building2,
  Phone,
  MapPinned,
  ArrowRight,
  FileText,
  Shield,
  Users
} from 'lucide-react'

interface CityPageProps {
  params: {
    state: string
    city: string
  }
}

// Generate static paths for all cities
export async function generateStaticParams() {
  return cities.map((city) => ({
    state: city.stateSlug,
    city: city.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const city = getCityBySlug(params.city, params.state)

  if (!city) {
    return {
      title: 'Cidade não encontrada',
    }
  }

  const title = `Consulta de Protesto em ${city.name} - ${city.state} | QueroDocumento`
  const description = `Consulte protestos e emita certidões em ${city.name}, ${city.stateName}. Atendimento em ${city.cartorios.length} cartório${city.cartorios.length > 1 ? 's' : ''} de protesto. Resultado em ${city.deliveryTime}. Serviço 100% online.`

  return {
    title,
    description,
    keywords: [
      `protesto ${city.name}`,
      `certidão de protesto ${city.name}`,
      `consulta protesto ${city.name}`,
      `certidão negativa ${city.name}`,
      `cartório ${city.name}`,
      `protesto ${city.state}`,
      `consulta CPF ${city.name}`,
      `consulta CNPJ ${city.name}`,
    ],
    openGraph: {
      title,
      description,
      url: `https://querodocumento.com.br/consulta-protesto/${params.state}/${params.city}`,
      type: 'website',
      locale: 'pt_BR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://querodocumento.com.br/consulta-protesto/${params.state}/${params.city}`,
    },
  }
}

export default function CityPage({ params }: CityPageProps) {
  const city = getCityBySlug(params.city, params.state)

  if (!city) {
    notFound()
  }

  // Schema.org JSON-LD
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Consulta de Protesto em ${city.name}`,
    description: `Consulte protestos e emita certidões em ${city.name}, ${city.stateName}`,
    provider: {
      '@type': 'Organization',
      name: 'QueroDocumento',
      url: 'https://querodocumento.com.br',
    },
    areaServed: {
      '@type': 'City',
      name: city.name,
      containedIn: {
        '@type': 'State',
        name: city.stateName,
        containedIn: {
          '@type': 'Country',
          name: 'Brasil',
        },
      },
    },
    serviceType: 'Consulta e Certidão de Protesto',
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `https://querodocumento.com.br/consulta-protesto/${params.state}/${params.city}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50">
        {/* Hero Section */}
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-2 text-red-100 mb-4">
              <Link href="/" className="hover:text-white transition-colors">
                Início
              </Link>
              <span>/</span>
              <Link href="/consulta-protesto" className="hover:text-white transition-colors">
                Consulta de Protesto
              </Link>
              <span>/</span>
              <span className="text-white font-medium">{city.name}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Consulta de Protesto em {city.name}
            </h1>
            <p className="text-xl text-red-100 mb-6 max-w-3xl">
              Consulte protestos e emita certidões de forma rápida e segura em cartórios de {city.name}, {city.stateName}
            </p>

            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{city.population} habitantes</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>Resultado em {city.deliveryTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <span>{city.cartorios.length} cartório{city.cartorios.length > 1 ? 's' : ''} atendido{city.cartorios.length > 1 ? 's' : ''}</span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/consulta-protesto"
                className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition-all hover:scale-105 shadow-lg"
              >
                <FileText className="w-5 h-5" />
                Consultar Agora
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Consulta de Protesto em {city.name}, {city.state}
                </h2>
                <div className="prose prose-lg text-gray-600">
                  <p>{city.description}</p>
                </div>

                <div className="mt-8 space-y-4">
                  {city.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <p className="text-gray-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:sticky lg:top-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Serviço 100% Online</h3>
                      <p className="text-sm text-gray-600">Rápido, seguro e confiável</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Resultado em {city.deliveryTime}</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Aceita CPF e CNPJ</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Certidão com validade jurídica</span>
                    </div>
                    <div className="flex items-center gap-3 text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span>Pagamento seguro via PIX ou cartão</span>
                    </div>
                  </div>

                  <Link
                    href="/consulta-protesto"
                    className="block w-full text-center bg-red-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Fazer Consulta Agora
                  </Link>

                  <p className="text-xs text-gray-500 text-center mt-4">
                    Atendimento em todos os cartórios de {city.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cartórios Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Cartórios de Protesto em {city.name}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Atendemos todos os cartórios de protesto de {city.name} de forma 100% online
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {city.cartorios.map((cartorio, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {cartorio.nome}
                      </h3>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-start gap-2">
                      <MapPinned className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                      <span>{cartorio.endereco}, {cartorio.bairro}</span>
                    </div>
                    {cartorio.telefone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span>{cartorio.telefone}</span>
                      </div>
                    )}
                    {cartorio.horario && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{cartorio.horario}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Como Funciona em {city.name}
              </h2>
              <p className="text-lg text-gray-600">
                Processo 100% online e simplificado
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-red-600">1</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Informe o CPF/CNPJ
                </h3>
                <p className="text-gray-600">
                  Digite o documento que deseja consultar em {city.name}
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-red-600">2</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Escolha o Serviço
                </h3>
                <p className="text-gray-600">
                  Consulta rápida ou certidão oficial dos cartórios
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-red-600">3</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Receba o Resultado
                </h3>
                <p className="text-gray-600">
                  Resultado em {city.deliveryTime} direto no seu e-mail
                </p>
              </div>
            </div>

            <div className="text-center mt-12">
              <Link
                href="/consulta-protesto"
                className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
              >
                <FileText className="w-5 h-5" />
                Iniciar Consulta em {city.name}
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Perguntas Frequentes sobre Protesto em {city.name}
            </h2>

            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Quanto tempo demora para receber o resultado em {city.name}?
                </h3>
                <p className="text-gray-600">
                  O prazo de entrega em {city.name} é de {city.deliveryTime}. Trabalhamos com todos os {city.cartorios.length} cartório{city.cartorios.length > 1 ? 's' : ''} de protesto da cidade para garantir resultados rápidos e precisos.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  A certidão tem validade jurídica em {city.name}?
                </h3>
                <p className="text-gray-600">
                  Sim! As certidões emitidas são oficiais, extraídas diretamente dos cartórios de protesto de {city.name}, com validade jurídica em todo território nacional.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Posso consultar protestos de qualquer pessoa ou empresa de {city.name}?
                </h3>
                <p className="text-gray-600">
                  Sim, o sistema de protesto é público. Você pode consultar qualquer CPF ou CNPJ registrado em cartórios de {city.name} e demais cidades do Brasil.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Quais cartórios de {city.name} são consultados?
                </h3>
                <p className="text-gray-600">
                  Consultamos todos os cartórios de protesto de {city.name}: {city.cartorios.map(c => c.nome).join(', ')}. Garantimos cobertura completa da cidade.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-600 to-red-700 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <Users className="w-16 h-16 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">
              Pronto para Consultar Protestos em {city.name}?
            </h2>
            <p className="text-xl text-red-100 mb-8">
              Serviço 100% online, rápido e seguro. Resultado em {city.deliveryTime}.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/consulta-protesto"
                className="inline-flex items-center justify-center gap-2 bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-red-50 transition-all hover:scale-105 shadow-lg"
              >
                <FileText className="w-5 h-5" />
                Fazer Consulta Agora
              </Link>
              <Link
                href="/precos-e-prazos"
                className="inline-flex items-center justify-center gap-2 bg-red-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-800 transition-colors border-2 border-white/30"
              >
                Ver Preços e Prazos
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
