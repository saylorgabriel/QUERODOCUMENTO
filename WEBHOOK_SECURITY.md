# Webhook Security Implementation

## Overview

This document describes the security measures implemented for ASAAS payment webhooks to prevent unauthorized payment confirmations.

## Security Vulnerabilities Fixed

### CRITICAL: Webhook Signature Validation

**Previous Issue:**
- Webhooks only checked User-Agent header
- Anyone could send fake payment confirmation requests
- Attackers could mark orders as paid without actually paying

**Solution Implemented:**
- Token-based webhook authentication
- ASAAS webhook token verification on every request
- Security incident logging for unauthorized attempts
- Audit trail for all webhook activities

## Implementation Details

### Webhook Endpoint

**Secured Endpoint:** `/api/webhooks/asaas/route.ts`

**Removed Insecure Endpoint:** `/api/webhook/asaas/route.ts` (duplicate removed)

### Security Features

1. **Token Verification**
   - Verifies `asaas-access-token` header matches `ASAAS_WEBHOOK_TOKEN`
   - Rejects requests with invalid or missing tokens
   - Returns 401 Unauthorized for failed authentication

2. **Security Incident Logging**
   - Logs unauthorized webhook attempts to `AuditLog` table
   - Captures IP address, user agent, and partial signature
   - Enables security monitoring and threat detection

3. **Audit Trail**
   - Logs successful webhook processing
   - Records payment status changes
   - Links to order and user for compliance

## Configuration

### Environment Variables

Add to `.env`:

```bash
# ASAAS Webhook Token - CRITICAL SECURITY SETTING
# Generate: openssl rand -hex 32
ASAAS_WEBHOOK_TOKEN="your-secure-random-token-here"
```

### ASAAS Dashboard Configuration

1. Login to ASAAS Dashboard
2. Navigate to: **Configurações → Webhooks**
3. Configure webhook URL: `https://yourdomain.com/api/webhooks/asaas`
4. Set **Token de Acesso** to the SAME value as `ASAAS_WEBHOOK_TOKEN`
5. Enable desired webhook events:
   - `PAYMENT_RECEIVED`
   - `PAYMENT_CONFIRMED`
   - `PAYMENT_OVERDUE`
   - `PAYMENT_REFUNDED`

## Security Architecture

```
┌─────────────┐
│   ASAAS     │
│  Webhook    │
└─────┬───────┘
      │
      │ POST /api/webhooks/asaas
      │ Header: asaas-access-token
      ▼
┌─────────────────────────────┐
│  Signature Verification     │
│  ✓ Token matches?           │
│  ✓ Header present?          │
└─────┬──────────────┬────────┘
      │              │
   VALID          INVALID
      │              │
      ▼              ▼
┌─────────────┐  ┌──────────────┐
│  Process    │  │ Log Security │
│  Webhook    │  │   Incident   │
│  ✓ Update   │  │ Return 401   │
│  ✓ Audit    │  └──────────────┘
└─────────────┘
```

## Audit Logging

### Successful Webhooks

Logged with action: `WEBHOOK_PROCESSED`

```json
{
  "action": "WEBHOOK_PROCESSED",
  "resource": "ASAAS_WEBHOOK",
  "resourceId": "order-id",
  "metadata": {
    "event": "PAYMENT_RECEIVED",
    "paymentId": "pay_xxx",
    "paymentStatus": "RECEIVED",
    "orderNumber": "ORD-12345",
    "previousStatus": "AWAITING_PAYMENT",
    "newStatus": "PAYMENT_CONFIRMED",
    "processedAt": "2025-10-22T10:30:00.000Z"
  }
}
```

### Unauthorized Attempts

Logged with action: `WEBHOOK_UNAUTHORIZED`

```json
{
  "action": "WEBHOOK_UNAUTHORIZED",
  "resource": "ASAAS_WEBHOOK",
  "metadata": {
    "ip": "192.168.1.100",
    "userAgent": "curl/7.68.0",
    "signature": "invalid123",
    "timestamp": "2025-10-22T10:30:00.000Z",
    "securityEvent": "INVALID_WEBHOOK_SIGNATURE"
  }
}
```

## Monitoring & Alerts

### Query Unauthorized Attempts

```sql
SELECT
  createdAt,
  metadata->>'ip' as ip,
  metadata->>'userAgent' as userAgent,
  metadata->>'signature' as signature
FROM "AuditLog"
WHERE action = 'WEBHOOK_UNAUTHORIZED'
  AND resource = 'ASAAS_WEBHOOK'
ORDER BY createdAt DESC;
```

### Recommended Alerts

Set up monitoring for:
- Multiple unauthorized attempts from same IP (rate > 5/hour)
- Webhook processing failures (check logs)
- Missing `ASAAS_WEBHOOK_TOKEN` configuration

## Testing

### Test Webhook Security

```bash
# Test without token (should fail with 401)
curl -X POST https://yourdomain.com/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "payment": {
      "id": "pay_test",
      "status": "RECEIVED"
    }
  }'

# Test with invalid token (should fail with 401)
curl -X POST https://yourdomain.com/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -H "asaas-access-token: invalid-token" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "payment": {
      "id": "pay_test",
      "status": "RECEIVED"
    }
  }'

# Test with valid token (should succeed)
curl -X POST https://yourdomain.com/api/webhooks/asaas \
  -H "Content-Type: application/json" \
  -H "asaas-access-token: your-actual-token" \
  -d '{
    "event": "PAYMENT_RECEIVED",
    "payment": {
      "id": "pay_actual_order_id",
      "status": "RECEIVED"
    }
  }'
```

## Security Best Practices

1. **Token Generation**
   - Use cryptographically secure random tokens
   - Minimum 32 bytes (64 hex characters)
   - Generate with: `openssl rand -hex 32`

2. **Token Storage**
   - Store in environment variables (never in code)
   - Use different tokens for dev/staging/production
   - Rotate tokens periodically (e.g., quarterly)

3. **Monitoring**
   - Review audit logs regularly
   - Set up alerts for unauthorized attempts
   - Monitor webhook processing failures

4. **Network Security**
   - Use HTTPS only (enforce SSL/TLS)
   - Consider IP whitelisting (ASAAS IP ranges)
   - Implement rate limiting (prevent DoS)

## Compliance

This implementation supports:
- **LGPD Compliance**: Complete audit trail of payment status changes
- **PCI DSS**: No payment card data stored, tokenized payments only
- **Security Incident Response**: Automated logging and monitoring

## References

- [ASAAS Webhook Documentation](https://docs.asaas.com/reference/webhooks)
- [OWASP Webhook Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Webhook_Security_Cheat_Sheet.html)

## Changelog

### 2025-10-22 - Security Implementation
- ✅ Added webhook signature verification
- ✅ Implemented security incident logging
- ✅ Added audit trail for successful webhooks
- ✅ Removed duplicate insecure endpoint
- ✅ Updated documentation and configuration

---

**Status:** ✅ SECURED
**Last Updated:** 2025-10-22
**Reviewed By:** Security Team
