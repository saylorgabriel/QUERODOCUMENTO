# Conectar pgAdmin ao Neon (Vercel Database)

## 📋 Informações Necessárias

Você precisa da **Connection String** do Neon. Obtenha em:
- Vercel Dashboard → Storage → Neon → Connection String
- Ou na variável `DATABASE_URL` nas Environment Variables

A string tem este formato:
```
postgresql://user:password@host.region.aws.neon.tech:5432/dbname?sslmode=require
```

---

## 🔧 Configurar pgAdmin 4

### 1. Abrir pgAdmin
- Abra o pgAdmin 4 no seu computador

### 2. Criar Nova Conexão
- Clique com botão direito em **Servers**
- Selecione **Register** → **Server...**

### 3. Aba "General"
```
Name: Querodocumento - Neon (Production)
```

### 4. Aba "Connection"

Preencha com os dados extraídos da connection string:

**Se sua string for:**
```
postgresql://neondb_owner:AbCdEfGh123@ep-cool-darkness-12345678.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Preencha assim:**

```
Host name/address:  ep-cool-darkness-12345678.us-east-1.aws.neon.tech
Port:               5432
Maintenance database: neondb
Username:           neondb_owner
Password:           AbCdEfGh123

☑ Save password (opcional, mas recomendado)
```

**⚠️ IMPORTANTE: Substitua pelos seus valores reais!**

### 5. Aba "SSL"

```
SSL mode:  Require
```

OU se não funcionar, tente:
```
SSL mode:  Prefer
```

### 6. Salvar e Conectar

- Clique em **Save**
- O pgAdmin tentará conectar automaticamente

---

## 🎯 Exemplo Real de Configuração

### Extrair dados da Connection String

**Connection String de exemplo:**
```
postgresql://user123:pass456@ep-example-123.us-east-1.aws.neon.tech/mydb?sslmode=require
```

**Dados extraídos:**
- **Host**: `ep-example-123.us-east-1.aws.neon.tech`
- **Port**: `5432` (padrão)
- **Database**: `mydb`
- **Username**: `user123`
- **Password**: `pass456`

---

## 🔍 Script para Extrair Automaticamente

Execute este comando no terminal (dentro da pasta do projeto):

```bash
# Obter DATABASE_URL do .env
DATABASE_URL=$(grep DATABASE_URL .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")

# Extrair componentes
echo "=== DADOS PARA PGADMIN ==="
echo ""
echo "Connection String completa:"
echo "$DATABASE_URL"
echo ""

# Parse usando regex
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):?([0-9]*)/([^\?]+) ]]; then
    USERNAME="${BASH_REMATCH[1]}"
    PASSWORD="${BASH_REMATCH[2]}"
    HOST="${BASH_REMATCH[3]}"
    PORT="${BASH_REMATCH[4]:-5432}"
    DATABASE="${BASH_REMATCH[5]}"

    echo "Host:     $HOST"
    echo "Port:     $PORT"
    echo "Database: $DATABASE"
    echo "Username: $USERNAME"
    echo "Password: $PASSWORD"
    echo ""
    echo "SSL Mode: Require"
fi
```

---

## ✅ Verificar Conexão

Após conectar, você deve ver:
- **Databases** → **neondb** (ou nome do seu banco)
- **Schemas** → **public**
- **Tables**: Account, AuditLog, Certificate, Order, User, etc.

---

## ⚠️ Troubleshooting

### Erro: "could not connect to server"
- Verifique se o **Host** está correto (deve incluir `.neon.tech`)
- Confirme que a **porta** é `5432`
- Verifique se seu IP está permitido (Neon geralmente permite todos)

### Erro: "password authentication failed"
- Verifique se o **Username** e **Password** estão corretos
- Copie novamente da Vercel (pode ter caracteres especiais)

### Erro: "SSL connection required"
- Certifique-se de que **SSL mode** está em **"Require"** ou **"Prefer"**

### Conexão lenta
- Normal para Neon (pode levar 5-10 segundos na primeira conexão)
- O banco "acorda" quando não usado por um tempo (free tier)

---

## 🔒 Segurança

**⚠️ IMPORTANTE:**
- Nunca commite o arquivo com a senha
- Não compartilhe a connection string publicamente
- Use IP whitelist se possível (Neon Pro)

---

## 📚 Links Úteis

- **Neon Dashboard**: https://console.neon.tech
- **Vercel Storage**: https://vercel.com/dashboard/stores
- **pgAdmin Docs**: https://www.pgadmin.org/docs/

---

## 🎯 Próximos Passos

Após conectar, você pode:
1. ✅ Ver todos os usuários na tabela `User`
2. ✅ Verificar pedidos na tabela `Order`
3. ✅ Executar queries SQL manualmente
4. ✅ Fazer backup do banco
5. ✅ Verificar/alterar senhas dos usuários

---

## 💡 Dica: Verificar Usuários Admin

Execute esta query no pgAdmin após conectar:

```sql
SELECT
    id,
    email,
    name,
    role,
    created_at
FROM "User"
WHERE role = 'ADMIN'
ORDER BY created_at DESC;
```

Para ver se a senha está hasheada corretamente:

```sql
SELECT
    email,
    LEFT(password, 20) as password_hash,
    role
FROM "User"
WHERE email = 'admin@querodocumento.com';
```

Se retornar vazio, o admin não existe e você precisa rodar o seed.
