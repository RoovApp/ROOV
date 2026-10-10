/**
 * "Salvos" (quero/vivido/favorito) — fala com `api/`, não com o mock.
 * Mesmo padrão de `services/auth.js` e `services/users.js`.
 */

import { apiRequest } from './apiClient.js';

export const savedPlacesService = {
  /** @param {string} accessToken */
  async list(accessToken) {
    return apiRequest('/saved-places', { accessToken });
  },

  /**
   * @param {string} accessToken
   * @param {{ placeId: string, kind: 'favorito' | 'quero' | 'vivido' }} data
   */
  async create(accessToken, data) {
    return apiRequest('/saved-places', { method: 'POST', body: data, accessToken });
  },

  /**
   * @param {string} accessToken
   * @param {string} placeId
   * @param {'favorito' | 'quero' | 'vivido'} kind
   */
  async remove(accessToken, placeId, kind) {
    return apiRequest(`/saved-places/${encodeURIComponent(placeId)}/${kind}`, {
      method: 'DELETE',
      accessToken,
    });
  },
};
