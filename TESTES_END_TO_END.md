# 🎭 TESTES END-TO-END - QUERODOCUMENTO MVP

Este documento define todos os testes end-to-end necessários para validar o funcionamento completo do MVP do QUERODOCUMENTO antes do lançamento em produção.

---

## 🎯 **OBJETIVO DOS TESTES**

Validar que todo o workflow end-to-end está funcionando corretamente:
- ✅ Fluxos de usuário (registro, pedidos, acompanhamento)
- ✅ Backoffice administrativo (processamento manual)
- ✅ Sistema de emails (notificações automáticas)
- ✅ Gestão de arquivos (upload/download seguro)
- ✅ Conformidade LGPD (privacidade e auditoria)

---

## 🚀 **CONFIGURAÇÃO DO AMBIENTE DE TESTE**

### **Pré-requisitos:**
```bash
# 1. Subir ambiente de desenvolvimento
docker-compose -f docker-compose.dev.yml up

# 2. URLs para teste
- App: http://localhost:3009 ou http://app-dev.querodocumento.orb.local
- MailHog: http://localhost:8025 (captura de emails)
- Adminer: http://localhost:8080 (banco de dados)

# 3. Usuário admin já criado
- Email: admin@querodocumento.com
- Senha: admin123456
```

### **Ferramentas de Teste:**
- **Playwright** para automação
- **MailHog** para verificação de emails
- **Browser DevTools** para validação mobile
- **Postman** para testes de API (opcional)

---

## 📝 **SUÍTES DE TESTE**

## **1. AUTENTICAÇÃO E REGISTRO** 🔐

### **Teste 1.1: Registro de Novo Usuário**
```
CENÁRIO: Usuário se registra pela primeira vez
DADOS: Nome: "João Silva", Email: "joao@teste.com", CPF: "123.456.789-00"

PASSOS:
1. Acessar http://localhost:3009 ou http://app-dev.querodocumento.orb.local
2. Clicar em "Entrar" ou "Registrar"
3. Preencher formulário de registro
4. Submeter formulário
5. Verificar redirecionamento para dashboard
6. Verificar email de boas-vindas no MailHog (http://localhost:8025)

RESULTADO ESPERADO:
✅ Usuário criado no banco
✅ Login automático após registro
✅ Email de boas-vindas enviado
✅ Dashboard carregado corretamente
```

### **Teste 1.2: Login de Usuário Existente**
```
CENÁRIO: Usuário já cadastrado faz login
DADOS: Email: "joao@teste.com", Senha: senha cadastrada

PASSOS:
1. Acessar página de login
2. Preencher email e senha
3. Clicar em "Entrar"
4. Verificar redirecionamento

RESULTADO ESPERADO:
✅ Login bem-sucedido
✅ Redirecionamento para dashboard
✅ Sessão ativa (não pede login novamente)
```

### **Teste 1.3: Recuperação de Senha**
```
CENÁRIO: Usuário esqueceu a senha
DADOS: Email: "joao@teste.com"

PASSOS:
1. Clicar em "Esqueci minha senha"
2. Inserir email
3. Verificar email no MailHog
4. Clicar no link de reset
5. Definir nova senha
6. Fazer login com nova senha

RESULTADO ESPERADO:
✅ Email de reset enviado
✅ Link funciona corretamente
✅ Nova senha aceita
✅ Login funcional
```

---

## **2. CONSULTA DE PROTESTO** 🔍

### **Teste 2.1: Consulta - Usuário Não Cadastrado**
```
CENÁRIO: Usuário novo solicita consulta via hero form
DADOS: CPF: "987.654.321-00", Nome: "Maria Santos", Telefone: "(11) 99999-9999"

PASSOS:
1. Acessar landing page
2. Preencher hero form com CPF/Nome/Telefone
3. Clicar em "INICIAR CONSULTA"
4. Verificar redirecionamento para /consulta-protesto
5. Prosseguir com formulário multi-step:
   - Etapa 1: Confirmar documento e preço (R$ 29,90)
   - Etapa 2: Criar conta (preencher dados pessoais)
   - Etapa 3: Dados para nota fiscal
   - Etapa 4: Método de pagamento (PIX/Cartão/Boleto)
6. Finalizar pedido
7. Verificar página de sucesso
8. Verificar email de confirmação no MailHog

RESULTADO ESPERADO:
✅ Usuário criado automaticamente
✅ Pedido criado com status "Aguardando Pagamento"
✅ Email de confirmação enviado
✅ Número de pedido exibido
✅ Instruções de pagamento claras
```

