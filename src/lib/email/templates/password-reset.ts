/**
 * Password Reset Email Template
 * Professional and secure email template for password recovery
 */

import { EmailTemplateData, EmailTemplate, TemplateEngine, createEmailTemplate, createTextTemplate } from './base'

export function getPasswordResetTemplate(data: EmailTemplateData): EmailTemplate {
  const htmlContent = `
    <div class="content">      
      <p>Olá <strong>{{name|capitalize}}</strong>,</p>
      
      <p>Não precisa se preocupar, vamos te ajudar a recuperar seu acesso na QueroDocumento. Se você fez esta solicitação, siga as instruções abaixo para criar uma nova senha.</p>
      
      <div class="alert alert-info">
        <div class="alert-title">🔐 Solicitação de Redefinição</div>
        <div class="alert-text">
          Uma nova senha foi solicitada para sua conta. Por segurança, este link expira em 30 minutos.
        </div>
      </div>
      
      {{#if resetUrl}}
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px; border-radius: 12px; text-align: center; margin: 32px 0; color: white;">
        <a href="{{resetUrl}}" class="button" style="background: rgba(255,255,255,0.2); border: 2px solid white; color: white !important;">
          🔒 Redefinir Minha Senha
        </a>
      </div>
      {{/if}}
      
      <div class="alert alert-warning">
        <div class="alert-title">⚠️ Importante - Medidas de Segurança</div>
        <div class="alert-text">
          • <strong>Link único:</strong> Este link funciona apenas uma vez<br>
          • <strong>Prazo limitado:</strong> Expira automaticamente em 30 minutos<br>
          • <strong>Acesso seguro:</strong> Use apenas em dispositivos confiáveis<br>
          • <strong>Não compartilhe:</strong> Este email é pessoal e intransferível
        </div>
      </div>
      
      <hr class="divider">
      
      <p><strong>Conte conosco para manter sua conta sempre segura!</strong></p>
    </div>
  `

  const textContent = `
    REDEFINIR SUA SENHA
    
    Olá {{name|capitalize}},
    
    Recebemos uma solicitação para redefinir a senha da sua conta no QueroDocumento.
    
    🔐 SOLICITAÇÃO DE REDEFINIÇÃO
    Nova senha solicitada. Por segurança, este link expira em 30 minutos.
    
    👤 DETALHES:
    • Conta: {{email}}
    • Data/Hora: {{createdAt|date}} às {{createdAt|time}}
    • Expira: 30 minutos
    • Status: Aguardando Ação
    
    {{#if resetUrl}}
    🔑 CRIAR NOVA SENHA:
    {{resetUrl}}
    
    Clique no link acima para definir sua nova senha.
    {{/if}}
    
    ⚠️ MEDIDAS DE SEGURANÇA:
    • Link único - funciona apenas uma vez
    • Prazo limitado - expira em 30 minutos
    • Acesso seguro - use dispositivos confiáveis
    • Não compartilhe - email pessoal e intransferível
    
    🛡️ SE VOCÊ NÃO SOLICITOU:
    Fique tranquilo! Sua conta está segura.
    ✅ Ignore este email - senha atual inalterada
    ✅ Sem ações necessárias - link expira automaticamente
    ✅ Conta protegida - múltiplas camadas de segurança
    ✅ Monitoramento ativo - detectamos acessos suspeitos
    
    🔐 DICAS PARA SENHA SEGURA:
    
    ✅ FAÇA:
    • Use pelo menos 8 caracteres
    • Combine letras e números
    • Inclua símbolos especiais
    • Misture maiúsculas e minúsculas
    
    ❌ EVITE:
    • Datas de nascimento
    • Nomes de familiares
    • Sequências simples (123456)
    • Palavras do dicionário
    
    PROGRESSO:
    1. ✅ Solicitação
    2. ⏳ Verificação (ATUAL)
    3. 🔒 Nova Senha
    4. ✅ Concluído
    
    🚨 EM CASO DE PROBLEMAS:
    Se suspeita que conta foi comprometida:
    • WhatsApp Imediato - suporte urgente
    • Bloqueio Preventivo - suspensão temporária
    • Análise de Segurança - verificação completa
    
    🤝 PRECISA DE AJUDA?
    💬 WhatsApp: Suporte imediato para segurança
    📧 Email: Resposta em até 2 horas úteis
    
    🔒 NOSSO COMPROMISSO:
    ✅ Criptografia SSL - comunicações protegidas
    ✅ Monitoramento 24/7 - segurança sempre ativa
    ✅ LGPD Compliance - proteção de dados
    ✅ Equipe Especializada - profissionais dedicados
    
    Conte conosco para manter sua conta sempre segura!
  `

  const processedHtml = createEmailTemplate(
    TemplateEngine.process(htmlContent, {
      ...data,
      createdAt: data.createdAt || new Date()
    }),
    'Redefinição de Senha',
    '#dc2626' // Red header for security-related emails
  )

  const processedText = createTextTemplate(
    TemplateEngine.process(textContent, {
      ...data,
      createdAt: data.createdAt || new Date()
    }),
    'Redefinição de Senha'
  )

  return {
    html: processedHtml,
    text: processedText,
    subject: '🔒 Redefinir senha - QueroDocumento'
  }
}