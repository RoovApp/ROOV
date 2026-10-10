# ROOV: Documento de Produto

**Data:** 01/out/2026 (última atualização: 10/out/2026)
**Status:** rascunho para validar entre os sócios antes de travar o plano do mês.
**Projeto pausado em 10/out/2026**, retomar quando a conta do Google Cloud
existir (ver passo 7 da seção 3).

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
| Autenticação | 🟢 Vivido | Cadastro, login, logout, refresh, perfil autenticado. Argon2id + JWT + refresh token com rotação. Desde 07/out, cadastro aceita localização opcional e exige confirmar um código de 6 dígitos por e-mail antes de entrar no app (não em todo login). 28 testes automatizados passando |
| Lugares (backend) | 🟡 Quero viver | CRUD existe (criar, atualizar, consultar, categorias, horário), mas ainda não confirmado se cobre tudo que o front vai precisar |
| Motor de recomendação (DNA, pesos, contexto, agenda) | 🟡 Quero viver | Roda sobre mock + lugar real (seedTags, EMENDA-004) desde 01/out. Ainda não viu sinal de uso de verdade (Posts, Fase 5) |
| Mapa / Explorar (frontend) | 🟢 Vivido | Ligados em `api/` desde 01/out (EMENDA-004); mostram mock + lugar real juntos. Falta geolocalização de verdade (`distanceKm` é neutro pra lugar real) |
| Perfil (frontend + backend) | 🟢 Vivido | Editar nome/bio/cidade/estado/país já era real desde antes (achado em 07/out, o status aqui estava desatualizado). Completado em 07/out: avatar (preset de emoji, sem upload) e preferência de categoria, ambos persistidos |
| Salvos (favorito/quero/vivido) | 🟢 Vivido | Concluído em 07/out: tabela `SavedPlace`, toggle otimista no frontend, funciona pra lugar mockado e real (`placeId` sem FK, de propósito) |
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
3. ~~**Completar Perfil.**~~ **Concluído em 07/out.** Nome/bio/cidade/estado/
   país já eram reais desde antes (o status da seção 2 estava desatualizado
   nesse ponto). O que faltava de fato: avatar (preset de emoji, decisão
   registrada de não fazer upload real ainda, Storage é Fase 11) e
   preferência de categoria declarada (`preferredCategories` no `User`,
   sinal de cold start, não alimenta o DNA ainda). De quebra, achado um bug:
   o merge entre identidade real e perfil mock em `RoovProvider` usava uma
   lista explícita de campos que não incluía os novos, corrigido junto.
   Fecha a Fase 3 do roadmap.
4. ~~**Salvos simples.**~~ **Concluído em 07/out.** Tabela nova `SavedPlace`
   (favorito/quero/vivido, mesmos três tipos que a UI já tinha), com uma
   decisão de propósito: `placeId` é texto solto, sem FK pro `Place`, porque
   a lista mistura lugar mockado e real, e metade ficar sem poder salvar
   seria pior que perder integridade referencial. Toggle otimista no
   frontend (aplica local na hora, desfaz se a API falhar). Validado: salvar
   e remover lugar real e lugar mockado, os dois persistem/removem certo.
5. ~~**Cadastrar lugares de verdade.**~~ **Concluído em 07/out.** Tela nova
   em `/lugares/novo`, acessível pelo "+" central (que virou um menu com
   duas opções: publicar experiência ou cadastrar lugar). Cobre nome,
   categoria, tipo, endereço, coordenadas (com atalho de geolocalização do
   navegador), faixa de preço, horário e a curadoria de `seedTags` (opcional,
   mesmos 4 grupos do DNA). Lugar criado aparece em Mapa/Explorar/Busca na
   hora, sem recarregar a página. Validado ponta a ponta: cadastrei a
   Padaria Bella Paulista pela própria tela, foi pro ar com DNA correto.
   Antes de hoje, só havia os 6 lugares cadastrados via script; agora são 7,
   e o self-service é real. Falta só upload de foto (Storage, Fase 11).
6. **Decisão de hospedagem da API e do front**, depois do MVP rodando local
   (Render/Fly/Railway para a API, o `Dockerfile` já existe pronto pra
   qualquer uma; Vercel/Netlify para o front).
