/**
 * Tutorial de instalação — mostrado uma vez, logo após o primeiro login bem
 * sucedido (depois da verificação de e-mail, antes do resto do app).
 *
 * O ROOV é PWA, não app de loja (ver `docs/PRODUTO.md`): "instalar" aqui
 * significa adicionar à tela de início do navegador. Android com Chrome tem
 * um prompt nativo (`beforeinstallprompt`); iOS Safari nunca dispara esse
 * evento, então lá o passo a passo é sempre manual. Mesma identidade visual
 * da `SplashScreen`: fundo quase preto, selo com o gradiente oficial da
 * marca, texto em `roov-gradient-text`.
 */

import { useEffect, useState } from 'react';
import { Check, MoreVertical, Share, SquarePlus } from 'lucide-react';
import { GlassCard, GhostButton, PrimaryButton } from '../../components/ui/primitives.jsx';
import {
  detectPlatform,
  hasNativePrompt,
  isStandalone,
  onInstallPromptReady,
  triggerInstallPrompt,
} from '../../services/installPrompt.js';

const STEPS_BY_PLATFORM = {
  ios: [
    { icon: Share, text: 'Toque no ícone de compartilhar, na barra do Safari' },
    { icon: SquarePlus, text: 'Role as opções e toque em "Adicionar à Tela de Início"' },
    { icon: Check, text: 'Toque em "Adicionar", no canto superior direito' },
  ],
  android: [
    { icon: MoreVertical, text: 'Toque no menu ⋮, no canto superior direito do Chrome' },
    { icon: SquarePlus, text: 'Toque em "Instalar app" (ou "Adicionar à tela inicial")' },
    { icon: Check, text: 'Confirme em "Instalar"' },
  ],
  desktop: [
    { icon: SquarePlus, text: 'Procure o ícone de instalar (⊕) na barra de endereço' },
    { icon: Check, text: 'Clique nele e confirme a instalação' },
  ],
};

export function InstallAppModule({ onComplete }) {
  const platform = detectPlatform();
  const [canPromptNative, setCanPromptNative] = useState(hasNativePrompt());
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      onComplete();
      return undefined;
    }
    return onInstallPromptReady(() => setCanPromptNative(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleNativeInstall() {
    setInstalling(true);
    const outcome = await triggerInstallPrompt();
    setInstalling(false);
    if (outcome === 'accepted') onComplete();
  }

  const steps = STEPS_BY_PLATFORM[platform];

  return (
    <div className="flex h-full w-full flex-col bg-[#050505] px-6 pb-8 pt-14 text-center">
      <span className="roov-gradient mx-auto flex h-16 w-16 items-center justify-center rounded-3xl text-2xl shadow-2xl shadow-[#7B2DFF]/30">
        📲
      </span>

      <h1 className="roov-gradient-text animate-fade-up mt-5 text-2xl font-bold tracking-tight">
        Leve o ROOV no bolso
      </h1>
      <p
        className="animate-fade-up mx-auto mt-2 max-w-[280px] text-sm leading-relaxed text-[var(--muted-foreground)]"
        style={{ animationDelay: '80ms' }}
      >
        Instale na tela de início do seu celular: abre direto, em tela cheia, sem precisar de
        loja de aplicativo.
      </p>

      <div className="mt-8 flex-1 text-left">
        <GlassCard className="animate-fade-up space-y-4 p-5" style={{ animationDelay: '140ms' }}>
          {steps.map((step, i) => (
            <div key={step.text} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold">
                {i + 1}
              </span>
              <div className="flex min-w-0 flex-1 items-center gap-2 pt-1">
                <step.icon className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
                <p className="text-sm leading-snug">{step.text}</p>
              </div>
            </div>
          ))}
        </GlassCard>

        {platform === 'ios' && (
          <p className="animate-fade-up mt-3 text-center text-[11px] text-[var(--muted-foreground)]">
            Funciona no Safari. Em outro navegador do iPhone, abra este link no Safari primeiro.
          </p>
        )}
      </div>

      <div className="mt-6 space-y-2.5">
        {canPromptNative && (
          <PrimaryButton onClick={handleNativeInstall} disabled={installing}>
            {installing ? 'Abrindo…' : 'Instalar agora'}
          </PrimaryButton>
        )}
        <GhostButton onClick={onComplete}>
          {canPromptNative ? 'Agora não' : 'Entendi, continuar'}
        </GhostButton>
      </div>
    </div>
  );
}
