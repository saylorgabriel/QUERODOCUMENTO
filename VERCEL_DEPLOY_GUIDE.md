# 🚀 Guia de Deploy na Vercel - QUERODOCUMENTO

## 📋 Status Atual

- ✅ Projeto criado: `querodocumento`
- ✅ URL: `https://querodocumento.vercel.app`
- ✅ Token ASAAS configurado no dashboard
- ⏳ Variáveis de ambiente: Pendente
- ⏳ Banco de dados: Pendente

---

## 🎯 Opção 1: Configuração Automática (Recomendado)

### Passo 1: Login na Vercel CLI

```bash
vercel login
```

### Passo 2: Execute o Script de Configuração

```bash
cd /Users/saylor/Documents/VPSGD/QUERODOCUMENTO
./setup-vercel-env.sh
```

Este script configura automaticamente:
- ✅ Todos os tokens de segurança
- ✅ Rate limiting
- ✅ Configurações de email
- ✅ ASAAS webhook token
- ⚠️  Pede para você configurar manualmente: DATABASE_URL, REDIS_URL, Email API Keys

---

## 🎯 Opção 2: Configuração Manual (Passo a Passo)

### 1️⃣ Login e Link do Projeto

```bash
# Fazer login
vercel login

# Na pasta do projeto
cd /Users/saylor/Documents/VPSGD/QUERODOCUMENTO

# Link com projeto existente
vercel link
# Escolha: team_xcd7k8Cll7lWD15x8t25rQsP
# Escolha: querodocumento
```

### 2️⃣ Configurar Tokens de Segurança

Copie e cole cada comando (um de cada vez):

```bash
# ASAAS Webhook Token (CRÍTICO)
echo "4459e0518c34385a84f7187c85e911b68e931ae4bca992b7859d89c6cc40a152" | vercel env add ASAAS_WEBHOOK_TOKEN production

# JWT Secret
echo "7ad02e0280f61f3f5059eb9f977f679b784adf8b39b52b1b2a6cf3e5d779ea23" | vercel env add JWT_SECRET production

# Encryption Key
echo "e8a3714b309f4d453dbe5fd688c5a49ab78530a17016fa5ea31ba52bc4d79709" | vercel env add ENCRYPTION_KEY production

# NextAuth Secret
echo "010ab227c1e886d3131e783c5b1d4d69f1da5ef04273d62454b389c0f1749103" | vercel env add NEXTAUTH_SECRET production

# Seed Secret
echo "4459e0518c34385a84f7187c85e911b68e931ae4bca992b7859d89c6cc40a152" | vercel env add SEED_SECRET production

# NextAuth URL
echo "https://querodocumento.vercel.app" | vercel env add NEXTAUTH_URL production

# App URL
echo "https://querodocumento.vercel.app" | vercel env add APP_URL production

# ASAAS Environment
echo "production" | vercel env add ASAAS_ENVIRONMENT production

# Node Environment
echo "production" | vercel env add NODE_ENV production
```

### 3️⃣ Configurar ASAAS API Key de PRODUÇÃO

⚠️ **IMPORTANTE**: Use sua API Key de PRODUÇÃO do ASAAS (não a de sandbox)

```bash
vercel env add ASAAS_API_KEY production
# Cole sua API Key de PRODUÇÃO quando solicitado
```

### 4️⃣ Configurar Banco de Dados

#### Opção A: Vercel Postgres (Recomendado - Mais Fácil)

1. Acesse: https://vercel.com/saylorgabriels-projects/querodocumento/stores
2. Clique em **"Create Database"**
3. Escolha **"Postgres"**
4. Região: **us-east-1** (ou mais próxima do Brasil)
5. Nome: `querodocumento-db`
6. Clique em **"Create"**

