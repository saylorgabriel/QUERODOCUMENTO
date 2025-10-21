#!/bin/bash

# Script para atualizar emolumentos na produção após deploy
# Aguarda o deploy da Vercel e executa o seed

VERCEL_URL="https://querodocumento.vercel.app"
SEED_SECRET="dd8f9a7b3c2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6"

echo "🔍 Verificando status do deploy na Vercel..."
echo ""

# Aguardar alguns segundos para o deploy iniciar
sleep 5

# Verificar se o site está respondendo
MAX_ATTEMPTS=30
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
  ATTEMPT=$((ATTEMPT + 1))

  echo "⏳ Tentativa $ATTEMPT/$MAX_ATTEMPTS - Aguardando deploy..."

  # Tentar acessar o health endpoint
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$VERCEL_URL/api/health" 2>/dev/null)

  if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Deploy concluído! API está respondendo."
    echo ""
    break
  fi

  sleep 10
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
  echo "❌ Timeout aguardando deploy. Tente executar o seed manualmente."
  exit 1
fi

# Aguardar mais alguns segundos para garantir que tudo está pronto
echo "⏳ Aguardando estabilização do deploy..."
sleep 10

# Executar seed
echo ""
echo "🌱 Executando seed de emolumentos na produção..."
echo ""

RESPONSE=$(curl -X POST "$VERCEL_URL/api/seed" \
  -H "Content-Type: application/json" \
  -d "{\"secret\":\"$SEED_SECRET\"}" \
  2>/dev/null)

echo "📊 Resposta do servidor:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Verificar se foi sucesso
if echo "$RESPONSE" | grep -q "success.*true"; then
  echo "✅ Emolumentos atualizados com sucesso na produção!"
  echo ""
  echo "🔗 Verifique em: $VERCEL_URL"
  exit 0
else
  echo "❌ Erro ao atualizar emolumentos."
  echo "Tente executar manualmente:"
  echo ""
  echo "curl -X POST $VERCEL_URL/api/seed \\"
  echo "  -H \"Content-Type: application/json\" \\"
  echo "  -d '{\"secret\":\"$SEED_SECRET\"}'"
  exit 1
fi
