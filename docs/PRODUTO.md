# ROOV — Documento de Produto

**Data:** 01/out/2026
**Status:** rascunho para validar entre os sócios antes de travar o plano do mês.

Este documento tem 4 partes: o que entra no MVP, o que já está pronto, o que
ainda falta (com os próximos passos concretos), e uma parte técnica — essa
última só interessa a quem vai colocar a mão no código.

---

## 1. O que estará no MVP

O `docs/ROADMAP.md` já define um MVP1 com 7 módulos (Mapa, Feed, Explorar,
Comunidades, Salvos, Perfil, Agenda) e DNA integrado em todos eles. Esse
continua sendo o destino. A proposta abaixo é um **corte menor**, pensado pra
caber num mês dado o estado real do backend hoje (seção 2) — não uma
substituição do MVP1, um primeiro degrau até ele.

**Entra no corte deste mês:**

| Módulo | Escopo do corte |
| --- | --- |
| Autenticação | Cadastro, login, logout, sessão persistente |
| Perfil | Ver e editar dados básicos, preferências de categoria |
| Lugares | Base real de lugares (categoria, localização, horário) |
| Mapa + Explorar | Navegação pelos lugares reais, com o motor de recomendação (DNA, contexto, pesos) decidindo o que aparece e em que ordem |
| Salvos | Marcar um lugar como "quero ir" ou "já fui" — sem calendário ainda |

**Fica para depois do MVP (melhoria):**

| Módulo | Por quê fica de fora agora |
| --- | --- |
| Feed social | Precisa de posts, fotos, curtidas e comentários — nenhuma linha de backend existe ainda (Fase 5 completa) |
| Comunidades | Precisa de criação, participação e moderação — mesma situação, Fase 8 completa |
| Agenda avançada | Calendário, eventos e lembretes — Salvos simples entra no corte, isso não |
| Pesquisa global | Fase 10, não iniciada |
| Integrações (fotos reais, clima real, mapa de verdade, geolocalização) | Fase 11, depende de decisão de fornecedor (Storage) |
| DNA rodando no servidor | O motor já existe e funciona — só que hoje roda no navegador. Levá-lo pro servidor (pra múltiplos clientes consultarem o mesmo cálculo) é trabalho de Fase 6/7 que ainda não começou |

A pergunta que separa um item de outro é sempre a mesma: **dá pra demonstrar a
proposta central do ROOV — "o que vale a pena viver, agora" — sem esse
módulo?** Mapa, Explorar e Salvos com recomendação de verdade já contam essa
história sozinhos. Feed e Comunidades contam uma história diferente (rede
social), que vale construir em seguida, não ao mesmo tempo.

---

## 2. O que já temos

Avaliação honesta do que existe **de verdade, rodando e testado** — não do
que está desenhado na tela.

| Área | Status | Nota |
| --- | --- | --- |
| Autenticação | 🟢 Vivido | Cadastro, login, logout, refresh, perfil autenticado. Argon2id + JWT + refresh token com rotação. 20 testes automatizados passando |
| Lugares (backend) | 🟡 Quero viver | CRUD existe (criar, atualizar, consultar, categorias, horário), mas ainda não confirmado se cobre tudo que o front vai precisar |
| Motor de recomendação (DNA, pesos, contexto, agenda) | 🟡 Quero viver | Existe, funciona, e é sofisticado — só que roda inteiro no navegador, sobre 20 lugares de mentira. Nunca viu um dado real |
| Mapa / Explorar (frontend) | 🟡 Quero viver | Telas prontas, só faltam ligar no dado real |
| Perfil (frontend + backend) | 🟡 Quero viver | Login/logout funcionam de verdade; editar perfil, avatar e preferências ainda não têm backend |
| Feed, Comunidades, Agenda avançada | ⚪ Ainda não | Telas existem (bonitas, navegáveis), mas 100% sobre dado inventado. Nenhuma dessas três tem uma linha de backend |
| Infraestrutura | 🟢 Vivido | Estrutura do projeto organizada, testes automatizados no backend, hospedagem decidida (Postgres gerenciado, sem Docker) |

**O que isso significa na prática:** o ROOV hoje é dois produtos colados — um
aplicativo de verdade (autenticação) e uma demo muito bem feita (todo o
resto). A ponte entre os dois já está desenhada (os `services/` do frontend
já separam "fala com a API real" de "fala com o mock"), só falta construir o
outro lado da ponte pro resto dos módulos.

---

