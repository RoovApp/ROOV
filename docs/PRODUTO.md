# ROOV: Documento de Produto

**Data:** 01/out/2026
**Status:** rascunho para validar entre os sócios antes de travar o plano do mês.

Este documento tem 5 partes: o que entra no MVP, o que já está pronto, o que
ainda falta (com os próximos passos concretos), pontos estratégicos a
validar, e uma parte técnica (essa última só interessa a quem vai colocar a
mão no código).

---

## 1. O que estará no MVP

O `docs/ROADMAP.md` já define um MVP1 com 7 módulos (Mapa, Feed, Explorar,
Comunidades, Salvos, Perfil, Agenda) e DNA integrado em todos eles. Esse
continua sendo o destino. A proposta abaixo é um **corte menor**, pensado pra
caber num mês dado o estado real do backend hoje (seção 2): não uma
substituição do MVP1, um primeiro degrau até ele.

**Entra no corte deste mês:**

| Módulo | Escopo do corte |
| --- | --- |
| Autenticação | Cadastro, login, logout, sessão persistente |
| Perfil | Ver e editar dados básicos, preferências de categoria |
| Lugares | Base real de lugares (categoria, localização, horário) |
| Mapa + Explorar | Navegação pelos lugares reais, com o motor de recomendação (DNA, contexto, pesos) decidindo o que aparece e em que ordem |
| Salvos | Marcar um lugar como "quero ir" ou "já fui", sem calendário ainda |

**Fica para depois do MVP (melhoria):**

| Módulo | Por quê fica de fora agora |
| --- | --- |
| Feed social | Precisa de posts, fotos, curtidas e comentários. Nenhuma linha de backend existe ainda (Fase 5 completa) |
| Comunidades | Precisa de criação, participação e moderação. Mesma situação, Fase 8 completa |
| Agenda avançada | Calendário, eventos e lembretes. Salvos simples entra no corte, isso não |
| Pesquisa global | Fase 10, não iniciada |
| Integrações (fotos reais, clima real, mapa de verdade, geolocalização) | Fase 11, depende de decisão de fornecedor (Storage) |
| DNA rodando no servidor | O motor já existe e funciona, só que hoje roda no navegador. Levá-lo pro servidor (pra múltiplos clientes consultarem o mesmo cálculo) é trabalho de Fase 6/7 que ainda não começou |

A pergunta que separa um item de outro é sempre a mesma: **dá pra demonstrar a
proposta central do ROOV ("o que vale a pena viver, agora") sem esse
módulo?** Mapa, Explorar e Salvos com recomendação de verdade já contam essa
história sozinhos. Feed e Comunidades contam uma história diferente (rede
social), que vale construir em seguida, não ao mesmo tempo.

---

## 2. O que já temos

Avaliação honesta do que existe **de verdade, rodando e testado**, não do
que está desenhado na tela.

| Área | Status | Nota |
| --- | --- | --- |
| Autenticação | 🟢 Vivido | Cadastro, login, logout, refresh, perfil autenticado. Argon2id + JWT + refresh token com rotação. 20 testes automatizados passando |
| Lugares (backend) | 🟡 Quero viver | CRUD existe (criar, atualizar, consultar, categorias, horário), mas ainda não confirmado se cobre tudo que o front vai precisar |
| Motor de recomendação (DNA, pesos, contexto, agenda) | 🟡 Quero viver | Roda sobre mock + lugar real (seedTags, EMENDA-004) desde 01/out. Ainda não viu sinal de uso de verdade (Posts, Fase 5) |
| Mapa / Explorar (frontend) | 🟢 Vivido | Ligados em `api/` desde 01/out (EMENDA-004); mostram mock + lugar real juntos. Falta geolocalização de verdade (`distanceKm` é neutro pra lugar real) |
| Perfil (frontend + backend) | 🟡 Quero viver | Login/logout funcionam de verdade; editar perfil, avatar e preferências ainda não têm backend |
| Feed, Comunidades, Agenda avançada | ⚪ Ainda não | Telas existem (bonitas, navegáveis), mas 100% sobre dado inventado. Nenhuma dessas três tem uma linha de backend |
| Infraestrutura | 🟢 Vivido | Estrutura do projeto organizada, testes automatizados no backend, hospedagem decidida (Postgres gerenciado, sem Docker) |

