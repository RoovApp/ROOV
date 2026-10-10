/**
 * Sistema Oficial de Navegação — ROOV Product, Cap. 8.
 *
 * Estrutura principal: quatro abas (Mapa, Comunidades, Salvos, Perfil) e um
 * Floating Action Button central para Criar Post. Telas de detalhe e a
 * pesquisa escondem a barra: são navegação secundária, não destino.
 */

import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, MapPin, Map, Plus, Sparkles, User, Users } from 'lucide-react';
import { useRoov } from '../state/RoovProvider.jsx';
import { Sheet, Toast } from './ui/primitives.jsx';

const TABS = [
  { to: '/', label: 'Mapa', icon: Map, end: true },
  { to: '/comunidades', label: 'Comunidades', icon: Users },
  { to: '/salvos', label: 'Salvos', icon: Bookmark },
  { to: '/perfil', label: 'Perfil', icon: User },
];

/** Rotas onde a barra inferior não aparece. */
const FULLSCREEN_PREFIXES = ['/lugar/', '/comunidade/', '/buscar', '/criar', '/lugares/novo'];

export function AppShell({ children }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { toast } = useRoov();
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

  const hideNav = FULLSCREEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  return (
    <div className="relative mx-auto flex h-full w-full max-w-md flex-col overflow-hidden bg-[var(--background)]">
      <main className="scrollbar-hide flex-1 overflow-y-auto">{children}</main>

      {!hideNav && (
        <nav
          className="absolute inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom,0px)+14px)]"
          aria-label="Navegação principal"
        >
          <div className="glass-surface flex items-center gap-1 rounded-full px-2 py-2">
            {TABS.slice(0, 2).map((tab) => (
              <TabLink key={tab.to} tab={tab} />
            ))}

            <button
              type="button"
              aria-label="Criar"
              onClick={() => setCreateMenuOpen(true)}
              className="relative -mt-6 flex flex-col items-center px-1"
            >
              <motion.span
                whileTap={{ scale: 0.88 }}
                className="glass-fab flex h-14 w-14 items-center justify-center rounded-full"
              >
                <Plus className="relative z-10 h-6 w-6 text-white" />
              </motion.span>
            </button>

            {TABS.slice(2).map((tab) => (
              <TabLink key={tab.to} tab={tab} />
            ))}
          </div>
        </nav>
      )}

      <Toast toast={toast} />

      <Sheet
        open={createMenuOpen}
        onClose={() => setCreateMenuOpen(false)}
        title="Criar"
        subtitle="O que você quer fazer?"
      >
        <div className="space-y-2 pb-2">
          <button
            type="button"
            onClick={() => {
              setCreateMenuOpen(false);
              navigate('/criar');
            }}
            className="glass flex w-full items-center gap-3 rounded-2xl p-3.5 text-left"
          >
            <span className="roov-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <Sparkles className="h-4.5 w-4.5 text-white" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Publicar experiência</span>
              <span className="block text-xs text-[var(--muted-foreground)]">
                Conte como foi num lugar que você já conhece
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreateMenuOpen(false);
              navigate('/lugares/novo');
            }}
            className="glass flex w-full items-center gap-3 rounded-2xl p-3.5 text-left"
          >
            <span className="roov-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <MapPin className="h-4.5 w-4.5 text-white" />
            </span>
            <span>
              <span className="block text-sm font-semibold">Cadastrar lugar</span>
              <span className="block text-xs text-[var(--muted-foreground)]">
                Adicione um lugar novo ao catálogo do ROOV
              </span>
            </span>
          </button>
        </div>
      </Sheet>
    </div>
  );
}

function TabLink({ tab }) {
  const Icon = tab.icon;
  return (
    <NavLink
      to={tab.to}
      end={tab.end}
      aria-label={tab.label}
      className="relative flex min-w-[56px] flex-col items-center gap-1 px-1 py-1"
    >
      {({ isActive }) => (
        <>
          <motion.span className="relative flex h-9 w-11 items-center justify-center" whileTap={{ scale: 0.85 }}>
            {isActive && (
              <motion.span
                layoutId="roov-nav-active-pill"
                className="glass-pill-active absolute inset-0 rounded-full"
                transition={{ type: 'spring', stiffness: 480, damping: 32 }}
              />
            )}
            <motion.span
              animate={{ scale: isActive ? 1.08 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className="relative z-10 flex items-center justify-center"
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.3 : 1.8}
                className={isActive ? 'text-white' : 'text-[var(--muted-foreground)]'}
              />
            </motion.span>
          </motion.span>
          <span
            className={`text-[10px] font-semibold transition-colors ${
              isActive ? 'text-white' : 'text-[var(--muted-foreground)]'
            }`}
          >
            {tab.label}
          </span>
        </>
      )}
    </NavLink>
  );
}

/** Cabeçalho das telas de navegação secundária. */
export function DetailHeader({ title, onBack, right }) {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-[#050505]/85 px-4 py-3 backdrop-blur-xl">
      <button
        type="button"
        aria-label="Voltar"
        onClick={onBack ?? (() => navigate(-1))}
        className="glass flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <h1 className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</h1>
      {right}
    </header>
  );
}
