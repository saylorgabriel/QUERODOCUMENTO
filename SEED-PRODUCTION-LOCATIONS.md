# Como Popular as Tabelas de Cartórios em Produção (Vercel)

## Status Atual
- ✅ **Local**: Banco de dados local já populado com 3.756 cartórios
- ⚠️ **Produção**: Tabelas State, City e Notary ainda vazias na Vercel

## Opções para Popular Produção

### Opção 1: Via Script Local (Recomendado)

#### Passo 1: Instalar Vercel CLI (se não tiver)
```bash
npm install -g vercel
# ou
bun install -g vercel
```

#### Passo 2: Login na Vercel
```bash
vercel login
```

#### Passo 3: Puxar Variáveis de Ambiente de Produção
```bash
cd /Users/saylor/Documents/VPSGD/QUERODOCUMENTO
vercel env pull .env.production.local
```

Isso criará o arquivo `.env.production.local` com as variáveis da Vercel, incluindo `DATABASE_URL`.

#### Passo 4: Popular Banco de Produção
```bash
# Usar DATABASE_URL da produção
bun run scripts/seed-locations.js
```

**Importante**: Certifique-se de que o arquivo `.env.production.local` está sendo lido. Se não, você pode exportar manualmente:

```bash
# Extrair DATABASE_URL do arquivo
export DATABASE_URL=$(grep DATABASE_URL .env.production.local | cut -d '=' -f2-)

# Rodar seed
bun run scripts/seed-locations.js
```

### Opção 2: Via API Endpoint (Para Produção)

Crie um endpoint protegido para executar o seed remotamente.

#### Criar Endpoint de Seed

**`src/app/api/admin/seed-locations/route.ts`:**
```typescript
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Secret para proteger o endpoint
const SEED_SECRET = process.env.SEED_SECRET

// Helper function to slugify strings
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

// Parse CSV file
function parseCSV(filePath: string, stateCode: string) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  const dataLines = lines.slice(1)

  const citiesMap = new Map()

  dataLines.forEach(line => {
    // Parse CSV line properly
    const parts: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          const thirdChar = line[i + 2]
          if (thirdChar === '"') {
            current += '"'
            i += 2
            inQuotes = false
          } else {
            current += '"'
            i++
          }
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ';' && !inQuotes) {
        parts.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    parts.push(current.trim())

    if (parts.length < 3) return

    const city = parts[1]?.trim().replace(/^"|"$/g, '').replace(/"/g, '')
    const notaryName = parts[2]?.trim().replace(/^"|"$/g, '').replace(/"/g, '')

    if (!city || !notaryName) return

    if (!citiesMap.has(city)) {
      citiesMap.set(city, {
        name: city,
        slug: slugify(city),
        notaries: []
      })
    }

    const cityData = citiesMap.get(city)
    const exists = cityData.notaries.some((n: any) => n.name === notaryName)
    if (!exists) {
      cityData.notaries.push({
        name: notaryName,
        slug: slugify(notaryName + '-' + city),
        address: `${city} - ${stateCode}`,
      })
    }
  })

  return Array.from(citiesMap.values())
}

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (token !== SEED_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Limpar dados existentes
    await prisma.notary.deleteMany()
    await prisma.city.deleteMany()
    await prisma.state.deleteMany()

    const stateMapping: Record<string, any> = {
      'AC': { id: 'ac', name: 'Acre', code: 'AC' },
      'AL': { id: 'al', name: 'Alagoas', code: 'AL' },
      'AP': { id: 'ap', name: 'Amapá', code: 'AP' },
      // ... adicionar todos os estados
    }

    let totalStates = 0
    let totalCities = 0
    let totalNotaries = 0

    const bdEstadosPath = path.join(process.cwd(), 'BD Estados')

    for (const [code, stateInfo] of Object.entries(stateMapping)) {
      const csvPath = path.join(bdEstadosPath, `${code} - Protesto.csv`)
      const altCsvPath = path.join(bdEstadosPath, `${code}- Protesto.csv`)

      let filePath = csvPath
      if (!fs.existsSync(csvPath) && fs.existsSync(altCsvPath)) {
        filePath = altCsvPath
      }

      if (!fs.existsSync(filePath)) continue

      const cities = parseCSV(filePath, code)

      const state = await prisma.state.create({
        data: {
          code: stateInfo.code,
          name: stateInfo.name,
          slug: stateInfo.id,
        }
      })

      totalStates++

      for (const cityData of cities) {
        const city = await prisma.city.create({
          data: {
            stateId: state.id,
            name: cityData.name,
            slug: cityData.slug,
          }
        })

        totalCities++

        for (const notaryData of cityData.notaries) {
          await prisma.notary.create({
            data: {
              cityId: city.id,
              name: notaryData.name,
              slug: notaryData.slug,
              address: notaryData.address,
            }
          })

          totalNotaries++
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Locations seeded successfully',
      stats: {
        states: totalStates,
        cities: totalCities,
        notaries: totalNotaries
      }
    })

  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Seed failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
```

