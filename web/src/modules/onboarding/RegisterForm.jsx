import { useState } from 'react';
import { AtSign, LocateFixed, Lock, Mail, MapPin, User } from 'lucide-react';
import { PrimaryButton, GhostButton } from '../../components/ui/primitives.jsx';
import { useAuth } from '../../state/AuthProvider.jsx';

const USERNAME_PATTERN = /^[a-z0-9_]+$/;

/**
 * Nominatim (OpenStreetMap) — de graça, sem chave, mas uso leve: só quando a
 * pessoa toca em "usar minha localização" no cadastro, nunca em segundo
 * plano. Se falhar, as coordenadas continuam válidas; só não preenchemos os
 * campos de texto automaticamente, a pessoa digita à mão.
 */
async function reverseGeocode(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
  const response = await fetch(url, { headers: { 'Accept-Language': 'pt-BR' } });
  if (!response.ok) throw new Error('Não foi possível identificar sua localização.');
  const data = await response.json();
  const address = data.address ?? {};
  return {
    city: address.city ?? address.town ?? address.village ?? address.municipality ?? '',
    state: address.state ?? '',
    country: address.country ?? '',
  };
}

export function RegisterForm({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const place = await reverseGeocode(
            position.coords.latitude,
            position.coords.longitude,
          );
          setCity(place.city);
          setState(place.state);
          setCountry(place.country);
        } catch (err) {
          setError(err.message ?? 'Não foi possível identificar sua localização.');
        } finally {
          setLocating(false);
        }
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  }

  // Validação leve no cliente, só para feedback rápido — a regra oficial é
  // a mesma do backend (RegisterDto) e quem decide de fato é a resposta da API.
  const canSubmit =
    email.trim().length > 0 &&
    username.length >= 3 &&
    username.length <= 30 &&
    USERNAME_PATTERN.test(username) &&
    name.trim().length >= 2 &&
    password.length >= 8 &&
    !submitting;

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);
    try {
      await register({
        email: email.trim(),
        username,
        name: name.trim(),
        password,
        ...(city.trim() && { city: city.trim() }),
        ...(state.trim() && { state: state.trim() }),
        ...(country.trim() && { country: country.trim() }),
      });
    } catch (err) {
      setError(err.message ?? 'Não foi possível criar sua conta. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <p className="rounded-2xl border border-[#FF0F7B]/40 bg-[#FF0F7B]/10 p-3 text-[11px]">
          {error}
        </p>
      )}

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">E-mail</span>
        <div className="glass flex h-11 items-center gap-2.5 rounded-full px-4">
          <Mail className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Nome</span>
        <div className="glass flex h-11 items-center gap-2.5 rounded-full px-4">
          <User className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
          />
        </div>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Nome de usuário</span>
        <div className="glass flex h-11 items-center gap-2.5 rounded-full px-4">
          <AtSign className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
          <input
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="seu_usuario"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
          />
        </div>
        <span className="mt-1 block px-1 text-[11px] text-[var(--muted-foreground)]">
          Letras minúsculas, números e underline. Entre 3 e 30 caracteres.
        </span>
      </label>

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Senha</span>
        <div className="glass flex h-11 items-center gap-2.5 rounded-full px-4">
          <Lock className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
          />
        </div>
      </label>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-semibold">Localização (opcional)</span>
          <button
            type="button"
            onClick={useMyLocation}
            disabled={locating}
            className="flex items-center gap-1 text-[11px] text-[var(--muted-foreground)] underline underline-offset-2"
          >
            <LocateFixed className="h-3 w-3" />
            {locating ? 'Localizando…' : 'Usar minha localização'}
          </button>
        </div>
        <div className="glass flex h-11 items-center gap-2.5 rounded-full px-4">
          <MapPin className="h-4 w-4 shrink-0 text-[var(--muted-foreground)]" />
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Cidade"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--muted-foreground)]"
          />
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            placeholder="Estado"
            className="glass h-11 flex-1 rounded-full px-4 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
          />
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            placeholder="País"
            className="glass h-11 flex-1 rounded-full px-4 text-sm outline-none placeholder:text-[var(--muted-foreground)]"
          />
        </div>
        <span className="mt-1 block px-1 text-[11px] text-[var(--muted-foreground)]">
          Ajuda a personalizar recomendações perto de você. Dá pra editar depois.
        </span>
      </div>

      <PrimaryButton type="submit" disabled={!canSubmit} className="mt-2">
        {submitting ? 'Criando conta…' : 'Criar conta'}
      </PrimaryButton>

      <GhostButton type="button" onClick={onSwitchToLogin}>
        Já tem conta? Entrar
      </GhostButton>
    </form>
  );
}
