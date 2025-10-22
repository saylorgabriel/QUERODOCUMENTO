/**
 * Script to seed database with locations from CSV files
 * Run with: bun run scripts/seed-locations.js
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// State mapping
const stateMapping = {
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
};

// Helper function to slugify strings
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/--+/g, '-') // Replace multiple - with single -
    .trim();
}

// Parse CSV file
function parseCSV(filePath, stateCode) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  // Skip header
  const dataLines = lines.slice(1);

  const citiesMap = new Map();

  dataLines.forEach(line => {
    // Split by semicolon
    const parts = line.split(';');
    if (parts.length < 3) return;

    const city = parts[1]?.trim();
    const notaryName = parts[2]?.trim();

    if (!city || !notaryName) return;

    // Initialize city if not exists
    if (!citiesMap.has(city)) {
      citiesMap.set(city, {
        name: city,
        slug: slugify(city),
        notaries: []
      });
    }

    // Add notary to city
    const cityData = citiesMap.get(city);

    // Check if notary already exists (avoid duplicates)
    const exists = cityData.notaries.some(n => n.name === notaryName);
    if (!exists) {
      cityData.notaries.push({
        name: notaryName,
        slug: slugify(notaryName + '-' + city),
        address: `${city} - ${stateCode}`,
      });
    }
  });

  return Array.from(citiesMap.values());
}

// Main seed function
async function seedLocations() {
  const bdEstadosPath = path.join(__dirname, '..', 'BD Estados');

  console.log('🌱 Starting location seed...');
  console.log('📂 Reading CSV files from:', bdEstadosPath);

  try {
    // Clear existing data
    console.log('\n🗑️  Clearing existing location data...');
    await prisma.notary.deleteMany();
    await prisma.city.deleteMany();
    await prisma.state.deleteMany();
    console.log('✅ Existing data cleared');

    let totalStates = 0;
    let totalCities = 0;
    let totalNotaries = 0;

    // Process each state
    for (const [code, stateInfo] of Object.entries(stateMapping)) {
      const csvPath = path.join(bdEstadosPath, `${code} - Protesto.csv`);
      const altCsvPath = path.join(bdEstadosPath, `${code}- Protesto.csv`);

      let filePath = csvPath;
      if (!fs.existsSync(csvPath) && fs.existsSync(altCsvPath)) {
        filePath = altCsvPath;
      }

      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  CSV not found for ${code}: ${filePath}`);
        continue;
      }

      console.log(`\n📍 Processing ${code} - ${stateInfo.name}...`);

      try {
        // Parse CSV
        const cities = parseCSV(filePath, code);

        // Create state
        const state = await prisma.state.create({
          data: {
            code: stateInfo.code,
            name: stateInfo.name,
            slug: stateInfo.id,
          }
        });

        console.log(`   ✅ State created: ${state.name}`);
        totalStates++;

        // Create cities and notaries
        for (const cityData of cities) {
          const city = await prisma.city.create({
            data: {
              stateId: state.id,
              name: cityData.name,
              slug: cityData.slug,
            }
          });

          totalCities++;

          // Create notaries
          for (const notaryData of cityData.notaries) {
            await prisma.notary.create({
              data: {
                cityId: city.id,
                name: notaryData.name,
                slug: notaryData.slug,
                address: notaryData.address,
              }
            });

            totalNotaries++;
          }
        }

        console.log(`   ✅ ${cities.length} cities and ${cities.reduce((sum, c) => sum + c.notaries.length, 0)} notaries created`);

      } catch (error) {
        console.error(`   ❌ Error processing ${code}:`, error.message);
      }
    }

    console.log('\n✅ Seed completed successfully!');
    console.log(`📊 Total states: ${totalStates}`);
    console.log(`📊 Total cities: ${totalCities}`);
    console.log(`📊 Total notaries: ${totalNotaries}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run
seedLocations()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });
