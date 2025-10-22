#!/bin/bash

# QUERODOCUMENTO - Configuração Automática de Variáveis de Ambiente na Vercel
# ============================================================================
# Este script configura TODAS as variáveis de segurança na Vercel automaticamente

echo "🚀 Configurando variáveis de ambiente na Vercel..."
echo "=================================================="
echo ""

# Verificar se está logado na Vercel
if ! vercel whoami &> /dev/null; then
    echo "❌ Você não está logado na Vercel CLI"
    echo "Execute primeiro: vercel login"
    exit 1
fi

echo "✅ Usuário Vercel autenticado"
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script na raiz do projeto QUERODOCUMENTO"
    exit 1
fi

echo "📝 Configurando variáveis de ambiente..."
echo ""

# Função para adicionar variável de ambiente
add_env() {
    local key=$1
    local value=$2
    local env_type=${3:-production,preview,development}

    echo "  Configurando: $key"
    echo "$value" | vercel env add "$key" "$env_type" --force > /dev/null 2>&1

    if [ $? -eq 0 ]; then
        echo "  ✅ $key configurado"
    else
        echo "  ⚠️  $key - erro ao configurar (pode já existir)"
    fi
}

# =============================================================================
# TOKENS DE SEGURANÇA (do arquivo PRODUCTION_SECRETS.txt)
# =============================================================================

echo "🔐 1. Tokens de Segurança..."
add_env "ASAAS_WEBHOOK_TOKEN" "4459e0518c34385a84f7187c85e911b68e931ae4bca992b7859d89c6cc40a152"
add_env "JWT_SECRET" "7ad02e0280f61f3f5059eb9f977f679b784adf8b39b52b1b2a6cf3e5d779ea23"
add_env "ENCRYPTION_KEY" "e8a3714b309f4d453dbe5fd688c5a49ab78530a17016fa5ea31ba52bc4d79709"
add_env "NEXTAUTH_SECRET" "010ab227c1e886d3131e783c5b1d4d69f1da5ef04273d62454b389c0f1749103"
add_env "SEED_SECRET" "4459e0518c34385a84f7187c85e911b68e931ae4bca992b7859d89c6cc40a152"
echo ""

# =============================================================================
# NEXTAUTH
# =============================================================================

echo "🔑 2. NextAuth Configuration..."
add_env "NEXTAUTH_URL" "https://querodocumento.vercel.app"
echo ""

# =============================================================================
# ASAAS (PRODUÇÃO)
# =============================================================================

echo "💳 3. ASAAS Payment Gateway..."
echo "⚠️  IMPORTANTE: Você precisa configurar ASAAS_API_KEY manualmente"
echo "   Execute: vercel env add ASAAS_API_KEY"
echo "   E cole sua API Key de PRODUÇÃO do ASAAS"
echo ""
add_env "ASAAS_ENVIRONMENT" "production"
echo ""

# =============================================================================
# DATABASE (Vercel Postgres)
# =============================================================================

echo "🗄️  4. Database Configuration..."
echo "⚠️  IMPORTANTE: Configuração do banco de dados"
echo ""
echo "Você tem 2 opções:"
echo ""
echo "OPÇÃO A - Usar Vercel Postgres (Recomendado):"
echo "  1. Acesse: https://vercel.com/saylorgabriels-projects/querodocumento/stores"
echo "  2. Clique em 'Create Database' → 'Postgres'"
echo "  3. Siga o wizard (escolha região próxima ao Brasil)"
echo "  4. A Vercel vai configurar DATABASE_URL automaticamente"
echo ""
echo "OPÇÃO B - Usar banco externo (Neon, Supabase, etc):"
echo "  Execute: vercel env add DATABASE_URL"
echo "  Cole a connection string do seu banco"
echo ""
read -p "Pressione ENTER para continuar..."
echo ""

# =============================================================================
# REDIS (Opcional mas recomendado)
# =============================================================================

echo "🔴 5. Redis Configuration (Rate Limiting)..."
echo "⚠️  RECOMENDADO: Configure Redis para rate limiting"
echo ""
echo "Opções:"
echo "  1. Vercel KV (Redis): https://vercel.com/saylorgabriels-projects/querodocumento/stores"
echo "  2. Upstash Redis: https://upstash.com/"
echo "  3. Redis Cloud: https://redis.io/cloud/"
echo ""
echo "Após criar, execute: vercel env add REDIS_URL"
echo ""
read -p "Pressione ENTER para continuar..."
echo ""

# =============================================================================
# EMAIL SERVICE
# =============================================================================

echo "📧 6. Email Service Configuration..."
echo "⚠️  IMPORTANTE: Configure provedor de email"
echo ""
add_env "EMAIL_PRIMARY_PROVIDER" "sendgrid"
add_env "EMAIL_FROM" "noreply@querodocumento.vercel.app"
add_env "EMAIL_REPLY_TO" "contato@querodocumento.vercel.app"
echo ""
echo "Configure a API Key do seu provedor de email:"
echo "  SendGrid: vercel env add SENDGRID_API_KEY"
echo "  Mailgun: vercel env add MAILGUN_API_KEY e MAILGUN_DOMAIN"
echo "  Resend: vercel env add RESEND_API_KEY"
echo ""
read -p "Pressione ENTER para continuar..."
echo ""

# =============================================================================
# RATE LIMITING
# =============================================================================

