import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300 py-12">
      <div className="container-padded">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">QueroDocumento</h3>
            <p className="text-sm text-neutral-400 mb-4">
              Plataforma digital para consulta de protestos e emissão de certidões 
              de forma rápida e segura.
            </p>
            <p className="text-xs text-neutral-500">
              Atendimento via WhatsApp - Resposta em até 24 horas úteis
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Serviços</h3>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li>Consulta de Protesto</li>
              <li>Certidão de Protesto</li>
              <li>Suporte Especializado</li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Informações Legais</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="/termos-de-uso" 
                  className="text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link 
                  href="/politica-de-privacidade" 
                  className="text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li className="text-neutral-400">Preços e Prazos</li>
              <li>
                <Link 
                  href="/fale-conosco" 
                  className="text-neutral-400 hover:text-white transition-colors duration-200"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 pt-6 text-center">
          <p className="text-sm text-neutral-500">
            © 2025 QueroDocumento. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}