**O que isso significa na prática:** o ROOV hoje é dois produtos colados, um
aplicativo de verdade (autenticação) e uma demo muito bem feita (todo o
resto). A ponte entre os dois já está desenhada (os `services/` do frontend
já separam "fala com a API real" de "fala com o mock"), só falta construir o
outro lado da ponte pro resto dos módulos.

---

## 3. O que ainda falta e próximos passos

Em ordem: cada passo depende do anterior.

1. ~~**Banco de dados em produção.**~~ **Concluído em 01/out.** Postgres
   gerenciado (Supabase, só como hospedagem, não para login, ver
   `docs/EMENDA-002-AUTENTICACAO-PROPRIA.md`), PostGIS ativo, migrations
   aplicadas.
2. ~~**Ligar Mapa e Explorar no dado real.**~~ **Concluído em 01/out, com uma
   ressalva registrada:** não foi só trocar a fonte de dado. O motor de
   recomendação precisava de `place.dna`, que não existia em lugar nenhum pra
   lugar real (Posts, Fase 5, não existe ainda). Ver
   `docs/EMENDA-004-SEED-TAGS-NO-PLACE.md`: `Place` ganhou `seedTags`
   (curadoria manual, ponte temporária) pra alimentar o motor sem esperar a
   Fase 5/6. Hoje `services/index.js` soma lugares mockados com os reais
   vindos da `api/`; Feed/Comunidades continuam só mockados (dependem de
   Posts, fora do corte). Validado ponta a ponta: lugar criado via API
   aparece em Mapa/Explorar/Busca/Detalhe com DNA correto.
3. **Completar Perfil.** Editar nome/bio/avatar, preferências de categoria.
   Fecha a Fase 3 do roadmap.
4. **Salvos simples.** Marcar lugar como "quero ir"/"já fui": a versão sem
   calendário da Fase 9.
5. **Cadastrar lugares de verdade.** Não existe tela de "cadastrar lugar" no
   frontend ainda: hoje só dá pra criar lugar via chamada direta à API. Pra
   validar a recomendação com um conjunto real (território + categoria
   específicos, ponto da seção 4), ou se cadastra via script/API por enquanto,
   ou essa tela entra na lista antes do passo 5 valer a pena de verdade.
6. **Decisão de hospedagem da API e do front**, depois do MVP rodando local
   (Render/Fly/Railway para a API, o `Dockerfile` já existe pronto pra
   qualquer uma; Vercel/Netlify para o front).

Depois desses 6 passos, o corte do MVP (seção 1) está de pé. A partir daí, a
ordem de construção do que "fica como melhoria" volta a seguir o
`docs/ROADMAP.md` na ordem em que está: Feed antes de Comunidades, DNA no
servidor quando o segundo cliente (ex: app mobile) precisar dele de verdade.

---

## 4. Pontos estratégicos a validar

**Direção estratégica: confirmada, não precisa mudar.** Vale reforçar o que
já está decidido antes de construir mais features: o ROOV tem um eixo
central claro, descrito em `docs/VISION.md` (descoberta de experiências é o
eixo primário, comunidade sustenta a confiança na recomendação, não é o
ponto de partida). Nada muda aqui, só vale manter a disciplina de checar
isso a cada feature nova.

**Pertencimento (Comunidades) depois, não antes: já é a decisão tomada.**
Entender o usuário de verdade (localização, persona, comportamento) antes
de construir features de pertencimento. É exatamente a sequência que a
seção 1 já propõe: Comunidades fica como melhoria, fora do corte deste mês.

**Geolocalização com raio definido.** O roadmap já lista geolocalização na
Fase 11, mas de forma genérica. Vale ser específico desde já: busca por
lugares precisa de um raio configurável (ex: "experiências a até 5 km"), não
só "usar a localização do usuário". Muda a experiência de Mapa/Explorar de
forma direta, e é barato de especificar agora mesmo sem implementar ainda.

