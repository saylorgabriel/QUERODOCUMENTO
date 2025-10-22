# Banco de Dados de Cartórios - QueroDocumento

## Resumo

Sistema completo de gerenciamento de cartórios de protesto de todos os estados brasileiros, com **3.764 cartórios** distribuídos em **3.331 cidades** de **27 estados**.

## O Que Foi Criado

### 1. Modelos do Banco de Dados (Prisma)

Três novas tabelas foram adicionadas ao `prisma/schema.prisma`:

#### **State (Estados)**
```typescript
model State {
  id        String   // ID único
  code      String   // Sigla do estado (AC, AL, etc.)
  name      String   // Nome completo (Acre, Alagoas, etc.)
  slug      String   // URL-friendly (ac, al, etc.)
  cities    City[]   // Relação com cidades
  active    Boolean  // Status ativo/inativo
  createdAt DateTime
  updatedAt DateTime
}
```

#### **City (Cidades)**
```typescript
model City {
  id        String   // ID único
  stateId   String   // Foreign key para State
  name      String   // Nome da cidade
  slug      String   // URL-friendly
  state     State    // Relação com estado
  notaries  Notary[] // Relação com cartórios
  active    Boolean  // Status ativo/inativo
  createdAt DateTime
  updatedAt DateTime
}
```

#### **Notary (Cartórios)**
```typescript
model Notary {
  id        String   // ID único
  cityId    String   // Foreign key para City
  name      String   // Nome do cartório
  slug      String   // URL-friendly
  address   String   // Endereço completo
  phone     String?  // Telefone (opcional)
  email     String?  // Email (opcional)
  website   String?  // Site do cartório (opcional)
  hours     String?  // Horário de funcionamento (opcional)
  notes     String?  // Observações adicionais (opcional)
  city      City     // Relação com cidade
  active    Boolean  // Status ativo/inativo
  createdAt DateTime
  updatedAt DateTime
}
```

### 2. Migration Aplicada

**Migration**: `20251021225019_add_location_models`

Criada e aplicada com sucesso no banco de dados local e pronta para ser aplicada em produção.

### 3. Arquivo de Dados Estáticos

**`src/data/locations.ts`** - Arquivo TypeScript com todos os dados estruturados:
- 27 estados
- 3.331 cidades
- 3.764 cartórios

Este arquivo pode ser usado para:
- Dropdowns de seleção
- Autocompletar
- Validação de dados
- Geração de páginas estáticas (SSG)

### 4. Scripts Criados

#### **`scripts/generate-locations.js`**
Gera o arquivo `src/data/locations.ts` a partir dos CSVs:
```bash
node scripts/generate-locations.js
```

#### **`scripts/seed-locations.js`**
Popula o banco de dados com todos os dados dos CSVs:
```bash
bun run db:seed:locations
```

## Como Usar

### 1. Consultar Cartórios no Banco de Dados

```typescript
import { prisma } from '@/lib/prisma'

// Buscar todos os estados
const states = await prisma.state.findMany({
  include: {
    cities: {
      include: {
        notaries: true
      }
    }
  }
})

// Buscar cartórios de uma cidade específica
const notaries = await prisma.notary.findMany({
  where: {
    city: {
      slug: 'sao-paulo',
      state: {
        code: 'SP'
      }
    },
    active: true
  },
  include: {
    city: {
      include: {
        state: true
      }
    }
  }
})

// Buscar por nome do cartório
const results = await prisma.notary.findMany({
  where: {
    name: {
      contains: 'Tabelião',
      mode: 'insensitive'
    },
    active: true
  },
  include: {
    city: {
      include: {
        state: true
      }
    }
  },
  take: 10
})
```

### 2. Usar Dados Estáticos (TypeScript)

```typescript
import { locations } from '@/data/locations'

// Buscar estado
const sp = locations.find(state => state.code === 'SP')

// Buscar cidade
const city = sp?.cities.find(city => city.slug === 'campinas')

// Listar cartórios
const notaries = city?.notaries || []
```

### 3. Criar API Endpoint

```typescript
// src/app/api/locations/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const stateCode = searchParams.get('state')
  const citySlug = searchParams.get('city')

  if (!stateCode) {
    // Return all states
    const states = await prisma.state.findMany({
      where: { active: true },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(states)
  }

  if (!citySlug) {
    // Return cities of state
    const cities = await prisma.city.findMany({
      where: {
        state: { code: stateCode },
        active: true
      },
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(cities)
  }

  // Return notaries of city
  const notaries = await prisma.notary.findMany({
    where: {
      city: {
        slug: citySlug,
        state: { code: stateCode }
      },
      active: true
    },
    include: {
      city: {
        include: {
          state: true
        }
      }
    }
  })

  return NextResponse.json(notaries)
}
```

### 4. Componente React para Seleção

