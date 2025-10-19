#!/bin/bash

# Script temporário para fazer seed em produção
# IMPORTANTE: Configure o SEED_SECRET abaixo ou como variável de ambiente

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🌱 Executando seed em produção...${NC}"
echo ""

# URL de produção
PRODUCTION_URL="https://querodocumento.vercel.app"

# SEED_SECRET - você precisa obter este valor da Vercel Dashboard
# Vá em: Settings → Environment Variables → SEED_SECRET
if [ -z "$SEED_SECRET" ]; then
  echo -e "${RED}❌ Erro: SEED_SECRET não configurado${NC}"
  echo ""
  echo "Por favor, configure a variável SEED_SECRET:"
  echo ""
  echo "1. Acesse: https://vercel.com/saylorgabriel/querodocumento/settings/environment-variables"
  echo "2. Encontre o valor de SEED_SECRET"
  echo "3. Execute:"
  echo "   ${YELLOW}export SEED_SECRET='valor-aqui'${NC}"
  echo "   ${YELLOW}./scripts/seed-production-now.sh${NC}"
  echo ""
  echo "OU execute diretamente:"
  echo "   ${YELLOW}SEED_SECRET='valor-aqui' ./scripts/seed-production-now.sh${NC}"
  echo ""
  exit 1
fi

echo "URL: $PRODUCTION_URL"
echo ""

# Executar seed
echo -e "${YELLOW}📤 Enviando requisição...${NC}"
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST "$PRODUCTION_URL/api/admin/seed" \
  -H "Authorization: Bearer $SEED_SECRET" \
  -H "Content-Type: application/json")

http_body=$(echo "$response" | head -n -1)
http_code=$(echo "$response" | tail -n 1)

echo ""

if [ "$http_code" = "200" ]; then
  echo -e "${GREEN}✅ Seed executado com sucesso!${NC}"
  echo ""
  echo "Resposta:"
  echo "$http_body" | jq '.' 2>/dev/null || echo "$http_body"
  echo ""
  echo -e "${GREEN}📝 Credenciais criadas:${NC}"
  echo ""
  echo "  ${GREEN}Admin:${NC}"
  echo "    Email: admin@querodocumento.com"
  echo "    Senha: admin123456"
  echo ""
  echo "  ${GREEN}Demo:${NC}"
  echo "    Email: demo@querodocumento.com"
  echo "    Senha: 123456"
  echo ""
  echo -e "${YELLOW}⚠️  Altere essas senhas após o primeiro login!${NC}"
  echo ""
else
  echo -e "${RED}❌ Falha ao executar seed (HTTP $http_code)${NC}"
  echo ""
  echo "Resposta:"
  echo "$http_body" | jq '.' 2>/dev/null || echo "$http_body"
  echo ""

  if [ "$http_code" = "401" ]; then
    echo -e "${YELLOW}💡 Dica: Verifique se o SEED_SECRET está correto${NC}"
  fi

  exit 1
fi
