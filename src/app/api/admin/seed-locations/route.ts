import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'
import { rateLimit, createRateLimitResponse, RateLimits, isRateLimitEnabled } from '@/lib/rate-limiter'

// Secret para proteger o endpoint
const SEED_SECRET = process.env.SEED_SECRET

// State mapping
const stateMapping: Record<string, { id: string; name: string; code: string }> = {
  'AC': { id: 'ac', name: 'Acre', code: 'AC' },
  'AL': { id: 'al', name: 'Alagoas', code: 'AL' },
  'AP': { id: 'ap', name: 'Amapá', code: 'AP' },
  'AM': { id: 'am', name: 'Amazonas', code: 'AM' },
  'BA': { id: 'ba', name: 'Bahia', code: 'BA' },
  'CE': { id: 'ce', name: 'Ceará', code: 'CE' },
  'DF': { id: 'df', name: 'Distrito Federal', code: 'DF' },
  'ES': { id: 'es', name: 'Espírito Santo', code: 'ES' },
  'GO': { id: 'go', name: 'Goiás', code: 'GO' },
  'MA': { id: 'ma', name: 'Maranhão', code: 'MA' },
  'MT': { id: 'mt', name: 'Mato Grosso', code: 'MT' },
  'MS': { id: 'ms', name: 'Mato Grosso do Sul', code: 'MS' },
  'MG': { id: 'mg', name: 'Minas Gerais', code: 'MG' },
  'PA': { id: 'pa', name: 'Pará', code: 'PA' },
  'PB': { id: 'pb', name: 'Paraíba', code: 'PB' },
  'PR': { id: 'pr', name: 'Paraná', code: 'PR' },
  'PE': { id: 'pe', name: 'Pernambuco', code: 'PE' },
  'PI': { id: 'pi', name: 'Piauí', code: 'PI' },
  'RJ': { id: 'rj', name: 'Rio de Janeiro', code: 'RJ' },
  'RN': { id: 'rn', name: 'Rio Grande do Norte', code: 'RN' },
  'RS': { id: 'rs', name: 'Rio Grande do Sul', code: 'RS' },
  'RO': { id: 'ro', name: 'Rondônia', code: 'RO' },
  'RR': { id: 'rr', name: 'Roraima', code: 'RR' },
  'SC': { id: 'sc', name: 'Santa Catarina', code: 'SC' },
  'SP': { id: 'sp', name: 'São Paulo', code: 'SP' },
  'SE': { id: 'se', name: 'Sergipe', code: 'SE' },
  'TO': { id: 'to', name: 'Tocantins', code: 'TO' }
}

// Helper function to slugify strings
function slugify(text: string): string {
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

  const citiesMap = new Map<string, { name: string; slug: string; notaries: any[] }>()

  dataLines.forEach(line => {
    // Parse CSV line properly (handle quoted fields)
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

    const cityData = citiesMap.get(city)!
    const exists = cityData.notaries.some(n => n.name === notaryName)
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
    // Rate limiting - global limit for seed endpoint (very strict)
    if (isRateLimitEnabled()) {
      const rateLimitResult = await rateLimit(
        'admin-seed-global',
        RateLimits.ADMIN_SEED.limit,
        RateLimits.ADMIN_SEED.windowMs
      )

      if (!rateLimitResult.success) {
        // Log rate limit violation
        await prisma.auditLog.create({
          data: {
            action: 'RATE_LIMIT_EXCEEDED',
            resource: 'ADMIN_SEED',
            metadata: {
              limit: rateLimitResult.limit,
              resetAt: rateLimitResult.resetAt.toISOString()
            }
          }
        }).catch(err => console.error('Failed to log rate limit:', err))

        return createRateLimitResponse(
          rateLimitResult,
          'Seed endpoint can only be called once per hour'
        )
      }
    }

    // Verificar autenticação
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!SEED_SECRET || token !== SEED_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🌱 Starting location seed...')

    // Limpar dados existentes
    console.log('🗑️  Clearing existing data...')
    await prisma.notary.deleteMany()
    await prisma.city.deleteMany()
    await prisma.state.deleteMany()

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

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  CSV not found for ${code}`)
        continue
      }

      console.log(`📍 Processing ${code} - ${stateInfo.name}...`)

      try {
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

        console.log(`   ✅ ${cities.length} cities and ${cities.reduce((sum, c) => sum + c.notaries.length, 0)} notaries created`)

      } catch (error) {
        console.error(`   ❌ Error processing ${code}:`, error)
      }
    }

    console.log('✅ Seed completed successfully!')

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
    console.error('❌ Seed error:', error)
    return NextResponse.json(
      {
        error: 'Seed failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