✅ A Vercel vai adicionar automaticamente:
- `POSTGRES_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

⚠️ **Após criar, copie o `POSTGRES_URL_NON_POOLING` e adicione como `DATABASE_URL`:**

```bash
vercel env add DATABASE_URL production
# Cole o valor de POSTGRES_URL_NON_POOLING quando solicitado
```

#### Opção B: Banco Externo (Neon, Supabase, etc)

Se você já tem um banco configurado:

```bash
vercel env add DATABASE_URL production
# Cole sua connection string: postgresql://user:password@host:5432/database
```

**⚠️ SOBRE A SENHA DO BANCO:**

**Se o banco JÁ EXISTE e tem dados:**
- ❌ **NÃO altere a senha** - Use a senha atual
- Apenas configure a `DATABASE_URL` com a senha existente

**Se está criando banco NOVO:**
- ✅ Use a senha forte que geramos: `kwi8xlf8qauUVR1wHmGajajJ7+/ynpPOH3RuPzwOOVg=`

### 5️⃣ Configurar Redis (Recomendado para Rate Limiting)

#### Opção A: Vercel KV (Redis) - Recomendado

1. Acesse: https://vercel.com/saylorgabriels-projects/querodocumento/stores
2. Clique em **"Create Database"**
3. Escolha **"KV"** (Redis)
4. Nome: `querodocumento-redis`
5. Clique em **"Create"**

✅ A Vercel vai adicionar automaticamente `KV_URL`, `KV_REST_API_URL`, etc.

⚠️ **Adicione também como `REDIS_URL`:**

```bash
vercel env add REDIS_URL production
# Cole o valor de KV_URL quando solicitado
```

#### Opção B: Upstash Redis (Grátis)

1. Acesse: https://upstash.com/
2. Crie conta gratuita
3. Crie database Redis
4. Copie a connection string
5. Configure:

```bash
vercel env add REDIS_URL production
# Cole a connection string do Upstash
```

#### ⚠️ Redis é Opcional

Se não configurar Redis:
- ✅ Sistema usa fallback in-memory automático
- ⚠️ Rate limiting funciona, mas não é compartilhado entre múltiplas instâncias
- 💡 Recomendado configurar para produção

### 6️⃣ Configurar Serviço de Email

Escolha UM provedor:

#### Opção A: SendGrid (Recomendado)

```bash
echo "sendgrid" | vercel env add EMAIL_PRIMARY_PROVIDER production
echo "noreply@querodocumento.vercel.app" | vercel env add EMAIL_FROM production
vercel env add SENDGRID_API_KEY production
# Cole sua API Key do SendGrid
```

#### Opção B: Mailgun

```bash
echo "mailgun" | vercel env add EMAIL_PRIMARY_PROVIDER production
echo "noreply@querodocumento.vercel.app" | vercel env add EMAIL_FROM production
vercel env add MAILGUN_API_KEY production
# Cole sua API Key do Mailgun
vercel env add MAILGUN_DOMAIN production
# Cole seu domínio do Mailgun (ex: mg.seudominio.com)
```

#### Opção C: Resend

```bash
echo "resend" | vercel env add EMAIL_PRIMARY_PROVIDER production
echo "noreply@querodocumento.vercel.app" | vercel env add EMAIL_FROM production
vercel env add RESEND_API_KEY production
# Cole sua API Key do Resend
```

### 7️⃣ Configurar Rate Limiting

```bash
echo "true" | vercel env add RATE_LIMIT_ENABLED production
echo "5" | vercel env add RATE_LIMIT_LOGIN_MAX production
echo "900000" | vercel env add RATE_LIMIT_LOGIN_WINDOW production
echo "3" | vercel env add RATE_LIMIT_REGISTER_MAX production
echo "3600000" | vercel env add RATE_LIMIT_REGISTER_WINDOW production
```

---

## 🚀 Deploy para Produção

### Passo 1: Fazer Deploy

```bash
vercel --prod
```

Aguarde o build completar. A URL será: `https://querodocumento.vercel.app`

### Passo 2: Baixar Variáveis de Ambiente Localmente

```bash
vercel env pull .env.production
```

### Passo 3: Executar Migrations

```bash
# Extrair DATABASE_URL do arquivo baixado
export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-)

# Executar migrations
bunx prisma migrate deploy
```

### Passo 4: Seed de Localizações (Opcional)

```bash
curl -X POST https://querodocumento.vercel.app/api/admin/seed-locations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 4459e0518c34385a84f7187c85e911b68e931ae4bca992b7859d89c6cc40a152"
```

---

## ✅ Verificações Pós-Deploy

### 1. Teste de Webhook Security

```bash
# Deve retornar {"error":"Unauthorized"}
curl -X POST https://querodocumento.vercel.app/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -d '{"event":"PAYMENT_RECEIVED"}'
```

### 2. Teste de Rate Limiting

```bash
# 6ª tentativa deve retornar erro 429
for i in {1..6}; do
  echo "Tentativa $i:"
  curl -X POST https://querodocumento.vercel.app/api/auth/simple-login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  sleep 1
done
```

### 3. Verificar Security Headers

Acesse: https://securityheaders.com/

Digite: `https://querodocumento.vercel.app`

**Esperado:** Nota A ou A+

### 4. Verificar Logs

```bash
vercel logs https://querodocumento.vercel.app --follow
```

---

## 🔧 Comandos Úteis

### Ver variáveis de ambiente configuradas

```bash
vercel env ls
```

### Remover variável de ambiente

```bash
vercel env rm NOME_DA_VARIAVEL production
```

### Ver logs em tempo real

```bash
vercel logs --follow
```

### Ver deployments

```bash
vercel ls
```

### Rollback para deployment anterior

```bash
vercel rollback
```

---

## 📊 Checklist Final

- [ ] Login na Vercel CLI (`vercel login`)
- [ ] Link com projeto (`vercel link`)
- [ ] Tokens de segurança configurados (9 variáveis)
- [ ] ASAAS_API_KEY de produção configurado
- [ ] DATABASE_URL configurado (Vercel Postgres ou externo)
- [ ] REDIS_URL configurado (recomendado)
- [ ] Email provider configurado (SendGrid/Mailgun/Resend)
- [ ] Rate limiting configurado
- [ ] Deploy realizado (`vercel --prod`)
- [ ] Migrations executadas (`bunx prisma migrate deploy`)
- [ ] Seed de localizações (opcional)
- [ ] Webhook ASAAS testado (retorna 401 sem token)
- [ ] Rate limiting testado (bloqueia após 5 tentativas)
- [ ] Security headers verificados (nota A/A+)
- [ ] Dashboard ASAAS configurado com URL e token

---

## 🆘 Problemas Comuns

### Erro: "No existing credentials found"

```bash
vercel login
```

### Erro: "ASAAS_API_KEY not configured"

```bash
vercel env add ASAAS_API_KEY production
# Cole sua API Key de PRODUÇÃO (não sandbox)
```

### Erro: "Database connection failed"

Verifique se `DATABASE_URL` foi configurado:

```bash
vercel env ls | grep DATABASE_URL
```

Se não aparecer, configure:

```bash
vercel env add DATABASE_URL production
```

### Erro: "Rate limiting not working"

Configure `REDIS_URL` ou verifique se está habilitado:

```bash
echo "true" | vercel env add RATE_LIMIT_ENABLED production
```

---

## 📚 Referências

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel KV (Redis)](https://vercel.com/docs/storage/vercel-kv)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)

---

**Status:** ✅ Pronto para configurar e fazer deploy!

Execute `./setup-vercel-env.sh` para começar! 🚀
