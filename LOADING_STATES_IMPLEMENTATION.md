# Loading States Implementation - QUERODOCUMENTO

## Resumo da Implementação

Foram implementados loading states completos para a validação de CPF/CNPJ no formulário principal da aplicação, proporcionando uma melhor experiência do usuário com feedback visual claro sobre o estado da validação.

## Arquivos Criados/Modificados

### 1. Novo Componente: LoadingSpinner
**Arquivo:** `/src/components/ui/loading-spinner.tsx`

- Componente reutilizável para spinners de loading
- Suporte a diferentes tamanhos (sm, md, lg)
- Suporte a diferentes cores (primary, white, neutral)
- Incluiu também um componente LoadingDots como alternativa
- Acessibilidade com role="status" e aria-label

```typescript
<LoadingSpinner size="sm" color="primary" />
<LoadingDots color="primary" />
```

### 2. Novo Hook: useDebounce
**Arquivo:** `/src/hooks/useDebounce.ts`

- Hook personalizado para debounce de valores
- Hook adicional useDebouncedCallback para callbacks
- Evita validações excessivas durante a digitação
- Configurável com delay personalizado

```typescript
const debouncedValue = useDebounce(inputValue, 800)
const debouncedCallback = useDebouncedCallback(handleChange, 600)
```

### 3. Componente Atualizado: InputDocument
**Arquivo:** `/src/components/ui/input-document.tsx`

#### Novos Estados e Funcionalidades:

- **Estado `isValidating`**: Controla quando a validação está em andamento
- **Debounce integrado**: Validação ocorre após 800ms de inatividade (configurável)
- **Delay visual**: Pequeno delay de 200ms para garantir que o loading seja visível
- **Placeholder dinâmico**: Muda para "Validando..." durante validação
- **Border states**: Cores diferentes para validando (azul), válido (verde), inválido (âmbar)

#### Estados Visuais:
- 🔵 **Validando**: Spinner azul + texto "Validando CPF/CNPJ..."
- 🟢 **Válido**: Ícone de check verde + texto "CPF/CNPJ válido"
- 🟡 **Inválido**: Ícone de X âmbar + texto "CPF/CNPJ inválido"

#### Props Adicionadas:
```typescript
interface InputDocumentProps {
  // ... props existentes
  validationDelay?: number        // Delay do debounce (padrão: 800ms)
  onChange?: (
    value: string, 
    isValid: boolean, 
    type: 'CPF' | 'CNPJ' | null, 
    isValidating?: boolean        // Novo parâmetro
  ) => void
}
```

### 4. Página Principal Atualizada
**Arquivo:** `/src/app/page.tsx`

#### Novos Estados:
- **`isValidatingDocument`**: Controla estado de validação do documento no formulário principal

#### Botão "INICIAR CONSULTA" Atualizado:
- **Desabilitado durante validação**: Previne submissão enquanto valida
- **Estados visuais distintos**:
  - 🔵 "VALIDANDO..." - Quando validando CPF/CNPJ
  - 🟢 "PROCESSANDO..." - Quando submetendo formulário
  - ⚪ "INICIAR CONSULTA" - Estado normal

#### Melhorias na UX:
- Validação mais rápida (600ms de delay vs 800ms padrão)
- Validação visual habilitada (`showValidation={true}`)
- Transições suaves com CSS
- Prevenção de submissão durante validação

## Fluxo de Validação

1. **Usuário digita CPF/CNPJ**
   - Campo fica com borda normal
   - Botão permanece habilitado mas pode mostrar estado inválido

2. **Usuário para de digitar (600ms de inatividade)**
   - Estado muda para `isValidating: true`
   - Placeholder muda para "Validando..."
   - Spinner azul aparece no campo
   - Botão fica desabilitado com texto "VALIDANDO..."
   - Texto informativo "Validando CPF/CNPJ..." aparece

3. **Validação completa (200ms de delay visual)**
   - Estado `isValidating: false`
   - Resultado mostrado:
     - ✅ **Válido**: Borda verde, ícone check, texto "CPF válido"
     - ❌ **Inválido**: Borda âmbar, ícone X, texto "CPF inválido"
   - Botão volta ao estado normal

4. **Submissão do formulário**
   - Validação adicional que CPF não esteja em processo de validação
   - Estado `isSubmitting: true`
   - Botão mostra "PROCESSANDO..."
   - Delay de 500ms antes do redirect

## Características Técnicas

### Performance
- **Debounce**: Reduz chamadas de validação desnecessárias
- **Memoização**: Hooks otimizados para re-renderizações
- **Lazy validation**: Validação só ocorre após parar de digitar

### Acessibilidade
- **ARIA labels**: Spinners com role="status"
- **Screen reader text**: Textos alternativos para leitores de tela
- **Estados semânticos**: Cores e ícones consistentes
- **Focus management**: Estados de foco preservados

### Responsividade
- **Mobile-first**: Componentes adaptados para mobile
- **Touch-friendly**: Áreas de toque adequadas
- **Transitions**: Animações suaves em todas as telas

## Configuração e Uso

```typescript
// Uso básico
<InputDocument
  value={documentNumber}
  onChange={(value, isValid, type, isValidating) => {
    updateField('documentNumber', value)
    setIsDocumentValid(isValid)
    setIsValidatingDocument(!!isValidating)
  }}
  showValidation={true}
  validationDelay={600}
  placeholder="CPF ou CNPJ para consulta"
/>

// Botão com estados
<button 
  disabled={isSubmitting || isValidatingDocument}
  className="btn-primary transition-all duration-200"
>
  {isSubmitting ? (
    <>
      <LoadingSpinner size="sm" color="white" />
      <span>PROCESSANDO...</span>
    </>
  ) : isValidatingDocument ? (
    <>
      <LoadingSpinner size="sm" color="white" />
      <span>VALIDANDO...</span>
    </>
  ) : (
    <span>INICIAR CONSULTA</span>
  )}
</button>
```

## Benefícios Implementados

1. **Melhor UX**: Feedback visual claro sobre o que está acontecendo
2. **Performance**: Redução de validações desnecessárias
3. **Accessibilidade**: Suporte completo para leitores de tela
4. **Responsividade**: Funciona bem em todas as telas
5. **Reutilização**: Componentes podem ser usados em outros lugares
6. **Manutenibilidade**: Código bem estruturado e documentado
7. **Consistência**: Estados visuais padronizados em toda aplicação

## Testes Realizados

✅ **Compilação TypeScript**: Todos os arquivos compilam sem erros  
✅ **Bundle Build**: Componentes são bundleados corretamente  
✅ **Sintaxe**: Código segue padrões do projeto  
✅ **Integração**: Componentes integram corretamente com sistema existente  

A implementação está pronta para uso em produção e seguindo as melhores práticas de desenvolvimento React/TypeScript.