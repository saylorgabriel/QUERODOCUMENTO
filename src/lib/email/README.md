# QUERODOCUMENTO Email Templates

Comprehensive email system with professional templates for all order workflow notifications.

## Features

- **Professional Design**: QUERODOCUMENTO branded templates with responsive design
- **Template Engine**: Advanced variable substitution, conditionals, and loops
- **Brazilian Localization**: Date, currency, and phone number formatting
- **LGPD Compliant**: Privacy notices and data protection features
- **Multi-Provider Support**: SendGrid, Mailgun, SMTP, and MailHog
- **Rate Limiting**: Built-in protection against email spam
- **Retry Logic**: Automatic failover and retry mechanisms

## Available Templates

### User Templates
- `welcome` - Welcome email after registration
- `password-reset` - Password recovery email

### Order Templates  
- `order-confirmation` - Order created confirmation
- `payment-confirmed` - Payment successful notification
- `order-processing` - Order being processed notification
- `quote-ready` - Certificate quote available
- `order-completed` - Order finished with download links

### System Templates
- `status-update` - Generic status change notification

## Quick Start

### Using Template Helpers (Recommended)

```typescript
import { 
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendPaymentConfirmationEmail,
  sendOrderCompletedEmail
} from '@/lib/email/template-helpers'

// Send welcome email
await sendWelcomeEmail({
  name: 'João Silva',
  email: 'joao@example.com',
  createdAt: new Date()
})

// Send order confirmation
await sendOrderConfirmationEmail({
  customerName: 'João Silva',
  customerEmail: 'joao@example.com', 
  orderNumber: 'ORD-2024-001',
  serviceType: 'Consulta de Protesto',
  amount: 29.90,
  requiresPayment: true,
  isPIX: true
})
```

### Using Templates Directly

```typescript
import { getEmailTemplate, sendEmail } from '@/lib/email'

const template = getEmailTemplate('welcome', {
  name: 'João Silva',
  email: 'joao@example.com'
})

await sendEmail({
  to: 'joao@example.com',
  subject: template.subject,
  html: template.html,
  text: template.text
})
```

## Template Engine Features

### Variable Substitution
```html
<p>Olá {{name}}, seu pedido {{orderNumber}} está pronto!</p>
```

### Formatters
```html
<p>Valor: {{amount|currency}}</p>
<p>Data: {{createdAt|date}}</p>
<p>Hora: {{createdAt|time}}</p>
<p>CPF: {{cpf|cpfCnpj}}</p>
<p>Telefone: {{phone|phone}}</p>
```

### Conditionals
```html
{{#if hasProtests}}
<div class="alert alert-warning">
  Protestos encontrados!
</div>
{{#else}}
<div class="alert alert-success">
  Nenhum protesto encontrado.
</div>
{{/if}}
```

### Loops
```html
{{#each documents}}
<div class="document-item">
  <h4>{{this.name}}</h4>
  <p>{{this.type}} - {{this.size}}</p>
</div>
{{/each}}
```

## Template Data Structure

```typescript
interface EmailTemplateData {
  // User information
  name: string
  email?: string
  cpfCnpj?: string
  phone?: string
  
  // Order information
  orderNumber?: string
  orderStatus?: string
  serviceType?: string
  amount?: string | number
  paymentMethod?: string
  
  // URLs
  resetUrl?: string
  downloadUrl?: string
  dashboardUrl?: string
  
  // Arrays for loops
  documents?: Array<{
    name: string
    type: string
    url?: string
    size?: string
  }>
  
  protests?: Array<{
    date: string
    value: string
    creditor: string
    notary: string
  }>
  
  // Conditional flags
  hasProtests?: boolean
  requiresPayment?: boolean
  isPIX?: boolean
  isCreditCard?: boolean
  
  // Dates
  createdAt?: Date | string
  dueDate?: Date | string
  expiresAt?: Date | string
}
```

## Styling and Design

### Brand Colors
- Primary Blue: `#1e40af` (headers)
- Success Green: `#10b981` (completed states)
- Warning Orange: `#f97316` (pending/quotes)  
- Error Red: `#dc2626` (failures/security)

### Components
- **Headers**: Gradient backgrounds with logo
- **Info Boxes**: Structured data display
- **Progress Indicators**: Visual status tracking
- **Alert Boxes**: Success, warning, info, error states
- **Buttons**: Call-to-action with hover effects
- **Document Lists**: File attachments display

### Responsive Design
- Mobile-first approach
- Email client compatibility (Outlook, Gmail, Apple Mail)
- Dark mode support where available

