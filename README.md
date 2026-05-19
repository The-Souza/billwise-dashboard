# BillWise Dashboard

> Versão 2.0 do [Account Management](https://github.com/The-Souza/account-management) — reescrita completa com arquitetura moderna, novas features e stack fullstack integrada.

Aplicação fullstack para gerenciamento financeiro pessoal: contas, orçamentos, recorrências e analytics — tudo em um único painel.

**Status:** Em desenvolvimento · Deploy previsto em breve

---

## O que mudou em relação à v1

A v1 (Account Management) era uma SPA React + Vite com backend Express serverless. Funcionou bem como projeto de referência, mas tinha limitações claras: sem ORM, sem server-side rendering, features limitadas e arquitetura separada entre frontend e backend.

A v2 é uma reescrita completa com foco em:

- **Arquitetura integrada** — Next.js App Router com server components elimina a camada de API para a maioria das operações
- **ORM com Prisma** — queries tipadas, migrations versionadas, transações atômicas
- **Server Actions** — mutations direto do servidor, sem Express, sem rotas de API manuais
- **Muito mais features** — orçamentos, analytics, notificações, recorrências, configurações, área admin
- **Qualidade de código** — Zod em toda boundary, guards de autenticação consistentes, testes antes da implementação

---

## Features implementadas

### Autenticação
- Cadastro, login e logout via Supabase Auth
- Reset de senha por e-mail
- Verificação de e-mail no cadastro
- Proteção de rotas com guards server-side
- RBAC: roles `user` e `admin`

### Dashboard
- Resumo financeiro do mês (receitas, despesas, saldo)
- Gráfico de receitas vs. despesas por período
- Lista de contas recentes com status de pagamento

### Contas
- CRUD completo de contas (receitas e despesas)
- Suporte a parcelamentos — grupo de parcelas vinculadas
- Tabela com filtros, busca, paginação e ordenação server-side por coluna
- Importação de contas via CSV
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
- Gerenciamento de regras ativas

### Notificações
- Centro de notificações com filtros por tipo
- Tipos: contas vencidas, prestes a vencer, orçamento excedido, recorrência gerada
- Marcar como lida individualmente ou em massa

### Perfil e Configurações
- Edição de dados pessoais
- Troca de senha
- Preferências de notificação por categoria

### Área Admin *(em desenvolvimento)*
- Visão geral de todos os usuários
- Proteção por role com guard server-side

---

## Features planejadas

- [ ] Proteção no edge para rotas protegidas (middleware com redirect antes do server component)
- [ ] Exportação de dados (CSV / PDF)
- [ ] Metas financeiras com acompanhamento de progresso
- [ ] Multi-moeda
- [ ] Histórico de atividades por conta
- [ ] Notificações por e-mail

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
| Fetch client | SWR |
| Gráficos | Recharts |
| Toasts | Sonner |
| Testes | Vitest + jsdom |

---

## Arquitetura

```
src/
├── app/
│   ├── (auth)/           # sign-in, sign-up, forgot-password, reset-password
│   ├── (protected)/
│   │   ├── (user)/       # dashboard, accounts, budgets, analytics
│   │   ├── admin/        # área admin (RBAC)
│   │   ├── profile/      # perfil e troca de senha
│   │   ├── settings/     # preferências e regras recorrentes
│   │   └── notifications/
│   └── api/cron/         # generate-recurring, process-due-dates
├── actions/              # server actions por domínio
├── schemas/              # schemas Zod por domínio
├── components/
│   ├── ui/               # primitivos reutilizáveis
│   └── layout/           # sidebar, header
├── hooks/                # hooks customizados
├── lib/                  # prisma client, supabase clients, auth guards
└── __tests__/            # testes Vitest
```

**Pattern de página:**
```
page.tsx (server component)
  └── busca dados no servidor
      └── passa como props para *Client.tsx (client component)
              └── chama server actions em mutations
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
| Features | Contas básicas | Contas, orçamentos, analytics, notificações, recorrências, admin |
| Testes | Scripts de seed/drop | Vitest (unit tests) |
| Validação | Manual | Zod em toda boundary |

---

## Autor

**Guilherme Campos**