```typescript
'use client'

import { useState, useEffect } from 'react'

interface State {
  id: string
  code: string
  name: string
}

interface City {
  id: string
  name: string
  slug: string
}

interface Notary {
  id: string
  name: string
  address: string
}

export function LocationSelector() {
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [notaries, setNotaries] = useState<Notary[]>([])

  const [selectedState, setSelectedState] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  // Load states
  useEffect(() => {
    fetch('/api/locations')
      .then(res => res.json())
      .then(setStates)
  }, [])

  // Load cities when state changes
  useEffect(() => {
    if (!selectedState) {
      setCities([])
      setNotaries([])
      return
    }

    fetch(`/api/locations?state=${selectedState}`)
      .then(res => res.json())
      .then(setCities)
  }, [selectedState])

  // Load notaries when city changes
  useEffect(() => {
    if (!selectedCity) {
      setNotaries([])
      return
    }

    fetch(`/api/locations?state=${selectedState}&city=${selectedCity}`)
      .then(res => res.json())
      .then(setNotaries)
  }, [selectedState, selectedCity])

  return (
    <div className="space-y-4">
      <select
        value={selectedState}
        onChange={(e) => {
          setSelectedState(e.target.value)
          setSelectedCity('')
        }}
        className="w-full p-2 border rounded"
      >
        <option value="">Selecione o Estado</option>
        {states.map(state => (
          <option key={state.id} value={state.code}>
            {state.name}
          </option>
        ))}
      </select>

      {selectedState && (
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione a Cidade</option>
          {cities.map(city => (
            <option key={city.id} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
      )}

      {selectedCity && (
        <select className="w-full p-2 border rounded">
          <option value="">Selecione o Cartório</option>
          {notaries.map(notary => (
            <option key={notary.id} value={notary.id}>
              {notary.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
```

## Estrutura dos Dados

### Estados (27 total)
- AC - Acre
- AL - Alagoas
- AP - Amapá
- AM - Amazonas
- BA - Bahia
- CE - Ceará
- DF - Distrito Federal
- ES - Espírito Santo
- GO - Goiás
- MA - Maranhão
- MT - Mato Grosso
- MS - Mato Grosso do Sul
- MG - Minas Gerais
- PA - Pará
- PB - Paraíba
- PR - Paraná
- PE - Pernambuco
- PI - Piauí
- RJ - Rio de Janeiro
- RN - Rio Grande do Norte
- RS - Rio Grande do Sul
- RO - Rondônia
- RR - Roraima
- SC - Santa Catarina
- SP - São Paulo
- SE - Sergipe
- TO - Tocantins

### Top 5 Estados com Mais Cartórios
1. **São Paulo**: 407 cartórios em 280 cidades
2. **Ceará**: 327 cartórios em 182 cidades
3. **Rio Grande do Sul**: 307 cartórios em 302 cidades
4. **Minas Gerais**: 303 cartórios em 299 cidades
5. **Bahia**: 277 cartórios em 274 cidades

## Deploy em Produção

### 1. Via Vercel (Automático)

Quando você fizer deploy na Vercel, a migration será aplicada automaticamente através do comando `build` no `package.json`:

```bash
prisma generate && prisma migrate deploy && next build
```

### 2. Popular Banco de Dados

Após o deploy, execute o seed em produção:

**Opção A - Via Script Local:**
```bash
# Baixar env vars da Vercel
vercel env pull .env.production

# Executar seed com DATABASE_URL da produção
DATABASE_URL="postgresql://..." bun run db:seed:locations
```

**Opção B - Via SSH/Console na Vercel:**
Se você tiver acesso ao console da Vercel:
```bash
bun run db:seed:locations
```

**Opção C - Via API Endpoint:**
Crie um endpoint protegido para executar o seed remotamente.

## Comandos Úteis

```bash
# Gerar arquivo TypeScript dos dados
node scripts/generate-locations.js

# Popular banco de dados local
bun run db:seed:locations

# Ver banco de dados (GUI)
bun run db:studio

# Gerar Prisma Client após alterações
bun run db:generate

# Ver schema do banco
bun prisma db pull
```

## Integração com Formulários

Você pode usar esses dados nos formulários de solicitação de certidão:

1. **Dropdown de Estados** - Lista todos os estados
2. **Dropdown de Cidades** - Filtrado pelo estado selecionado
3. **Dropdown de Cartórios** - Filtrado pela cidade selecionada

Ou permitir que o usuário selecione "Todos os cartórios" para uma busca mais abrangente.

## Performance

### Índices Criados
- `State.code` - Busca por sigla
- `State.slug` - Busca por URL
- `City.stateId` - Join com estado
- `City.slug` - Busca por URL
- `Notary.cityId` - Join com cidade
- `Notary.slug` - Busca por URL

### Otimizações Recomendadas
- Cache de estados e cidades (dados raramente mudam)
- Paginação para listagem de cartórios
- Busca com índice full-text (se necessário)

## Backup dos Dados

Os dados originais estão preservados em:
- **Pasta**: `BD Estados/` (27 arquivos CSV)
- **Arquivo TypeScript**: `src/data/locations.ts`
- **Scripts**: `scripts/generate-locations.js` e `scripts/seed-locations.js`

Se precisar recriar o banco de dados, basta executar:
```bash
bun run db:seed:locations
```

## Próximos Passos Sugeridos

1. **API de Busca**: Criar endpoint para busca por nome de cartório
2. **Autocompletar**: Implementar busca inteligente com autocompletar
3. **Páginas Estáticas**: Gerar páginas SEO-friendly para cada estado/cidade
4. **Admin Panel**: Interface para gerenciar cartórios (adicionar/editar/desativar)
5. **Informações Adicionais**: Adicionar telefone, email, horários aos cartórios

## Suporte

Para dúvidas ou problemas:
1. Verifique os logs: `docker-compose logs -f`
2. Consulte o Prisma Studio: `bun run db:studio`
3. Revise os scripts em `scripts/`
