/**
 * Sessão de autenticação real — irmã do `RoovProvider`, não parte dele.
 *
 * `RoovProvider` orquestra o mundo mock (lugares, feed, perfil com XP) e só
 * deve montar depois que existe uma sessão real. Este provider decide isso:
 * `status` é o portão que `App.jsx` usa para escolher entre mostrar as telas
 * de entrada ou o app propriamente dito.
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService, clearSession, loadSession, saveSession } from '../services/auth.js';
import { usersService } from '../services/users.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('checking');
  const [user, setUser] = useState(null);
  /**
   * Mensagem de uma vez só, para explicar um logout que não é erro (ex.:
   * troca de senha). `login`/`register` limpam, pra não sobreviver a uma
   * nova tentativa de entrar.
   */
  const [notice, setNotice] = useState(null);

  // Sessão persiste entre recarregamentos: se há um refresh token salvo,
  // tenta renovar em silêncio antes de decidir que o usuário está deslogado.
  useEffect(() => {
    let cancelled = false;
    const session = loadSession();
    if (!session) {
      setStatus('anonymous');
      return undefined;
    }

    authService
      .refresh(session.refreshToken)
      .then((fresh) => {
        if (cancelled) return;
        saveSession(fresh);
        setUser(fresh.user);
        // Recarregar a página no meio da verificação não deve pular a
        // etapa: o portão continua valendo até o código ser confirmado.
        setStatus(fresh.user.emailVerified ? 'authenticated' : 'verifying');
      })
      .catch(() => {
        if (cancelled) return;
        clearSession();
        setStatus('anonymous');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Cadastro + verificação de e-mail por código (no cadastro, não em todo
   * login — decisão registrada). A conta já existe e já tem sessão nesse
   * ponto (`authService.register` devolve sessão completa); `status:
   * 'verifying'` só segura a entrada no app até o código ser confirmado.
   */
  const register = useCallback(async (data) => {
    const session = await authService.register(data);
    saveSession(session);
    setUser(session.user);
    setNotice(null);
    setStatus(session.user.emailVerified ? 'authenticated' : 'verifying');
  }, []);

  const verifyEmail = useCallback(async (code) => {
    const session = loadSession();
    const updated = await authService.verifyEmail(session.accessToken, code);
    saveSession({ ...session, user: updated });
    setUser(updated);
    setStatus('authenticated');
    return updated;
  }, []);

  const resendVerification = useCallback(async () => {
    const session = loadSession();
    await authService.resendVerification(session.accessToken);
  }, []);

  const login = useCallback(async (data) => {
    const session = await authService.login(data);
    saveSession(session);
    setUser(session.user);
    setNotice(null);
    setStatus('authenticated');
  }, []);

  /** Edição de informações — Fase 3. */
  const updateProfile = useCallback(async (data) => {
    const session = loadSession();
    const updated = await usersService.updateMe(session.accessToken, data);
    saveSession({ ...session, user: updated });
    setUser(updated);
    return updated;
  }, []);

  /**
   * Troca de senha — Fase 3. O backend já revoga todas as sessões (inclusive
   * esta); por isso o sucesso limpa a sessão local direto, sem chamar
   * `/auth/logout` (o token já está morto no servidor).
   */
  const changePassword = useCallback(async (data) => {
    const session = loadSession();
    await authService.changePassword(session.accessToken, data);
    clearSession();
    setUser(null);
    setNotice('Senha alterada. Faça login novamente.');
    setStatus('anonymous');
  }, []);

  const logout = useCallback(async () => {
    const session = loadSession();
    // Best-effort: mesmo se a chamada falhar (rede, token já expirado), o
    // usuário sai localmente — não faz sentido prendê-lo na sessão por causa
    // de um erro de rede no logout.
    if (session) {
      try {
        await authService.logout(session.refreshToken);
      } catch {
        // ignorado de propósito
      }
    }
    clearSession();
    setUser(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo(
    () => ({
      status,
      user,
      notice,
      register,
      login,
      logout,
      updateProfile,
      changePassword,
      verifyEmail,
      resendVerification,
    }),
    [
      status,
      user,
      notice,
      register,
      login,
      logout,
      updateProfile,
      changePassword,
      verifyEmail,
      resendVerification,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return ctx;
}