**Validar aderência por território e categoria antes de escalar.** Em vez
de validar com lugares espalhados por qualquer região/categoria, delimitar
uma combinação específica (ex: uma região da cidade + uma categoria como
gastronomia) pra confirmar que a recomendação funciona de verdade antes de
abrir pra tudo. Dá pra incorporar já no passo 5 da seção 3: o "dado real"
desse teste pode ser um recorte deliberado, não só qualquer lugar.

**Monetização: ainda não está no papel.** É o ponto que mais falta no ROOV
hoje: nenhum documento atual discute como o produto gera receita. Vale
pensar a jornada monetizada contemplando B2B (lugares/parceiros pagando por
visibilidade, por exemplo) e B2C (usuário final, possivelmente assinatura)
desde já, mesmo que a decisão final venha depois. Antes de validar qualquer
frente B2B, confirmar que é um ativo de valor de verdade e mapear o
orçamento necessário, não assumir que "vender espaço pra lugares" é óbvio
só porque parece óbvio. **Não é uma decisão deste documento: é uma lacuna
registrada, pra entrar na pauta com o sócio.**

**Não precisamos fazer tudo agora, mas precisamos ter tudo mapeado.** Já é
como este documento está estruturado: um corte pequeno pra este mês (seção
1), o resto mapeado no roadmap, não esquecido.

---

## 5. Parte técnica

*Esta seção é só para quem vai construir, não precisa entrar numa
conversa de produto.*

### Stack

- **Frontend:** React 18 + Vite 6 + Tailwind 4, em `web/`.
- **API:** NestJS + Prisma + PostgreSQL (com PostGIS), em `api/`.
- **Repositório:** único, privado, sem ferramenta de monorepo. `web/` e
  `api/` são pastas independentes, cada uma com seu próprio `package.json`.
  Motivo registrado em `docs/EMENDA-003-REPO-UNICO-SEM-WORKSPACE.md`.

### Como rodar local

Ver `README.md` na raiz (resumo: `npm install` e `npm run dev` dentro de
cada pasta, Postgres gerenciado, sem Docker necessário).

### Como testar

A API já tem suíte de testes automatizados (Jest) cobrindo autenticação:
`npm test` dentro de `api/`. Convenção: todo módulo novo de backend entra
com teste antes de ser considerado pronto, mesmo padrão já usado em
`auth.service.spec.ts` e `jwt-auth.guard.spec.ts`. O frontend ainda não tem
suíte de testes; decisão a tomar quando ele parar de ser só mock.

### Como construir (ordem técnica dos passos da seção 3)

1. Banco em produção (Supabase, só hospedagem).
2. Endpoint de listagem de lugares já existe (`GET /v1/places`, conferir
   paginação por cursor, já é o padrão do resto da API).
3. No frontend, `services/index.js` hoje decide mock vs. real por módulo:
   trocar places para real é mudar essa decisão num lugar só, sem tocar em
   `engine/` nem nos componentes.
4. Módulo de perfil na API (`users.controller.ts` já existe, falta o PATCH
   de edição e o campo de avatar: decidir se avatar é upload real (precisa
   de Storage, puxa a Fase 11 pra frente) ou uma lista de ícones prontos
   pra começar).
5. Tabela nova (`saved_places` ou equivalente) + endpoints de
   criar/listar/remover: reaproveita os mesmos `AppException`, guards e
   padrão de resposta já estabelecidos.

### Decisões já tomadas (não reabrir sem motivo novo)

- Autenticação é nossa, nunca de provedor externo (`EMENDA-002`).
- Toda rota nasce protegida; `@Public()` é exceção explícita.
- Só repositórios tocam o Prisma.
- Erro sempre vira `AppException`, nunca `HttpException` crua.
- O motor de recomendação continua com implementação única em
  `web/src/engine/` até o dia em que o backend precisar dele de verdade
  (`EMENDA-003`); não construir um pacote compartilhado antes disso
  acontecer.

Lista completa de invariantes: `README.md`, seção "Invariantes da
arquitetura".
