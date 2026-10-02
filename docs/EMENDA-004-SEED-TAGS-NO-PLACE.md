# Emenda 004: `seedTags` no `Place`, antes da hora

**Status:** aprovado e implementado
**Altera:** `api/prisma/schema.prisma` (modelo `Place`), `docs/PRODUTO.md` (passo 2)
**Fase:** entre a Fase 4 e a Fase 5

---

## Por que a decisão mudou

O comentário original do modelo `Place` em `schema.prisma` registrava uma
decisão deliberada:

> Sem `dna`/`postsCount`/`savesCount`: são derivados de Posts (Fase 5) e DNA
> (Fase 6), que ainda não existem.

Na época fazia sentido: nenhum lugar real existia, e carregar o modelo com
campos que nada preenchia ainda era antecipar trabalho sem necessidade. O
`docs/PRODUTO.md` (passo 2) assumiu em cima disso que "ligar Mapa e Explorar
no dado real" seria só trocar `services/mock/places.js` pela API, "sem mudar
o motor de recomendação".

Essa suposição não se sustentou na prática: o motor (`web/src/engine/`)
depende de `place.dna` para absolutamente tudo (título da experiência,
pontuação, afinidade). Hoje o DNA mockado vem de `consolidateDna(seedTags,
posts)`. Sem Posts (Fase 5) e sem um lugar para o DNA morar antes disso, todo
lugar vindo da API chegaria sem DNA, e o motor não teria o que processar: ou
seja, não dava para validar o motor com dado real sem esperar a Fase 5/6
inteira primeiro.

A alternativa (esperar) tem um custo próprio: meses rodando o motor só sobre
20 lugares de mentira, sem nenhum sinal de que a recomendação funciona com
dado de verdade, e descobrindo só na Fase 6/7 se a modelagem de DNA aguenta
lugar real. Dado esse risco, a decisão foi trazer uma peça pequena de Posts
(a semente de curadoria) para agora, em vez de esperar a fase inteira.

## Decisão

**`Place` ganha um campo `seedTags` (JSON, opcional), temporário.**

```prisma
/// Semente de curadoria por lugar, ponte temporária até Posts (Fase 5)
/// existir de verdade. Ver EMENDA-004.
seedTags Json? @map("seed_tags")
```

Mesmo formato que `consolidateDna` já espera no frontend:
`{ ambiente: string[], vibe: string[], publico: string[], perfil: string[] }`.
Quem cadastra um lugar (hoje, só via API/script, não existe tela de cadastro
no frontend) preenche essa curadoria manual. O DNA do lugar continua sendo
calculado 100% no frontend (`consolidateDna`), sem mudar nenhuma lógica: com
zero posts, a própria fórmula já existente faz o peso da semente ser máximo
(`seedWeight = 1`), então o comportamento é idêntico ao de um lugar mockado
recém-criado.

## Consequências

**Ganhos**

- O motor de recomendação roda sobre lugar real, cadastrado de verdade no
  Postgres, antes da Fase 5/6 existir: valida a modelagem de DNA cedo, que
  era exatamente o risco que motivou a emenda.
- Zero mudança em `engine/` ou nos componentes: a ponte inteira fica
  contida em `services/index.js` (mapeamento de campo) e no `Place` do
  Prisma (campo novo, opcional, não quebra nada existente).

**Custos**

- `seedTags` é uma decisão de curadoria manual, não um sinal de uso real:
  continua sendo o mesmo tipo de aproximação que já existia no mock, só que
  agora persistida. Não substitui Posts quando a Fase 5 chegar.
- Não existe tela de cadastro de lugar no frontend ainda. Até ela existir,
  `seedTags` só pode ser preenchido via chamada direta à API ou script, não
  é self-service.
- Quando a Fase 5 (Posts) for implementada, `consolidateDna` já diminui o
  peso da semente automaticamente conforme posts acumulam (`seedWeight =
  max(0.35, 2 / (posts.length + 2))`), então não é necessário migrar dado
  nem mudar fórmula nesse momento: a transição já estava desenhada na
  lógica existente, só faltava o campo para alimentá-la com dado real.
- Se a Fase 6 (DNA no servidor) decidir que o cálculo deve sair do frontend,
  `seedTags` continua sendo o insumo de entrada: a migração é de "onde
  calcula", não de "que dado alimenta".

**Custo de reverter:** baixo. É uma coluna opcional a mais: remover é uma
migration que dropa a coluna, sem efeito em nenhum lugar que não a usa
explicitamente.

## Impacto em decisões anteriores

| Decisão | Situação |
| --- | --- |
| Comentário original do `Place` ("sem dna/postsCount/savesCount... que ainda não existem") | **Parcialmente revertido.** `seedTags` entra agora, como ponte; `postsCount` e `savesCount` continuam de fora até Fase 5 |
| `docs/PRODUTO.md`, passo 2 ("sem mudar o motor de recomendação") | **Mantido no espírito, ajustado no texto.** O motor não muda; o que muda é que o `Place` real agora carrega o insumo que o motor precisa |
| `docs/ROADMAP.md`, Fase 5/6 (Posts, DNA) | **Não adiantada.** Posts continua não implementado; só a semente de curadoria (uma fração pequena do que a Fase 6 entrega) existe agora |
