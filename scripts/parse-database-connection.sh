#!/bin/bash

# Script para extrair dados da connection string do Neon
# Para usar com pgAdmin

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== NEON DATABASE - Dados para pgAdmin ===${NC}"
echo ""

# Tentar obter DATABASE_URL do .env
if [ -f .env ]; then
    DATABASE_URL=$(grep "^DATABASE_URL" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'" | xargs)
fi

# Se não encontrou, pedir ao usuário
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}DATABASE_URL não encontrado no .env${NC}"
    echo ""
    echo "Cole a connection string do Neon aqui:"
    echo "(Obtenha em: Vercel → Storage → Neon → Connection String)"
    echo ""
    read -p "Connection String: " DATABASE_URL
    echo ""
fi

echo -e "${GREEN}Connection String completa:${NC}"
echo "$DATABASE_URL"
echo ""

# Parse da URL usando regex
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:/]+):?([0-9]*)/([^\?]+) ]]; then
    USERNAME="${BASH_REMATCH[1]}"
    PASSWORD="${BASH_REMATCH[2]}"
    HOST="${BASH_REMATCH[3]}"
    PORT="${BASH_REMATCH[4]:-5432}"
    DATABASE="${BASH_REMATCH[5]}"

    echo -e "${GREEN}=== Configuração para pgAdmin 4 ===${NC}"
    echo ""
    echo -e "${BLUE}Aba 'General':${NC}"
    echo "  Name: Querodocumento - Neon (Production)"
    echo ""
    echo -e "${BLUE}Aba 'Connection':${NC}"
    echo "  Host name/address: $HOST"
    echo "  Port:              $PORT"
    echo "  Maintenance DB:    $DATABASE"
    echo "  Username:          $USERNAME"
    echo "  Password:          $PASSWORD"
    echo ""
    echo -e "${BLUE}Aba 'SSL':${NC}"
    echo "  SSL mode:          Require"
    echo ""
    echo -e "${YELLOW}☑ Marque 'Save password' para não precisar digitar sempre${NC}"
    echo ""

    # Salvar em arquivo temporário para copiar facilmente
    cat > /tmp/neon-pgadmin-config.txt << EOF
=== Configuração pgAdmin ===

Nome: Querodocumento - Neon (Production)

Connection:
  Host: $HOST
  Port: $PORT
  Database: $DATABASE
  Username: $USERNAME
  Password: $PASSWORD

SSL:
  Mode: Require

Connection String:
$DATABASE_URL
EOF

    echo -e "${GREEN}✅ Configuração salva em: /tmp/neon-pgadmin-config.txt${NC}"
    echo ""
    echo -e "${BLUE}Passos:${NC}"
    echo "1. Abra pgAdmin 4"
    echo "2. Clique com botão direito em 'Servers' → Register → Server"
    echo "3. Preencha com os dados acima"
    echo "4. Clique em 'Save'"
    echo ""

else
    echo -e "${YELLOW}⚠️ Não foi possível parsear a connection string${NC}"
    echo "Formato esperado: postgresql://user:pass@host:port/database"
    echo ""
    echo "Verifique se a string está correta e tente novamente."
    exit 1
fi
