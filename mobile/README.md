# ROOV (mobile)

App nativo (iOS + Android) de descoberta de experiências locais: mapa, prova
social e curadoria coletiva.

Stack: React Native (Expo) + Expo Router. Fala com a mesma API (`../api/`)
que o `../web/` usa, não com Supabase diretamente (essa decisão mudou, ver
`docs/EMENDA-002-AUTENTICACAO-PROPRIA.md` na raiz do repositório). A
conexão de verdade com a API ainda não foi feita: o app roda hoje sobre
`lib/mock-data.ts`.

## Pré-requisitos

- Node.js 22+
- [Expo Go](https://expo.dev/go) no celular, para desenvolvimento, ou um
  simulador iOS/Android
- Conta gratuita na [Expo](https://expo.dev) e EAS CLI (`npx eas-cli`), só
  quando for gerar um build instalável de verdade (não precisa pra rodar
  localmente)

## Rodar em desenvolvimento

```bash
cd mobile
npm install
npm start
```

Depois pressione:
- `i`: simulador iOS
- `a`: emulador Android
- Escaneie o QR code com o app Expo Go no celular

## Gerar um build instalável (EAS)

Sem Xcode ou Android Studio local: o build roda na nuvem da Expo.

```bash
npx eas-cli login       # conta gratuita, uma vez só
npx eas-cli build --platform ios --profile preview
npx eas-cli build --platform android --profile preview
```

Perfis de build em `eas.json`. `preview` gera algo instalável direto no
aparelho (distribuição interna), sem passar por loja nenhuma.

## Estrutura do projeto

```
app/
  (tabs)/            Navegação principal
    index.jsx          Mapa + Feed + Ranking
    comunidades.jsx
    perfil.jsx
    salvos.jsx
  criar.jsx            Modal: publicar experiência
  place/[id].jsx       Detalhe do lugar
  comunidade/[id].jsx   Detalhe da comunidade
  buscar.jsx            Busca
components/roov/      Componentes específicos do ROOV
src/                  Mesmas camadas domain/engine/services/state do
                       frontend web (ver docs/ARCHITECTURE.md na raiz)
constants/            Tema, categorias, config
lib/                  Mock data (Supabase client ainda presente, não usado
                       mais para auth)
supabase/              Schema SQL antigo, superado (ver nota no arquivo)
types/                 Tipos TypeScript
```

## O que já está implementado

- Navegação com tabs (Mapa, Comunidades, Salvos, Perfil)
- Tela de mapa com pins por categoria, feed e ranking
- Filtros por categoria
- Detalhe de lugar com ações de salvar
- Modal de criar experiência (só UI)
- Tudo sobre dado mock, nada conectado à API real ainda

## Próximos passos

Mesma ordem geral do `docs/PRODUTO.md` na raiz do repositório, adaptada pro
mobile:

1. Confirmar que o build instalável via EAS funciona de ponta a ponta no
   seu aparelho (sem custo, distribuição interna).
2. Trocar `lib/supabase.ts` por um cliente HTTP que fala com `../api/`,
   igual o `web/src/services/apiClient.js` já faz.
3. Ligar a tela de mapa nos lugares reais.
4. A partir daí, seguir a mesma sequência do corte de MVP documentado em
   `docs/PRODUTO.md`.