### **Teste 2.2: Consulta - Usuário Logado**
```
CENÁRIO: Usuário já cadastrado solicita nova consulta
DADOS: Usuário "João Silva" logado, Novo CPF: "111.222.333-44"

PASSOS:
1. Fazer login
2. Acessar dashboard
3. Clicar em "Nova Consulta"
4. Preencher formulário de consulta:
   - Etapa 1: CPF diferente do usuário
   - Etapa 2: Dados já preenchidos (permitir edição)
   - Etapa 3: Dados NF
   - Etapa 4: Pagamento
5. Finalizar pedido

RESULTADO ESPERADO:
✅ Dados do usuário pré-preenchidos
✅ Possibilidade de editar dados
✅ Novo pedido criado
✅ Email de confirmação
```

### **Teste 2.3: Validações do Formulário**
```
CENÁRIO: Testar validações de campos obrigatórios

TESTES:
1. CPF inválido → Mostrar erro
2. Email inválido → Mostrar erro
3. Telefone inválido → Mostrar erro
4. Campos vazios → Impedir avanço
5. CPF já consultado → Permitir ou alertar

RESULTADO ESPERADO:
✅ Mensagens de erro claras
✅ Campos inválidos destacados
✅ Não permitir submissão com dados inválidos
```

---

## **3. SOLICITAÇÃO DE CERTIDÃO** 📜

### **Teste 3.1: Certidão - Fluxo Completo**
```
CENÁRIO: Usuário logado solicita certidão
DADOS: Usuário "João Silva", Estado: "SP", Cidade: "São Paulo"

PASSOS:
1. Login no sistema
2. Acessar /certidao-protesto ou via dashboard
3. Preencher formulário multi-step:
   - Etapa 1: Selecionar Estado → Cidade → Cartório
   - Etapa 2: Login já feito (pular)
   - Etapa 3: Motivo da solicitação
   - Etapa 4: Dados NF
   - Etapa 5: Confirmar e solicitar orçamento
4. Verificar página de sucesso
5. Verificar email no MailHog

RESULTADO ESPERADO:
✅ Seleção hierárquica funcionando (Estado→Cidade→Cartório)
✅ Opção "Todos os cartórios" disponível
✅ Pedido criado com status "Pedido Confirmado"
✅ Email informando prazo de orçamento (3 dias úteis)
✅ Preço estimado mostrado
```

### **Teste 3.2: Seleção de Localização**
```
CENÁRIO: Validar sistema de seleção hierárquica

TESTES:
1. Selecionar estado → Cidades carregam
2. Selecionar cidade → Cartórios carregam
3. Opção "Todos os cartórios" funciona
4. Reset de seleções funciona

RESULTADO ESPERADO:
✅ Dropdowns dependentes funcionando
✅ Dados carregam corretamente
✅ Interface responsiva
```

---

## **4. DASHBOARD DO USUÁRIO** 📊

### **Teste 4.1: Visualização de Pedidos**
```
CENÁRIO: Usuário acessa dashboard com pedidos
DADOS: Usuário com 2 pedidos (1 consulta, 1 certidão)

PASSOS:
1. Login no sistema
2. Verificar dashboard carregado
3. Verificar estatísticas rápidas
4. Ver lista de pedidos
5. Clicar em "Ver Detalhes" de um pedido
6. Testar filtros (status, tipo de serviço)
7. Testar busca

RESULTADO ESPERADO:
✅ Estatísticas corretas (total, pendentes, gastos)
✅ Lista de pedidos com status visuais
✅ Detalhes do pedido completos
✅ Filtros funcionando
✅ Busca operacional
✅ Paginação se necessário
```

### **Teste 4.2: Download de Documentos**
```
CENÁRIO: Usuário baixa documento pronto
DADOS: Pedido com status "Finalizado" e PDF anexado

PASSOS:
1. Acessar dashboard
2. Identificar pedido finalizado
3. Clicar em "Download"
4. Verificar download do PDF
5. Verificar log de download

RESULTADO ESPERADO:
✅ Botão download visível apenas para pedidos finalizados
✅ PDF baixado corretamente
✅ Download logado no sistema
✅ Link seguro (não acessível sem login)
```

---

## **5. BACKOFFICE ADMINISTRATIVO** ⚙️

