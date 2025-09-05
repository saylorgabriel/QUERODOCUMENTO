# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QUERODOCUMENTO is a B2C digital platform for protest consultation and certificate issuance services in Brazil. The platform allows users to:
- Check for pending protests using CPF/CNPJ
- Request official protest certificates from notary offices
- Make payments and receive invoices
- Track order status through a user dashboard

## Architecture Guidelines

### Technology Stack (Implemented)
This project uses the following modern stack:
- **Runtime**: Bun (3x faster than Node.js, TypeScript native support)
- **Frontend**: Next.js 14 with App Router + TypeScript
- **Styling**: TailwindCSS + shadcn/ui components + Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for session management and API response caching
- **Authentication**: Custom session-based auth (simple-session)
- **Container**: Docker for all services
- **Payment**: ASAAS/Pagar.me integration (mock implemented)
- **PDF Generation**: jsPDF with professional templates
- **Email Service**: Multi-provider system (SendGrid/Mailgun/SMTP/Resend)
- **Testing**: Jest + Testing Library + Playwright + MSW
- **Animation**: Framer Motion for smooth UX transitions
- **File Upload**: Secure document management with tokens

### Core System Components

1. **User-Facing Application** (`/app` or `/src/app`)
   - Landing page with service information
   - User authentication (registration/login)
   - Protest consultation interface
   - Certificate request forms
   - User dashboard for order tracking
   - Payment integration UI

2. **Admin Backoffice** (`/admin` or `/src/admin`)
   - Order management dashboard
   - User management
   - Document generation and status updates
   - Integration monitoring
   - Audit logs viewer

3. **API Layer** (`/api` or `/src/api`)
   - Authentication endpoints
   - Protest consultation service
   - Certificate request handling
   - Payment processing
   - Document generation
   - Email/WhatsApp notifications

4. **Integration Services** (`/services` or `/src/services`)
   - ASAAS/Pagar.me payment gateway
   - Email service (SendGrid/AWS SES/Mailgun)
   - WhatsApp Business API
   - PDF generation service
   - Notary office API integrations

### Development Commands

```bash
# Development with Docker
docker-compose -f docker-compose.dev.yml up    # Start all services in dev mode
docker-compose logs -f app-dev                  # View app logs

# Development without Docker
bun install                 # Install dependencies
bun run dev                # Run development server (http://localhost:3009)

# Database
bun run db:push            # Push schema changes to database
bun run db:migrate         # Run migrations
bun run db:studio          # Open Prisma Studio GUI
bun run db:generate        # Generate Prisma Client

# Testing
bun test                   # Run unit tests
bun run test:watch         # Run tests in watch mode
bun run test:coverage      # Generate coverage report
bun run test:integration   # Run integration tests
bun run test:e2e          # Run end-to-end tests

# Production Build
bun run build              # Build production bundle
bun run start              # Start production server
bun run lint              # Run ESLint
bun run typecheck         # Run TypeScript type checking

# Docker Commands
docker-compose build       # Build production images
docker-compose up -d       # Start production containers
docker-compose down        # Stop all containers
docker-compose logs -f     # View all logs
docker-compose -f docker-compose.test.yml up   # Start test environment
```

### Database Schema (Implemented in Prisma)

The database schema is defined in `prisma/schema.prisma` with the following entities:
- **User**: CPF/CNPJ, email, phone, authentication data
- **ProtestQuery**: Query results with status and PDF URL
- **ProtestItem**: Individual protest records found
- **Certificate**: Certificate requests with type and status
- **Order**: Payment tracking for services
- **Session**: User authentication sessions
- **AuditLog**: System actions for LGPD compliance

### Security & Compliance

- Implement LGPD compliance for handling personal data (CPF/CNPJ)
- All sensitive data must be encrypted at rest and in transit
- API rate limiting to prevent abuse
- Input validation for CPF/CNPJ formats
- Secure PDF generation with watermarks/signatures
- Payment data must never be stored directly (use tokenization)

### Integration Patterns

1. **Payment Gateway**: Use webhook endpoints for async payment confirmations
2. **Email Service**: Queue-based sending with retry logic
3. **WhatsApp**: Template messages for transactional notifications
4. **PDF Generation**: Async generation with status callbacks
5. **Notary APIs**: Implement circuit breakers for external service failures

### Environment Configuration

Use environment variables for all service configurations:
```
DATABASE_URL
REDIS_URL
ASAAS_API_KEY / PAGARME_API_KEY
EMAIL_SERVICE_API_KEY
WHATSAPP_BUSINESS_TOKEN
PDF_SERVICE_URL
NOTARY_API_ENDPOINTS
JWT_SECRET
```

### Testing Strategy

- Unit tests for business logic (protest validation, certificate rules)
- Integration tests for API endpoints
- E2E tests for critical user flows (consultation, payment, certificate request)
- Load testing for consultation endpoints (expect high traffic)

### Container Development

All development is containerized with Docker:
- **Development**: `docker-compose.dev.yml` with hot-reload
- **Production**: `docker-compose.yml` with optimized builds
- **Services included**:
  - App (Bun + Next.js)
  - PostgreSQL database
  - Redis cache
  - Nginx proxy
  - MailHog (dev only)
  - Adminer (dev only)

The Dockerfile uses multi-stage builds for optimal production images.

### Quick Start

```bash
# Clone and setup
git clone <repo>
cd QUERODOCUMENTO
cp .env.example .env

# Start with Docker
docker-compose -f docker-compose.dev.yml up

# Or start without Docker
bun install
bun run dev
```

SEMPRE SUBA O PROJETO VIA CONTAINER

Access:
- App: http://localhost:3009 ou http://app-dev.querodocumento.orb.local
- Admin Panel: http://localhost:3009/admin (admin credentials required)
- MailHog: http://localhost:8025 (dev - email testing)
- Adminer: http://localhost:8080 (dev - database admin)

### Key Features Implemented (95% MVP Complete)

#### Authentication & User Management
- Custom session-based authentication with secure cookies
- User registration/login with CPF/CNPJ validation
- Password reset functionality with email tokens
- Admin role system for backend access

#### Protest Consultation System
- Professional landing page with consultation form
- Real-time CPF/CNPJ validation with Brazilian algorithms
- Mock protest query system with realistic data scenarios
- Results display with professional UI/UX
- PDF generation with official templates, QR codes, and watermarks

#### Dashboard & Admin Panel
- User dashboard with real-time statistics from database
- Admin panel with comprehensive order/user/lead management
- Document upload and management system
- Email queue management and monitoring

#### Email System
- Multi-provider email service (SendGrid/Mailgun/SMTP/Resend)
- Professional HTML templates for all communications
- Queue system with retry mechanisms and failure handling
- Lead capture and remarketing automation

#### UX/UI Excellence
- Mobile-first responsive design
- Smooth animations with Framer Motion
- Professional loading states and skeleton loaders
- Modern glassmorphism design elements
- Accessibility compliance (WCAG 2.1 Level AA)

#### Testing & Quality Assurance
- 79+ unit tests with Jest and Testing Library
- Integration tests with real database operations
- End-to-end tests with Playwright across multiple browsers
- Performance and accessibility testing
- Security vulnerability audits completed

### Current Status
- **95% MVP Complete** - Production ready with mock data
- **Remaining 5%**: Real payment integration (ASAAS) and external API integration (CENPROT/SERASA)
- **Quality**: All critical bugs fixed, security vulnerabilities patched
- **Performance**: Optimized for production deployment