## 3. O que ainda falta e próximos passos

Em ordem — cada passo depende do anterior.

1. **Banco de dados em produção.** Decidido: Postgres gerenciado (Supabase,
   só como hospedagem — não para login, essa decisão já foi tomada e
   revertida uma vez, ver `docs/EMENDA-002-AUTENTICACAO-PROPRIA.md`). Falta
   criar a conta, o projeto, ativar a extensão PostGIS e passar a connection
   string. *Responsável: Gabriel.*
2. **Ligar Mapa e Explorar no dado real.** Trocar `services/mock/places.js`
   pela chamada de verdade em `api/`, sem mudar o motor de recomendação —
   ele já está pronto, só precisa parar de receber dado inventado.
3. **Completar Perfil.** Editar nome/bio/avatar, preferências de categoria —
   fecha a Fase 3 do roadmap.
4. **Salvos simples.** Marcar lugar como "quero ir"/"já fui" — a versão sem
   calendário da Fase 9.
5. **Validar com dado real.** Com os 20 lugares de mock trocados por lugares
   de verdade (cadastrados à mão ou importados), testar se a recomendação
   continua fazendo sentido — é o primeiro teste de verdade do motor de DNA.
6. **Decisão de hospedagem da API e do front**, depois do MVP rodando local
   (Render/Fly/Railway para a API — o `Dockerfile` já existe pronto pra
   qualquer uma; Vercel/Netlify para o front).

Depois desses 6 passos, o corte do MVP (seção 1) está de pé. A partir daí, a
ordem de construção do que "fica como melhoria" volta a seguir o
`docs/ROADMAP.md` na ordem em que está — Feed antes de Comunidades, DNA no
servidor quando o segundo cliente (ex: app mobile) precisar dele de verdade.

---

## 4. Parte técnica

*Esta seção é só para quem vai construir — não precisa entrar numa
conversa de produto.*

### Stack

- **Frontend:** React 18 + Vite 6 + Tailwind 4, em `web/`.
- **API:** NestJS + Prisma + PostgreSQL (com PostGIS), em `api/`.
- **Repositório:** único, privado, sem ferramenta de monorepo — `web/` e
  `api/` são pastas independentes, cada uma com seu próprio `package.json`.
  Motivo registrado em `docs/EMENDA-003-REPO-UNICO-SEM-WORKSPACE.md`.

### Como rodar local

Ver `README.md` na raiz — resumo: `npm install` e `npm run dev` dentro de
cada pasta, Postgres gerenciado (sem Docker necessário).

### Como testar

A API já tem suíte de testes automatizados (Jest) cobrindo autenticação —
`npm test` dentro de `api/`. Convenção: todo módulo novo de backend entra
com teste antes de ser considerado pronto, mesmo padrão já usado em
`auth.service.spec.ts` e `jwt-auth.guard.spec.ts`. O frontend ainda não tem
suíte de testes — decisão a tomar quando ele parar de ser só mock.

### Como construir (ordem técnica dos passos da seção 3)

1. Banco em produção (Supabase, só hospedagem).
2. Endpoint de listagem de lugares já existe (`GET /v1/places` — conferir
   paginação por cursor, já é o padrão do resto da API).
3. No frontend, `services/index.js` hoje decide mock vs. real por módulo —
   trocar places para real é mudar essa decisão num lugar só, sem tocar em
   `engine/` nem nos componentes.
4. Módulo de perfil na API (`users.controller.ts` já existe, falta o PATCH
   de edição e o campo de avatar — decidir se avatar é upload real
   (precisa de Storage, puxa a Fase 11 pra frente) ou uma lista de ícones
   prontos pra começar).
5. Tabela nova (`saved_places` ou equivalente) + endpoints de
   criar/listar/remover — reaproveita os mesmos `AppException`, guards e
   padrão de resposta já estabelecidos.

### Decisões já tomadas (não reabrir sem motivo novo)

- Autenticação é nossa, nunca de provedor externo (`EMENDA-002`).
- Toda rota nasce protegida; `@Public()` é exceção explícita.
- Só repositórios tocam o Prisma.
- Erro sempre vira `AppException`, nunca `HttpException` crua.
- O motor de recomendação continua com implementação única em
  `web/src/engine/` até o dia em que o backend precisar dele de verdade
  (`EMENDA-003`) — não construir um pacote compartilhado antes disso
  acontecer.

Lista completa de invariantes: `README.md`, seção "Invariantes da
arquitetura".