echo "🛡️  7. Rate Limiting Configuration..."
add_env "RATE_LIMIT_ENABLED" "true"
add_env "RATE_LIMIT_LOGIN_MAX" "5"
add_env "RATE_LIMIT_LOGIN_WINDOW" "900000"
add_env "RATE_LIMIT_REGISTER_MAX" "3"
add_env "RATE_LIMIT_REGISTER_WINDOW" "3600000"
add_env "RATE_LIMIT_FORGOT_PASSWORD_MAX" "3"
add_env "RATE_LIMIT_FORGOT_PASSWORD_WINDOW" "3600000"
add_env "RATE_LIMIT_RESET_PASSWORD_MAX" "5"
add_env "RATE_LIMIT_RESET_PASSWORD_WINDOW" "3600000"
add_env "RATE_LIMIT_PROTEST_QUERY_MAX" "10"
add_env "RATE_LIMIT_PROTEST_QUERY_WINDOW" "3600000"
add_env "RATE_LIMIT_ORDER_CREATE_MAX" "20"
add_env "RATE_LIMIT_ORDER_CREATE_WINDOW" "3600000"
add_env "RATE_LIMIT_PAYMENT_CREATE_MAX" "10"
add_env "RATE_LIMIT_PAYMENT_CREATE_WINDOW" "3600000"
add_env "RATE_LIMIT_WEBHOOK_MAX" "100"
add_env "RATE_LIMIT_WEBHOOK_WINDOW" "60000"
add_env "RATE_LIMIT_SEED_MAX" "1"
add_env "RATE_LIMIT_SEED_WINDOW" "3600000"
echo ""

# =============================================================================
# APPLICATION
# =============================================================================

echo "🌐 8. Application Configuration..."
add_env "APP_URL" "https://querodocumento.vercel.app"
add_env "NODE_ENV" "production"
echo ""

# =============================================================================
# EMAIL CONFIGURATION (Detalhada)
# =============================================================================

echo "📨 9. Email Service Settings..."
add_env "EMAIL_RATE_LIMIT_PER_MINUTE" "30"
add_env "EMAIL_RATE_LIMIT_PER_HOUR" "1000"
add_env "EMAIL_RATE_LIMIT_PER_DAY" "10000"
add_env "EMAIL_MAX_RETRY_ATTEMPTS" "3"
add_env "EMAIL_RETRY_BACKOFF_MULTIPLIER" "2"
add_env "EMAIL_INITIAL_RETRY_DELAY" "1000"
add_env "EMAIL_QUEUE_ENABLED" "true"
add_env "EMAIL_MAX_CONCURRENT" "10"
add_env "EMAIL_QUEUE_DELAY" "100"
add_env "EMAIL_LOG_TO_CONSOLE" "false"
add_env "EMAIL_LOG_EMAILS" "true"
add_env "EMAIL_LOG_RETENTION_DAYS" "365"
add_env "EMAIL_TRACK_DELIVERY" "true"
add_env "EMAIL_INCLUDE_UNSUBSCRIBE" "false"
echo ""

echo "=================================================="
echo "✅ CONFIGURAÇÃO BÁSICA CONCLUÍDA!"
echo "=================================================="
echo ""
echo "📋 PRÓXIMOS PASSOS MANUAIS:"
echo ""
echo "1. 🔑 Configure ASAAS_API_KEY de PRODUÇÃO:"
echo "   vercel env add ASAAS_API_KEY production"
echo ""
echo "2. 🗄️  Configure DATABASE_URL:"
echo "   - Opção A: Crie Vercel Postgres via dashboard"
echo "   - Opção B: vercel env add DATABASE_URL production"
echo ""
echo "3. 🔴 Configure REDIS_URL (recomendado):"
echo "   - Crie Vercel KV via dashboard"
echo "   - Ou: vercel env add REDIS_URL production"
echo ""
echo "4. 📧 Configure Email Service (escolha um):"
echo "   vercel env add SENDGRID_API_KEY production"
echo "   # OU"
echo "   vercel env add MAILGUN_API_KEY production"
echo "   vercel env add MAILGUN_DOMAIN production"
echo "   # OU"
echo "   vercel env add RESEND_API_KEY production"
echo ""
echo "5. 🚀 Faça deploy:"
echo "   vercel --prod"
echo ""
echo "6. 🗃️  Execute migrations (após primeiro deploy):"
echo "   vercel env pull .env.production"
echo "   DATABASE_URL=\$(grep DATABASE_URL .env.production | cut -d '=' -f2-) bunx prisma migrate deploy"
echo ""
echo "7. 🌱 Seed de localizações (opcional):"
echo "   curl -X POST https://querodocumento.vercel.app/api/admin/seed-locations \\"
echo "     -H \"Authorization: Bearer 4459e0518c34385a84f7187c85e911b68e931ae4bca992b7859d89c6cc40a152\""
echo ""
echo "8. ✅ Verifique o webhook ASAAS:"
echo "   - Dashboard ASAAS deve ter:"
echo "   - URL: https://querodocumento.vercel.app/api/webhooks/asaas"
echo "   - Token: 4459e0518c34385a84f7187c85e911b68e931ae4bca992b7859d89c6cc40a152"
echo ""
echo "=================================================="
echo "📖 Consulte PRODUCTION_SECRETS.txt para mais detalhes"
echo "=================================================="
