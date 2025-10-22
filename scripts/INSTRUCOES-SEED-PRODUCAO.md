# Instruções para Popular Cartórios em Produção

## Passo a Passo Simples

### Opção 1: Usando Script Interativo (MAIS FÁCIL) ⭐

Execute o script que criei para você:

```bash
cd /Users/saylor/Documents/VPSGD/QUERODOCUMENTO
chmod +x scripts/seed-production-interactive.sh
./scripts/seed-production-interactive.sh
```

O script irá:
1. Fazer login na Vercel (abrirá o navegador)
2. Baixar automaticamente a DATABASE_URL de produção
3. Executar o seed
4. Mostrar o progresso em tempo real

**Tempo estimado**: 5-15 minutos

---

### Opção 2: Manual (Se preferir controle total)

#### 1. Fazer Login na Vercel
```bash
vercel login
```

Isso abrirá seu navegador para autenticação.

#### 2. Baixar Variáveis de Ambiente
```bash
vercel env pull .env.production.local --yes
```

Isso criará o arquivo `.env.production.local` com todas as variáveis da Vercel.

#### 3. Executar o Seed
```bash
bun run scripts/seed-locations.js
```

O script automaticamente lerá o arquivo `.env.production.local` e usará a `DATABASE_URL` ou `POSTGRES_URL` de produção.

#### 4. Aguardar Conclusão
Você verá o progresso:
```
🌱 Starting location seed...
📂 Reading CSV files from: .../BD Estados

🗑️  Clearing existing location data...
✅ Existing data cleared

📍 Processing AC - Acre...
   ✅ State created: Acre
   ✅ 19 cities and 20 notaries created

... (continua para todos os estados)

✅ Seed completed successfully!
📊 Total states: 27
📊 Total cities: 3323
📊 Total notaries: 3756
```

---

### Verificação Pós-Seed

Após o seed completar, verifique se funcionou:

#### 1. Acessar o Site
Abra: https://querodocumento.vercel.app/certidao-protesto

#### 2. Testar Dropdowns
- Dropdown de **Estado** deve ter 27 opções
- Ao selecionar um estado, **Cidade** deve popular
- Ao selecionar uma cidade, **Cartório** deve popular

#### 3. Verificar via API (Opcional)
```bash
# Ver todos os estados
curl https://querodocumento.vercel.app/api/locations | jq '.'

# Ver cidades de SP
curl https://querodocumento.vercel.app/api/locations?state=SP | jq '.'
```

---

## Troubleshooting

### Erro: "No existing credentials found"
**Solução**: Execute `vercel login` primeiro

### Erro: "DATABASE_URL not found"
**Solução**: Certifique-se de que executou `vercel env pull` antes

### Erro: "Connection timeout"
**Solução**: Verifique sua conexão com a internet e tente novamente

### Seed está muito lento
**Normal**: 3.756 registros podem levar 5-15 minutos. Seja paciente!

### Erro: "Unique constraint violation"
**Solução**: Execute novamente - o script limpa dados existentes antes de popular

---

## Comandos Rápidos

```bash
# Tudo em um comando (requer login prévio)
vercel login && \
vercel env pull .env.production.local --yes && \
bun run scripts/seed-locations.js
```

---

## Resultado Esperado

Após o seed bem-sucedido, você terá em produção:
- ✅ 27 Estados
- ✅ 3.323 Cidades
- ✅ 3.756 Cartórios

Todos com slugs, nomes formatados e endereços corretos!

---

## Precisa de Ajuda?

Se encontrar problemas:
1. Verifique os logs do script
2. Teste a conexão com o banco: `bunx prisma db pull`
3. Verifique se o arquivo `.env.production.local` foi criado
4. Me chame se precisar de ajuda adicional!
