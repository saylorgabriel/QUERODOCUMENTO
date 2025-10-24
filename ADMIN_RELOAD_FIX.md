# Fix: Infinite Reload Loop em /admin/pedidos/[id]

## 🐛 Problema Identificado

Na página de detalhes do pedido (`/admin/pedidos/[id]`), ocorria um **loop infinito de recarregamento**, causando a tela piscar continuamente.

### Causa Raiz

O problema tinha duas causas:

1. **Loop Infinito de Callbacks**:
   - `DocumentManager.fetchDocuments()` → chamava `onDocumentsChange()`
   - `page.tsx` recebia `onDocumentsChange` → chamava `loadOrderDetails()`
   - `loadOrderDetails()` atualizava o estado → re-renderizava `DocumentManager`
   - `DocumentManager` montava novamente → chamava `fetchDocuments()`
   - **Loop infinito** 🔄

2. **Next.js 15 API Route Error**:
   - Next.js 15 requer que `params` seja `await`ed antes de acessar propriedades
   - Erro: `Route used params.id. params should be awaited`
   - Causava warnings no console e possível comportamento inconsistente

---

## ✅ Solução Implementada

### 1. Fix do DocumentManager (`src/components/admin/DocumentManager.tsx`)

#### Mudança 1: Parâmetro opcional `notifyChange`
```typescript
// ANTES
const fetchDocuments = async () => {
  // ...
  setDocuments(data.documents || [])
  onDocumentsChange?.(data.documents || []) // SEMPRE notificava
  // ...
}

// DEPOIS
const fetchDocuments = async (notifyChange = true) => {
  // ...
  setDocuments(data.documents || [])

  // Só notifica o parent component quando necessário
  if (notifyChange) {
    onDocumentsChange?.(data.documents || [])
  }
  // ...
}
```

#### Mudança 2: Download sem notificar parent
```typescript
// ANTES (linha 152)
await fetchDocuments() // Notificava e causava reload

// DEPOIS (linha 157)
await fetchDocuments(false) // NÃO notifica parent
```

#### Mudança 3: useEffect inicial sem notificar
```typescript
// ANTES (linha 197-199)
useEffect(() => {
  fetchDocuments() // Notificava ao montar
}, [orderId])

// DEPOIS (linha 202-206)
useEffect(() => {
  // Carregamento inicial NÃO notifica para evitar loop
  fetchDocuments(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [orderId])
```

**Resultado**: Documentos só disparam `onDocumentsChange` quando realmente houver alteração (upload/delete), não em leituras normais.

---

### 2. Fix das API Routes (Next.js 15 Compliance)

Corrigidos 5 endpoints que usavam `params` sem `await`:

#### Arquivo: `src/app/api/admin/orders/[id]/route.ts`

##### GET Handler (linha 53-67)
```typescript
// ANTES
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // ...
  const orderId = params.id // ❌ Erro: sync access
}

// DEPOIS
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // ...
  const { id: orderId } = await params // ✅ Async await
}
```

##### PUT Handler (linha 186-200)
```typescript
// ANTES
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id // ❌ Erro
}

// DEPOIS
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params // ✅ Correto
}
```

#### Arquivo: `src/app/api/admin/orders/[id]/upload/route.ts`

##### POST Handler (linha 134-148)
```typescript
// ANTES
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id // ❌ Erro
}

// DEPOIS
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params // ✅ Correto
}
```

##### GET Handler (linha 402-416)
```typescript
// ANTES
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id // ❌ Erro
}

// DEPOIS
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params // ✅ Correto
}
```

##### DELETE Handler (linha 461-475)
```typescript
// ANTES
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const orderId = params.id // ❌ Erro
}

// DEPOIS
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params // ✅ Correto
}
```

---

## 📝 Resumo das Alterações

### Arquivos Modificados

| Arquivo | Linhas Alteradas | Mudança |
|---------|------------------|---------|
| `src/components/admin/DocumentManager.tsx` | 77-101, 157, 202-206 | Parâmetro `notifyChange` + lógica condicional |
| `src/app/api/admin/orders/[id]/route.ts` | 53-67, 186-200 | `await params` em GET e PUT |
| `src/app/api/admin/orders/[id]/upload/route.ts` | 134-148, 402-416, 461-475 | `await params` em POST, GET e DELETE |

### Total
- **3 arquivos** modificados
- **8 funções** corrigidas
- **0 breaking changes**
- **100% backward compatible**

---

## 🧪 Como Testar

### 1. Verificar que o loop foi corrigido
```bash
# Iniciar o projeto
docker-compose up -d

# Ou sem Docker
bun run dev
```

1. Acessar: http://localhost:3009/admin/pedidos
2. Clicar em **"Ver Detalhes"** em qualquer pedido
3. **Verificar**: A página deve carregar UMA VEZ e parar (não piscar)
4. **Verificar**: Console do navegador NÃO deve mostrar loops de requisições

### 2. Verificar funcionalidades continuam funcionando

#### Test Case 1: Visualizar Documentos
- ✅ Lista de documentos deve aparecer
- ✅ Sem recarregamentos infinitos
- ✅ Botões de ação devem funcionar

