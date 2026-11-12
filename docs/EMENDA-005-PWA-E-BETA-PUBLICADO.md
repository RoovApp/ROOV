# Emenda 005: PWA como caminho de distribuição do beta, e publicação real

**Status:** aprovado e implementado
**Altera:** `docs/PRODUTO.md` (seções 2 e 3), `FASE-1-DECISOES-TECNICAS.md` (D9, execução)
**Fase:** depois do corte do MVP (seção 1 do `PRODUTO.md`), antes de validar com usuários de fora

---

## Por que a decisão mudou

O plano até aqui (ver `mobile/` e as tentativas registradas em `docs/PRODUTO.md`)
era testar o ROOV num aparelho de verdade via build nativo Expo (EAS). Dois
bloqueios pararam esse caminho:

- **Android:** a última tentativa de build (01/out, perfil `preview`) errou na
  fase de instalação de dependências. Nenhum `.apk` foi gerado.
- **iOS:** bloqueado por completo sem a Apple Developer Program (US$ 99/ano) —
  exigência da Apple, não da Expo — e sem Xcode instalado na máquina de
  desenvolvimento, o que também bloqueia o simulador.

Esperar os dois se resolverem antes de qualquer teste de fora teria empurrado
a validação do produto por tempo indefinido, sem relação com a qualidade do
MVP em si. Ao mesmo tempo, o `web/` já tinha o mesmo produto rodando, só
faltava torná-lo instalável.

## Decisão

**O `web/` vira uma PWA instalável, e passa a ser o caminho principal de
distribuição do beta — não substitui o app nativo (Expo), só deixa de
bloquear o teste nele.**

Entregas:

1. **CRUD de Lugares completo.** Faltava editar e excluir (só havia criar e
   ler). Adicionado `PATCH`/`DELETE /v1/places/:id` na API, com a mesma regra
   de posse do resto do sistema: só quem cadastrou edita ou exclui (`403`
   pra qualquer outro usuário, testado). No front, os ícones de editar/excluir
   só aparecem pra quem é dono, na ficha do lugar.
2. **Manifest + Service Worker** (`vite-plugin-pwa`, modo `generateSW`,
   `registerType: autoUpdate`). O service worker nunca cacheia chamadas à API
   (`/v1/*`): o app precisa de dado real, nunca de resposta velha servida
   offline sem o usuário perceber.
3. **Ícones da PWA** gerados a partir da marca já existente no projeto
   (`mobile/assets/images/android-icon-foreground.png`), não uma paleta nova.
4. **Tutorial de instalação**, mostrado uma vez, logo após o primeiro login
   (persistido em `localStorage`, por navegador). Detecta a plataforma: iOS
   mostra o passo manual do Safari (Adicionar à Tela de Início); Android/Chrome
   mostra um botão "Instalar agora" ligado ao `beforeinstallprompt` nativo
   quando disponível, com passo a passo manual como alternativa.
5. **Publicação real**, executando a decisão que já estava tomada desde
   `EMENDA-001` (seção 2) e `FASE-1-DECISOES-TECNICAS.md` (D9): Render Free
   para a API, Vercel Hobby para o front. Ver seção "Onde está publicado"
   abaixo.

## Incidente operacional registrado: banco do Supabase recriado

Durante esta rodada, o projeto Supabase original (`vvstoccvbixfypoxeimc`,
região São Paulo) foi encontrado inacessível — o domínio do projeto não
resolvia mais no DNS, consistente com a conta ter sido removida numa limpeza
de contas, não com o comportamento normal de "pausado por inatividade" (que
`FASE-1-DECISOES-TECNICAS.md`, R5, já previa e que apenas exige reabrir o
projeto no painel).

**Resolução:** novo projeto Supabase criado, mesma região (South America /
São Paulo, `sa-east-1`), nova conta/organização. As 7 migrations do Prisma
foram reaplicadas sem erro. `api/.env` local foi atualizado com a nova
connection string — **nenhum segredo entra neste documento nem em nenhum
outro arquivo versionado**; ver "Como continuar da sua máquina" no
`README.md` pra saber de onde tirar a nova string.