7. **🔴 Bloqueado: integrar lugares do Google Maps.** Pedido em 10/out, fora
   do corte original: lugares passariam a vir do Google Places (nearby
   search, filtrado pro que faz sentido no ROOV) em vez de cadastro manual,
   que seria removido. O mapa principal passaria a ser um mapa de verdade
   (hoje é decorativo, sem biblioteca nenhuma por trás), com o nome de cada
   lugar em formato de balão, cinza até o primeiro post e colorido depois.
   Inclui também um seletor de lugar por mapa (centrado na localização da
   pessoa) na tela de criar post, pra quando o lugar ainda não tem post.
   **Trancado por falta de uma conta no Google Cloud com faturamento
   ativado** (Maps JavaScript API + Places API exigem isso mesmo dentro do
   crédito gratuito de $200/mês): ninguém além do Gabriel pode criar essa
   conta. Retomar quando a conta existir. Enquanto isso, o cadastro manual
   de lugares (passo 5) continua sendo o único caminho pra lugar novo entrar
   no catálogo, e os 7 lugares já cadastrados ficam como estão.

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

**O banco pausa sozinho por inatividade** (free tier do Supabase, visto na
prática em 07/out depois de alguns dias sem uso): a API falha com
`tenant/user not found`. Reativa abrindo o projeto no painel do Supabase
(status "Coming up...", leva cerca de 1 minuto); nunca rodar
`prisma migrate dev` nesse estado, ele detecta isso como "drift" e oferece
resetar o schema inteiro. Usar `prisma db execute` com uma migration escrita
à mão + `prisma migrate resolve --applied` pra aplicar mudança de schema sem
cair nesse fluxo.

**Pra ativar envio de e-mail de verdade:** sem `RESEND_API_KEY`, o código de
verificação do cadastro só é logado no servidor (modo dev, API sobe normal).
Pra enviar de verdade: criar conta grátis em resend.com, gerar uma chave em
API Keys, colar em `RESEND_API_KEY` no `api/.env`. `RESEND_FROM_EMAIL` já
vem com o domínio de teste do Resend (`onboarding@resend.dev`), que funciona
sem verificar domínio próprio.

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
4. ~~Módulo de perfil na API~~ **Concluído em 07/out:** decidido avatar como
   preset de emoji (não upload, Storage fica pra Fase 11), e
   `preferredCategories` como preferência declarada no `User`.
5. ~~Tabela nova (`saved_places`)~~ **Concluído em 07/out:** `SavedPlace`
   (favorito/quero/vivido), endpoints de criar/listar/remover, `placeId`
   sem FK de propósito.

### Decisões já tomadas (não reabrir sem motivo novo)

- Autenticação é nossa, nunca de provedor externo (`EMENDA-002`).
- Toda rota nasce protegida; `@Public()` é exceção explícita.
- Só repositórios tocam o Prisma.
- Erro sempre vira `AppException`, nunca `HttpException` crua.
- O motor de recomendação continua com implementação única em
  `web/src/engine/` até o dia em que o backend precisar dele de verdade
  (`EMENDA-003`); não construir um pacote compartilhado antes disso
  acontecer.
- Avatar é preset de emoji, não upload de arquivo. `preferredCategories` é
  preferência declarada, não entra em `buildUserDna`. Reabrir só quando
  Storage (Fase 11) ou Posts (Fase 5) chegarem de verdade.
- `SavedPlace.placeId` é texto solto, sem FK pro `Place` (mesmo raciocínio
  do `seedTags`/EMENDA-004: a lista mistura mock e real). Reabrir só quando
  o mock de lugares sair de cena de vez.
- Código de verificação de e-mail é só no cadastro, não em todo login
  (decisão registrada em 07/out). SHA-256, não Argon2: quem impede força
  bruta é o limite de tentativas (`VERIFICATION_MAX_ATTEMPTS`), não o custo
  do hash. Envio é best-effort: falha não derruba o cadastro, só fica sem
  código até o usuário pedir reenvio.

Lista completa de invariantes: `README.md`, seção "Invariantes da
arquitetura".
