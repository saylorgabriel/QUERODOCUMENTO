import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

// Dados extraídos da planilha Emolumentos.xlsx
// Valores para solicitação de certidão de protesto por estado
const certificateEmoluments: Prisma.CertificateEmolumentCreateInput[] = [
  {
    state: 'AC',
    value5Years: new Prisma.Decimal('54.90'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('5.09'),
    finalValue: new Prisma.Decimal('89.90')
  },
  {
    state: 'AL',
    value5Years: new Prisma.Decimal('83.53'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('6.81'),
    finalValue: new Prisma.Decimal('113.53')
  },
  {
    state: 'AM',
    value5Years: new Prisma.Decimal('95.02'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('7.50'),
    finalValue: new Prisma.Decimal('125.02')
  },
  {
    state: 'AP',
    value5Years: new Prisma.Decimal('105.40'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('8.12'),
    finalValue: new Prisma.Decimal('135.40')
  },
  {
    state: 'BA',
    value5Years: new Prisma.Decimal('40.00'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('4.20'),
    finalValue: new Prisma.Decimal('70.00')
  },
  {
    state: 'CE',
    value5Years: new Prisma.Decimal('47.00'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('4.62'),
    finalValue: new Prisma.Decimal('77.00')
  },
  {
    state: 'DF',
    value5Years: new Prisma.Decimal('42.39'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('4.34'),
    finalValue: new Prisma.Decimal('72.39')
  },
  {
    state: 'ES',
    value5Years: new Prisma.Decimal('49.39'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('4.76'),
    finalValue: new Prisma.Decimal('79.39')
  },
  {
    state: 'GO',
    value5Years: new Prisma.Decimal('90.34'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('7.22'),
    finalValue: new Prisma.Decimal('127.56')
  },
  {
    state: 'MA',
    value5Years: new Prisma.Decimal('78.14'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('6.49'),
    finalValue: new Prisma.Decimal('108.14')
  },
  {
    state: 'MG',
    value5Years: new Prisma.Decimal('63.46'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('5.61'),
    finalValue: new Prisma.Decimal('93.46')
  },
  {
    state: 'MS',
    value5Years: new Prisma.Decimal('35.65'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('3.94'),
    finalValue: new Prisma.Decimal('65.65')
  },
  {
    state: 'MT',
    value5Years: new Prisma.Decimal('51.90'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('4.89'),
    finalValue: new Prisma.Decimal('81.50')
  },
  {
    state: 'PA',
    value5Years: new Prisma.Decimal('116.00'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('8.76'),
    finalValue: new Prisma.Decimal('146.00')
  },
  {
    state: 'PB',
    value5Years: new Prisma.Decimal('45.45'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('4.53'),
    finalValue: new Prisma.Decimal('75.45')
  },
  {
    state: 'PE',
    value5Years: new Prisma.Decimal('24.27'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('3.26'),
    finalValue: new Prisma.Decimal('54.27')
  },
  {
    state: 'PI',
    value5Years: new Prisma.Decimal('37.33'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('4.04'),
    finalValue: new Prisma.Decimal('67.33')
  },
  {
    state: 'PR',
    value5Years: new Prisma.Decimal('26.99'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('3.42'),
    finalValue: new Prisma.Decimal('56.99')
  },
  {
    state: 'RJ',
    value5Years: new Prisma.Decimal('43.96'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('4.44'),
    finalValue: new Prisma.Decimal('73.96')
  },
  {
    state: 'RN',
    value5Years: new Prisma.Decimal('33.48'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('3.81'),
    finalValue: new Prisma.Decimal('63.48')
  },
  {
    state: 'RO',
    value5Years: new Prisma.Decimal('25.36'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('3.32'),
    finalValue: new Prisma.Decimal('55.36')
  },
  {
    state: 'RR',
    value5Years: new Prisma.Decimal('70.00'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('6.00'),
    finalValue: new Prisma.Decimal('100.00')
  },
  {
    state: 'RS',
    value5Years: new Prisma.Decimal('44.08'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('4.44'),
    finalValue: new Prisma.Decimal('74.08')
  },
  {
    state: 'SC',
    value5Years: new Prisma.Decimal('24.94'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('3.30'),
    finalValue: new Prisma.Decimal('54.94')
  },
  {
    state: 'SE',
    value5Years: new Prisma.Decimal('73.30'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('6.20'),
    finalValue: new Prisma.Decimal('103.30')
  },
  {
    state: 'SP',
    value5Years: new Prisma.Decimal('18.62'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('2.92'),
    finalValue: new Prisma.Decimal('48.62')
  },
  {
    state: 'TO',
    value5Years: new Prisma.Decimal('57.28'),
    boletoFee: new Prisma.Decimal('5.087'),
    lucroFee: new Prisma.Decimal('5.087'),
    taxPercentage: new Prisma.Decimal('6'),
    taxValue: new Prisma.Decimal('5.24'),
    finalValue: new Prisma.Decimal('87.28')
  }
]

export async function seedCertificateEmoluments() {
  console.log('🌱 Seeding certificate emoluments...')

  for (const emolument of certificateEmoluments) {
    await prisma.certificateEmolument.upsert({
      where: { state: emolument.state },
      update: emolument,
      create: emolument
    })
    console.log(`✓ ${emolument.state}: R$ ${emolument.finalValue}`)
  }

  console.log('✅ Certificate emoluments seeded successfully!')
}

// Execute if run directly
if (require.main === module) {
  seedCertificateEmoluments()
    .catch((e) => {
      console.error('❌ Error seeding certificate emoluments:', e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
