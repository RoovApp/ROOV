/**
 * Verificação de e-mail do cadastro — código de 6 dígitos.
 *
 * Só aparece uma vez, logo depois de criar a conta (não a cada login,
 * decisão registrada em `docs/PRODUTO.md`). Visual espelha `AuthModule.jsx`.
 */

import { useState } from 'react';
import { MailCheck } from 'lucide-react';
import { PrimaryButton, GhostButton } from '../../components/ui/primitives.jsx';
import { useAuth } from '../../state/AuthProvider.jsx';

const CODE_PATTERN = /^\d{6}$/;
const RESEND_COOLDOWN_SECONDS = 60;

export function VerifyEmailModule() {
  const { user, verifyEmail, resendVerification, logout } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const canSubmit = CODE_PATTERN.test(code) && !verifying;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;
    setVerifying(true);
    setError(null);
    try {
      await verifyEmail(code);
    } catch (err) {
      setError(err.message ?? 'Código inválido. Tente de novo.');
    } finally {
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    setError(null);
    setNotice(null);
    try {
      await resendVerification();
      setNotice('Novo código enviado.');
      setCooldown(RESEND_COOLDOWN_SECONDS);
      const timer = setInterval(() => {
        setCooldown((current) => {
          if (current <= 1) {
            clearInterval(timer);
            return 0;
          }
          return current - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message ?? 'Não foi possível reenviar. Tente de novo em instantes.');
    }
  }

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto bg-[var(--background)] px-6 pb-10 pt-14">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="roov-gradient flex h-16 w-16 items-center justify-center rounded-3xl shadow-2xl shadow-[#7B2DFF]/30">
          <MailCheck className="h-7 w-7 text-white" />
        </span>
        <h1 className="roov-gradient-text text-3xl font-bold tracking-tight">Confirme seu e-mail</h1>
        <p className="max-w-[280px] text-sm leading-relaxed text-[var(--muted-foreground)]">
          Enviamos um código de 6 dígitos para <strong className="text-[var(--foreground)]">{user?.email}</strong>.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <p className="rounded-2xl border border-[#FF0F7B]/40 bg-[#FF0F7B]/10 p-3 text-center text-[11px]">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center text-[11px] text-[var(--muted-foreground)]">
            {notice}
          </p>
        )}

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Código</span>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="glass w-full rounded-2xl px-4 py-3 text-center text-2xl tracking-[0.5em] outline-none placeholder:text-[var(--muted-foreground)]"
          />
        </label>

        <PrimaryButton type="submit" disabled={!canSubmit} className="mt-2">
          {verifying ? 'Confirmando…' : 'Confirmar'}
        </PrimaryButton>

        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-center text-xs text-[var(--muted-foreground)] underline underline-offset-2 disabled:no-underline disabled:opacity-50"
        >
          {cooldown > 0 ? `Reenviar código em ${cooldown}s` : 'Reenviar código'}
        </button>

        <GhostButton type="button" onClick={logout} className="mt-2">
          Sair e tentar com outro e-mail
        </GhostButton>
      </form>
    </div>
  );
}
