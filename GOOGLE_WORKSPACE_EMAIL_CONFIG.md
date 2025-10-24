# Configuração de Email Google Workspace - querodocumento.com.br

## ✅ Status: Configurado com Sucesso

**Data**: 23 de outubro de 2025
**Domínio**: querodocumento.com.br
**Email**: contato@querodocumento.com.br

---

## 📋 Registros DNS Configurados

### ✅ Registros MX (Mail Exchange)

| Prioridade | Tipo | Nome | Valor | Status |
|------------|------|------|-------|--------|
| 1 | MX | @ | aspmx.l.google.com | ✅ Ativo |
| 5 | MX | @ | alt1.aspmx.l.google.com | ✅ Ativo |
| 5 | MX | @ | alt2.aspmx.l.google.com | ✅ Ativo |
| 10 | MX | @ | alt3.aspmx.l.google.com | ✅ Ativo |
| 10 | MX | @ | alt4.aspmx.l.google.com | ✅ Ativo |

### ✅ Registro SPF (Sender Policy Framework)

| Tipo | Nome | Valor | Status |
|------|------|-------|--------|
| TXT | @ | `v=spf1 include:_spf.google.com ~all` | ✅ Ativo |

---

## 🔧 Alterações Realizadas

### 1. Removidos Registros Antigos (ImprovMX)
- ❌ Removido: `MX 10 mx1.improvmx.com`
- ❌ Removido: `MX 20 mx2.improvmx.com`
- ❌ Removido: `TXT v=spf1 include:spf.improvmx.com ~all`

### 2. Adicionados Registros Google Workspace
- ✅ Adicionado: 5 registros MX do Google (prioridades 1, 5, 5, 10, 10)
- ✅ Adicionado: 1 registro SPF do Google

---

## ✅ Verificação DNS

### Teste de Registros MX
```bash
$ dig +short querodocumento.com.br MX
1 aspmx.l.google.com.
5 alt1.aspmx.l.google.com.
5 alt2.aspmx.l.google.com.
10 alt3.aspmx.l.google.com.
10 alt4.aspmx.l.google.com.
```

### Teste de Registro SPF
```bash
$ dig +short querodocumento.com.br TXT | grep spf
"v=spf1 include:_spf.google.com ~all"
```

**Status**: ✅ Todos os registros estão propagados e funcionando

---

## 📧 Configurações Adicionais Recomendadas

### 1. DKIM (DomainKeys Identified Mail) - Próximo Passo

Para configurar o DKIM, você precisa:

1. Acessar o **Google Workspace Admin Console**: https://admin.google.com
2. Ir em **Aplicativos** → **Google Workspace** → **Gmail**
3. Clicar em **Autenticar email**
4. Gerar uma nova chave DKIM
5. Copiar o registro TXT gerado

Depois, adicionar via Vercel CLI:
```bash
vercel dns add querodocumento.com.br google._domainkey TXT "v=DKIM1; k=rsa; p=SEU_CODIGO_AQUI"
```

### 2. DMARC (Domain-based Message Authentication) - Recomendado

Adicionar registro DMARC para melhorar a entregabilidade:

```bash
vercel dns add querodocumento.com.br _dmarc TXT "v=DMARC1; p=quarantine; rua=mailto:admin@querodocumento.com.br"
```

**Explicação**:
- `p=quarantine`: Move emails suspeitos para spam
- `rua=mailto:...`: Envia relatórios de autenticação para o email especificado

### 3. BIMI (Brand Indicators for Message Identification) - Opcional

Para mostrar seu logo nos emails (Gmail, Yahoo, etc):

```bash
vercel dns add querodocumento.com.br default._bimi TXT "v=BIMI1; l=https://querodocumento.com.br/logo.svg"
```

---

## 🚀 Próximos Passos

### 1. Verificar no Google Workspace Admin Console
1. Acessar: https://admin.google.com
2. Ir em **Domínios** → **Gerenciar domínios**
3. Clicar em **Ativar Gmail**
4. Verificar se o domínio está validado
5. Aguardar até 72h para propagação completa (geralmente 1-2h)

### 2. Criar Contas de Email
1. No Admin Console, ir em **Usuários**
2. Criar usuário: `contato@querodocumento.com.br`
3. Definir senha segura
4. Habilitar autenticação de 2 fatores

### 3. Configurar Aliases (Opcional)
Você pode criar aliases sem criar novas contas:
- `suporte@querodocumento.com.br` → redireciona para `contato@`
- `vendas@querodocumento.com.br` → redireciona para `contato@`
- `admin@querodocumento.com.br` → redireciona para `contato@`

