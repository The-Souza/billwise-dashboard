---
name: BillWise Dashboard
description: Painel de gerenciamento financeiro pessoal e colaborativo — contas, orçamentos, recorrências e analytics em workspaces compartilhados.
colors:
  confident-berry: "oklch(0.586 0.253 17.585)"
  confident-berry-foreground: "oklch(0.969 0.015 12.422)"
  confident-berry-ring: "oklch(0.712 0.194 13.428)"
  paper-white: "oklch(1 0 0)"
  ink: "oklch(0.141 0.005 285.823)"
  neutral-surface: "oklch(0.967 0.001 286.375)"
  neutral-surface-foreground: "oklch(0.21 0.006 285.885)"
  muted-foreground: "oklch(0.552 0.016 285.938)"
  border: "oklch(0.92 0.004 286.32)"
  destructive: "oklch(0.577 0.245 27.325)"
  chart-1: "oklch(0.81 0.117 11.638)"
  chart-2: "oklch(0.645 0.246 16.439)"
  chart-3: "oklch(0.586 0.253 17.585)"
  chart-4: "oklch(0.514 0.222 16.935)"
  chart-5: "oklch(0.455 0.188 13.697)"
typography:
  heading:
    fontFamily: "Poppins, var(--font-poppins), sans-serif"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Inter, var(--font-inter), sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, var(--font-inter), sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
rounded:
  sm: "calc(0.65rem - 4px)"
  md: "calc(0.65rem - 2px)"
  lg: "0.65rem"
  xl: "calc(0.65rem + 4px)"
spacing:
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.confident-berry}"
    textColor: "{colors.confident-berry-foreground}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-outline:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    height: "2.25rem"
  card:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
  input-group:
    backgroundColor: "{colors.paper-white}"
    rounded: "{rounded.md}"
    height: "2.25rem"
---

# Design System: BillWise Dashboard

## 1. Overview

**Creative North Star: "The Clear Ledger"**

BillWise é um livro-caixa honesto e legível, não uma planilha intimidadora nem um banco institucional frio. Toda decisão visual serve a um único objetivo: o usuário consegue responder "como estou financeiramente" em segundos, sem precisar decifrar jargão ou interpretar uma tabela densa. A cor (Confident Berry) é usada com moderação — ela marca o que é acionável ou importante, nunca decora por decorar. O restante da interface é neutro e silencioso para que os números sejam a única coisa que grita.

O sistema rejeita explicitamente dois extremos: o dashboard-planilha (denso, monoespaçado, sem hierarquia, intimidador para quem não é especialista) e o fintech institucional frio (navy/cinza corporativo, tom de "produto bancário"). BillWise fica no meio: confiante o suficiente para inspirar segurança com dinheiro, acessível o suficiente para qualquer pessoa entender de primeira.

**Key Characteristics:**
- Neutro como base, cor como sinalização (não decoração)
- Hierarquia tipográfica clara entre dados (Inter) e títulos de seção (Poppins)
- Elevação tonal e quase plana — profundidade sutil, nunca dramática
- Mesma linguagem visual para uso pessoal e para workspace compartilhado

## 2. Colors

A paleta é deliberadamente curta: um único acento saturado sobre uma base neutra quase monocromática, com a mesma família de cor reaproveitada nos gráficos.

### Primary
- **Confident Berry** (`oklch(0.586 0.253 17.585)`): ação primária (botões `default`, links, foco de marca). Usado com moderação — nunca como cor de fundo de grandes áreas.
- **Confident Berry Foreground** (`oklch(0.969 0.015 12.422)`): texto sobre fundos Confident Berry.
- **Confident Berry Ring** (`oklch(0.712 0.194 13.428)`): anel de foco visível em inputs e elementos interativos.

