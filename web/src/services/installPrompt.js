/**
 * Instalação da PWA — captura o `beforeinstallprompt` do Chrome/Android assim
 * que o módulo carrega (precisa ser cedo: o navegador só dispara o evento
 * uma vez, antes de qualquer componente montar). iOS Safari nunca dispara
 * esse evento — lá a instalação é sempre manual, ver `InstallAppModule`.
 */

let deferredPrompt = null;
const listeners = new Set();

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredPrompt = event;
    listeners.forEach((fn) => fn());
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
  });
}

export function hasNativePrompt() {
  return deferredPrompt !== null;
}

/** @param {() => void} fn */
export function onInstallPromptReady(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** @returns {Promise<'accepted' | 'dismissed' | 'unavailable'>} */
export async function triggerInstallPrompt() {
  if (!deferredPrompt) return 'unavailable';
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome;
}

export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

/** @returns {'ios' | 'android' | 'desktop'} */
export function detectPlatform() {
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}
