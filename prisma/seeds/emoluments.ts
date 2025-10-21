import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Valores de emolumentos por estado (em R$)
// Fonte: Tabelas de emolumentos dos cartórios de protesto de cada estado
// Fórmula: serviceValue = value5Years + lucroFee | finalValue = serviceValue + taxValue
const emolumentsByState = [
  { state: 'AC', value5Years: 54.90 },
  { state: 'AL', value5Years: 83.53 },
  { state: 'AM', value5Years: 95.02 },
  { state: 'AP', value5Years: 105.40 },
  { state: 'BA', value5Years: 40.00 },
  { state: 'CE', value5Years: 47.00 },
  { state: 'DF', value5Years: 42.39 },
  { state: 'ES', value5Years: 49.39 },
  { state: 'GO', value5Years: 90.34 },
  { state: 'MA', value5Years: 78.14 },
  { state: 'MG', value5Years: 63.46 },
  { state: 'MS', value5Years: 35.65 },
  { state: 'MT', value5Years: 51.50 },
  { state: 'PA', value5Years: 116.00 },
  { state: 'PB', value5Years: 45.45 },
  { state: 'PE', value5Years: 24.27 },
  { state: 'PI', value5Years: 37.33 },
  { state: 'PR', value5Years: 26.99 },
  { state: 'RJ', value5Years: 43.96 },
  { state: 'RN', value5Years: 33.48 },
  { state: 'RO', value5Years: 25.36 },
  { state: 'RR', value5Years: 70.00 },
  { state: 'RS', value5Years: 44.08 },
  { state: 'SC', value5Years: 24.94 },
  { state: 'SE', value5Years: 73.30 },
  { state: 'SP', value5Years: 18.62 },
  { state: 'TO', value5Years: 57.28 },
]

// Valores padrão para todas as taxas
const DEFAULT_BOLETO_FEE = 0.87
const DEFAULT_LUCRO_FEE = 30.00
const DEFAULT_TAX_PERCENTAGE = 6.00

function calculateFinalValue(value5Years: number): { taxValue: number; serviceValue: number; finalValue: number } {
  // serviceValue = value5Years + lucroFee
  const serviceValue = Number((value5Years + DEFAULT_LUCRO_FEE).toFixed(2))

  // taxValue = serviceValue * taxPercentage / 100
  const taxValue = Number((serviceValue * DEFAULT_TAX_PERCENTAGE / 100).toFixed(2))

  // finalValue = serviceValue + taxValue
  const finalValue = Number((serviceValue + taxValue).toFixed(2))

  return { taxValue, serviceValue, finalValue }
}

export async function seedEmoluments() {
  console.log('🌱 Seeding Certificate Emoluments...')

  let createdCount = 0
  let updatedCount = 0
  let skippedCount = 0

  for (const emolument of emolumentsByState) {
    try {
      // Calculate tax and final value
      const { taxValue, serviceValue, finalValue } = calculateFinalValue(emolument.value5Years)

      // Check if emolument already exists for this state
      const existing = await prisma.certificateEmolument.findUnique({
        where: { state: emolument.state }
      })

      if (existing) {
        // Always update to ensure all fields are correct
        await prisma.certificateEmolument.update({
          where: { state: emolument.state },
          data: {
            value5Years: emolument.value5Years,
            boletoFee: DEFAULT_BOLETO_FEE,
            lucroFee: DEFAULT_LUCRO_FEE,
            serviceValue,
            taxPercentage: DEFAULT_TAX_PERCENTAGE,
            taxValue,
            finalValue,
          }
        })
        console.log(`  ✏️  Updated emolument for ${emolument.state}: R$ ${emolument.value5Years.toFixed(2)} → Service: R$ ${serviceValue.toFixed(2)} → Final: R$ ${finalValue.toFixed(2)}`)
        updatedCount++
      } else {
        // Create new emolument
        await prisma.certificateEmolument.create({
          data: {
            state: emolument.state,
            value5Years: emolument.value5Years,
            boletoFee: DEFAULT_BOLETO_FEE,
            lucroFee: DEFAULT_LUCRO_FEE,
            serviceValue,
            taxPercentage: DEFAULT_TAX_PERCENTAGE,
            taxValue,
            finalValue,
          }
        })
        console.log(`  ✅ Created emolument for ${emolument.state}: R$ ${emolument.value5Years.toFixed(2)} → Service: R$ ${serviceValue.toFixed(2)} → Final: R$ ${finalValue.toFixed(2)}`)
        createdCount++
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${emolument.state}:`, error)
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`   ✅ Created: ${createdCount}`)
  console.log(`   ✏️  Updated: ${updatedCount}`)
  console.log(`   ⏭️  Skipped: ${skippedCount}`)
  console.log(`   📍 Total states: ${emolumentsByState.length}`)
  console.log('🌟 Certificate Emoluments seeded successfully!')
}

// Run if called directly
if (require.main === module) {
  seedEmoluments()
    .catch((e) => {
      console.error('❌ Error seeding emoluments:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