**Lição registrada:** nada muda na arquitetura por causa disso — é Postgres
gerenciado, como D3 já previa, sem lock-in real. O ponto novo é prático: ao
assumir o projeto, confirme que o projeto Supabase ativo é o mesmo que a
`DATABASE_URL`/`DIRECT_URL` atuais apontam antes de rodar qualquer migration.

## Onde está publicado

| Camada | Serviço | Plano | Endereço |
| --- | --- | --- | --- |
| Front (PWA) | Vercel | Hobby (grátis) | `https://roov-web-rouge.vercel.app` |
| API | Render | Free (grátis) | `https://roov-api-ttm0.onrender.com` |
| Banco | Supabase | Free (grátis) | São Paulo (`sa-east-1`), recriado em 12/nov |

**Duas ressalvas operacionais, não bugs:**

- **Cold start da API:** no plano Free do Render, a instância "dorme" depois
  de um tempo sem tráfego. A primeira requisição depois disso pode levar uns
  50 segundos. Upgrade pra Starter (~US$ 7/mês) remove isso, se incomodar
  antes de validar com usuários reais.
- **E-mail de verificação não está ativo:** sem `RESEND_API_KEY`, o código de
  6 dígitos do cadastro só é logado no servidor (ver logs do Render), não
  chega no e-mail de ninguém. Configurar é rápido (conta grátis em
  resend.com, colar a chave na variável de ambiente do Render) — ver
  `README.md`.

**Como republicar depois de um `git push`:**

- **Render redeploya sozinho** a cada push na branch `main` do
  `github.com/RoovApp/ROOV` (é de lá que o serviço `roov-api` foi conectado).
- **Vercel não está conectado ao GitHub ainda** (a tentativa de conectar
  automaticamente falhou na criação do projeto). Até alguém conectar o
  repositório pelo painel da Vercel, publicar uma versão nova do front é
  manual: `cd web && npx vercel deploy --prod`, de dentro de uma conta com
  acesso ao projeto `roov/roov-web` na Vercel.

## Consequências

**Ganhos**

- Beta testável por qualquer pessoa de fora, em qualquer aparelho com
  navegador, sem esperar os bloqueios de loja de aplicativo (Apple Developer
  Program, build Android quebrado).
- CRUD de Lugares fecha de verdade: antes só dava pra cadastrar, não pra
  corrigir um erro de digitação ou remover um lugar de teste.
- A decisão de hospedagem de `EMENDA-001`/D9 deixa de ser plano e vira fato:
  custo real confirmado em **US$ 0/mês** nos três serviços.

**Custos**

- PWA não é loja de aplicativo: sem presença na App Store/Play Store, sem
  as vantagens de descoberta orgânica que uma loja dá. Isso não muda a
  decisão de eventualmente publicar o app Expo nativo, só tira a urgência.
- Cold start do Render (sem custo) é uma fricção real na primeira
  impressão de quem testar depois de um tempo parado.
- Vercel sem conexão automática ao GitHub é débito operacional: redeploy do
  front exige alguém rodar o comando manualmente, não acontece sozinho.

**Custo de reverter:** baixo. A PWA não substitui nada que já existia, só
adiciona manifest/service worker/ícones por cima do `web/` que já rodava.
Remover é tirar o plugin do `vite.config.js` e os arquivos em
`web/src/services/installPrompt.js` e `web/src/modules/onboarding/InstallAppModule.jsx`.

## Impacto em decisões anteriores

| Decisão | Situação |
| --- | --- |
| `EMENDA-001`, seção 2 (Render Free + Vercel Hobby, custo zero) | **Executada.** Deixa de ser plano, os dois serviços estão no ar |
| `FASE-1-DECISOES-TECNICAS.md`, D9 | **Confirmada na prática**, com os endereços reais acima |
| `docs/PRODUTO.md`, passo 6 ("decisão de hospedagem") | **Concluído em 12/nov** |
| Build nativo Android/iOS via Expo (`mobile/`) | **Não substituído, só não é mais bloqueio pro primeiro teste.** Continua como passo futuro |
