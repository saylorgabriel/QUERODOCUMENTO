/**
 * Script to generate locations.ts from CSV files in "BD Estados" folder
 * Run with: node scripts/generate-locations.js
 */

const fs = require('fs');
const path = require('path');

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
    // Parse CSV line properly (handle quoted fields with semicolons)
    const parts = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote (two double quotes) - but NOT if followed by a third quote
          const thirdChar = line[i + 2];
          if (thirdChar === '"') {
            // Three quotes: first two are escape, third closes the field
            current += '"';
            i += 2; // Skip the next two quotes
            inQuotes = false; // Close quotes
          } else {
            // Two quotes: escaped quote
            current += '"';
            i++; // Skip next quote
          }
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
        }
      } else if (char === ';' && !inQuotes) {
        // Field separator
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim()); // Add last field

    if (parts.length < 3) return;

    // Clean data - remove leading/trailing quotes AND all internal quotes
    const city = parts[1]?.trim().replace(/^"|"$/g, '').replace(/"/g, '');
    const notaryName = parts[2]?.trim().replace(/^"|"$/g, '').replace(/"/g, '');

    if (!city || !notaryName) return;

    // Initialize city if not exists
    if (!citiesMap.has(city)) {
      citiesMap.set(city, {
        id: slugify(city),
        name: city,
        notaries: []
      });
    }

    // Add notary to city
    const cityData = citiesMap.get(city);
    const notaryId = `${slugify(notaryName)}-${slugify(city)}-${stateCode.toLowerCase()}`;

    // Check if notary already exists (avoid duplicates)
    const exists = cityData.notaries.some(n => n.name === notaryName);
    if (!exists) {
      cityData.notaries.push({
        id: notaryId,
        name: notaryName,
        address: `${city} - ${stateCode}`,
        phone: undefined
      });
    }
  });

  return Array.from(citiesMap.values());
}

// Main function
function generateLocations() {
  const bdEstadosPath = path.join(__dirname, '..', 'BD Estados');
  const outputPath = path.join(__dirname, '..', 'src', 'data', 'locations.ts');

  console.log('🔍 Reading CSV files from:', bdEstadosPath);

  const states = [];

  // Process each state
  Object.entries(stateMapping).forEach(([code, stateInfo]) => {
    const csvPath = path.join(bdEstadosPath, `${code} - Protesto.csv`);

    // Check alternative filename (PE and PR have different naming)
    const altCsvPath = path.join(bdEstadosPath, `${code}- Protesto.csv`);

    let filePath = csvPath;
    if (!fs.existsSync(csvPath) && fs.existsSync(altCsvPath)) {
      filePath = altCsvPath;
    }

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  CSV not found for ${code}: ${filePath}`);
      // Add empty state
      states.push({
        ...stateInfo,
        cities: []
      });
      return;
    }

    console.log(`✅ Processing ${code} - ${stateInfo.name}`);

    try {
      const cities = parseCSV(filePath, code);
      console.log(`   → Found ${cities.length} cities with ${cities.reduce((sum, c) => sum + c.notaries.length, 0)} notaries`);

      states.push({
        ...stateInfo,
        cities
      });
    } catch (error) {
      console.error(`❌ Error processing ${code}:`, error.message);
      states.push({
        ...stateInfo,
        cities: []
      });
    }
  });

  // Sort states by name
  states.sort((a, b) => a.name.localeCompare(b.name));

  // Generate TypeScript file
  const tsContent = `export interface Notary {
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

export const locations: State[] = ${JSON.stringify(states, null, 2)
  .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys
  .replace(/: "([^"]*)"/g, (_match, p1) => {
    // Clean and escape string values for JavaScript
    // Remove any problematic characters from CSV parsing
    const cleaned = p1
      .replace(/\\+/g, '')      // Remove backslashes
      .replace(/"+/g, '')       // Remove all double quotes
      .replace(/`/g, '')        // Remove backticks (for template literal safety)
      .replace(/\$/g, '')       // Remove dollar signs (for template literal safety)
    return `: '${cleaned.replace(/'/g, "\\'")}'` // Escape single quotes last
  })
  .replace(/: undefined/g, '') // Remove undefined values
}

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
`;

  fs.writeFileSync(outputPath, tsContent, 'utf-8');

  console.log('\n✅ locations.ts generated successfully!');
  console.log(`📁 Output: ${outputPath}`);
  console.log(`📊 Total states: ${states.length}`);
  console.log(`📊 Total cities: ${states.reduce((sum, s) => sum + s.cities.length, 0)}`);
  console.log(`📊 Total notaries: ${states.reduce((sum, s) => sum + s.cities.reduce((cSum, c) => cSum + c.notaries.length, 0), 0)}`);
}

// Run
try {
  generateLocations();
} catch (error) {
  console.error('❌ Fatal error:', error);
  process.exit(1);
}
