# Configuração DNS para Resend Email Service

## Status Atual
- Domínio: querodocumento.com.br
- Provedor DNS: Registro.br (em transição - aguardar 2h-3h)
- Serviço de Email: Resend

## Registros DNS Necessários

### 1. Registro MX (Mail Exchange)
Permite que o Resend receba emails de retorno (bounces, etc.)

```
Tipo: MX
Nome: send
Dados: feedback-smtp.sa-east-1.amazonses.com
Prioridade: 10
TTL: 3600
```

### 2. Registro TXT - SPF (Sender Policy Framework)
Autoriza o Resend a enviar emails em nome do seu domínio

```
Tipo: TXT
Nome: send
Dados: v=spf1 include:amazonses.com ~all
TTL: 3600
```

### 3. Registro TXT - DKIM (DomainKeys Identified Mail)
Assina digitalmente seus emails para validação

```
Tipo: TXT
Nome: resend._domainkey
Dados: [Copie o valor completo do painel Resend - começa com "p=MIGfMA0GCSqGSIb3DQEB..."]
TTL: 3600
```

**IMPORTANTE**: Você precisa copiar o valor DKIM completo do painel do Resend. Ele é uma chave pública longa que começa com `p=` e contém caracteres aleatórios.

### 4. Registro TXT - DMARC (Domain-based Message Authentication)
Define política de tratamento de emails não autenticados

```
Tipo: TXT
Nome: _dmarc
Dados: v=DMARC1; p=none; rua=mailto:contato@querodocumento.com.br
TTL: 3600
```

## Passo a Passo no Registro.br

### 1. Aguarde a Transição DNS
- Status atual: "Domínio em transição"
- Tempo estimado: 2h-3h
- Após esse período, a mensagem mudará para permitir edição

### 2. Acesse a Configuração da Zona DNS
1. Volte para: https://registro.br
2. Acesse: Meus Domínios → querodocumento.com.br
3. Clique em **"CONFIGURAR ZONA DNS"** (o botão que você viu na tela)
4. A seção expandirá mostrando a tabela com: TIPO | NOME | DADOS

### 3. Adicionar Cada Registro

Para cada um dos 4 registros acima, você verá uma interface similar a:

```
┌──────────────────────────────────────────────────┐
│ TIPO       NOME                DADOS             │
├──────────────────────────────────────────────────┤
│ [Novo Registro]                                  │
│                                                  │
│ Tipo: [Selecionar ▼]                            │
│ Nome: ________________                           │
│ Dados: ______________________________            │
│ Prioridade: _____ (apenas para MX)              │
│ TTL: _____                                       │
│                                                  │
│ [Adicionar]                                      │
└──────────────────────────────────────────────────┘
```

### 4. Adicione os 4 Registros na Ordem

#### Registro 1 - MX
- Clique em "Adicionar novo registro" ou ícone "+"
- Tipo: Selecione **MX**
- Nome: `send`
- Dados: `feedback-smtp.sa-east-1.amazonses.com`
- Prioridade: `10`
- TTL: `3600`
- Clique em "Adicionar" ou "Salvar"

#### Registro 2 - TXT (SPF)
- Clique em "Adicionar novo registro" ou ícone "+"
- Tipo: Selecione **TXT**
- Nome: `send`
- Dados: `v=spf1 include:amazonses.com ~all`
- TTL: `3600`
- Clique em "Adicionar" ou "Salvar"

#### Registro 3 - TXT (DKIM)
- Clique em "Adicionar novo registro" ou ícone "+"
- Tipo: Selecione **TXT**
- Nome: `resend._domainkey`
- Dados: **[COPIE DO PAINEL RESEND]** - Vá em https://resend.com/domains → querodocumento.com.br → Copie o valor DKIM completo
- TTL: `3600`
- Clique em "Adicionar" ou "Salvar"

#### Registro 4 - TXT (DMARC)
- Clique em "Adicionar novo registro" ou ícone "+"
- Tipo: Selecione **TXT**
- Nome: `_dmarc`
- Dados: `v=DMARC1; p=none; rua=mailto:contato@querodocumento.com.br`
- TTL: `3600`
- Clique em "Adicionar" ou "Salvar"

### 5. Salvar Alterações
- Após adicionar todos os 4 registros, clique em "Salvar Zona" ou botão similar
- Confirme as alterações se solicitado

## Verificação

### No Painel do Resend (após 15min-2h)
1. Acesse: https://resend.com/domains
2. Clique em `querodocumento.com.br`
3. Aguarde os status mudarem de "Failed" (vermelho) para "Verified" (verde)
4. Pode levar de 15 minutos a 2 horas para verificação

