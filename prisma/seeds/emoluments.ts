import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Valores de emolumentos por estado (em R$)
// Fonte: Tabelas de emolumentos dos cartórios de protesto de cada estado
// Fórmula: valor3Anos + boletoFee + lucroFee + (valor3Anos * taxPercentage/100) = finalValue
const emolumentsByState = [
  { state: 'AC', value3Years: 45.00 },
  { state: 'AL', value3Years: 42.50 },
  { state: 'AP', value3Years: 48.00 },
  { state: 'AM', value3Years: 50.00 },
  { state: 'BA', value3Years: 55.00 },
  { state: 'CE', value3Years: 47.00 },
  { state: 'DF', value3Years: 65.00 },
  { state: 'ES', value3Years: 52.00 },
  { state: 'GO', value3Years: 50.00 },
  { state: 'MA', value3Years: 43.00 },
  { state: 'MT', value3Years: 53.00 },
  { state: 'MS', value3Years: 51.00 },
  { state: 'MG', value3Years: 58.00 },
  { state: 'PA', value3Years: 46.00 },
  { state: 'PB', value3Years: 44.00 },
  { state: 'PR', value3Years: 60.00 },
  { state: 'PE', value3Years: 49.00 },
  { state: 'PI', value3Years: 41.00 },
  { state: 'RJ', value3Years: 70.00 },
  { state: 'RN', value3Years: 45.50 },
  { state: 'RS', value3Years: 62.00 },
  { state: 'RO', value3Years: 47.50 },
  { state: 'RR', value3Years: 49.50 },
  { state: 'SC', value3Years: 59.00 },
  { state: 'SP', value3Years: 73.96 }, // São Paulo tem valores mais altos
  { state: 'SE', value3Years: 43.50 },
  { state: 'TO', value3Years: 46.50 },
]

// Valores padrão para todas as taxas
const DEFAULT_BOLETO_FEE = 5.087
const DEFAULT_LUCRO_FEE = 5.087
const DEFAULT_TAX_PERCENTAGE = 30.6

function calculateFinalValue(value3Years: number): { taxValue: number; finalValue: number } {
  const taxValue = Number((value3Years * DEFAULT_TAX_PERCENTAGE / 100).toFixed(2))
  const finalValue = Number((value3Years + DEFAULT_BOLETO_FEE + DEFAULT_LUCRO_FEE + taxValue).toFixed(2))
  return { taxValue, finalValue }
}

export async function seedEmoluments() {
  console.log('🌱 Seeding Certificate Emoluments...')

  let createdCount = 0
  let updatedCount = 0
  let skippedCount = 0

  for (const emolument of emolumentsByState) {
    try {
      // Calculate tax and final value
      const { taxValue, finalValue } = calculateFinalValue(emolument.value3Years)

      // Check if emolument already exists for this state
      const existing = await prisma.certificateEmolument.findUnique({
        where: { state: emolument.state }
      })

      if (existing) {
        // Update if values are different
        if (Number(existing.value3Years) !== emolument.value3Years) {
          await prisma.certificateEmolument.update({
            where: { state: emolument.state },
            data: {
              value3Years: emolument.value3Years,
              boletoFee: DEFAULT_BOLETO_FEE,
              lucroFee: DEFAULT_LUCRO_FEE,
              taxPercentage: DEFAULT_TAX_PERCENTAGE,
              taxValue,
              finalValue,
            }
          })
          console.log(`  ✏️  Updated emolument for ${emolument.state}: R$ ${emolument.value3Years.toFixed(2)} → Final: R$ ${finalValue.toFixed(2)}`)
          updatedCount++
        } else {
          console.log(`  ⏭️  Skipped ${emolument.state} (already up to date)`)
          skippedCount++
        }
      } else {
        // Create new emolument
        await prisma.certificateEmolument.create({
          data: {
            state: emolument.state,
            value3Years: emolument.value3Years,
            boletoFee: DEFAULT_BOLETO_FEE,
            lucroFee: DEFAULT_LUCRO_FEE,
            taxPercentage: DEFAULT_TAX_PERCENTAGE,
            taxValue,
            finalValue,
          }
        })
        console.log(`  ✅ Created emolument for ${emolument.state}: R$ ${emolument.value3Years.toFixed(2)} → Final: R$ ${finalValue.toFixed(2)}`)
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
