# Guia de Deploy na Vercel com PostgreSQL (Neon)

Este guia explica como fazer deploy do QUERODOCUMENTO na Vercel com PostgreSQL.

## Pré-requisitos

- Conta na Vercel
- Projeto já criado na Vercel
- Código commitado no Git

## 1. Configurar Database na Vercel

### Opção A: Usar Neon (Recomendado - Já configurado)

1. Acesse seu projeto na Vercel Dashboard
2. Vá em **Storage** → **Connect Database**
3. Selecione **Neon PostgreSQL**
4. Clique em **Create Database**

A Vercel automaticamente criará as variáveis de ambiente:
- `DATABASE_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`

### Opção B: Usar PostgreSQL Externo

Se preferir usar outro provedor (Railway, Supabase, etc.), adicione manualmente a variável:

1. Vá em **Settings** → **Environment Variables**
2. Adicione: `DATABASE_URL` com a URL de conexão do seu banco

## 2. Configurar Variáveis de Ambiente

Na Vercel Dashboard, vá em **Settings** → **Environment Variables** e adicione:

### Essenciais para Database
```bash
DATABASE_URL=postgresql://...  # Já configurado se usar Neon
```

### Segurança
```bash
NEXTAUTH_SECRET=your-secret-here        # Gere com: openssl rand -base64 32
NEXTAUTH_URL=https://seu-dominio.vercel.app
SEED_SECRET=your-seed-secret-here       # Para endpoint de seed
```

### Email (Escolha um provedor)
```bash
# SendGrid
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-key

# OU Resend
EMAIL_PROVIDER=resend
RESEND_API_KEY=your-key

# OU SMTP
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email
SMTP_PASSWORD=your-password
```

### Redis (Opcional)
```bash
REDIS_URL=redis://...  # Para cache e sessões
```

### Pagamento (Opcional - Mock funciona sem)
```bash
ASAAS_API_KEY=your-asaas-key
```

## 3. Deploy Inicial

### Via Vercel CLI

```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

### Via GitHub (Recomendado)

1. Conecte seu repositório GitHub à Vercel
2. Faça push do código
3. Deploy automático será iniciado

O build executará automaticamente:
```bash
prisma generate → prisma migrate deploy → next build
```

## 4. Executar Seed do Banco (Usuários Iniciais)

Após o primeiro deploy bem-sucedido:

### Opção A: Via cURL (Produção)

```bash
curl -X POST https://seu-app.vercel.app/api/admin/seed \
  -H "Authorization: Bearer SEU_SEED_SECRET" \
  -H "Content-Type: application/json"
```

### Opção B: Via Vercel CLI (Development)

```bash
# 1. Puxar variáveis de ambiente
vercel env pull .env.production

# 2. Executar seed localmente contra produção
DATABASE_URL="sua-url-aqui" bun run db:seed
```

### Opção C: Via Script Node

Crie um arquivo `scripts/seed-production.sh`:

```bash
#!/bin/bash
SEED_SECRET="seu-secret-aqui"
PRODUCTION_URL="https://seu-app.vercel.app"

curl -X POST "$PRODUCTION_URL/api/admin/seed" \
  -H "Authorization: Bearer $SEED_SECRET" \
  -H "Content-Type: application/json"
```

Execute:
```bash
chmod +x scripts/seed-production.sh
./scripts/seed-production.sh
```

## 5. Verificar Deploy

### Health Check do Banco
```bash
curl https://seu-app.vercel.app/api/health/db
```

Resposta esperada:
```json
{
  "status": "healthy",
  "database": "connected",
  "responseTime": "15ms",
  "stats": {
    "users": 2,
    "orders": 0,
    "leads": 0
  }
}
```

### Verificar Logs
```bash
vercel logs --follow
```

## 6. Migrations em Deploy

### Deploy Automático
As migrations rodam automaticamente no build através do comando:
```bash
prisma migrate deploy
```

### Migration Manual (Se necessário)
```bash
# 1. Conectar ao banco de produção
vercel env pull .env.production

# 2. Rodar migration
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2)" \
  bunx prisma migrate deploy
```

## 7. Troubleshooting

### Erro: "Can't reach database server"
```bash
# Verificar se DATABASE_URL está configurada
vercel env ls

# Verificar conexão do Neon
# Acesse: https://console.neon.tech
```

### Erro: "Prisma Client not generated"
```bash
# Garantir que postinstall está no package.json
"postinstall": "prisma generate"

# Redeploy forçado
vercel --prod --force
```

### Erro: "Migration failed"
```bash
# Ver logs de build
vercel logs

# Rodar migration manualmente
vercel env pull .env.production
DATABASE_URL="..." bunx prisma migrate deploy
```

### Connection Pool Limits
Se receber erro de pool de conexões:

1. Use `POSTGRES_PRISMA_URL` em vez de `DATABASE_URL` (já usa pooling)
2. Ou adicione `?connection_limit=5` na URL

## 8. Credenciais Padrão (Após Seed)

### Usuário Demo
- Email: `demo@querodocumento.com`
- Senha: `123456`

### Admin
- Email: `admin@querodocumento.com`
- Senha: `admin123456`

**IMPORTANTE:** Altere essas senhas após o primeiro login em produção!

## 9. Monitoramento

### Vercel Analytics
Já configurado via `@vercel/analytics` no código.

### Health Check Automático
Configure um serviço de uptime monitoring (UptimeRobot, Pingdom, etc.) para:
```
https://seu-app.vercel.app/api/health/db
```

### Logs de Email
Acesse via admin panel: `https://seu-app.vercel.app/admin/emails`

## 10. Atualizações Futuras

Para fazer updates com migrations:

```bash
# 1. Criar migration localmente
bun run db:migrate

# 2. Commit e push
git add .
git commit -m "feat: new migration"
git push

# 3. Vercel fará deploy automático e rodará as migrations
```

## 11. Rollback (Se necessário)

```bash
# 1. Voltar ao commit anterior na Vercel Dashboard
# 2. OU via CLI
vercel rollback

# 3. Para rollback de migration (CUIDADO!)
vercel env pull .env.production
DATABASE_URL="..." bunx prisma migrate resolve --rolled-back MIGRATION_NAME
```

## 12. URLs Úteis

- **App**: https://seu-app.vercel.app
- **Admin**: https://seu-app.vercel.app/admin
- **Health Check**: https://seu-app.vercel.app/api/health/db
- **Seed API**: https://seu-app.vercel.app/api/admin/seed
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Neon Console**: https://console.neon.tech

## 13. Checklist de Deploy

- [ ] Conectar database na Vercel (Neon)
- [ ] Configurar variáveis de ambiente
- [ ] Fazer push do código
- [ ] Aguardar build completar
- [ ] Verificar health check: `/api/health/db`
- [ ] Executar seed: POST `/api/admin/seed`
- [ ] Testar login com credenciais demo
- [ ] Testar login admin
- [ ] Alterar senhas padrão
- [ ] Configurar domínio customizado (opcional)
- [ ] Configurar monitoring (opcional)

## Dúvidas?

- Documentação Vercel: https://vercel.com/docs
- Documentação Prisma: https://www.prisma.io/docs
- Documentação Neon: https://neon.tech/docs