### **Teste 5.1: Login Admin**
```
CENÁRIO: Funcionário acessa backoffice
DADOS: admin@querodocumento.com / admin123456

PASSOS:
1. Acessar http://localhost:3009/admin
2. Fazer login com credenciais admin
3. Verificar dashboard admin
4. Verificar métricas

RESULTADO ESPERADO:
✅ Login admin funcional
✅ Dashboard com estatísticas
✅ Acesso apenas para role ADMIN
✅ Métricas atualizadas
```

### **Teste 5.2: Gerenciamento de Pedidos**
```
CENÁRIO: Admin visualiza e gerencia pedidos
DADOS: Pedidos com diferentes status

PASSOS:
1. Acessar /admin/pedidos
2. Verificar lista de pedidos
3. Usar filtros (status, tipo, data)
4. Usar busca por CPF/nome
5. Clicar em "Ver Detalhes" de um pedido
6. Verificar detalhes completos

RESULTADO ESPERADO:
✅ Lista completa de pedidos
✅ Filtros funcionando
✅ Busca operacional
✅ Paginação funcional
✅ Detalhes completos
✅ Dados sensíveis mascarados (LGPD)
```

### **Teste 5.3: Processamento Manual - Consulta**
```
CENÁRIO: Funcionário processa consulta de protesto
DADOS: Pedido com status "Pagamento Confirmado"

PASSOS:
1. Acessar detalhes do pedido
2. Clicar em "Processar Pedido"
3. Ver interface de processamento
4. Inserir número de protocolo CENPROT
5. Alterar status para "Em Processamento"
6. Inserir resultado da consulta:
   - Opção A: "Nenhum protesto encontrado"
   - Opção B: "Protestos encontrados" + detalhes
7. Upload do PDF resultado
8. Finalizar pedido
9. Verificar email enviado ao cliente

RESULTADO ESPERADO:
✅ Interface de processamento intuitiva
✅ Templates de resposta funcionando
✅ Upload de PDF bem-sucedido
✅ Status atualizado automaticamente
✅ Email automático ao cliente
✅ Histórico de ações registrado
```

### **Teste 5.4: Processamento Manual - Certidão**
```
CENÁRIO: Funcionário processa solicitação de certidão
DADOS: Pedido certidão com status "Pedido Confirmado"

PASSOS:
1. Acessar detalhes do pedido de certidão
2. Inserir protocolo CENPROT
3. Alterar status para "Aguardando Orçamento"
4. Receber valor do cartório (simular)
5. Inserir valor da certidão (ex: R$ 150,00)
6. Enviar orçamento ao cliente
7. Status muda para "Aguardando Pagamento"
8. Após pagamento confirmado:
   - Status "Documento Solicitado"
   - Upload da certidão recebida
   - Status "Finalizado"
   - Email automático com certidão

RESULTADO ESPERADO:
✅ Workflow completo de certidão
✅ Sistema de orçamento funcional
✅ Emails automáticos em cada etapa
✅ Upload da certidão final
✅ Cliente recebe documento
```

### **Teste 5.5: Upload de Documentos**
```
CENÁRIO: Admin faz upload de PDF para pedido
DADOS: PDF de resultado ou certidão

PASSOS:
1. Acessar pedido em processamento
2. Usar interface de upload (drag & drop)
3. Selecionar arquivo PDF válido
4. Verificar upload bem-sucedido
5. Ver documento na lista
6. Testar download do documento
7. Verificar logs de upload

RESULTADO ESPERADO:
✅ Interface drag & drop funcional
✅ Validação de tipo de arquivo (só PDF)
✅ Limite de tamanho respeitado (10MB)
✅ Upload progress indicator
✅ Arquivo armazenado corretamente
✅ Logs de auditoria criados
```

---

## **6. SISTEMA DE EMAILS** 📧

### **Teste 6.1: Emails Automáticos**
```
CENÁRIO: Validar todos os emails automáticos
DADOS: Fluxo completo de pedido

EMAILS PARA TESTAR:
1. Boas-vindas (após registro)
2. Confirmação de pedido (após criação)
3. Pagamento confirmado (após webhook)
4. Em processamento (admin muda status)
5. Orçamento pronto (só certidões)
6. Documento pronto (com download)
7. Status genérico (outras mudanças)

PASSOS:
1. Executar cada fluxo
2. Verificar MailHog após cada ação
3. Validar template usado
4. Verificar conteúdo personalizado
5. Testar links nos emails

RESULTADO ESPERADO:
✅ Todos os emails enviados
✅ Templates corretos aplicados
✅ Conteúdo personalizado (nome, pedido, valores)
✅ Links funcionais
✅ Formatação brasileira (moeda, data)
```

