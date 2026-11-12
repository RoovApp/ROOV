# Emenda 006: teste fechado em `/admin`, sem código de e-mail no cadastro

**Status:** aprovado e implementado
**Altera:** `docs/PRODUTO.md` (decisão "código de verificação só no cadastro"), `docs/EMENDA-005-PWA-E-BETA-PUBLICADO.md` (onde o front fica publicado)
**Data:** 12/nov/2026

---

## Por que a decisão mudou

Duas coisas travavam o teste com gente de fora:

- **Código de e-mail no cadastro.** O domínio de teste do Resend só entrega
  pro e-mail da própria conta (`PRODUTO.md`, passo 10). Qualquer outra pessoa
  criava a conta e ficava presa na tela "Confirme seu e-mail", sem nunca
  receber o código.
- **App aberto na raiz do domínio.** Pra levar o beta pra um domínio próprio
  durante o teste, o app não deve ficar exposto pra quem cair no endereço por
  acaso nem ser indexado por buscadores.

## Decisão

1. **Verificação de e-mail desligada no cadastro.** A API não gera nem envia
   mais o código (`AuthService.register`); o front entra direto no app depois
   do cadastro e não trava mais quem tinha conta não verificada. O resto do
   mecanismo (`/auth/verify-email`, `/auth/resend-verification`,
   `VerifyEmailModule`, tabela de códigos) **fica no código, sem uso**, pra
   ser religado quando houver domínio verificado no Resend. Os comentários em
   `auth.service.ts` e `AuthProvider.jsx` dizem onde mexer.
2. **App em `/admin`, atrás de usuário e senha.** O build do `web/` sai em
   `dist/admin/` (`base: '/admin/'`); a raiz do domínio serve só uma página
   "em breve" (`web/site/`). `web/middleware.js` (Vercel Routing Middleware)
   exige Basic Auth em `/admin` com `ADMIN_USER`/`ADMIN_PASSWORD`, definidos
   como variável de ambiente no Vercel, nunca no código. Sem as variáveis, a
   resposta é `503`: falha fechada, mesma filosofia de "rota nasce protegida".
   Tudo sai com `noindex` (`robots.txt`, meta e cabeçalho `X-Robots-Tag`).

## Consequências

**Ganhos**

- Qualquer pessoa com a senha de teste consegue se cadastrar e usar o app,
  sem depender do domínio do Resend.
- O app fica num domínio próprio sem estar aberto ao público.

**Custos**

- Sem verificação, o e-mail cadastrado não é garantidamente da pessoa. Para
  um teste fechado é aceitável, mas antes de abrir ao público a
  verificação precisa voltar (depende do passo 10 do `PRODUTO.md`).
- Basic Auth é uma barreira simples, compartilhada por todos os testadores.
  Não substitui o login do app, só fica na frente dele.
- PWA instalada a partir de `/admin`: em alguns navegadores (principalmente
  iOS, modo tela de início) a senha pode ser pedida de novo ao abrir o app.
- Os endereços antigos sem `/admin` (ex.: `roov-web-rouge.vercel.app/perfil`)
  passam a cair na página "em breve".

**Custo de reverter:** baixo. Voltar o app pra raiz é trocar `BASE` e
`outDir` em `vite.config.js` e apagar `middleware.js`, `site/` e
`vercel.json`. Religar a verificação está descrito no item 1.