### Comandos para Verificar Propagação DNS

**No terminal (Mac/Linux):**
```bash
# Verificar MX
dig MX send.querodocumento.com.br

# Verificar SPF
dig TXT send.querodocumento.com.br

# Verificar DKIM
dig TXT resend._domainkey.querodocumento.com.br

# Verificar DMARC
dig TXT _dmarc.querodocumento.com.br
```

**Ferramentas Online:**
- MXToolbox: https://mxtoolbox.com/SuperTool.aspx
- DNS Checker: https://dnschecker.org
- Google DNS: https://dns.google

Digite `send.querodocumento.com.br` para verificar os registros.

## Configuração no Código (Já Configurado)

As variáveis de ambiente necessárias já estão documentadas no `.env.example`:

```env
# Email Service
EMAIL_PRIMARY_PROVIDER=resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
EMAIL_FROM=noreply@send.querodocumento.com.br
EMAIL_REPLY_TO=contato@querodocumento.com.br
RESEND_FROM_NAME=QueroDocumento
```

### Na Vercel (Produção)

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Adicione/verifique:
   - `EMAIL_PRIMARY_PROVIDER` = `resend`
   - `RESEND_API_KEY` = `[Sua chave da Resend]`
   - `EMAIL_FROM` = `noreply@send.querodocumento.com.br`
   - `RESEND_FROM_NAME` = `QueroDocumento`

## Testando o Envio

Após configurar e verificar:

### Via Admin Panel
1. Acesse: https://querodocumento-cpj6.vercel.app/admin/configuracoes
2. Na seção "Email Service", clique em "Testar Conexão"
3. Digite seu email para receber um email de teste

### Via API (cURL)
```bash
curl -X POST https://querodocumento-cpj6.vercel.app/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "seu-email@example.com"}'
```

### Via Dashboard
Faça qualquer ação que gera email (ex: solicitar consulta de protesto) e verifique se o email é enviado.

## Troubleshooting

### Status "Failed" não muda para "Verified"
- Aguarde mais tempo (até 2 horas)
- Verifique se os registros foram adicionados corretamente
- Confira se não há espaços extras nos valores
- Use `dig` ou ferramentas online para verificar propagação

### Email não está sendo enviado
1. Verifique os logs da Vercel: `vercel logs --follow`
2. Confira se `RESEND_API_KEY` está configurada
3. Verifique se o domínio está verificado no Resend
4. Teste o envio via admin panel

### Erro "Domain not verified"
- Aguarde a verificação completa dos DNS records
- Pode levar até 24 horas em casos raros
- Verifique se todos os 4 registros foram adicionados

### DKIM Failed
- Certifique-se de copiar o valor DKIM completo (é bem longo)
- Não adicione aspas extras ao redor do valor
- O nome deve ser exatamente: `resend._domainkey`

## Observações Importantes

1. **Subdomínio "send"**: O Resend usa `send.querodocumento.com.br` para enviar emails. Isso protege a reputação do seu domínio principal.

2. **EMAIL_FROM**: Use `noreply@send.querodocumento.com.br` como remetente (com o subdomínio "send")

3. **REPLY-TO**: Configure como `contato@querodocumento.com.br` para que respostas vão para o email principal

4. **DMARC Policy**: Configurado como `p=none` inicialmente (apenas monitora). Após estabilizar, você pode mudar para `p=quarantine` ou `p=reject` para maior segurança.

5. **Tempo de Propagação**: DNS pode levar de 15 minutos a 48 horas. Seja paciente.

## Próximos Passos

- [ ] Aguardar transição DNS do Registro.br (2-3 horas)
- [ ] Adicionar os 4 registros DNS conforme instruções
- [ ] Aguardar propagação (15min-2h)
- [ ] Verificar status no painel Resend
- [ ] Configurar variáveis na Vercel (se ainda não configurado)
- [ ] Testar envio via admin panel
- [ ] Testar fluxo completo de consulta/certidão

## Links Úteis

- Painel Resend: https://resend.com/domains
- Registro.br: https://registro.br
- Vercel Env Vars: https://vercel.com/seu-projeto/settings/environment-variables
- Documentação Resend: https://resend.com/docs/send-with-nextjs
- Admin Panel: https://querodocumento-cpj6.vercel.app/admin/configuracoes

## Suporte

Se precisar de ajuda:
1. Verifique os logs: `vercel logs --follow`
2. Teste conexão via admin panel
3. Consulte documentação do Resend: https://resend.com/docs