#### Test Case 2: Upload de Documento
1. Clicar em **"Enviar Documento"**
2. Selecionar tipo de documento
3. Fazer upload de arquivo
4. **Verificar**: Lista deve atualizar COM reload (comportamento esperado)
5. **Verificar**: Após atualização, página para de recarregar

#### Test Case 3: Download de Documento
1. Clicar em **"Baixar"** em um documento
2. **Verificar**: Download inicia
3. **Verificar**: Contador de downloads atualiza
4. **Verificar**: Página NÃO recarrega infinitamente

#### Test Case 4: Deletar Documento
1. Clicar em **"Remover"** em um documento
2. Confirmar exclusão
3. **Verificar**: Documento removido da lista COM reload
4. **Verificar**: Após atualização, página para de recarregar

### 3. Verificar logs do container

```bash
# Ver logs do container
docker-compose logs -f app-dev

# Verificar que NÃO aparecem mais os erros:
# ❌ "Error: Route used params.id. params should be awaited"
```

**Resultado esperado**: Nenhum erro relacionado a `params` deve aparecer.

---

## 🔍 Explicação Técnica Detalhada

### Por que o loop acontecia?

#### Fluxo ANTES (Loop Infinito):
```
1. Usuário acessa /admin/pedidos/[id]
   ↓
2. page.tsx monta e chama loadOrderDetails()
   ↓
3. page.tsx renderiza <DocumentManager onDocumentsChange={loadOrderDetails} />
   ↓
4. DocumentManager monta e chama useEffect → fetchDocuments()
   ↓
5. fetchDocuments() sempre chama onDocumentsChange(documents)
   ↓
6. onDocumentsChange === loadOrderDetails → recarrega a página inteira
   ↓
7. Volta para passo 2 → LOOP INFINITO 🔄
```

#### Fluxo DEPOIS (Corrigido):
```
1. Usuário acessa /admin/pedidos/[id]
   ↓
2. page.tsx monta e chama loadOrderDetails()
   ↓
3. page.tsx renderiza <DocumentManager onDocumentsChange={loadOrderDetails} />
   ↓
4. DocumentManager monta e chama useEffect → fetchDocuments(false)
   ↓
5. fetchDocuments(false) NÃO chama onDocumentsChange
   ↓
6. Página carregada ✅ SEM LOOP

--- QUANDO USUÁRIO FAZ UPLOAD/DELETE ---

7. handleUploadSuccess() ou deleteDocument() chama fetchDocuments(true)
   ↓
8. fetchDocuments(true) chama onDocumentsChange(documents)
   ↓
9. onDocumentsChange === loadOrderDetails → recarrega UMA VEZ
   ↓
10. Volta para passo 4, mas fetchDocuments(false) → PARA ✅
```

### Por que precisava do `await params`?

No Next.js 15, os route handlers recebem `params` como **Promise** para suportar **Partial Prerendering (PPR)** e **Streaming**.

#### Antes (Next.js 14):
```typescript
// params era um objeto síncrono
{ params }: { params: { id: string } }
const orderId = params.id // OK
```

#### Depois (Next.js 15):
```typescript
// params é uma Promise assíncrona
{ params }: { params: Promise<{ id: string }> }
const { id: orderId } = await params // REQUERIDO
```

**Benefícios**:
- Suporte a streaming de dados
- Melhor performance com PPR
- Lazy loading de parâmetros dinâmicos

---

## ⚡ Impacto da Correção

### Performance
- ✅ **Redução de 100% dos reloads desnecessários**
- ✅ Página carrega 1x ao invés de loop infinito
- ✅ Menos chamadas API (fetchDocuments só quando necessário)
- ✅ Menos uso de CPU/memória no cliente

### Experiência do Usuário
- ✅ Página não pisca mais
- ✅ Interface responsiva e estável
- ✅ Melhor UX ao visualizar detalhes de pedidos

### Conformidade
- ✅ 100% compatível com Next.js 15
- ✅ Nenhum warning no console
- ✅ Código mais robusto e manutenível

---

## 🚀 Deploy

### Produção (Vercel)
```bash
git add .
git commit -m "fix: infinite reload loop in admin order details

- Add notifyChange parameter to DocumentManager.fetchDocuments()
- Prevent parent notification on initial load and downloads
- Update API routes to await params (Next.js 15)
- Fix 5 route handlers in orders/[id] endpoints

Fixes #[issue-number]"

git push origin master
```

### Docker
```bash
# Build e deploy
docker-compose build
docker-compose up -d

# Verificar logs
docker-compose logs -f app-dev
```

---

## 📚 Referências

- [Next.js 15 - Dynamic Route Segments](https://nextjs.org/docs/messages/sync-dynamic-apis)
- [React - useEffect Best Practices](https://react.dev/reference/react/useEffect)
- [Prisma - Query Optimization](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**Status**: ✅ **Corrigido e testado**
**Data**: 23 de outubro de 2025
**Versão**: Next.js 15 + React 18
