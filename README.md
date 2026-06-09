# BillWise Dashboard

> Versão 2.0 do [Account Management](https://github.com/The-Souza/account-management) — reescrita completa com arquitetura moderna, novas features e stack fullstack integrada.

Aplicação fullstack para gerenciamento financeiro pessoal e colaborativo: contas, orçamentos, recorrências, analytics e workspaces compartilhados — tudo em um único painel.

**Status:** Em produção · [billwise-dashboard.vercel.app](https://billwise-dashboard.vercel.app)

---

## O que mudou em relação à v1

A v1 (Account Management) era uma SPA React + Vite com backend Express serverless. Funcionou bem como projeto de referência, mas tinha limitações claras: sem ORM, sem server-side rendering, features limitadas e arquitetura separada entre frontend e backend.

A v2 é uma reescrita completa com foco em:

- **Arquitetura integrada** — Next.js App Router com server components elimina a camada de API para a maioria das operações
- **ORM com Prisma** — queries tipadas, migrations versionadas, transações atômicas
- **Server Actions** — mutations direto do servidor, sem Express, sem rotas de API manuais
- **Workspaces** — contextos financeiros isolados e compartilháveis entre usuários
- **Muito mais features** — orçamentos, analytics, notificações, recorrências, configurações, workspaces
- **Qualidade de código** — Zod em toda boundary, guards de autenticação consistentes, testes antes da implementação

---

## Features implementadas

### Autenticação
- Cadastro, login e logout via Supabase Auth
- Reset de senha por e-mail
- Verificação de e-mail no cadastro
- Proteção de rotas com guards server-side
- Cloudflare Turnstile (anti-bot) no login e cadastro

### Workspaces
- Todo usuário tem um workspace pessoal criado automaticamente no cadastro
- Criação de até 3 workspaces adicionais por usuário
- Convite de membros por e-mail
- Aceitar ou recusar convites via notificação
- Troca de workspace ativa pelo seletor na sidebar
- Gerenciamento completo: renomear, remover membros, sair, deletar
- Transferência de propriedade para outro membro
- Todos os dados financeiros são isolados por workspace

### Dashboard
- Resumo financeiro do mês (receitas, despesas, saldo)
- Gráfico de receitas vs. despesas por período
- Lista de contas recentes com status de pagamento
- Progresso de orçamentos do mês

### Contas
- CRUD completo de contas (receitas e despesas)
- Suporte a parcelamentos — grupo de parcelas vinculadas
- Tabela com filtros, busca, paginação e ordenação server-side por coluna
- Importação de contas via CSV / XLSX
- Exportação de contas
- Página de detalhes individual por conta

### Orçamentos
- Criação de orçamentos por categoria (receita ou despesa)
- Barra de progresso com percentual gasto
- Alertas visuais ao atingir o limite

### Analytics
- Gráficos de evolução financeira por período
- Breakdown de gastos por categoria
- Comparativo entre meses

### Recorrências
- Criação de regras de cobrança recorrente
- Geração automática de contas mensais via cron job
- Gerenciamento de regras ativas na página de configurações

### Notificações
- Centro de notificações com filtros por tipo
- Tipos: contas vencidas, prestes a vencer, orçamento excedido, recorrência gerada, convite de workspace
- Ações inline para aceitar/recusar convites de workspace
- Marcar como lida individualmente ou em massa

### Perfil e Configurações
- Edição de dados pessoais e avatar
- Troca de senha
- Preferências de notificação por categoria

---

## Features planejadas

- [ ] Notificações por e-mail (convites, vencimentos, orçamentos)
- [ ] Metas financeiras com acompanhamento de progresso
- [ ] Histórico de atividades por conta
- [ ] Multi-moeda

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Banco de dados | PostgreSQL (Supabase) |
| ORM | Prisma 7 |
| Autenticação | Supabase Auth |
| Estilização | Tailwind CSS v4 |
| Componentes | Radix UI (shadcn-inspired) |
| Formulários | React Hook Form + Zod |
| Fetch client | TanStack Query |
| Gráficos | Recharts |
| Toasts | Sonner |
| Testes | Vitest + React Testing Library + MSW |
| CI | GitHub Actions |

---

## Arquitetura

```
src/
├── app/
│   ├── (auth)/           # sign-in, sign-up, forgot-password, reset-password
│   ├── (protected)/
│   │   └── (user)/       # todas as rotas autenticadas:
│   │       ├── dashboard/
│   │       ├── accounts/
│   │       ├── budgets/
│   │       ├── analytics/
│   │       ├── notifications/
│   │       ├── profile/
│   │       ├── settings/
│   │       └── workspaces/
│   └── api/cron/         # generate-recurring, process-due-dates
├── actions/
│   ├── (user)/           # server actions por domínio
│   │   ├── accounts/
│   │   ├── budgets/
│   │   ├── dashboard/
│   │   ├── analytics/
│   │   ├── workspaces/
│   │   ├── notifications/
│   │   ├── profile/
│   │   └── settings/
│   └── auth/
├── schemas/              # schemas Zod por domínio
├── components/
│   ├── ui/               # primitivos reutilizáveis
│   └── layout/           # sidebar, header, notificações
├── hooks/                # hooks customizados
├── lib/
│   ├── auth/             # guards (requireAuth, requireWorkspace)
│   └── prisma/           # client
└── __tests__/            # testes Vitest
```

**Pattern de página:**
```
page.tsx (server component)
  └── busca dados no servidor (requireWorkspace + prisma)
      └── passa como props para *Client.tsx (client component)
              └── chama server actions em mutations
                  └── feedback via appToast (sonner)
```

**Guard de autenticação:**
```ts
// Dados financeiros — escopo de workspace
const ctx = await requireWorkspace(); // { user, workspaceId, workspaceRole }

// Gerenciamento de workspace / perfil / configurações
const user = await requireAuth();
```

---

## Comparativo v1 → v2

| Aspecto | v1 (Account Management) | v2 (BillWise Dashboard) |
|---------|------------------------|------------------------|
| Framework | React + Vite | Next.js 16 App Router |
| Backend | Express serverless | Server Actions |
| ORM | — (queries diretas) | Prisma 7 |
| Auth | JWT manual | Supabase Auth |
| Rendering | CSR (SPA) | SSR + Server Components |
| Multi-usuário | — | Workspaces compartilhados |
| Features | Contas básicas | Contas, orçamentos, analytics, notificações, recorrências, workspaces |
| Testes | Scripts de seed/drop | Vitest + RTL + MSW |
| Validação | Manual | Zod em toda boundary |
| CI | — | GitHub Actions |

---

## Autor

**Guilherme Campos**
