export const DEFAULT_CITY = 'São Paulo, SP';

export const CATEGORIES = [
  { id: 'gastro', label: 'Gastro', color: '#FF6B4A' },
  { id: 'natureza', label: 'Natureza', color: '#34D399' },
  { id: 'passeios', label: 'Passeios', color: '#60A5FA' },
  { id: 'noturna', label: 'Noturna', color: '#A78BFA' },
] as const;

export const VIBES = [
  'Nightlife',
  'Café',
  'Date',
  'Nature',
  'Luxury',
  'Sunset',
  'Live Music',
  'Hidden Gem',
  'Local Favorite',
] as const;

export const COLLECTIONS = ['Todos', 'Favs', 'Quero', 'Noite', 'Trips', 'Gems'] as const;

export const SAO_PAULO_CENTER = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};