### Neutral
- **Paper White** (`oklch(1 0 0)`): fundo padrão e superfície de cards no tema claro.
- **Ink** (`oklch(0.141 0.005 285.823)`): texto principal — também é o fundo do tema escuro.
- **Neutral Surface** (`oklch(0.967 0.001 286.375)`): superfícies secundárias (badges, hover de menu, `secondary`/`muted`/`accent`).
- **Muted Foreground** (`oklch(0.552 0.016 285.938)`): texto de apoio (legendas, descrições) — nunca usado em valores financeiros, só em metadados.
- **Border** (`oklch(0.92 0.004 286.32)`): divisórias e contornos de input.

### Status
- **Destructive** (`oklch(0.577 0.245 27.325)`): erros, exclusões, despesas quando o contexto exige distinção explícita de "saída de dinheiro".

### Chart Ramp
- **Chart 1 → 5** (`oklch(0.81 0.117 11.638)` → `oklch(0.455 0.188 13.697)`): uma única família de cor (mesmo hue ~11–17°) variando em luminosidade. Gráficos não introduzem cores fora dessa família — multisséries usam o degradê, não cores arbitrárias.

### Named Rules
**The One Accent Rule.** Confident Berry é o único acento saturado do sistema. Nenhum segundo acento (verde "sucesso", azul "info") é introduzido; estado é comunicado por posição, ícone ou pelo próprio número (sinal +/-), não por uma segunda cor de marca.

## 3. Typography

**Display/Heading Font:** Poppins (`var(--font-poppins)`, fallback sans-serif)
**Body Font:** Inter (`var(--font-inter)`, fallback sans-serif)

**Character:** Poppins traz peso e personalidade aos títulos de seção sem virar decorativo; Inter carrega o trabalho pesado de leitura de números e texto longo com máxima neutralidade. O par existe para que dado nunca compita visualmente com o rótulo que o explica.

### Hierarchy
- **Headline** (Poppins, 600, `text-lg`–`text-2xl`, line-height 1, letter-spacing -0.01em): títulos de página e de card (ex: "Resumo do mês").
- **Title** (Inter, 600, `text-sm`–`text-base`): títulos de componente (`CardTitle`, cabeçalhos de tabela).
- **Body** (Inter, 400, `text-sm`, line-height 1.5): valores financeiros, descrições, conteúdo de formulário. Linha máxima de 65–75ch em textos longos.
- **Label** (Inter, 500, `text-xs`): legendas de gráfico, badges, texto de apoio em `CardDescription`/`muted-foreground`.

### Named Rules
**The Number-First Rule.** Nenhum valor financeiro é exibido em peso menor que `font-medium`; números nunca competem com `muted-foreground` pela atenção do usuário — eles vencem sempre.

## 4. Elevation

O sistema é tonal e quase plano: não há hierarquia de elevação em camadas (z-depth dramático), apenas sombras ambiente sutis (`shadow-xs`/`shadow-sm`/`shadow`) em superfícies que precisam se diferenciar do fundo — cards, inputs, botões. Modais e popovers usam a mesma sombra leve combinada com a posição em overlay, não com sombra mais escura. Profundidade dramática (sombras grandes, blur alto) está fora do sistema.

### Shadow Vocabulary
- **Surface ambient** (`shadow-xs`, ~`0 1px 2px rgba(0,0,0,0.05)`): inputs, input-group.
- **Card ambient** (`shadow`, ~`0 1px 3px rgba(0,0,0,0.1)`): cards, botão `default`/`destructive`.
- **Border-only** (sem sombra, `border` + `bg-background`): botão `outline`, divisórias de tabela.

### Named Rules
**The Whisper Shadow Rule.** Toda sombra no sistema é sutil o suficiente para passar despercebida conscientemente — ela existe para separar superfícies, não para chamar atenção. Se a sombra é notável à primeira vista, está forte demais.

## 5. Components

Botões, cards e inputs compartilham a mesma sensação: calma e precisa — cantos comedidos, sem ruído visual, foco total na legibilidade dos dados, mesmo nos estados de hover/foco.

