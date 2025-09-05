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