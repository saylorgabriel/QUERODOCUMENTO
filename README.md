# QUERODOCUMENTO 📄

Plataforma B2C digital para consulta de protestos e emissão de certidões no Brasil.

## 🚀 Visão Geral

QUERODOCUMENTO é uma plataforma moderna que digitaliza e simplifica o acesso a serviços cartorários de protesto no Brasil. O sistema permite que usuários consultem pendências de protesto e solicitem certidões oficiais de forma rápida, segura e 100% online.

## ✨ Principais Funcionalidades

### Para Usuários
- **Consulta de Protestos**: Verificação instantânea de pendências usando CPF/CNPJ
- **Solicitação de Certidões**: Processo simplificado para requisitar certidões oficiais
- **Dashboard Pessoal**: Acompanhamento em tempo real do status dos pedidos
- **Pagamento Online**: Integração com gateways de pagamento seguros
- **Notificações**: Alertas por email sobre o status dos pedidos

### Para Administradores
- **Painel Administrativo**: Gestão completa de pedidos e usuários
- **Sistema de Leads**: Captura e remarketing automatizado
- **Gestão de Documentos**: Upload e gerenciamento seguro de arquivos
- **Fila de Emails**: Sistema robusto com retry automático
- **Relatórios e Métricas**: Dashboard com indicadores de performance

## 🛠️ Tecnologias Utilizadas

### Core
- **Runtime**: [Bun](https://bun.sh/) - JavaScript runtime 3x mais rápido que Node.js
- **Framework**: [Next.js 14](https://nextjs.org/) com App Router
- **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
- **Estilização**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Animações**: [Framer Motion](https://www.framer.com/motion/)

### Backend
- **Banco de Dados**: PostgreSQL
- **ORM**: [Prisma](https://www.prisma.io/)
- **Cache**: Redis
- **Autenticação**: Sistema de sessões customizado

### DevOps
- **Containerização**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Testes**: Jest + Testing Library + Playwright

## 📦 Instalação

### Pré-requisitos
- Bun 1.0+ ou Node.js 18+
- Docker e Docker Compose
- PostgreSQL 15+ (se rodando sem Docker)
- Redis (se rodando sem Docker)

### Configuração com Docker (Recomendado)

```bash
# Clone o repositório
git clone https://github.com/saylorgabriel/QUERODOCUMENTO.git
cd QUERODOCUMENTO

# Configure as variáveis de ambiente
cp .env.example .env

# Inicie os containers
docker-compose -f docker-compose.dev.yml up
```

### Configuração Local

```bash
# Clone o repositório
git clone https://github.com/saylorgabriel/QUERODOCUMENTO.git
cd QUERODOCUMENTO

# Instale as dependências
bun install

# Configure as variáveis de ambiente
cp .env.example .env

# Configure o banco de dados
bun run db:push
bun run db:generate

# Inicie o servidor de desenvolvimento
bun run dev
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
bun run dev              # Inicia servidor de desenvolvimento
bun run build            # Build para produção
bun run start            # Inicia servidor de produção

# Banco de Dados
bun run db:push          # Sincroniza schema com banco
bun run db:migrate       # Executa migrações
bun run db:studio        # Abre Prisma Studio
bun run db:generate      # Gera Prisma Client

# Testes
bun test                 # Executa testes unitários
bun run test:integration # Executa testes de integração
bun run test:e2e         # Executa testes E2E
bun run test:coverage    # Gera relatório de cobertura

# Qualidade
bun run lint            # Executa linter
bun run typecheck       # Verifica tipos TypeScript
```

## 🌐 URLs de Acesso

### Desenvolvimento
- **Aplicação**: http://localhost:3009
- **Admin**: http://localhost:3009/admin
- **Mailhog** (emails): http://localhost:8025
- **Adminer** (DB): http://localhost:8080

### Produção
- **Aplicação**: https://querodocumento.com.br
- **Admin**: https://querodocumento.com.br/admin

## 📂 Estrutura do Projeto

```
QUERODOCUMENTO/
├── src/
│   ├── app/              # App Router (Next.js 14)
│   │   ├── api/          # API Routes
│   │   ├── admin/        # Páginas administrativas
│   │   └── (public)/     # Páginas públicas
│   ├── components/       # Componentes React
│   │   ├── ui/           # Componentes base (shadcn/ui)
│   │   ├── forms/        # Formulários
│   │   └── admin/        # Componentes admin
│   ├── lib/              # Utilitários e configurações
│   │   ├── email/        # Sistema de email
│   │   ├── pdf/          # Geração de PDFs
│   │   └── validators.ts # Validações CPF/CNPJ
│   └── styles/           # Estilos globais
├── prisma/               # Schema e migrações
├── docker/               # Configurações Docker
├── e2e-tests/           # Testes E2E
└── public/              # Assets estáticos
```

## 🔐 Segurança

- **LGPD Compliant**: Totalmente adequado à Lei Geral de Proteção de Dados
- **Criptografia**: Dados sensíveis criptografados em repouso e trânsito
- **Rate Limiting**: Proteção contra abuso de API
- **Validação**: CPF/CNPJ validados com algoritmos oficiais
- **Auditoria**: Logs completos de todas as operações

## 🧪 Testes

O projeto possui cobertura completa de testes:

- **Unitários**: Lógica de negócio e componentes
- **Integração**: APIs e fluxos de dados
- **E2E**: Jornadas completas do usuário
- **Performance**: Métricas de desempenho
- **Acessibilidade**: WCAG 2.1 Level AA

```bash
# Executar todos os testes
bun test

# Com cobertura
bun run test:coverage

# Apenas E2E
bun run test:e2e
```

## 📈 Status do Projeto

- ✅ **MVP Completo** (95%)
- ✅ Sistema de autenticação
- ✅ Consulta de protestos (mock)
- ✅ Solicitação de certidões
- ✅ Dashboard do usuário
- ✅ Painel administrativo
- ✅ Sistema de emails
- ✅ Geração de PDFs
- 🚧 Integração com APIs reais (CENPROT/SERASA)
- 🚧 Gateway de pagamento real (ASAAS/Pagar.me)

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor, siga estes passos:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário e confidencial. Todos os direitos reservados.

## 👥 Equipe

- **Saylor Gabriel** - Desenvolvedor Principal - [@saylorgabriel](https://github.com/saylorgabriel)

## 📞 Suporte

Para suporte, envie um email para suporte@querodocumento.com.br

---

Desenvolvido com ❤️ usando [Claude Code](https://claude.ai/code)