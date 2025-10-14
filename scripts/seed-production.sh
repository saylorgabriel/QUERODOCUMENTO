#!/bin/bash

# Script para fazer seed do banco de dados em produção via API
# Uso: ./scripts/seed-production.sh

set -e

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🌱 QUERODOCUMENTO - Production Database Seed${NC}"
echo ""

# Verificar se as variáveis estão definidas
if [ -z "$SEED_SECRET" ]; then
  echo -e "${RED}❌ Error: SEED_SECRET environment variable is not set${NC}"
  echo ""
  echo "Configure a variável SEED_SECRET:"
  echo "  export SEED_SECRET='your-secret-here'"
  echo ""
  exit 1
fi

if [ -z "$PRODUCTION_URL" ]; then
  echo -e "${YELLOW}⚠️  PRODUCTION_URL not set, using default${NC}"
  PRODUCTION_URL="https://querodocumento.vercel.app"
fi

echo "Production URL: $PRODUCTION_URL"
echo ""

# Confirmar antes de executar
echo -e "${YELLOW}⚠️  This will seed the PRODUCTION database!${NC}"
echo "This action will create demo and admin users."
echo ""
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo -e "${RED}❌ Aborted${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}🚀 Sending seed request...${NC}"

# Executar seed via API
response=$(curl -s -w "\n%{http_code}" -X POST "$PRODUCTION_URL/api/admin/seed" \
  -H "Authorization: Bearer $SEED_SECRET" \
  -H "Content-Type: application/json")

# Separar body e status code
http_body=$(echo "$response" | head -n -1)
http_code=$(echo "$response" | tail -n 1)

echo ""

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ Seed completed successfully!${NC}"
  echo ""
  echo "Response:"
  echo "$http_body" | jq '.' 2>/dev/null || echo "$http_body"
  echo ""
  echo -e "${GREEN}📝 Default credentials:${NC}"
  echo "  Demo User:"
  echo "    Email: demo@querodocumento.com"
  echo "    Password: 123456"
  echo ""
  echo "  Admin User:"
  echo "    Email: admin@querodocumento.com"
  echo "    Password: admin123456"
  echo ""
  echo -e "${YELLOW}⚠️  IMPORTANT: Change these passwords after first login!${NC}"
else
  echo -e "${RED}❌ Seed failed with status code: $http_code${NC}"
  echo ""
  echo "Response:"
  echo "$http_body" | jq '.' 2>/dev/null || echo "$http_body"
  exit 1
fi