### 4. Testar Envio e Recebimento
Após propagação DNS (1-2h):
1. Enviar email de teste para `contato@querodocumento.com.br`
2. Verificar recebimento no Gmail
3. Enviar email do Gmail para testar SPF/DKIM
4. Verificar se emails não vão para spam

---

## 🔍 Ferramentas de Verificação

### Verificar Configuração MX
```bash
# Via Vercel CLI
vercel dns ls querodocumento.com.br | grep MX

# Via dig
dig +short querodocumento.com.br MX

# Via nslookup
nslookup -type=MX querodocumento.com.br
```

### Verificar SPF/DKIM/DMARC
- **MXToolbox**: https://mxtoolbox.com/SuperTool.aspx?action=mx:querodocumento.com.br
- **Google Admin Toolbox**: https://toolbox.googleapps.com/apps/checkmx/check?domain=querodocumento.com.br
- **DMARC Analyzer**: https://www.dmarcanalyzer.com/

### Testar Entregabilidade
- **Mail Tester**: https://www.mail-tester.com/
- **Send Score**: https://www.validity.com/everest/

---

## 📝 Comandos Úteis

### Listar todos os registros DNS
```bash
vercel dns ls querodocumento.com.br
```

### Adicionar novo registro
```bash
vercel dns add querodocumento.com.br <nome> <tipo> <valor> [prioridade]
```

### Remover registro
```bash
echo "y" | vercel dns rm <record_id>
```

### Verificar propagação DNS
```bash
dig @8.8.8.8 querodocumento.com.br MX  # Google DNS
dig @1.1.1.1 querodocumento.com.br MX  # Cloudflare DNS
```

---

## ⚠️ Notas Importantes

### Tempo de Propagação
- **Mínimo**: 1-2 horas
- **Máximo**: 72 horas
- **Recomendado**: Aguardar 24h antes de testes críticos

### Segurança
- ✅ SPF configurado corretamente
- ⏳ DKIM pendente (requer configuração no Google Admin)
- ⏳ DMARC recomendado para melhor proteção
- ⏳ Habilitar 2FA em todas as contas

### Backup
Sempre tenha um email alternativo configurado:
- Gmail pessoal
- Outlook
- Outro provedor

### Monitoramento
Configure alertas no Google Workspace para:
- Tentativas de login suspeitas
- Alterações de configuração
- Quota de armazenamento
- Problemas de entrega

---

## 🆘 Troubleshooting

### Emails não chegam
1. Verificar registros MX: `dig +short querodocumento.com.br MX`
2. Verificar se domínio está ativo no Google Admin
3. Verificar quota de armazenamento
4. Verificar filtros de spam

### Emails vão para spam
1. Configurar DKIM
2. Configurar DMARC
3. Verificar SPF está correto
4. Testar em https://www.mail-tester.com/

### Domínio não validado no Google
1. Verificar registro TXT de verificação existe
2. Aguardar propagação DNS (até 72h)
3. Tentar método alternativo (upload de arquivo HTML)

### DNS não propaga
1. Limpar cache DNS local: `sudo dscacheutil -flushcache` (macOS)
2. Usar DNS público: `8.8.8.8` (Google) ou `1.1.1.1` (Cloudflare)
3. Verificar TTL dos registros
4. Aguardar até 72h

---

## 📞 Suporte

### Google Workspace Support
- **Email**: workspace-support@google.com
- **Telefone**: 0800-727-7003 (Brasil)
- **Chat**: https://support.google.com/a/contact/

### Vercel DNS Support
- **Documentação**: https://vercel.com/docs/projects/domains/managing-dns-records
- **Support**: https://vercel.com/support

---

## ✅ Checklist de Validação

- [x] Registros MX configurados (5 registros)
- [x] Registro SPF configurado
- [x] DNS propagado e verificado
- [ ] DKIM configurado (pendente)
- [ ] DMARC configurado (recomendado)
- [ ] Conta `contato@querodocumento.com.br` criada
- [ ] Teste de envio/recebimento realizado
- [ ] 2FA habilitado
- [ ] Backup de email configurado

---

**Documentação criada em**: 23 de outubro de 2025
**Última atualização**: 23 de outubro de 2025
**Responsável**: Saylor Gabriel

---

**Status Geral**: ✅ **Pronto para uso após validação no Google Workspace Admin Console**
