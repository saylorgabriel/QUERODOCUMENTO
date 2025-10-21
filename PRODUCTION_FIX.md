# Fix para Erro de Login em Produção

## Problema
A coluna `rg` não existe no banco de dados de produção, causando erro:
```
Invalid `prisma.user.findUnique()` invocation:
The column `User.rg` does not exist in the current database.
```

## Solução

### Opção 1: Executar Script Automatizado (Recomendado)

1. Obtenha a `DATABASE_URL` do banco de produção no Vercel:
   ```bash
   # No painel Vercel > Settings > Environment Variables
   # Copie o valor de DATABASE_URL
   ```

2. Execute o script de correção:
   ```bash
   DATABASE_URL="postgresql://..." bun scripts/fix-production-schema.ts
   ```

### Opção 2: SQL Manual

Se preferir executar o SQL diretamente no banco:

```sql
-- Adicionar coluna rg na tabela User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "rg" TEXT;
```

### Opção 3: Via Vercel CLI

Se você tiver acesso ao banco via Vercel:

1. Instale a Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Faça login:
   ```bash
   vercel login
   ```

3. Acesse o shell do banco (se usar Vercel Postgres):
   ```bash
   vercel env pull .env.production
   # Ou execute o script com a DATABASE_URL de produção
   ```

## Verificação

Após aplicar a correção, teste o login em:
- https://querodocumento.vercel.app/auth/login

## Causa Raiz

A coluna `rg` foi adicionada ao schema Prisma (`prisma/schema.prisma` linha 55), mas a migration correspondente não foi aplicada no banco de dados de produção.

## Prevenção Futura

1. Sempre execute migrations antes de fazer deploy:
   ```bash
   bun prisma migrate deploy
   ```

2. Adicione no build script do Vercel:
   ```json
   {
     "build": "prisma generate && prisma migrate deploy && next build"
   }
   ```

3. Configure no `vercel.json`:
   ```json
   {
     "buildCommand": "prisma generate && prisma migrate deploy && next build"
   }
   ```

## Notas Importantes

- ⚠️ Sempre faça backup do banco antes de executar migrations em produção
- ⚠️ Teste primeiro em ambiente de staging se disponível
- ⚠️ A coluna `rg` é opcional (nullable), então não afeta dados existentes
