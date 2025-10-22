#!/bin/bash

echo "🌱 Script de Seed de Cartórios em Produção"
echo "=========================================="
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI não encontrado!${NC}"
    echo "Instalando Vercel CLI..."
    bun install -g vercel
fi

echo -e "${GREEN}✅ Vercel CLI encontrado${NC}"
echo ""

# Passo 1: Login na Vercel
echo "📝 Passo 1: Login na Vercel"
echo "Por favor, faça login na Vercel quando solicitado..."
echo ""
vercel login

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha no login. Abortando.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login realizado com sucesso${NC}"
echo ""

# Passo 2: Puxar variáveis de ambiente
echo "📥 Passo 2: Baixando variáveis de ambiente de produção..."
vercel env pull .env.production.local --yes

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Falha ao baixar variáveis de ambiente. Abortando.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Variáveis de ambiente baixadas${NC}"
echo ""

# Verificar se DATABASE_URL existe
if ! grep -q "DATABASE_URL" .env.production.local 2>/dev/null; then
    # Tentar POSTGRES_URL
    if grep -q "POSTGRES_URL" .env.production.local 2>/dev/null; then
        echo -e "${YELLOW}ℹ️  Usando POSTGRES_URL como DATABASE_URL${NC}"
        DATABASE_URL=$(grep POSTGRES_URL .env.production.local | cut -d '=' -f2-)
    else
        echo -e "${RED}❌ DATABASE_URL não encontrada. Abortando.${NC}"
        exit 1
    fi
else
    DATABASE_URL=$(grep DATABASE_URL .env.production.local | cut -d '=' -f2-)
fi

# Passo 3: Confirmar ação
echo ""
echo -e "${YELLOW}⚠️  ATENÇÃO!${NC}"
echo "Você está prestes a popular o banco de dados de PRODUÇÃO."
echo "Isso irá:"
echo "  - Limpar todas as tabelas State, City e Notary existentes"
echo "  - Inserir 27 estados, 3.323 cidades e 3.756 cartórios"
echo "  - Pode levar de 5 a 15 minutos"
echo ""
read -p "Tem certeza que deseja continuar? (digite 'SIM' para confirmar): " confirm

if [ "$confirm" != "SIM" ]; then
    echo -e "${YELLOW}❌ Operação cancelada pelo usuário${NC}"
    exit 0
fi

# Passo 4: Executar seed
echo ""
echo -e "${GREEN}🌱 Iniciando seed do banco de produção...${NC}"
echo ""

# Exportar DATABASE_URL e executar script
export DATABASE_URL="$DATABASE_URL"
bun run scripts/seed-locations.js

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Seed concluído com sucesso!${NC}"
    echo ""
    echo "📊 Verificação:"
    echo "Acesse https://querodocumento-cpj6.vercel.app/certidao-protesto"
    echo "e verifique se os dropdowns de estado/cidade/cartório estão populados."
else
    echo ""
    echo -e "${RED}❌ Seed falhou!${NC}"
    echo "Verifique os logs acima para mais detalhes."
    exit 1
fi
