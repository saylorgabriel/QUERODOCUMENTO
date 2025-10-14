# Scripts de Deployment e Manutenção

Scripts auxiliares para deploy e manutenção do QUERODOCUMENTO.

## run-production-migration.sh

Script para executar migrations no banco de dados de produção.

### Uso

```bash
# 1. Obter DATABASE_URL da Vercel
vercel env pull .env.production

# 2. Exportar a variável
export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2-)

# 3. Executar o script
./scripts/run-production-migration.sh
```

### O que faz

- Executa `prisma migrate deploy` no banco de produção
- Cria todas as tabelas, índices e foreign keys
- Aplica todas as migrations pendentes
- Verifica se a DATABASE_URL está configurada

### Quando usar

- **Primeira vez**: Após conectar o banco na Vercel
- **Após mudanças no schema**: Quando criar novas migrations
- **Se o build falhar**: Para aplicar migrations manualmente

### Requisitos

- `bunx` ou `npx` instalado
- DATABASE_URL do Neon/PostgreSQL
- Acesso ao banco de produção

---

## seed-production.sh

Script para fazer seed do banco de dados em produção via API endpoint.

### Uso

```bash
# 1. Configurar variáveis de ambiente
export SEED_SECRET="seu-secret-configurado-na-vercel"
export PRODUCTION_URL="https://seu-app.vercel.app"  # Opcional

# 2. Executar o script
./scripts/seed-production.sh
```

### O que faz

- Cria usuário demo: `demo@querodocumento.com` (senha: `123456`)
- Cria usuário admin: `admin@querodocumento.com` (senha: `admin123456`)
- Verifica se os usuários já existem antes de criar
- Retorna informações sobre o resultado

### Requisitos

- `curl` instalado
- `jq` instalado (opcional, para formatação JSON)
- Variável `SEED_SECRET` configurada na Vercel
- Acesso à URL de produção

### Segurança

O endpoint `/api/admin/seed` requer autenticação via Bearer token usando o `SEED_SECRET`. Mantenha este segredo em local seguro e nunca o commite no Git.

## Outros Scripts (futuro)

- `backup-database.sh` - Backup do banco de dados
- `restore-database.sh` - Restore do banco de dados
- `health-check.sh` - Verificação de saúde da aplicação
- `cleanup-old-files.sh` - Limpeza de arquivos antigos
