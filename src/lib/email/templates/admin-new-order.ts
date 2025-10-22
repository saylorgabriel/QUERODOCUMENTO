/**
 * Admin New Order Notification Template
 * Sent to admin when a new order is created
 */

interface AdminNewOrderData {
  orderNumber: string
  customerName: string
  customerEmail: string
  serviceType: string
  documentNumber: string
  documentType: 'CPF' | 'CNPJ'
  amount: string
  paymentMethod: string
  status: string
  adminUrl: string
}

export function generateAdminNewOrderEmail(data: AdminNewOrderData): { html: string; text: string; subject: string } {
  const subject = `🔔 Novo Pedido Recebido - #${data.orderNumber}`

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 12px;
      padding: 32px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #dc2626;
    }
    .header h1 {
      color: #dc2626;
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 700;
    }
    .order-number {
      font-size: 18px;
      color: #666;
      font-weight: 600;
    }
    .alert-badge {
      display: inline-block;
      background-color: #fef3c7;
      color: #92400e;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 24px;
    }
    .section {
      margin-bottom: 24px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .info-grid {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      color: #6b7280;
      font-weight: 500;
      font-size: 14px;
    }
    .info-value {
      color: #1f2937;
      font-weight: 600;
      font-size: 14px;
      text-align: right;
    }
    .customer-info {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 16px;
      border-radius: 4px;
      margin-bottom: 16px;
    }
    .customer-name {
      font-weight: 700;
      color: #1e40af;
      font-size: 16px;
      margin-bottom: 4px;
    }
    .customer-email {
      color: #3b82f6;
      font-size: 14px;
    }
    .cta-button {
      display: inline-block;
      background-color: #dc2626;
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-weight: 600;
      text-align: center;
      margin: 24px 0;
      transition: background-color 0.2s;
    }
    .cta-button:hover {
      background-color: #b91c1c;
    }
    .footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      background-color: #fef3c7;
      color: #92400e;
    }
    .amount-highlight {
      font-size: 20px;
      font-weight: 700;
      color: #059669;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Novo Pedido Recebido</h1>
      <div class="order-number">#${data.orderNumber}</div>
    </div>

    <div class="alert-badge">
      ⚡ Ação necessária: Novo pedido aguardando processamento
    </div>

    <div class="section">
      <div class="section-title">👤 Informações do Cliente</div>
      <div class="customer-info">
        <div class="customer-name">${data.customerName}</div>
        <div class="customer-email">📧 ${data.customerEmail}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📋 Detalhes do Pedido</div>
      <div class="info-grid">
        <div class="info-row">
          <span class="info-label">Número do Pedido</span>
          <span class="info-value">#${data.orderNumber}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Serviço</span>
          <span class="info-value">${data.serviceType}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Documento</span>
          <span class="info-value">${data.documentNumber} (${data.documentType})</span>
        </div>
        <div class="info-row">
          <span class="info-label">Forma de Pagamento</span>
          <span class="info-value">${data.paymentMethod}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status</span>
          <span class="info-value">
            <span class="status-badge">${data.status}</span>
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">Valor Total</span>
          <span class="info-value amount-highlight">${data.amount}</span>
        </div>
      </div>
    </div>

    <div style="text-align: center;">
      <a href="${data.adminUrl}" class="cta-button">
        🔗 Ver Pedido no Painel Admin
      </a>
    </div>

    <div class="footer">
      <p>Este é um email automático enviado pelo sistema QueroDocumento.</p>
      <p>Para acessar todos os pedidos, visite o <a href="https://querodocumento.com.br/admin/pedidos" style="color: #dc2626;">Painel Administrativo</a></p>
    </div>
  </div>
</body>
</html>
  `.trim()

  const text = `
🔔 NOVO PEDIDO RECEBIDO - #${data.orderNumber}

⚡ Ação necessária: Novo pedido aguardando processamento

👤 INFORMAÇÕES DO CLIENTE
Nome: ${data.customerName}
Email: ${data.customerEmail}

📋 DETALHES DO PEDIDO
Número do Pedido: #${data.orderNumber}
Serviço: ${data.serviceType}
Documento: ${data.documentNumber} (${data.documentType})
Forma de Pagamento: ${data.paymentMethod}
Status: ${data.status}
Valor Total: ${data.amount}

🔗 ACESSAR PEDIDO:
${data.adminUrl}

---
Este é um email automático enviado pelo sistema QueroDocumento.
Para acessar todos os pedidos, visite: https://querodocumento.com.br/admin/pedidos
  `.trim()

  return { html, text, subject }
}
