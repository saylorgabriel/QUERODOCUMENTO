# 🎨 Padrão de Design - QUERODOCUMENTO

Este documento define o sistema de design visual da aplicação QUERODOCUMENTO, baseado no padrão visual da Consolide (https://www.consolidesuamarca.com.br/).

## 🎯 Filosofia do Design

- **Profissional e Confiável**: Transmitir segurança para serviços de documentação oficial
- **Moderno e Limpo**: Interface atual sem elementos desnecessários
- **Acessível**: Alto contraste e boa legibilidade
- **Responsivo**: Funcional em todos os dispositivos

## 🎨 Paleta de Cores

### Cores Principais
```css
/* Azul - Cor primária (confiança, profissionalismo) */
--primary-50: #eff6ff
--primary-100: #dbeafe
--primary-500: #3b82f6
--primary-600: #2563eb
--primary-700: #1d4ed8
--primary-900: #1e3a8a

/* Laranja/Coral - Cor de ação (CTAs, botões importantes) */
--accent-400: #fb923c
--accent-500: #f97316
--accent-600: #ea580c

/* Verde - Sucesso e confirmação */
--success-400: #4ade80
--success-500: #22c55e
--success-600: #16a34a
```

### Cores Neutras
```css
/* Cinzas para textos e backgrounds */
--neutral-50: #f8fafc
--neutral-100: #f1f5f9
--neutral-200: #e2e8f0
--neutral-400: #94a3b8
--neutral-500: #64748b
--neutral-600: #475569
--neutral-700: #334155
--neutral-800: #1e293b
--neutral-900: #0f172a
```

## 🔤 Tipografia

### Fonte Principal
- **Família**: Inter (Google Fonts)
- **Pesos**: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Hierarquia de Títulos
```css
/* H1 - Hero/Landing */
font-size: 3rem (48px)
font-weight: 700
line-height: 1.1
letter-spacing: -0.025em

/* H2 - Seções principais */
font-size: 2.25rem (36px)
font-weight: 700
line-height: 1.2

/* H3 - Subseções */
font-size: 1.5rem (24px)
font-weight: 600
line-height: 1.3

/* Body Large */
font-size: 1.125rem (18px)
font-weight: 400
line-height: 1.6

/* Body Regular */
font-size: 1rem (16px)
font-weight: 400
line-height: 1.5
```

## 🔘 Componentes

### Botões

#### Botão Primário (CTA Principal)
```css
background: linear-gradient(135deg, #f97316, #ea580c)
color: white
padding: 12px 24px
border-radius: 8px
font-weight: 600
box-shadow: 0 4px 14px 0 rgba(249, 115, 22, 0.25)
transition: all 0.2s
```

#### Botão Secundário
```css
background: white
color: #2563eb
border: 2px solid #2563eb
padding: 12px 24px
border-radius: 8px
font-weight: 600
```

#### Botão Outline
```css
background: transparent
color: #64748b
border: 1px solid #e2e8f0
padding: 12px 24px
border-radius: 8px
```

### Cards

#### Card Principal
```css
background: white
border-radius: 16px
box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 
           0 4px 6px -2px rgba(0, 0, 0, 0.05)
padding: 32px
```

#### Card Simples
```css
background: white
border-radius: 8px
border: 1px solid #e2e8f0
padding: 24px
```

### Inputs

#### Input Padrão
```css
border: 1px solid #e2e8f0
border-radius: 8px
padding: 12px 16px
font-size: 16px
background: white
transition: all 0.2s

/* Focus state */
border-color: #2563eb
box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1)
```

## 🌈 Gradientes

### Gradiente de Fundo Principal
```css
background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)
```

### Gradiente de Botão
```css
background: linear-gradient(135deg, #f97316, #ea580c)
```

### Gradiente Sutil (Cards/Sections)
```css
background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)
```

## 📐 Espaçamento

### Grid System
- **Container**: max-width: 1200px
- **Gutter**: 24px
- **Columns**: 12 colunas flexíveis

### Espaçamentos Padrão
```css
--space-xs: 4px
--space-sm: 8px
--space-md: 16px
--space-lg: 24px
--space-xl: 32px
--space-2xl: 48px
--space-3xl: 64px
--space-4xl: 96px
```

## 🎯 Padrões de Layout

### Hero Section
- Fundo com gradiente azul
- Card branco centralizado para formulário
- Título grande e call-to-action proeminente
- Elementos de confiança (selos, avaliações)

### Seções de Conteúdo
- Alternância entre fundo branco e cinza claro
- Cards com sombra sutil
- Ícones grandes e coloridos
- Textos hierárquicos bem definidos

### Formulários
- Cards elevados sobre fundo colorido
- Campos com borda sutil e focus states
- Botões de ação em laranja
- Indicadores de progresso quando necessário

## 🔍 Estados Interativos

### Hover States
```css
/* Botões */
transform: translateY(-2px)
box-shadow: aumentada

/* Cards */
box-shadow: mais intensa
transform: translateY(-4px)
```

### Focus States
```css
/* Todos os elementos focáveis */
outline: 2px solid #2563eb
outline-offset: 2px
```

### Loading States
```css
/* Esqueleto com animação shimmer */
background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)
background-size: 200% 100%
animation: shimmer 2s infinite
```

## 🎨 Classes Utilitárias Customizadas

### Gradientes
- `.bg-gradient-primary` - Azul gradiente
- `.bg-gradient-accent` - Laranja gradiente
- `.bg-gradient-subtle` - Cinza sutil

### Sombras
- `.shadow-card` - Sombra padrão para cards
- `.shadow-floating` - Sombra elevada
- `.shadow-button` - Sombra para botões

### Bordas
- `.rounded-card` - Border radius de cards (16px)
- `.rounded-button` - Border radius de botões (8px)

## 📱 Responsividade

### Breakpoints
- **SM**: 640px
- **MD**: 768px
- **LG**: 1024px
- **XL**: 1280px

### Padrões Mobile-First
- Cards full-width em mobile
- Texto menor em telas pequenas
- Botões stack verticalmente
- Navegação hamburger em mobile

## ✅ Checklist de Implementação

- [ ] Configurar cores no TailwindCSS
- [ ] Adicionar fonte Inter do Google Fonts
- [ ] Criar componentes base (Button, Card, Input)
- [ ] Implementar gradientes customizados
- [ ] Aplicar padrões na landing page
- [ ] Testar responsividade
- [ ] Verificar acessibilidade (contraste, focus states)
- [ ] Documentar componentes no Storybook (futuro)

---

**Nota**: Este design system é vivo e deve evoluir com o produto. Sempre priorize a usabilidade e acessibilidade sobre estética pura.