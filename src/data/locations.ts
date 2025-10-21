export interface Notary {
  id: string
  name: string
  address: string
  phone?: string
}

export interface City {
  id: string
  name: string
  notaries: Notary[]
}

export interface State {
  id: string
  name: string
  code: string
  cities: City[]
}

export const locations: State[] = [
  {
    id: 'sp',
    name: 'São Paulo',
    code: 'SP',
    cities: [
      {
        id: 'sao-paulo',
        name: 'São Paulo',
        notaries: [
          {
            id: '1-tabelliao-sp',
            name: '1º Tabelião de Protesto',
            address: 'Rua Libero Badaró, 344 - Centro, São Paulo - SP',
            phone: '(11) 3291-3291'
          },
          {
            id: '2-tabelliao-sp',
            name: '2º Tabelião de Protesto',
            address: 'Rua Álvares Penteado, 207 - Centro, São Paulo - SP',
            phone: '(11) 3104-2177'
          },
          {
            id: '3-tabelliao-sp',
            name: '3º Tabelião de Protesto',
            address: 'Rua Benjamin Constant, 43 - Centro, São Paulo - SP',
            phone: '(11) 3106-4600'
          }
        ]
      },
      {
        id: 'campinas',
        name: 'Campinas',
        notaries: [
          {
            id: '1-tabelliao-campinas',
            name: '1º Tabelião de Protesto de Campinas',
            address: 'Rua Barão de Jaguara, 1421 - Centro, Campinas - SP',
            phone: '(19) 3236-1414'
          },
          {
            id: '2-tabelliao-campinas',
            name: '2º Tabelião de Protesto de Campinas',
            address: 'Av. Francisco Glicério, 1661 - Centro, Campinas - SP',
            phone: '(19) 3231-2020'
          }
        ]
      },
      {
        id: 'santos',
        name: 'Santos',
        notaries: [
          {
            id: '1-tabelliao-santos',
            name: '1º Tabelião de Protesto de Santos',
            address: 'Rua XV de Novembro, 195 - Centro, Santos - SP',
            phone: '(13) 3219-4040'
          },
          {
            id: '2-tabelliao-santos',
            name: '2º Tabelião de Protesto de Santos',
            address: 'Av. Ana Costa, 567 - Gonzaga, Santos - SP',
            phone: '(13) 3284-7777'
          }
        ]
      }
    ]
  },
  {
    id: 'rj',
    name: 'Rio de Janeiro',
    code: 'RJ',
    cities: [
      {
        id: 'rio-de-janeiro',
        name: 'Rio de Janeiro',
        notaries: [
          {
            id: '1-tabelliao-rj',
            name: '1º Tabelião de Protesto do Rio de Janeiro',
            address: 'Rua da Alfândega, 5 - Centro, Rio de Janeiro - RJ',
            phone: '(21) 2263-2020'
          },
          {
            id: '2-tabelliao-rj',
            name: '2º Tabelião de Protesto do Rio de Janeiro',
            address: 'Rua Primeiro de Março, 23 - Centro, Rio de Janeiro - RJ',
            phone: '(21) 2533-8484'
          },
          {
            id: '3-tabelliao-rj',
            name: '3º Tabelião de Protesto do Rio de Janeiro',
            address: 'Av. Presidente Vargas, 482 - Centro, Rio de Janeiro - RJ',
            phone: '(21) 2263-7070'
          }
        ]
      },
      {
        id: 'niteroi',
        name: 'Niterói',
        notaries: [
          {
            id: '1-tabelliao-niteroi',
            name: '1º Tabelião de Protesto de Niterói',
            address: 'Rua Visconde do Rio Branco, 123 - Centro, Niterói - RJ',
            phone: '(21) 2717-8888'
          },
          {
            id: '2-tabelliao-niteroi',
            name: '2º Tabelião de Protesto de Niterói',
            address: 'Av. Roberto Silveira, 456 - Icaraí, Niterói - RJ',
            phone: '(21) 2610-9999'
          }
        ]
      }
    ]
  },
  {
    id: 'mg',
    name: 'Minas Gerais',
    code: 'MG',
    cities: [
      {
        id: 'belo-horizonte',
        name: 'Belo Horizonte',
        notaries: [
          {
            id: '1-tabelliao-bh',
            name: '1º Tabelião de Protesto de Belo Horizonte',
            address: 'Rua dos Carijós, 151 - Centro, Belo Horizonte - MG',
            phone: '(31) 3273-2020'
          },
          {
            id: '2-tabelliao-bh',
            name: '2º Tabelião de Protesto de Belo Horizonte',
            address: 'Av. Afonso Pena, 867 - Centro, Belo Horizonte - MG',
            phone: '(31) 3274-5555'
          },
          {
            id: '3-tabelliao-bh',
            name: '3º Tabelião de Protesto de Belo Horizonte',
            address: 'Rua da Bahia, 1148 - Centro, Belo Horizonte - MG',
            phone: '(31) 3222-8888'
          }
        ]
      },
      {
        id: 'uberlandia',
        name: 'Uberlândia',
        notaries: [
          {
            id: '1-tabelliao-uberlandia',
            name: '1º Tabelião de Protesto de Uberlândia',
            address: 'Av. João Pinheiro, 234 - Centro, Uberlândia - MG',
            phone: '(34) 3214-7777'
          },
          {
            id: '2-tabelliao-uberlandia',
            name: '2º Tabelião de Protesto de Uberlândia',
            address: 'Rua Goiás, 567 - Centro, Uberlândia - MG',
            phone: '(34) 3239-4444'
          }
        ]
      }
    ]
  },
  // Estados adicionais (sem cartórios específicos - usar opção "Todos os cartórios")
  {
    id: 'ac',
    name: 'Acre',
    code: 'AC',
    cities: [
      {
        id: 'rio-branco',
        name: 'Rio Branco',
        notaries: []
      }
    ]
  },
  {
    id: 'al',
    name: 'Alagoas',
    code: 'AL',
    cities: [
      {
        id: 'maceio',
        name: 'Maceió',
        notaries: []
      }
    ]
  },
  {
    id: 'ap',
    name: 'Amapá',
    code: 'AP',
    cities: [
      {
        id: 'macapa',
        name: 'Macapá',
        notaries: []
      }
    ]
  },
  {
    id: 'am',
    name: 'Amazonas',
    code: 'AM',
    cities: [
      {
        id: 'manaus',
        name: 'Manaus',
        notaries: []
      }
    ]
  },
  {
    id: 'ba',
    name: 'Bahia',
    code: 'BA',
    cities: [
      {
        id: 'salvador',
        name: 'Salvador',
        notaries: []
      }
    ]
  },
  {
    id: 'ce',
    name: 'Ceará',
    code: 'CE',
    cities: [
      {
        id: 'fortaleza',
        name: 'Fortaleza',
        notaries: []
      }
    ]
  },
  {
    id: 'df',
    name: 'Distrito Federal',
    code: 'DF',
    cities: [
      {
        id: 'brasilia',
        name: 'Brasília',
        notaries: []
      }
    ]
  },
  {
    id: 'es',
    name: 'Espírito Santo',
    code: 'ES',
    cities: [
      {
        id: 'vitoria',
        name: 'Vitória',
        notaries: []
      }
    ]
  },
  {
    id: 'go',
    name: 'Goiás',
    code: 'GO',
    cities: [
      {
        id: 'goiania',
        name: 'Goiânia',
        notaries: []
      }
    ]
  },
  {
    id: 'ma',
    name: 'Maranhão',
    code: 'MA',
    cities: [
      {
        id: 'sao-luis',
        name: 'São Luís',
        notaries: []
      }
    ]
  },
  {
    id: 'mt',
    name: 'Mato Grosso',
    code: 'MT',
    cities: [
      {
        id: 'cuiaba',
        name: 'Cuiabá',
        notaries: []
      }
    ]
  },
  {
    id: 'ms',
    name: 'Mato Grosso do Sul',
    code: 'MS',
    cities: [
      {
        id: 'campo-grande',
        name: 'Campo Grande',
        notaries: []
      }
    ]
  },
  {
    id: 'pa',
    name: 'Pará',
    code: 'PA',
    cities: [
      {
        id: 'belem',
        name: 'Belém',
        notaries: []
      }
    ]
  },
  {
    id: 'pb',
    name: 'Paraíba',
    code: 'PB',
    cities: [
      {
        id: 'joao-pessoa',
        name: 'João Pessoa',
        notaries: []
      }
    ]
  },
  {
    id: 'pr',
    name: 'Paraná',
    code: 'PR',
    cities: [
      {
        id: 'curitiba',
        name: 'Curitiba',
        notaries: []
      }
    ]
  },
  {
    id: 'pe',
    name: 'Pernambuco',
    code: 'PE',
    cities: [
      {
        id: 'recife',
        name: 'Recife',
        notaries: []
      }
    ]
  },
  {
    id: 'pi',
    name: 'Piauí',
    code: 'PI',
    cities: [
      {
        id: 'teresina',
        name: 'Teresina',
        notaries: []
      }
    ]
  },
  {
    id: 'rn',
    name: 'Rio Grande do Norte',
    code: 'RN',
    cities: [
      {
        id: 'natal',
        name: 'Natal',
        notaries: []
      }
    ]
  },
  {
    id: 'rs',
    name: 'Rio Grande do Sul',
    code: 'RS',
    cities: [
      {
        id: 'porto-alegre',
        name: 'Porto Alegre',
        notaries: []
      }
    ]
  },
  {
    id: 'ro',
    name: 'Rondônia',
    code: 'RO',
    cities: [
      {
        id: 'porto-velho',
        name: 'Porto Velho',
        notaries: []
      }
    ]
  },
  {
    id: 'rr',
    name: 'Roraima',
    code: 'RR',
    cities: [
      {
        id: 'boa-vista',
        name: 'Boa Vista',
        notaries: []
      }
    ]
  },
  {
    id: 'sc',
    name: 'Santa Catarina',
    code: 'SC',
    cities: [
      {
        id: 'florianopolis',
        name: 'Florianópolis',
        notaries: []
      }
    ]
  },
  {
    id: 'se',
    name: 'Sergipe',
    code: 'SE',
    cities: [
      {
        id: 'aracaju',
        name: 'Aracaju',
        notaries: []
      }
    ]
  },
  {
    id: 'to',
    name: 'Tocantins',
    code: 'TO',
    cities: [
      {
        id: 'palmas',
        name: 'Palmas',
        notaries: []
      }
    ]
  }
]

// Certificate request reasons
export const certificateReasons = [
  {
    id: 'judicial',
    label: 'Processo Judicial',
    description: 'Para usar em processos na Justiça'
  },
  {
    id: 'credit',
    label: 'Análise de Crédito',
    description: 'Para análise de crédito em instituições financeiras'
  },
  {
    id: 'employment',
    label: 'Contratação de Emprego',
    description: 'Para apresentar em processo seletivo'
  },
  {
    id: 'business',
    label: 'Negociação Comercial',
    description: 'Para fechar contratos e parcerias'
  },
  {
    id: 'personal',
    label: 'Uso Pessoal',
    description: 'Para fins pessoais diversos'
  },
  {
    id: 'property',
    label: 'Compra/Venda de Imóvel',
    description: 'Para transações imobiliárias'
  },
  {
    id: 'corporate',
    label: 'Constituição de Empresa',
    description: 'Para abertura ou alteração de empresa'
  },
  {
    id: 'other',
    label: 'Outros',
    description: 'Especificar motivo nos comentários'
  }
]