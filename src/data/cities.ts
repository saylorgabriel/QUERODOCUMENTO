// Top 20 cidades brasileiras com dados de cartórios de protesto

export interface Cartorio {
  nome: string
  endereco: string
  bairro: string
  telefone?: string
  horario?: string
}

export interface CityData {
  slug: string
  name: string
  state: string
  stateSlug: string
  stateName: string
  population: string
  deliveryTime: string
  cartorios: Cartorio[]
  description: string
  benefits: string[]
}

export const cities: CityData[] = [
  {
    slug: 'sao-paulo',
    name: 'São Paulo',
    state: 'SP',
    stateSlug: 'sp',
    stateName: 'São Paulo',
    population: '12.3 milhões',
    deliveryTime: '24 a 48 horas',
    cartorios: [
      {
        nome: '1º Tabelionato de Protesto de Letras e Títulos',
        endereco: 'Rua Libero Badaró, 425',
        bairro: 'Centro',
        telefone: '(11) 3106-4733',
        horario: '9h às 17h'
      },
      {
        nome: '2º Tabelionato de Protesto de Letras e Títulos',
        endereco: 'Praça Antônio Prado, 33',
        bairro: 'Centro',
        telefone: '(11) 3105-7300',
        horario: '9h às 17h'
      },
      {
        nome: '3º Tabelionato de Protesto de Letras e Títulos',
        endereco: 'Rua Álvares Penteado, 151',
        bairro: 'Centro',
        telefone: '(11) 3107-2288',
        horario: '9h às 17h'
      }
    ],
    description: 'São Paulo, a maior cidade do Brasil e centro financeiro do país, concentra milhares de transações comerciais diariamente. Com uma economia diversificada e intensa atividade comercial, a consulta e certidão de protesto são fundamentais para empresas e cidadãos paulistanos que precisam verificar a regularidade de documentos, avaliar riscos de crédito ou comprovar sua situação cadastral junto a instituições financeiras e fornecedores.',
    benefits: [
      'Atendimento em todos os cartórios de protesto da capital',
      'Processamento rápido devido à infraestrutura digital avançada',
      'Cobertura completa da região metropolitana',
      'Sistema integrado com todos os tabelionatos da cidade'
    ]
  },
  {
    slug: 'rio-de-janeiro',
    name: 'Rio de Janeiro',
    state: 'RJ',
    stateSlug: 'rj',
    stateName: 'Rio de Janeiro',
    population: '6.7 milhões',
    deliveryTime: '24 a 48 horas',
    cartorios: [
      {
        nome: '1º Tabelionato de Protesto',
        endereco: 'Rua Primeiro de Março, 38',
        bairro: 'Centro',
        telefone: '(21) 2533-5064',
        horario: '9h às 17h'
      },
      {
        nome: '2º Tabelionato de Protesto',
        endereco: 'Av. Rio Branco, 128',
        bairro: 'Centro',
        telefone: '(21) 2220-6464',
        horario: '9h às 17h'
      }
    ],
    description: 'O Rio de Janeiro, segunda maior cidade do Brasil e importante polo econômico, turístico e cultural, movimenta bilhões em transações comerciais anualmente. Para empresários cariocas, profissionais liberais e cidadãos que participam ativamente do mercado, ter acesso rápido a certidões de protesto é essencial para negociações comerciais, participação em licitações, obtenção de crédito e regularização cadastral.',
    benefits: [
      'Cobertura de toda a cidade do Rio de Janeiro',
      'Integração com cartórios da Zona Sul, Norte, Oeste e Centro',
      'Processamento ágil para demandas urgentes',
      'Suporte para empresas e pessoas físicas'
    ]
  },
  {
    slug: 'brasilia',
    name: 'Brasília',
    state: 'DF',
    stateSlug: 'df',
    stateName: 'Distrito Federal',
    population: '3.1 milhões',
    deliveryTime: '24 a 48 horas',
    cartorios: [
      {
        nome: '1º Tabelionato de Protesto de Brasília',
        endereco: 'SCS Quadra 1, Bloco I',
        bairro: 'Asa Sul',
        telefone: '(61) 3321-2626',
        horario: '9h às 17h'
      },
      {
        nome: '2º Tabelionato de Protesto de Brasília',
        endereco: 'SRTVS Quadra 701, Bloco O',
        bairro: 'Asa Sul',
        telefone: '(61) 3328-4444',
        horario: '9h às 17h'
      }
    ],
    description: 'Brasília, capital federal e sede dos três poderes, é polo de decisões políticas e econômicas estratégicas. Com forte presença de órgãos públicos, empresas prestadoras de serviços ao governo e profissionais que atuam em licitações, a consulta e emissão de certidões de protesto são documentos fundamentais para comprovar idoneidade fiscal e regularidade cadastral em processos administrativos e comerciais.',
    benefits: [
      'Atendimento especializado para licitações e órgãos públicos',
      'Processamento prioritário para demandas do DF',
      'Cobertura completa do Distrito Federal',
      'Sistema integrado com cartórios de todas as regiões administrativas'
    ]
  },
  {
    slug: 'salvador',
    name: 'Salvador',
    state: 'BA',
    stateSlug: 'ba',
    stateName: 'Bahia',
    population: '2.9 milhões',
    deliveryTime: '24 a 72 horas',
    cartorios: [
      {
        nome: '1º Tabelionato de Protesto de Salvador',
        endereco: 'Av. Estados Unidos, 50',
        bairro: 'Comércio',
        telefone: '(71) 3320-4500',
        horario: '9h às 17h'
      },
      {
        nome: '2º Tabelionato de Protesto de Salvador',
        endereco: 'Rua Miguel Calmon, 555',
        bairro: 'Comércio',
        telefone: '(71) 3322-1800',
        horario: '9h às 17h'
      }
    ],
    description: 'Salvador, capital da Bahia e primeira capital do Brasil, é um importante centro comercial, turístico e industrial do Nordeste. Com economia diversificada e forte atividade portuária, a cidade demanda constantemente serviços de consulta e certidão de protesto para empresas do setor de comércio exterior, turismo, construção civil e serviços que precisam comprovar regularidade cadastral.',
    benefits: [
      'Atendimento em toda a região metropolitana de Salvador',
      'Processamento para empresas de comércio exterior',
      'Cobertura completa da capital baiana',
      'Suporte para todos os setores econômicos'
    ]
  },
  {
    slug: 'fortaleza',
    name: 'Fortaleza',
    state: 'CE',
    stateSlug: 'ce',
    stateName: 'Ceará',
    population: '2.7 milhões',
    deliveryTime: '24 a 72 horas',
    cartorios: [
      {
        nome: '1º Tabelionato de Protesto de Fortaleza',
        endereco: 'Rua Barão do Rio Branco, 1480',
        bairro: 'Centro',
        telefone: '(85) 3252-1711',
        horario: '8h às 17h'
      },
      {
        nome: '2º Tabelionato de Protesto de Fortaleza',
        endereco: 'Av. Duque de Caxias, 500',
        bairro: 'Centro',
        telefone: '(85) 3254-8900',
        horario: '8h às 17h'
      }
    ],
    description: 'Fortaleza, capital do Ceará e importante polo turístico e comercial do Nordeste, possui economia pujante baseada em turismo, indústria têxtil, tecnologia e serviços. Empresários e profissionais fortalezenses necessitam frequentemente de certidões de protesto para negociações comerciais, comprovação de idoneidade financeira e participação em processos licitatórios.',
    benefits: [
      'Cobertura de Fortaleza e região metropolitana',
      'Processamento ágil para o setor de turismo e comércio',
      'Integração com todos os cartórios da capital',
      'Atendimento especializado para empresas locais'
    ]
  },
  {
    slug: 'belo-horizonte',
    name: 'Belo Horizonte',
    state: 'MG',
    stateSlug: 'mg',
    stateName: 'Minas Gerais',
    population: '2.5 milhões',
    deliveryTime: '24 a 48 horas',
    cartorios: [
      {
        nome: '1º Tabelionato de Protesto de Belo Horizonte',
        endereco: 'Rua da Bahia, 1148',
        bairro: 'Centro',
        telefone: '(31) 3273-2626',
        horario: '9h às 17h'
      },
      {
        nome: '2º Tabelionato de Protesto de Belo Horizonte',
        endereco: 'Rua Goitacazes, 73',
        bairro: 'Centro',
        telefone: '(31) 3201-7300',
        horario: '9h às 17h'
      }
    ],
    description: 'Belo Horizonte, capital de Minas Gerais e terceira maior região metropolitana do Brasil, é importante centro econômico com forte presença industrial, comercial e de serviços. A cidade mineira, conhecida por sua vocação empreendedora, demanda constantemente certidões de protesto para análise de crédito, regularização cadastral e comprovação de idoneidade financeira em transações comerciais.',
    benefits: [
      'Atendimento em toda a região metropolitana de BH',
      'Processamento rápido para empresas mineiras',
      'Cobertura completa da capital',
      'Sistema integrado com cartórios de todas as regionais'
    ]
  },
  {
    slug: 'manaus',
    name: 'Manaus',
    state: 'AM',
    stateSlug: 'am',
    stateName: 'Amazonas',
    population: '2.2 milhões',
    deliveryTime: '48 a 72 horas',
    cartorios: [
      {
        nome: '1º Tabelionato de Protesto de Manaus',
        endereco: 'Av. Eduardo Ribeiro, 520',
        bairro: 'Centro',
        telefone: '(92) 3633-4800',
        horario: '8h às 14h'
      }
    ],
    description: 'Manaus, capital do Amazonas e maior cidade da região Norte, é polo industrial da Zona Franca e centro econômico amazônico. Com economia voltada para indústria de eletroeletrônicos, duas rodas e tecnologia, empresas manauaras necessitam de certidões de protesto para operações de comércio internacional, financiamentos e comprovação de regularidade fiscal.',
    benefits: [
      'Atendimento especializado para empresas da Zona Franca',
      'Cobertura completa de Manaus',
      'Processamento para comércio exterior',
      'Suporte para indústrias e importadores'
    ]
  },
  {
    slug: 'curitiba',
    name: 'Curitiba',
    state: 'PR',
    stateSlug: 'pr',
    stateName: 'Paraná',
    population: '1.9 milhões',
    deliveryTime: '24 a 48 horas',
    cartorios: [
      {
        nome: '1º Tabelionato de Protesto de Curitiba',
        endereco: 'Rua XV de Novembro, 626',
        bairro: 'Centro',
        telefone: '(41) 3322-6464',
        horario: '9h às 17h'
      },
      {
        nome: '2º Tabelionato de Protesto de Curitiba',
        endereco: 'Rua Marechal Deodoro, 344',
        bairro: 'Centro',
        telefone: '(41) 3323-7070',
        horario: '9h às 17h'
      }
    ],
    description: 'Curitiba, capital do Paraná e referência em planejamento urbano e qualidade de vida, possui economia diversificada com forte presença de indústria automotiva, tecnologia e serviços. Empresários curitibanos e profissionais liberais utilizam certidões de protesto para análise de crédito, participação em licitações e comprovação de regularidade em transações comerciais e bancárias.',
    benefits: [
      'Cobertura de Curitiba e região metropolitana',
      'Processamento ágil com infraestrutura moderna',
      'Integração com cartórios de toda a capital',
      'Atendimento para todos os setores econômicos'
    ]
  },
  {
    slug: 'recife',
    name: 'Recife',
    state: 'PE',
    stateSlug: 'pe',
    stateName: 'Pernambuco',
    population: '1.7 milhões',
    deliveryTime: '24 a 72 horas',
    cartorios: [
      {
        nome: '1º Tabelionato de Protesto do Recife',
        endereco: 'Rua do Imperador, 206',
        bairro: 'Santo Antônio',
        telefone: '(81) 3224-3277',
        horario: '8h às 17h'
      },
      {
        nome: '2º Tabelionato de Protesto do Recife',
        endereco: 'Av. Dantas Barreto, 191',
        bairro: 'São José',
        telefone: '(81) 3224-7070',
        horario: '8h às 17h'
      }
    ],
    description: 'Recife, capital de Pernambuco e polo econômico do Nordeste, destaca-se nos setores de tecnologia, turismo, serviços e polo médico. A cidade recifense, com forte vocação para inovação e empreendedorismo, demanda certidões de protesto para empresas de tecnologia, startups, prestadores de serviços e profissionais que buscam comprovar idoneidade financeira.',
    benefits: [
      'Atendimento em Recife e região metropolitana',
      'Processamento para empresas de tecnologia e startups',
      'Cobertura completa da capital',
      'Suporte especializado para polo médico e turismo'
    ]
  },
  {
    slug: 'porto-alegre',
    name: 'Porto Alegre',
    state: 'RS',
    stateSlug: 'rs',
    stateName: 'Rio Grande do Sul',
    population: '1.5 milhões',
    deliveryTime: '24 a 48 horas',
    cartorios: [
      {
        nome: '1º Tabelionato de Protesto de Porto Alegre',
        endereco: 'Rua dos Andradas, 1234',
        bairro: 'Centro Histórico',
        telefone: '(51) 3228-4646',
        horario: '9h às 18h'
      },
      {
        nome: '2º Tabelionato de Protesto de Porto Alegre',
        endereco: 'Av. Borges de Medeiros, 377',
        bairro: 'Centro',
        telefone: '(51) 3211-2020',
        horario: '9h às 18h'
      }
    ],
    description: 'Porto Alegre, capital do Rio Grande do Sul e importante centro econômico da região Sul, possui economia baseada em comércio, serviços, indústria e agronegócio. Empresários gaúchos necessitam de certidões de protesto para negociações comerciais, operações de crédito, participação em licitações e comprovação de regularidade cadastral em transações com fornecedores e instituições financeiras.',
    benefits: [
      'Cobertura de Porto Alegre e região metropolitana',
      'Processamento rápido para empresas gaúchas',
      'Integração com cartórios de toda a capital',
      'Atendimento especializado para agronegócio e indústria'
    ]
  },
  {
    slug: 'goiania',
    name: 'Goiânia',
    state: 'GO',
    stateSlug: 'go',
    stateName: 'Goiás',
    population: '1.5 milhões',
    deliveryTime: '24 a 48 horas',
    cartorios: [
      {
        nome: '1º Tabelionato de Protesto de Goiânia',
        endereco: 'Av. Goiás, 837',
        bairro: 'Centro',
        telefone: '(62) 3224-8282',
        horario: '8h às 18h'
      },
      {
        nome: '2º Tabelionato de Protesto de Goiânia',
        endereco: 'Rua 3, nº 738',
        bairro: 'Centro',
        telefone: '(62) 3225-3030',
        horario: '8h às 18h'
      }
    ],
    description: 'Goiânia, capital de Goiás e importante polo do agronegócio brasileiro, possui economia diversificada com destaque para agropecuária, indústria farmacêutica e serviços. Empresários goianos do agronegócio, indústria e comércio utilizam certidões de protesto para análise de crédito rural, financiamentos, participação em licitações e comprovação de idoneidade em transações comerciais.',
    benefits: [
      'Atendimento especializado para agronegócio',
      'Cobertura de Goiânia e região metropolitana',
      'Processamento ágil para empresas do Centro-Oeste',
      'Suporte para indústria e comércio local'
    ]
  },
  {
    slug: 'belem',
    name: 'Belém',
    state: 'PA',
    stateSlug: 'pa',
    stateName: 'Pará',
    population: '1.5 milhões',
    deliveryTime: '48 a 72 horas',
    cartorios: [
      {
        nome: '1º Tabelionato de Protesto de Belém',
        endereco: 'Av. Presidente Vargas, 780',
        bairro: 'Campina',
        telefone: '(91) 3212-1500',
        horario: '8h às 14h'
      }
    ],
    description: 'Belém, capital do Pará e maior cidade da Amazônia Oriental, é importante centro comercial e portuário da região Norte. Com economia baseada em comércio, serviços, turismo e indústria mineral, empresas belenenses necessitam de certidões de protesto para operações portuárias, comércio exterior, análise de crédito e regularização cadastral.',
    benefits: [
      'Cobertura de Belém e região metropolitana',
      'Atendimento para empresas portuárias e comércio exterior',
      'Processamento para todos os setores econômicos',
      'Suporte especializado para região amazônica'
    ]
  },
  {
    slug: 'guarulhos',
    name: 'Guarulhos',
    state: 'SP',
    stateSlug: 'sp',
    stateName: 'São Paulo',
    population: '1.4 milhões',
    deliveryTime: '24 a 48 horas',
    cartorios: [
      {
        nome: 'Tabelionato de Protesto de Guarulhos',
        endereco: 'Rua Claudino Barbosa, 1136',
        bairro: 'Centro',
        telefone: '(11) 2409-5252',
        horario: '9h às 17h'
      }
    ],
    description: 'Guarulhos, segunda maior cidade de São Paulo e sede do maior aeroporto da América Latina, possui forte atividade industrial, logística e comercial. Com economia diversificada e intensa movimentação de cargas, empresas guarulhenses necessitam de certidões de protesto para operações de comércio exterior, logística, análise de crédito e comprovação de regularidade cadastral.',
    benefits: [
      'Atendimento especializado para empresas de logística',
      'Processamento ágil para comércio exterior',
      'Cobertura completa de Guarulhos',
      'Integração com aeroporto internacional'
    ]
  },
  {
    slug: 'campinas',
    name: 'Campinas',
    state: 'SP',
    stateSlug: 'sp',
    stateName: 'São Paulo',
    population: '1.2 milhões',
    deliveryTime: '24 a 48 horas',
    cartorios: [
      {
        nome: '1º Tabelionato de Protesto de Campinas',
        endereco: 'Av. Francisco Glicério, 1150',
        bairro: 'Centro',
        telefone: '(19) 3231-2626',
        horario: '9h às 17h'
      },
      {
        nome: '2º Tabelionato de Protesto de Campinas',
        endereco: 'Rua Barão de Jaguara, 1481',
        bairro: 'Centro',
        telefone: '(19) 3236-4040',
        horario: '9h às 17h'
      }
    ],
    description: 'Campinas, importante polo tecnológico e industrial do interior paulista, abriga universidades renomadas, centros de pesquisa e empresas de tecnologia. Com economia diversificada e forte presença de startups, indústria e agronegócio, profissionais e empresários campineiros utilizam certidões de protesto para análise de crédito, participação em editais de inovação, licitações e comprovação de idoneidade financeira.',
    benefits: [
      'Atendimento especializado para empresas de tecnologia',
      'Cobertura de Campinas e região metropolitana',
      'Processamento ágil para startups e indústria',
      'Suporte para universidades e centros de pesquisa'
    ]
  },
  {
    slug: 'sao-luis',
    name: 'São Luís',
    state: 'MA',
    stateSlug: 'ma',
    stateName: 'Maranhão',
    population: '1.1 milhões',
    deliveryTime: '48 a 72 horas',
    cartorios: [
      {
        nome: '1º Tabelionato de Protesto de São Luís',
        endereco: 'Rua do Sol, 255',
        bairro: 'Centro',
        telefone: '(98) 3231-4040',
        horario: '8h às 14h'
      }
    ],
    description: 'São Luís, capital do Maranhão e importante centro portuário do Nordeste, possui economia baseada em comércio, indústria, turismo e atividades portuárias. Empresas ludovicenses necessitam de certidões de protesto para operações portuárias, comércio, análise de crédito e regularização cadastral em transações comerciais e bancárias.',
    benefits: [
      'Cobertura de São Luís e região metropolitana',
      'Atendimento para empresas portuárias',
      'Processamento para comércio e indústria',
      'Suporte especializado para a região'
    ]
  },
  {
    slug: 'maceio',
    name: 'Maceió',
    state: 'AL',
    stateSlug: 'al',
    stateName: 'Alagoas',
    population: '1.0 milhão',
    deliveryTime: '48 a 72 horas',
    cartorios: [
      {
        nome: 'Tabelionato de Protesto de Maceió',
        endereco: 'Rua do Comércio, 70',
        bairro: 'Centro',
        telefone: '(82) 3326-3030',
        horario: '8h às 14h'
      }
    ],
    description: 'Maceió, capital de Alagoas e importante destino turístico do Nordeste, possui economia baseada em turismo, comércio, serviços e produção de cana-de-açúcar. Empresários maceioenses dos setores de turismo, hotelaria e comércio utilizam certidões de protesto para análise de crédito, financiamentos e comprovação de regularidade cadastral.',
    benefits: [
      'Atendimento para empresas de turismo e hotelaria',
      'Cobertura de Maceió e região',
      'Processamento para comércio local',
      'Suporte especializado para a capital alagoana'
    ]
  },
  {
    slug: 'natal',
    name: 'Natal',
    state: 'RN',
    stateSlug: 'rn',
    stateName: 'Rio Grande do Norte',
    population: '890 mil',
    deliveryTime: '48 a 72 horas',
    cartorios: [
      {
        nome: 'Tabelionato de Protesto de Natal',
        endereco: 'Av. Rio Branco, 656',
        bairro: 'Cidade Alta',
        telefone: '(84) 3211-3030',
        horario: '8h às 14h'
      }
    ],
    description: 'Natal, capital do Rio Grande do Norte e importante polo turístico do Nordeste, possui economia diversificada com destaque para turismo, comércio, serviços e fruticultura. Empresários potiguares necessitam de certidões de protesto para operações comerciais, análise de crédito, participação em licitações e comprovação de idoneidade financeira.',
    benefits: [
      'Cobertura de Natal e região metropolitana',
      'Atendimento para turismo e comércio',
      'Processamento ágil para empresas locais',
      'Suporte para todos os setores'
    ]
  },
  {
    slug: 'campo-grande',
    name: 'Campo Grande',
    state: 'MS',
    stateSlug: 'ms',
    stateName: 'Mato Grosso do Sul',
    population: '920 mil',
    deliveryTime: '24 a 48 horas',
    cartorios: [
      {
        nome: 'Tabelionato de Protesto de Campo Grande',
        endereco: 'Rua 15 de Novembro, 390',
        bairro: 'Centro',
        telefone: '(67) 3321-2020',
        horario: '8h às 18h'
      }
    ],
    description: 'Campo Grande, capital de Mato Grosso do Sul e importante centro do agronegócio brasileiro, possui economia baseada em pecuária, agricultura, comércio e serviços. Empresários campo-grandenses do agronegócio e comércio utilizam certidões de protesto para crédito rural, análise de risco, participação em licitações e comprovação de regularidade cadastral.',
    benefits: [
      'Atendimento especializado para agronegócio',
      'Cobertura de Campo Grande e região',
      'Processamento para crédito rural e comércio',
      'Suporte para empresas do Centro-Oeste'
    ]
  },
  {
    slug: 'teresina',
    name: 'Teresina',
    state: 'PI',
    stateSlug: 'pi',
    stateName: 'Piauí',
    population: '870 mil',
    deliveryTime: '48 a 72 horas',
    cartorios: [
      {
        nome: 'Tabelionato de Protesto de Teresina',
        endereco: 'Rua Álvaro Mendes, 2294',
        bairro: 'Centro',
        telefone: '(86) 3221-5050',
        horario: '8h às 14h'
      }
    ],
    description: 'Teresina, capital do Piauí e única capital nordestina fora do litoral, possui economia baseada em comércio, serviços, indústria e agronegócio. Empresários teresinenses necessitam de certidões de protesto para operações comerciais, análise de crédito, participação em licitações e regularização cadastral em transações bancárias e comerciais.',
    benefits: [
      'Cobertura de Teresina e região',
      'Atendimento para comércio e agronegócio',
      'Processamento ágil para empresas locais',
      'Suporte especializado para o Piauí'
    ]
  },
  {
    slug: 'sao-bernardo-do-campo',
    name: 'São Bernardo do Campo',
    state: 'SP',
    stateSlug: 'sp',
    stateName: 'São Paulo',
    population: '850 mil',
    deliveryTime: '24 a 48 horas',
    cartorios: [
      {
        nome: 'Tabelionato de Protesto de São Bernardo do Campo',
        endereco: 'Rua Marechal Deodoro, 2149',
        bairro: 'Centro',
        telefone: '(11) 4125-9090',
        horario: '9h às 17h'
      }
    ],
    description: 'São Bernardo do Campo, importante cidade do ABC Paulista e polo industrial automotivo, possui economia diversificada com forte presença de indústria, comércio e serviços. Empresas são-bernardenses, especialmente do setor automotivo e metalúrgico, necessitam de certidões de protesto para análise de crédito, participação em licitações e comprovação de regularidade em cadeias produtivas.',
    benefits: [
      'Atendimento especializado para indústria automotiva',
      'Cobertura do ABC Paulista',
      'Processamento ágil para fornecedores industriais',
      'Suporte para cadeias produtivas'
    ]
  }
]

// Helper functions
export function getCityBySlug(citySlug: string, stateSlug: string): CityData | undefined {
  return cities.find(city => city.slug === citySlug && city.stateSlug === stateSlug)
}

export function getCitiesByState(stateSlug: string): CityData[] {
  return cities.filter(city => city.stateSlug === stateSlug)
}

export function getAllStates(): Array<{ slug: string; name: string }> {
  const states = new Map<string, string>()
  cities.forEach(city => {
    states.set(city.stateSlug, city.stateName)
  })
  return Array.from(states.entries()).map(([slug, name]) => ({ slug, name }))
}