### **Teste 6.2: Dashboard de Emails (Admin)**
```
CENÁRIO: Admin gerencia emails enviados
DADOS: Emails na fila/histórico

PASSOS:
1. Acessar /admin/emails
2. Ver lista de emails enviados
3. Verificar estatísticas
4. Filtrar por status/tipo
5. Tentar reenviar email falhado
6. Ver detalhes de email específico

RESULTADO ESPERADO:
✅ Dashboard de emails funcional
✅ Estatísticas precisas
✅ Filtros operacionais
✅ Reenvio funcional
✅ Logs detalhados
```

---

## **7. GESTÃO DE ARQUIVOS** 📄

### **Teste 7.1: Segurança de Downloads**
```
CENÁRIO: Validar controle de acesso a arquivos
DADOS: Pedido com PDF de usuário A, usuário B logado

PASSOS:
1. Login com usuário A
2. Upload de documento para seu pedido
3. Logout
4. Login com usuário B
5. Tentar acessar documento do usuário A
6. Tentar acessar via URL direta

RESULTADO ESPERADO:
✅ Usuário B não vê documentos do usuário A
✅ URL direta negada (403/404)
✅ Admin tem acesso a todos os documentos
✅ Links de download são seguros/temporários
```

### **Teste 7.2: Expiração de Arquivos**
```
CENÁRIO: Validar TTL de 3 meses
DADOS: Arquivos antigos no sistema

PASSOS:
1. Simular arquivo com data antiga
2. Executar script de limpeza
3. Verificar arquivo removido
4. Verificar log de limpeza

RESULTADO ESPERADO:
✅ Arquivos antigos removidos
✅ Arquivos recentes mantidos
✅ Logs de limpeza gerados
✅ Sistema continua funcional
```

---

## **8. CONFORMIDADE LGPD** 🛡️

### **Teste 8.1: Mascaramento de Dados**
```
CENÁRIO: Verificar privacidade de dados sensíveis
DADOS: CPF/CNPJ em diferentes telas

PASSOS:
1. Admin vê lista de pedidos
2. Verificar CPF mascarado (XXX.XXX.XXX-XX)
3. Acessar detalhes → Ver CPF completo
4. Verificar logs de acesso
5. Usuário vê apenas seus próprios dados

RESULTADO ESPERADO:
✅ CPF mascarado em listas
✅ Dados completos apenas quando necessário
✅ Logs de acesso criados
✅ Separação de dados por usuário
```

### **Teste 8.2: Auditoria e Logs**
```
CENÁRIO: Validar trilha de auditoria
DADOS: Ações diversas no sistema

AÇÕES PARA LOGAR:
1. Login/logout
2. Criação de pedidos
3. Mudanças de status
4. Downloads de arquivo
5. Uploads de documento

PASSOS:
1. Executar cada ação
2. Verificar logs criados
3. Validar dados nos logs
4. Verificar retenção de dados

RESULTADO ESPERADO:
✅ Todas as ações logadas
✅ Logs com dados suficientes
✅ Timestamps corretos
✅ Identificação do usuário/admin
```

---

## **9. RESPONSIVIDADE E UX** 📱

### **Teste 9.1: Mobile Responsivo**
```
CENÁRIO: Testar em dispositivos móveis
DISPOSITIVOS: iPhone, Android, Tablet

TESTES:
1. Landing page → Formulário hero
2. Formulários multi-step
3. Dashboard do usuário
4. Admin em tablet (funcionários)
5. Upload de arquivos touch

RESULTADO ESPERADO:
✅ Todos os elementos visíveis
✅ Navegação funcional
✅ Formulários utilizáveis
✅ Upload funciona em touch
✅ Performance adequada
```

### **Teste 9.2: Navegação e UX**
```
CENÁRIO: Validar experiência do usuário
DADOS: Usuário primeiro acesso

TESTES:
1. Fluxo intuitivo de registro
2. Instruções claras em cada etapa
3. Loading states funcionais
4. Mensagens de erro claras
5. Breadcrumbs funcionais
6. Botão voltar funcional

RESULTADO ESPERADO:
✅ Navegação intuitiva
✅ Usuário não se perde
✅ Feedback visual adequado
✅ Mensagens em português claro
```

---

## **10. PERFORMANCE E CARGA** ⚡

