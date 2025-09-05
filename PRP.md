📄 PRD – QUERODOCUMENTO
1. Visão Geral

O QUERODOCUMENTO é uma plataforma digital focada em serviços relacionados a protesto de cobrança, com atuação B2C.
O objetivo é fornecer ao usuário uma experiência rápida, segura e simplificada para consultar protestos e emitir certidões de protesto em cartórios de todo o Brasil.

O site será similar ao meucartoriodigital.com.br
, mas com foco exclusivo em protestos.

2. Público-Alvo

Pessoa Física (CPF) e Pessoa Jurídica (CNPJ) que desejam:

Consultar pendências de protesto;

Emitir certidões de protesto para fins legais, financeiros ou administrativos.

3. Funcionalidades Principais
3.1. Consulta de Protesto

Busca por CPF ou CNPJ.

Consulta instantânea com retorno em tela.

Possíveis resultados:

Sem pendências (retorno imediato).

Com pendências (gerar PDF + envio por e-mail).

Cobrança por número de protestos encontrados.

Acompanhamento de status do pedido no painel do usuário.

3.2. Emissão de Certidão de Protesto

Preenchimento dos dados: Estado, Cidade, Cartório.

Usuário deve cadastrar-se/login para solicitar.

Envio automático de instruções de pagamento via e-mail.

Certidões emitidas podem ser:

Certidão Positiva (há protestos).

Certidão Negativa (sem protestos).

Status do pedido visível no painel do usuário.

3.3. Pagamentos

Integração com ASAAS ou Pagar.me.

Emissão de nota fiscal pelo serviço prestado.

3.4. Documentos e Regras

Geração de PDFs (consultas e certidões).

Disponibilização obrigatória de:

Prazos e Preços;

Termos de Uso;

Política de Privacidade.

4. Fluxos do Usuário
Fluxo 1 – Consulta de Protesto

Usuário acessa o site → seleciona "Consulta de Protesto".

Digita CPF ou CNPJ → sistema consulta base integrada (via API/backoffice).

Resultado:

Sem pendências → mensagem na tela + opção de gerar comprovante em PDF.

Com pendências → gerar PDF com lista → enviar por e-mail.

Usuário pode acessar painel para rever consultas.

Fluxo 2 – Emissão de Certidão

Usuário faz cadastro/login.

Preenche formulário (Estado, Cidade, Cartório).

Recebe instruções de pagamento por e-mail.

Após pagamento → sistema gera certidão (Positiva ou Negativa).

Certidão é enviada em PDF por e-mail + disponível no painel.

Fluxo 3 – Pagamento

Escolhe forma de pagamento (ASAAS ou Pagar.me).

Após confirmação → pedido avança no fluxo.

Nota fiscal gerada automaticamente e enviada ao e-mail do cliente.

5. Backoffice (Administração Interna)

Dashboard para acompanhar pedidos.

Gerenciamento de usuários e serviços solicitados.

Atualização manual/automática do status do pedido.

Geração e envio de documentos (PDFs).

Histórico de atendimentos.

Integração com e-mail e WhatsApp (notificações + suporte).

6. Requisitos Técnicos

Front-end: responsivo, UX simples (modelo semelhante aos concorrentes).

Back-end: API para consultas, emissão de documentos e integração com pagamentos.

Banco de Dados: armazenamento seguro de pedidos, usuários e documentos.

Integrações:

ASAAS ou Pagar.me (pagamentos).

Serviço de e-mail transacional (ex: SendGrid, AWS SES, Mailgun).

WhatsApp Business API (notificações e suporte).

Segurança:

LGPD (tratamento de dados sensíveis).

HTTPS + criptografia de dados.

Logs de auditoria no backoffice.

7. Concorrentes

protestosp.com.br

documentonobrasil.com.br

8. Diferenciais Propostos

Fluxo 100% digital simplificado.

Suporte via WhatsApp + e-mail.

Transparência em prazos e preços.

Dashboard de acompanhamento de pedidos.

Emissão rápida de documentos oficiais em PDF.

9. Entregáveis

Site responsivo B2C (landing page + área logada).

Backoffice administrativo conectado ao site.

Integrações com meios de pagamento, e-mail e WhatsApp.

Geração de PDFs (consultas e certidões).

Documentação técnica e manual de uso.

10. Roadmap Inicial (MVP)

Consulta de protesto (CPF/CNPJ) com retorno PDF/e-mail.

Cadastro/login de usuários.

Solicitação de certidão com formulário básico.

Integração com ASAAS/Pagar.me para pagamentos.

Backoffice para gestão de pedidos.

Envio de e-mail automático.

Landing page institucional com Termos, Políticas e Preços.

🔹 Esse PRD já pode ser usado para guiar Claude Code a gerar arquitetura do sistema, backlog de tarefas ou até boilerplates de código.

✅ Resumo em inglês

This PRD defines QUERODOCUMENTO, a B2C digital platform for protest consultation and certificate issuance. The system includes:

User features: protest check (CPF/CNPJ), instant results, PDF/e-mail reports, certificate requests with login, payment via ASAAS/Pagar.me, and invoice issuance.

Backoffice: order management, PDF generation, e-mail and WhatsApp integration.

Requirements: secure, LGPD-compliant, responsive site, with APIs for payments and document handling.

MVP scope: consultation service, certificate requests, user dashboard, payments, and notifications.