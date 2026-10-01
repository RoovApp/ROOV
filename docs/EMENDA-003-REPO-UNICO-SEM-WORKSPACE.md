# Emenda 003: Repositório único, sem workspace

**Status:** aprovado e implementado
**Altera:** `README.md` (estrutura do projeto), `FASE-1-DECISOES-TECNICAS.md` (onde citar `packages/core`)
**Fase:** entre a Fase 4 e a Fase 5

---

## Por que a decisão mudou

O projeto adotou pnpm workspace desde o commit inicial do backend, com
`apps/api`, `apps/web` (planejado) e `packages/core` como três pacotes
linkados. A razão registrada no README original era específica: o
`engine/` é o produto, e sem um pacote compartilhado existiriam duas
implementações do motor de recomendação divergindo em silêncio.

Essa razão continua válida em tese, mas na prática `packages/core` nunca saiu
do estado de rascunho: permaneceu vazio de propósito, aguardando a Fase 6
para receber `domain/` e `engine/` migrados de `apps/web`. Até lá, o
workspace não estava protegendo nada: só adicionava uma ferramenta a mais
(pnpm, corepack, protocolo `workspace:*`) para coordenar dois pacotes reais
(`api`, `web`) e um terceiro que não existia de verdade ainda.

O custo apareceu num ambiente de desenvolvimento sem Docker nem Homebrew
instalados: `corepack enable` falhava por permissão, e a dependência de
`pnpm install --frozen-lockfile` na raiz tornava qualquer ajuste pontual em
`api/` ou `web/` mais pesado do que precisava ser.

## Decisão

**Repositório único, duas pastas irmãs, sem workspace.**

```
roov/
├── web/    package.json próprio, instala e roda sozinho
├── api/    package.json próprio, instala e roda sozinho
└── docs/
```

`pnpm-workspace.yaml`, `pnpm-lock.yaml` e `packages/core` saíram do repositório.
A dependência `@roov/core: workspace:*` em `api/package.json` saiu junto:
não tinha nenhum import real apontando para ela.

## Consequências

**Ganhos**

- Nenhuma ferramenta de workspace pra instalar ou que possa falhar por
  permissão/ambiente. `npm install` dentro de cada pasta basta.
- Build de produção de cada pasta fica mais simples (o `Dockerfile` da API
  não precisa mais copiar manifests de três pacotes nem rodar `pnpm --filter`
  em sequência).
- Menos uma camada de indireção pra entender quando alguém novo entra no
  projeto.

**Custos**

- A garantia de "uma implementação só" do motor de recomendação deixa de ser
  estrutural. Hoje ele só existe em `web/src/engine/`, então não há
  divergência possível ainda, mas quando a API precisar da mesma lógica
  (Fase 6/7), será preciso decidir como compartilhar código outra vez, com
  uma emenda própria quando chegar a hora. Não antes: decidir isso agora,
  sem o backend realmente precisar, é resolver um problema que ainda não
  existe.
- `packages/core` como conceito (pacote TypeScript puro, publicado com
  `.d.ts`) continua sendo uma solução válida pra esse problema futuro, só
  não faz sentido mantê-lo vazio enquanto não chega a hora de usá-lo de
  verdade.

**Custo de reverter:** baixo. Recriar o workspace é mover `web/` e `api/`
pra dentro de `apps/`, devolver `packages/core`, e religar o `workspace:*`
onde fizer sentido: nenhuma lógica muda, só a organização de pastas.

## Impacto em decisões anteriores

| Decisão | Situação |
| --- | --- |
| D2: `packages/core` compartilhado (FASE-1-DECISOES-TECNICAS) | **Adiada**, não revertida. Volta à mesa na Fase 6, quando o backend precisar do motor de verdade |
| Invariante 1 do README ("`packages/core` é puro") | **Obsoleta por ora.** Não há `packages/core` pra ser puro ou não. A invariante volta quando o pacote voltar |
| `Dockerfile` da API (build a partir da raiz do monorepo) | **Substituído.** Build agora acontece a partir de `api/`, sem copiar manifests de outros pacotes |