#### Chamar o Endpoint

**Via cURL:**
```bash
curl -X POST https://querodocumento-cpj6.vercel.app/api/admin/seed-locations \
  -H "Authorization: Bearer SEU_SEED_SECRET" \
  -H "Content-Type: application/json"
```

**Via Script:**
```bash
#!/bin/bash
# scripts/seed-production-locations.sh

SEED_SECRET="seu-seed-secret-aqui"
PRODUCTION_URL="https://querodocumento-cpj6.vercel.app"

echo "🌱 Seeding production locations..."

curl -X POST "$PRODUCTION_URL/api/admin/seed-locations" \
  -H "Authorization: Bearer $SEED_SECRET" \
  -H "Content-Type: application/json" \
  | jq '.'

echo "✅ Done!"
```

### Opção 3: Upload Manual via Prisma Studio

1. Abrir Prisma Studio conectado ao banco de produção:
```bash
# Exportar DATABASE_URL da produção
export DATABASE_URL="postgresql://..."

# Abrir Studio
bunx prisma studio
```

2. Copiar dados do banco local para produção usando dump/restore do PostgreSQL.

### Opção 4: Dump e Restore do PostgreSQL

#### Exportar do Local
```bash
# Dump apenas das tabelas de localização
pg_dump -h localhost -U querodoc -d querodocumento \
  -t State -t City -t Notary \
  --data-only \
  > locations_dump.sql
```

#### Importar para Produção
```bash
# Obter URL do banco de produção da Vercel
# Exemplo: postgresql://user:pass@host:5432/database

psql "postgresql://..." < locations_dump.sql
```

## Verificação Pós-Seed

Após popular o banco de produção, verifique:

### Via API
```bash
# Verificar estados
curl https://querodocumento-cpj6.vercel.app/api/locations

# Verificar cidades de um estado
curl https://querodocumento-cpj6.vercel.app/api/locations?state=SP

# Verificar cartórios de uma cidade
curl https://querodocumento-cpj6.vercel.app/api/locations?state=SP&city=campinas
```

### Via Prisma Studio
```bash
# Conectar ao banco de produção
export DATABASE_URL="postgresql://..."
bunx prisma studio
```

### Via SQL Direto
```sql
-- Contar registros
SELECT
  (SELECT COUNT(*) FROM "State") as states,
  (SELECT COUNT(*) FROM "City") as cities,
  (SELECT COUNT(*) FROM "Notary") as notaries;

-- Ver amostra
SELECT s.name, COUNT(c.id) as cities,
  (SELECT COUNT(*) FROM "Notary" n
   JOIN "City" ct ON n."cityId" = ct.id
   WHERE ct."stateId" = s.id) as notaries
FROM "State" s
LEFT JOIN "City" c ON c."stateId" = s.id
GROUP BY s.id, s.name
ORDER BY s.name;
```

## Considerações Importantes

### Performance
- O seed de 3.756 cartórios pode levar **5-15 minutos**
- Considere fazer em horário de baixo tráfego
- Vercel tem timeout de 60s por request (use seed local)

### Dados
- **Backup**: Sempre faça backup antes de popular produção
- **Idempotência**: O script limpa dados existentes antes de popular
- **Rollback**: Mantenha um backup para reverter se necessário

### Segurança
- Use `SEED_SECRET` forte e nunca exponha publicamente
- O endpoint deve ser protegido por autenticação
- Considere remover o endpoint após o seed inicial

## Recomendação Final

**Use a Opção 1 (Script Local)** porque:
- ✅ Mais rápido (sem timeout de 60s)
- ✅ Mais confiável (conexão direta com o banco)
- ✅ Sem necessidade de criar endpoint
- ✅ Fácil de monitorar progresso

**Comando Final:**
```bash
# 1. Instalar Vercel CLI (se necessário)
npm install -g vercel

# 2. Login
vercel login

# 3. Puxar env vars
vercel env pull .env.production.local

# 4. Popular produção
bun run scripts/seed-locations.js
```

Se o arquivo `.env.production.local` não for lido automaticamente:
```bash
# Exportar manualmente
export DATABASE_URL=$(grep POSTGRES_URL .env.production.local | cut -d '=' -f2-)

# Rodar seed
bun run scripts/seed-locations.js
```

## Verificação de Sucesso

Esperado após o seed:
- **27 estados**
- **3.323 cidades**
- **3.756 cartórios**

Teste no dashboard:
```
https://querodocumento-cpj6.vercel.app/certidao-protesto
```

O dropdown de estados/cidades/cartórios deve estar populado com dados reais.
