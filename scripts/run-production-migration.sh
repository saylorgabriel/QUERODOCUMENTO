#!/bin/bash

# Script para rodar migrations no banco de produção
# Uso: ./scripts/run-production-migration.sh

set -e

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 QUERODOCUMENTO - Run Production Migrations${NC}"
echo ""

# Verificar se a DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
  echo -e "${RED}❌ Error: DATABASE_URL environment variable is not set${NC}"
  echo ""
  echo "Você pode obter a URL do banco de duas formas:"
  echo ""
  echo "1. Via Vercel CLI:"
  echo "   ${BLUE}vercel env pull .env.production${NC}"
  echo "   ${BLUE}export DATABASE_URL=\$(grep DATABASE_URL .env.production | cut -d '=' -f2-)${NC}"
  echo ""
  echo "2. Ou exportar diretamente:"
  echo "   ${BLUE}export DATABASE_URL='postgresql://...'${NC}"
  echo ""
  exit 1
fi

echo "Database URL configured: ${DATABASE_URL:0:30}..."
echo ""

# Confirmar antes de executar
echo -e "${YELLOW}⚠️  This will run migrations on the PRODUCTION database!${NC}"
echo "This action will create/modify database tables."
echo ""
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo -e "${RED}❌ Aborted${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}🚀 Running migrations...${NC}"
echo ""

# Executar migrations
if bunx prisma migrate deploy; then
  echo ""
  echo -e "${GREEN}✅ Migrations completed successfully!${NC}"
  echo ""
  echo -e "${GREEN}📊 Database is ready${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Run seed to create initial users:"
  echo "   ${BLUE}./scripts/seed-production.sh${NC}"
  echo ""
  echo "2. Or test the application:"
  echo "   ${BLUE}curl https://seu-app.vercel.app/api/health/db${NC}"
else
  echo ""
  echo -e "${RED}❌ Migration failed!${NC}"
  echo ""
  echo "Check the error above and try again."
  echo "Common issues:"
  echo "- Wrong DATABASE_URL"
  echo "- Database not accessible"
  echo "- Conflicting schema changes"
  exit 1
fi