### Buttons
- **Shape:** `rounded-md` (`calc(0.65rem - 2px)` ≈ 8.4px), `h-9` por padrão (`h-8` em `sm`, `h-10` em `lg`).
- **Primary (`default`):** fundo Confident Berry, texto Confident Berry Foreground, `shadow` leve, hover escurece com `bg-primary/90`.
- **Destructive:** fundo Destructive, mesmo tratamento de sombra/hover do primary.
- **Secondary:** fundo Neutral Surface, hover para `border` (claro) ou `sidebar` (escuro).
- **Outline:** fundo `background`, borda `input`, hover para Neutral Surface.
- **Ghost / Link:** sem fundo; ghost ganha Neutral Surface só no hover, link sublinha no hover.
- **Focus:** anel de 1px na cor Confident Berry Ring (`focus-visible:ring-1 ring-ring`), nunca outline do navegador.

### Cards / Containers
- **Corner Style:** `rounded-xl` (`calc(0.65rem + 4px)` ≈ 14.4px) — mais arredondado que botões/inputs, marcando "container" visualmente.
- **Background:** Paper White (claro) / superfície escura dedicada (escuro), nunca o mesmo tom do body.
- **Shadow Strategy:** Card ambient (ver Elevation).
- **Border:** 1px na cor Border.
- **Internal Padding:** `p-6` no header/content, `pt-0` quando emendado ao header anterior.

### Inputs / Fields (InputGroup)
- **Style:** borda Border, `rounded-md`, `h-9` (cresce com `textarea`), fundo `background` (com tonalidade leve em dark mode via `bg-input/30`).
- **Focus:** anel de 1px Confident Berry Ring no controle interno, não na borda do grupo inteiro.
- **Error:** anel `destructive/20` (claro) ou `destructive/40` (escuro) + borda Destructive — sempre via `aria-invalid`, nunca só cor de texto.
- **Padrão de uso:** sempre via `InputGroupInput`, nunca o `Input` solto, para herdar addons (ícones, prefixos de moeda) e o tratamento de erro consistente.

### Navigation (Sidebar)
- Fundo dedicado (`sidebar`), levemente distinto do `background` mesmo no claro (`oklch(0.985 0 0)` vs. branco puro) — separação sutil sem borda forte.
- Item ativo usa Confident Berry como acento (ícone ou indicador), nunca um fundo berry sólido em todo o item.

## 6. Do's and Don'ts

### Do:
- **Do** manter Confident Berry como único acento saturado do sistema (The One Accent Rule).
- **Do** usar a família de cor do chart ramp (mesmo hue, luminosidade variável) para qualquer nova visualização de dados — nunca introduzir uma cor fora da família para uma nova série.
- **Do** priorizar clareza sobre densidade: se uma tabela ou gráfico precisa de legenda explicativa para ser entendido, simplificar antes de documentar.
- **Do** usar `InputGroupInput` em todo formulário, nunca o `Input` solto (consistência de erro e foco).
- **Do** manter sombras na família "whisper" (`shadow-xs`/`shadow-sm`/`shadow`) — nunca além disso.

### Don't:
- **Don't** desenhar um dashboard denso estilo planilha/terminal financeiro — é o anti-padrão explícito do PRODUCT.md ("intimidam o usuário não-especialista").
- **Don't** usar paleta navy/cinza corporativo ou tom de "produto bancário" institucional — segundo anti-padrão explícito do PRODUCT.md.
- **Don't** introduzir uma segunda cor de acento saturada (verde "sucesso", azul "info"); comunicar estado por posição, ícone ou sinal numérico.
- **Don't** usar `muted-foreground` em valores financeiros — reservado a metadados/legendas (The Number-First Rule).
- **Don't** usar gradiente em texto, glassmorphism decorativo, ou bordas coloridas tipo `border-left` como acento — nenhum desses existe no sistema atual e nenhum deve ser introduzido.
- **Don't** dar tratamento visual diferente ao workspace pessoal vs. compartilhado — a mesma linguagem de componente serve para os dois (The Clear Ledger não muda de personagem).