### **Teste 10.1: Performance Básica**
```
CENÁRIO: Validar tempos de carregamento
DADOS: Páginas principais

TESTES:
1. Landing page < 2s
2. Dashboard < 3s
3. Admin pedidos < 3s
4. Formulários responsivos
5. Upload de 10MB < 30s

RESULTADO ESPERADO:
✅ Tempos dentro do aceitável
✅ Indicadores de loading
✅ Sem travamentos
✅ Experiência fluida
```

---

## **11. INTEGRAÇÃO DE SISTEMAS** 🔗

### **Teste 11.1: Docker Environment**
```
CENÁRIO: Validar ambiente containerizado
DADOS: docker-compose.dev.yml

PASSOS:
1. Docker up
2. Verificar todos os serviços:
   - app-dev (Node.js)
   - postgres (Database)
   - redis (Cache)
   - mailhog (Email)
   - adminer (DB Admin)
3. Testar conectividade entre serviços
4. Verificar logs de cada container

RESULTADO ESPERADO:
✅ Todos os containers sobem
✅ Comunicação entre serviços OK
✅ Logs sem erros críticos
✅ Aplicação acessível
```

### **Teste 11.2: Webhook Simulation**
```
CENÁRIO: Simular webhook de pagamento
DADOS: Pedido pendente de pagamento

PASSOS:
1. Criar pedido
2. Simular webhook de confirmação
3. Verificar mudança de status
4. Verificar email de confirmação
5. Testar webhook inválido

RESULTADO ESPERADO:
✅ Status atualizado automaticamente
✅ Email enviado
✅ Webhooks inválidos rejeitados
✅ Logs de segurança criados
```

---

## 🚦 **CRITÉRIOS DE ACEITAÇÃO**

### **✅ MVP APROVADO SE:**
1. **Todos os fluxos principais funcionam** (registro → pedido → processamento → entrega)
2. **Emails são enviados** em todas as etapas críticas
3. **Admin consegue processar** pedidos manualmente
4. **Arquivos são gerenciados** com segurança
5. **LGPD está implementada** (mascaramento + logs)
6. **Sistema é responsivo** em mobile/tablet
7. **Performance é aceitável** (< 3s para páginas principais)
8. **Não há erros críticos** nos logs

### **🔴 BLOQUEADORES:**
- Login não funciona
- Pedidos não são criados
- Emails não são enviados
- Upload/download falha
- Admin não consegue processar
- Dados sensíveis expostos
- Site quebrado em mobile

---

## 📋 **CHECKLIST FINAL DE VALIDAÇÃO**

### **Funcionalidades Core:**
- [ ] Registro de usuário + email boas-vindas
- [ ] Login/logout funcionando
- [ ] Consulta de protesto (formulário → pedido → email)
- [ ] Certidão de protesto (seleção → orçamento → workflow)
- [ ] Dashboard usuário (pedidos + downloads)
- [ ] Admin login e dashboard
- [ ] Lista de pedidos admin (filtros + busca)
- [ ] Processamento manual (consulta + certidão)
- [ ] Upload/download de PDFs
- [ ] Sistema de emails (8 templates)
- [ ] Mascaramento LGPD
- [ ] Auditoria e logs

### **Qualidade e UX:**
- [ ] Mobile responsivo
- [ ] Performance adequada
- [ ] Mensagens de erro claras
- [ ] Loading states
- [ ] Navegação intuitiva
- [ ] Validações de formulário
- [ ] Segurança de acesso

### **Integração:**
- [ ] Docker environment funcional
- [ ] MailHog capturando emails
- [ ] Banco PostgreSQL operacional
- [ ] Redis funcionando
- [ ] Logs sem erros críticos

---

## 🎯 **EXECUÇÃO DOS TESTES**

### **Ordem Recomendada:**
1. **Setup** → Docker up + verificar serviços
2. **Autenticação** → Registro, login, recovery
3. **Fluxos usuário** → Consulta + Certidão completos
4. **Backoffice** → Admin + processamento manual
5. **Emails** → Verificar todos os templates
6. **Arquivos** → Upload/download + segurança
7. **LGPD** → Mascaramento + auditoria
8. **UX/Mobile** → Responsividade + performance

### **Estimativa de Tempo:**
- **Setup inicial:** 30 minutos
- **Testes funcionais:** 4-6 horas
- **Testes de qualidade:** 2-3 horas
- **Validação final:** 1 hora

**TOTAL: 1-2 dias de testes completos**

---

*Este documento garante que o MVP está 100% funcional e pronto para validação com usuários reais!*

---

**📧 MailHog:** http://localhost:3025  
**🌐 Aplicação:** http://localhost:3009  
**👨‍💼 Admin:** admin@querodocumento.com / admin123456