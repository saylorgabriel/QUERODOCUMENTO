# 🚀 Deploy na Vercel - QUERODOCUMENTO

## ⚠️ IMPORTANTE: Vercel não suporta Docker

A Vercel é uma plataforma serverless que não executa containers Docker. Você precisa configurar serviços externos.

## 📋 Checklist de Deploy

### 1. 🗄️ Banco de Dados (OBRIGATÓRIO)
Escolha uma das opções e configure a `DATABASE_URL`:

**Opção A - Vercel Postgres (Recomendado)**
- Acesse: Vercel Dashboard > Storage > Create Database > Postgres
- Conecta automaticamente ao projeto

**Opção B - Neon (Gratuito)**
- Site: https://neon.tech
- Crie conta e database
- Copie a connection string

**Opção C - Supabase (Gratuito)**  
- Site: https://supabase.com
- Crie projeto PostgreSQL
- Copie a connection string

### 2. 🔧 Configurações na Vercel

#### Build Settings:
```
Framework Preset: Next.js
Build Command: bun run build
Install Command: bun install
Output Directory: .next
Root Directory: ./
```

#### 3. 🌍 Environment Variables (OBRIGATÓRIAS)

```env
# Database (usar URL do serviço externo)
DATABASE_URL="postgresql://user:pass@host:5432/dbname"

# NextAuth
NEXTAUTH_URL="https://seu-projeto.vercel.app"
NEXTAUTH_SECRET="gere-um-secret-forte-aqui"

# Application
NODE_ENV="production"
APP_URL="https://seu-projeto.vercel.app"

# JWT & Security
JWT_SECRET="gere-um-jwt-secret-forte-aqui"
ENCRYPTION_KEY="gere-uma-encryption-key-forte-aqui"
```

#### 4. 📧 Email (Opcional mas recomendado)
```env
# Escolha um provedor
EMAIL_PRIMARY_PROVIDER="sendgrid"
EMAIL_FROM="noreply@seudominio.com"
SENDGRID_API_KEY="sua-api-key"
```

### 5. ⚙️ Comandos após Deploy

Após o primeiro deploy, execute no terminal da Vercel ou localmente:

```bash
# Gerar o Prisma Client
bunx prisma generate

# Fazer push do schema para o banco
bunx prisma db push

# (Opcional) Popular dados iniciais  
bunx prisma db seed
```

## 🚨 Problemas Comuns

### 1. Erro de Build
Se der erro com Bun, use npm:
```
Build Command: npm run build
Install Command: npm install
```

### 2. Database Connection Error
- Verifique se a DATABASE_URL está correta
- Confirme se o banco externo aceita conexões
- Rode `prisma db push` após configurar

### 3. Prisma Errors
Adicione no package.json:
```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

## 📱 URLs de Teste

Após deploy, teste:
- Homepage: `https://seu-projeto.vercel.app`
- API Health: `https://seu-projeto.vercel.app/api/health`
- Admin: `https://seu-projeto.vercel.app/admin`

## 🔗 Links Úteis

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Neon Database](https://neon.tech)
- [Supabase](https://supabase.com)
- [SendGrid](https://sendgrid.com)