/**
 * Password Reset Email Template
 * Professional and secure email template for password recovery
 */

import { EmailTemplateData, EmailTemplate, TemplateEngine, createEmailTemplate, createTextTemplate } from './base'

export function getPasswordResetTemplate(data: EmailTemplateData): EmailTemplate {
  const htmlContent = `
    <div class="content">
      <h1>🔒 Redefinir Sua Senha</h1>
      
      <p>Olá <strong>{{name|capitalize}}</strong>,</p>
      
      <p>Recebemos uma solicitação para redefinir a senha da sua conta no QueroDocumento. Se você fez esta solicitação, siga as instruções abaixo para criar uma nova senha.</p>
      
      <div class="alert alert-info">
        <div class="alert-title">🔐 Solicitação de Redefinição</div>
        <div class="alert-text">
          Uma nova senha foi solicitada para sua conta. Por segurança, este link expira em 30 minutos.
        </div>
      </div>
      
      <div class="info-box">
        <h3>👤 Detalhes da Solicitação</h3>
        <table>
          <tr>
            <td class="label">Conta:</td>
            <td class="value">{{email}}</td>
          </tr>
          <tr>
            <td class="label">Data/Hora:</td>
            <td class="value">{{createdAt|date}} às {{createdAt|time}}</td>
          </tr>
          <tr>
            <td class="label">Expira em:</td>
            <td class="value"><strong>30 minutos</strong></td>
          </tr>
          <tr>
            <td class="label">Status:</td>
            <td class="value"><span class="status status-warning">Aguardando Ação</span></td>
          </tr>
        </table>
      </div>
      
      {{#if resetUrl}}
      <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 32px; border-radius: 12px; text-align: center; margin: 32px 0; color: white;">
        <div style="font-size: 48px; margin-bottom: 16px;">🔑</div>
        <h2 style="margin: 0 0 16px 0; color: white;">Criar Nova Senha</h2>
        <p style="margin: 0 0 24px 0; color: rgba(255,255,255,0.9);">
          Clique no botão abaixo para definir sua nova senha
        </p>
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
      
      <h3>🛡️ Se Você NÃO Solicitou Esta Alteração</h3>
      <div class="info-box">
        <p style="margin-bottom: 16px;"><strong>Fique tranquilo!</strong> Sua conta está segura.</p>
        <ul>
          <li>✅ <strong>Ignore este email:</strong> Sua senha atual permanece inalterada</li>
          <li>✅ <strong>Sem ações necessárias:</strong> O link expira automaticamente</li>
          <li>✅ <strong>Conta protegida:</strong> Múltiplas camadas de segurança ativas</li>
          <li>✅ <strong>Monitoramento ativo:</strong> Detectamos tentativas de acesso suspeitas</li>
        </ul>
      </div>
      
      <h3>🔐 Dicas para uma Senha Segura</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin: 16px 0;">
        <div style="background: #f0fdf4; padding: 16px; border-radius: 8px; border: 1px solid #bbf7d0;">
          <h4 style="margin: 0 0 8px 0; color: #15803d;">✅ Faça</h4>
          <ul style="margin: 0; font-size: 14px; color: #166534;">
            <li>Use pelo menos 8 caracteres</li>
            <li>Combine letras e números</li>
            <li>Inclua símbolos especiais</li>
            <li>Misture maiúsculas e minúsculas</li>
          </ul>
        </div>
        <div style="background: #fef2f2; padding: 16px; border-radius: 8px; border: 1px solid #fecaca;">
          <h4 style="margin: 0 0 8px 0; color: #dc2626;">❌ Evite</h4>
          <ul style="margin: 0; font-size: 14px; color: #991b1b;">
            <li>Datas de nascimento</li>
            <li>Nomes de familiares</li>
            <li>Sequências simples (123456)</li>
            <li>Palavras do dicionário</li>
          </ul>
        </div>
      </div>
      
      <div class="progress">
        <div class="progress-step completed">
          <div class="progress-circle">1</div>
          <div class="progress-label">Solicitação</div>
        </div>
        <div class="progress-step active">
          <div class="progress-circle">2</div>
          <div class="progress-label">Verificação</div>
        </div>
        <div class="progress-step">
          <div class="progress-circle">3</div>
          <div class="progress-label">Nova Senha</div>
        </div>
        <div class="progress-step">
          <div class="progress-circle">✓</div>
          <div class="progress-label">Concluído</div>
        </div>
      </div>
      
      <div class="alert alert-error">
        <div class="alert-title">🚨 Em Caso de Problemas</div>
        <div class="alert-text">
          Se você suspeita que sua conta foi comprometida ou tem dificuldades para redefinir a senha:
          <br><br>
          • <strong>WhatsApp Imediato:</strong> Entre em contato para suporte urgente<br>
          • <strong>Bloqueio Preventivo:</strong> Podemos suspender temporariamente sua conta<br>
          • <strong>Análise de Segurança:</strong> Verificação completa de atividades suspeitas
        </div>
      </div>
      
      {{#if resetUrl}}
      <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 24px 0;">
        <h4 style="margin: 0 0 12px 0; color: #374151;">🔗 Link de Redefinição (Backup)</h4>
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #6b7280;">
          Se o botão acima não funcionar, copie e cole este link no seu navegador:
        </p>
        <div style="background: white; padding: 12px; border: 1px solid #d1d5db; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 12px; color: #374151;">
          {{resetUrl}}
        </div>
        <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
          ⚠️ Este link é único e expira em 30 minutos
        </p>
      </div>
      {{/if}}
      
      <hr class="divider">
      
      <h3>🤝 Precisa de Ajuda?</h3>
      <p>Nossa equipe está disponível para ajudá-lo com questões de segurança:</p>
      <div style="display: flex; gap: 16px; margin: 16px 0; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px; background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">💬</div>
          <h4 style="margin: 0 0 8px 0; color: #374151;">WhatsApp</h4>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Suporte imediato para<br>questões de segurança
          </p>
        </div>
        <div style="flex: 1; min-width: 200px; background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: center;">
          <div style="font-size: 24px; margin-bottom: 8px;">📧</div>
          <h4 style="margin: 0 0 8px 0; color: #374151;">Email</h4>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">
            Resposta em até<br>2 horas úteis
          </p>
        </div>
      </div>
      
      <div class="info-box">
        <h3>🔒 Nosso Compromisso com Sua Segurança</h3>
        <ul style="margin: 0;">
          <li>✅ <strong>Criptografia SSL:</strong> Todas as comunicações são protegidas</li>
          <li>✅ <strong>Monitoramento 24/7:</strong> Sistemas de segurança sempre ativos</li>
          <li>✅ <strong>LGPD Compliance:</strong> Proteção total de dados pessoais</li>
          <li>✅ <strong>Equipe Especializada:</strong> Profissionais dedicados à segurança</li>
        </ul>
      </div>
      
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