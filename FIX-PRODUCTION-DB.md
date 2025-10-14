# 🔧 Fix: "The table public.User does not exist"

## Problema

Após fazer deploy na Vercel, ao tentar registrar um usuário você recebe:

```
Error [PrismaClientKnownRequestError]:
The table `public.User` does not exist in the current database.
```

## Causa

As **migrations não foram aplicadas** no banco de produção da Vercel. O banco está vazio sem tabelas.

## Solução Rápida (5 minutos)

### Opção 1: Via Script Automatizado (Recomendado)

```bash
# 1. Instalar Vercel CLI (se não tiver)
npm i -g vercel

# 2. Login na Vercel
vercel login

# 3. Link ao projeto (se ainda não fez)
vercel link

# 4. Baixar variáveis de ambiente
vercel env pull .env.production

# 5. Exportar DATABASE_URL
export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-)

# 6. Executar migrations
./scripts/run-production-migration.sh
```

### Opção 2: Manual (Se preferir)

```bash
# Após os passos 1-5 acima:
bunx prisma migrate deploy
```

### Opção 3: Fazer Redeploy

Se preferir que a Vercel aplique automaticamente:

```bash
# Commit as migrations
git add prisma/migrations/
git commit -m "feat: add initial migration"
git push

# A Vercel fará redeploy e aplicará as migrations automaticamente
```

## Verificar se Funcionou

```bash
# Testar o health check
curl https://seu-app.vercel.app/api/health/db
```

Resposta esperada:
```json
{
  "status": "healthy",
  "database": "connected",
  "stats": {
    "users": 0,
    "orders": 0,
    "leads": 0
  }
}
```

## Próximo Passo: Criar Usuários

Após as migrations, crie os usuários iniciais:

```bash
# Configurar secret
export SEED_SECRET="seu-secret-da-vercel"

# Executar seed
./scripts/seed-production.sh
```

## Resumo do que foi feito

1. ✅ Criada migration inicial: `prisma/migrations/20241014202500_init/`
2. ✅ Atualizado `package.json` para rodar migrations no build
3. ✅ Criados scripts auxiliares em `scripts/`
4. ✅ Documentação completa em `DEPLOY.md`

## Por que isso aconteceu?

O projeto usava `prisma db push` localmente (que cria tabelas sem migrations), mas em produção o Prisma requer migrations formais via `prisma migrate deploy`.

Agora o projeto está configurado corretamente para ambos os ambientes.

## Precisa de Ajuda?

- Consulte: [DEPLOY.md](./DEPLOY.md) - Guia completo
- Consulte: [scripts/README.md](./scripts/README.md) - Documentação dos scripts
- Logs da Vercel: `vercel logs --follow`