## Usage Examples

### Complete Order Workflow

```typescript
// 1. Order created
await sendOrderConfirmationEmail({
  customerName: 'Maria Santos',
  customerEmail: 'maria@example.com',
  orderNumber: 'ORD-2024-002',
  serviceType: 'Certidão Negativa de Protesto',
  amount: 45.90,
  requiresPayment: true,
  isPIX: false,
  isCreditCard: true
})

// 2. Payment confirmed
await sendPaymentConfirmationEmail({
  customerName: 'Maria Santos',
  customerEmail: 'maria@example.com',
  orderNumber: 'ORD-2024-002',
  amount: 45.90,
  paymentMethod: 'Cartão de Crédito',
  isCreditCard: true
})

// 3. Processing started
await sendOrderProcessingEmail({
  customerName: 'Maria Santos',
  customerEmail: 'maria@example.com',
  orderNumber: 'ORD-2024-002',
  serviceType: 'Certidão Negativa de Protesto',
  orderStatus: 'Processando',
  hasProtests: false,
  dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
})

// 4. Order completed
await sendOrderCompletedEmail({
  customerName: 'Maria Santos',
  customerEmail: 'maria@example.com',
  orderNumber: 'ORD-2024-002',
  serviceType: 'Certidão Negativa de Protesto',
  downloadUrl: 'https://app.com/download/cert-neg-002.pdf',
  hasProtests: false,
  documents: [{
    name: 'Certidão Negativa de Protesto',
    type: 'PDF',
    url: 'https://app.com/download/cert-neg-002.pdf',
    size: '245 KB'
  }]
})
```

### Batch Email Processing

```typescript
import { batchSendEmails } from '@/lib/email/template-helpers'

await batchSendEmails([
  {
    type: 'welcome',
    data: { name: 'João', email: 'joao@example.com' }
  },
  {
    type: 'order-confirmation', 
    data: { 
      customerName: 'Maria',
      customerEmail: 'maria@example.com',
      orderNumber: 'ORD-001',
      serviceType: 'Consulta',
      amount: 29.90
    }
  }
], {
  delayBetweenEmails: 100, // 100ms delay
  maxConcurrent: 5 // 5 emails at once
})
```

## Testing

### Development Mode
```bash
# Use MailHog for local testing
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Set environment
EMAIL_PROVIDER=mailhog
EMAIL_SKIP_SENDING=false
```

### Template Preview
```typescript
import { getEmailTemplate } from '@/lib/email'

// Generate template for preview
const template = getEmailTemplate('welcome', {
  name: 'João Silva',
  email: 'joao@test.com'
})

console.log(template.html) // Preview HTML
console.log(template.text) // Preview text version
```

## Migration from Legacy Templates

Legacy functions are still available but deprecated:

```typescript
// ❌ Old way (deprecated)
import { sendWelcomeEmail } from '@/lib/email'

// ✅ New way (recommended) 
import { sendWelcomeEmail } from '@/lib/email/template-helpers'
```

## Configuration

Set environment variables:
```bash
# Primary email provider
EMAIL_PROVIDER=sendgrid
EMAIL_SENDGRID_API_KEY=your_key

# Fallback provider
EMAIL_FALLBACK_PROVIDER=mailgun
EMAIL_MAILGUN_API_KEY=your_key
EMAIL_MAILGUN_DOMAIN=your_domain

# Default settings
EMAIL_DEFAULT_FROM=noreply@querodocumento.com.br
EMAIL_SKIP_SENDING=false # Set true for development

# Rate limiting
EMAIL_RATE_LIMIT_PER_MINUTE=60
EMAIL_RATE_LIMIT_PER_HOUR=1000
EMAIL_RATE_LIMIT_PER_DAY=10000
```

## Monitoring and Analytics

```typescript
import { getEmailStats } from '@/lib/email/email-service'

// Get email statistics
const stats = await getEmailStats(30) // Last 30 days
console.log({
  totalSent: stats.totalSent,
  totalFailed: stats.totalFailed,
  successRate: (stats.totalSent / (stats.totalSent + stats.totalFailed)) * 100
})
```

## Support

- **Template Issues**: Check console logs for template compilation errors
- **Delivery Issues**: Monitor email service logs and provider status
- **Styling Issues**: Test across multiple email clients
- **Rate Limits**: Adjust batch sizes and delays as needed

For questions about the email system, check the implementation files in `/src/lib/email/` or contact the development team.