#!/bin/bash

# QUERODOCUMENTO - Script de Configuração para Produção
# ========================================================
# Este script ajuda a validar se todas as configurações
# necessárias estão presentes antes do deploy

echo "🔐 QUERODOCUMENTO - Validação de Configuração de Produção"
echo "=========================================================="
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de erros
errors=0
warnings=0

# Função para verificar variável de ambiente
check_env() {
    local var_name=$1
    local var_value=${!var_name}
    local is_critical=$2

    if [ -z "$var_value" ]; then
        if [ "$is_critical" = "true" ]; then
            echo -e "${RED}✗${NC} $var_name - AUSENTE (CRÍTICO)"
            ((errors++))
        else
            echo -e "${YELLOW}⚠${NC} $var_name - AUSENTE (Opcional)"
            ((warnings++))
        fi
    else
        # Verificar se não é valor de exemplo
        if [[ "$var_value" == *"your-"* ]] || [[ "$var_value" == *"exemplo"* ]] || [[ "$var_value" == *"querodoc123"* ]]; then
            echo -e "${YELLOW}⚠${NC} $var_name - Valor de exemplo detectado"
            ((warnings++))
        else
            echo -e "${GREEN}✓${NC} $var_name - OK"
        fi
    fi
}

echo "Verificando variáveis de ambiente obrigatórias..."
echo ""

# Database
echo "📦 BANCO DE DADOS:"
check_env "DATABASE_URL" "true"
check_env "POSTGRES_PASSWORD" "true"
echo ""

# Redis
echo "🔴 REDIS (Recomendado para Rate Limiting):"
check_env "REDIS_URL" "false"
echo ""

# NextAuth
echo "🔐 AUTENTICAÇÃO:"
check_env "NEXTAUTH_URL" "true"
check_env "NEXTAUTH_SECRET" "true"
check_env "JWT_SECRET" "true"
check_env "ENCRYPTION_KEY" "true"
echo ""

# ASAAS
echo "💳 GATEWAY DE PAGAMENTO ASAAS:"
check_env "ASAAS_API_KEY" "true"
check_env "ASAAS_WEBHOOK_TOKEN" "true"
check_env "ASAAS_ENVIRONMENT" "true"
echo ""

# Email
echo "📧 SERVIÇO DE EMAIL:"
check_env "EMAIL_PRIMARY_PROVIDER" "true"
check_env "EMAIL_FROM" "true"
check_env "SENDGRID_API_KEY" "false"
check_env "MAILGUN_API_KEY" "false"
check_env "RESEND_API_KEY" "false"
echo ""

# Rate Limiting
echo "🛡️ RATE LIMITING:"
check_env "RATE_LIMIT_ENABLED" "false"
echo ""

# Application
echo "🌐 APPLICATION:"
check_env "APP_URL" "true"
check_env "NODE_ENV" "true"
echo ""

# Verificações adicionais
echo "=========================================================="
echo "Verificações Adicionais:"
echo ""

# Verificar se NODE_ENV é production
if [ "$NODE_ENV" != "production" ]; then
    echo -e "${YELLOW}⚠${NC} NODE_ENV não está definido como 'production'"
    ((warnings++))
else
    echo -e "${GREEN}✓${NC} NODE_ENV configurado como 'production'"
fi

# Verificar se ASAAS_ENVIRONMENT é production
if [ "$ASAAS_ENVIRONMENT" != "production" ]; then
    echo -e "${YELLOW}⚠${NC} ASAAS_ENVIRONMENT não está como 'production' (vai usar sandbox)"
    ((warnings++))
else
    echo -e "${GREEN}✓${NC} ASAAS_ENVIRONMENT configurado como 'production'"
fi

# Verificar se Prisma Client foi gerado
if [ -d "node_modules/@prisma/client" ]; then
    echo -e "${GREEN}✓${NC} Prisma Client encontrado"
else
    echo -e "${RED}✗${NC} Prisma Client não encontrado. Execute: bun prisma generate"
    ((errors++))
fi

# Verificar se existe build
if [ -d ".next" ]; then
    echo -e "${GREEN}✓${NC} Build Next.js encontrado"
else
    echo -e "${YELLOW}⚠${NC} Build Next.js não encontrado. Execute: bun run build"
    ((warnings++))
fi

echo ""
echo "=========================================================="
echo "RESULTADO DA VALIDAÇÃO:"
echo "=========================================================="

if [ $errors -eq 0 ]; then
    echo -e "${GREEN}✓ Todas as configurações críticas estão presentes!${NC}"
else
    echo -e "${RED}✗ $errors erro(s) crítico(s) encontrado(s)${NC}"
fi

if [ $warnings -gt 0 ]; then
    echo -e "${YELLOW}⚠ $warnings aviso(s) encontrado(s)${NC}"
fi

echo ""

if [ $errors -eq 0 ]; then
    echo "=========================================================="
    echo "PRÓXIMOS PASSOS PARA DEPLOY:"
    echo "=========================================================="
    echo "1. Configure o token no Dashboard ASAAS:"
    echo "   - URL: Configurações → Webhooks"
    echo "   - Webhook URL: https://seudominio.com/api/webhooks/asaas"
    echo "   - Token: \$ASAAS_WEBHOOK_TOKEN"
    echo ""
    echo "2. Execute as migrations no banco de produção:"
    echo "   bun prisma migrate deploy"
    echo ""
    echo "3. Execute seed de localizações (se necessário):"
    echo "   curl -X POST https://seudominio.com/api/admin/seed-locations \\"
    echo "     -H \"Authorization: Bearer \$SEED_SECRET\""
    echo ""
    echo "4. Faça build de produção:"
    echo "   bun run build"
    echo ""
    echo "5. Inicie o servidor:"
    echo "   bun run start"
    echo ""
    echo "6. Teste a segurança:"
    echo "   - Teste webhook: https://securityheaders.com/"
    echo "   - Teste rate limiting no login (6 tentativas)"
    echo ""
    echo "✅ SISTEMA PRONTO PARA PRODUÇÃO!"
else
    echo "❌ CORRIJA OS ERROS ANTES DE FAZER DEPLOY!"
    exit 1
fi

exit 0
