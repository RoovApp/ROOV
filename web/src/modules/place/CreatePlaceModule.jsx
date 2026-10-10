/**
 * Cadastrar lugar — ROOV Product, Cap. 22, passo 5 do corte do mês.
 *
 * Cria um lugar real direto na `api/` (sem rascunho local): o formulário
 * cobre os campos obrigatórios do `CreatePlaceDto` mais uma curadoria
 * opcional de `seedTags` (ponte temporária até Posts existir, ver
 * `docs/EMENDA-004-SEED-TAGS-NO-PLACE.md`). Sem ela, o lugar entra sem DNA
 * algum, só visível no Mapa, nunca ranqueado no Explorar.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocateFixed } from 'lucide-react';
import { DetailHeader } from '../../components/AppShell.jsx';
import { Chip, PrimaryButton } from '../../components/ui/primitives.jsx';
import { CATEGORIES, PLACE_TYPES, PRICE_RANGES, TAG_GROUPS } from '../../domain/taxonomy.js';
import { useRoov } from '../../state/RoovProvider.jsx';

const fieldClass =
  'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm outline-none placeholder:text-[var(--muted-foreground)] focus:border-white/30';

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

/** Só os 4 grupos que `consolidateDna` usa de verdade — ocasião/momento são de post, não de lugar. */
const PLACE_DNA_GROUPS = TAG_GROUPS.filter((g) =>
  ['ambiente', 'vibe', 'publico', 'perfil'].includes(g.key),
);

export function CreatePlaceModule() {
  const navigate = useNavigate();
  const { user, actions } = useRoov();

  const [name, setName] = useState('');
  const [category, setCategory] = useState(null);
  const [placeType, setPlaceType] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState(user?.city ?? '');
  const [state, setState] = useState(user?.state ?? '');
  const [country, setCountry] = useState(user?.country || 'Brasil');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [priceRange, setPriceRange] = useState(null);
  const [open, setOpen] = useState('09:00');
  const [close, setClose] = useState('18:00');
  const [closedOn, setClosedOn] = useState([]);
  const [seedTags, setSeedTags] = useState({ ambiente: [], vibe: [], publico: [], perfil: [] });
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit =
    name.trim().length >= 2 &&
    category &&
    placeType.trim().length >= 2 &&
    neighborhood.trim().length >= 2 &&
    city.trim().length >= 2 &&
    state.trim().length >= 2 &&
    country.trim().length >= 2 &&
    latitude !== '' &&
    longitude !== '' &&
    priceRange &&
    open &&
    close &&
    !saving;

  function toggleDay(index) {
    setClosedOn((current) =>
      current.includes(index) ? current.filter((d) => d !== index) : [...current, index],
    );
  }

  function toggleTag(group, id) {
    setSeedTags((current) => ({
      ...current,
      [group]: current[group].includes(id)
        ? current[group].filter((t) => t !== id)
        : [...current[group], id],
    }));
  }

  function useMyLocation() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude.toFixed(6)));
        setLongitude(String(position.coords.longitude.toFixed(6)));
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    try {
      const hasSeedTags = Object.values(seedTags).some((group) => group.length > 0);
      const place = await actions.createPlace({
        name: name.trim(),
        category,
        placeType: placeType.trim(),
        neighborhood: neighborhood.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        priceRange,
        hours: { open, close, ...(closedOn.length ? { closedOn } : {}) },
        ...(hasSeedTags ? { seedTags } : {}),
      });
      navigate(`/lugar/${place.id}`, { replace: true });
    } catch (e) {
      setError(e.message ?? 'Não foi possível cadastrar. Tente de novo.');
      setSaving(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <DetailHeader title="Cadastrar lugar" />

      <div className="scrollbar-hide flex-1 overflow-y-auto px-4 pb-4 pt-4">
        <div className="space-y-5">
          {error && (
            <p className="rounded-2xl border border-[#FF0F7B]/40 bg-[#FF0F7B]/10 p-3 text-[11px]">
              {error}
            </p>
          )}

          <div>
            <h2 className="text-base font-semibold">O que é esse lugar?</h2>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              Sem ele catalogado, ninguém consegue descobri-lo no ROOV.
            </p>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Nome</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome do lugar"
              className={fieldClass}
            />
          </label>

          <div>
            <span className="mb-1.5 block text-sm font-semibold">Categoria</span>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((c) => (
                <Chip
                  key={c.id}
                  active={category === c.id}
                  color={c.hex}
                  onClick={() => {
                    setCategory(c.id);
                    setPlaceType('');
                  }}
                >
                  {c.label}
                </Chip>
              ))}
            </div>
          </div>

          {category && (
            <div>
              <span className="mb-1.5 block text-sm font-semibold">Tipo do local</span>
              <div className="flex flex-wrap gap-2">
                {PLACE_TYPES[category].map((type) => (
                  <Chip key={type} active={placeType === type} onClick={() => setPlaceType(type)}>
                    {type}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Faixa de preço</span>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((p) => (
                <Chip key={p.id} active={priceRange === p.id} onClick={() => setPriceRange(p.id)}>
                  {p.label} · {p.hint}
                </Chip>
              ))}
            </div>
          </label>

          <div>
            <h2 className="text-base font-semibold">Onde fica</h2>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Bairro</span>
            <input
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              placeholder="Bairro"
              className={fieldClass}
            />
          </label>

          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="mb-1.5 block text-sm font-semibold">Cidade</span>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Cidade"
                className={fieldClass}
              />
            </label>
            <label className="block flex-1">
              <span className="mb-1.5 block text-sm font-semibold">Estado</span>
              <input
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="UF"
                className={fieldClass}
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">País</span>
            <input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="País"
              className={fieldClass}
            />
          </label>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-semibold">Coordenadas</span>
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
            <div className="flex gap-3">
              <input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Latitude"
                inputMode="decimal"
                className={`${fieldClass} flex-1`}
              />
              <input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Longitude"
                inputMode="decimal"
                className={`${fieldClass} flex-1`}
              />
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold">Funcionamento</h2>
          </div>

          <div className="flex gap-3">
            <label className="block flex-1">
              <span className="mb-1.5 block text-sm font-semibold">Abre</span>
              <input
                type="time"
                value={open}
                onChange={(e) => setOpen(e.target.value)}
                className={fieldClass}
              />
            </label>
            <label className="block flex-1">
              <span className="mb-1.5 block text-sm font-semibold">Fecha</span>
              <input
                type="time"
                value={close}
                onChange={(e) => setClose(e.target.value)}
                className={fieldClass}
              />
            </label>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-semibold">Fechado em</span>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((day, index) => (
                <Chip key={day} active={closedOn.includes(index)} onClick={() => toggleDay(index)}>
                  {day}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-base font-semibold">Curadoria (opcional)</h2>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              Sem Posts ainda, essas tags são o único jeito do motor de recomendação dar DNA a
              esse lugar — ver EMENDA-004. Sem curadoria, ele fica visível só no Mapa.
            </p>
          </div>

          {PLACE_DNA_GROUPS.map((group) => (
            <div key={group.key}>
              <p className="mb-2 text-xs uppercase tracking-wide text-[var(--muted-foreground)]">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((t) => (
                  <Chip
                    key={t.id}
                    active={seedTags[group.key].includes(t.id)}
                    onClick={() => toggleTag(group.key, t.id)}
                  >
                    <span aria-hidden>{t.emoji}</span>
                    {t.label}
                  </Chip>
                ))}
              </div>
            </div>
          ))}

          <PrimaryButton onClick={handleSubmit} disabled={!canSubmit}>
            {saving ? 'Cadastrando…' : 'Cadastrar lugar'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
