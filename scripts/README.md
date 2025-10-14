# Scripts de Deployment e Manutenção

Scripts auxiliares para deploy e manutenção do QUERODOCUMENTO.

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
