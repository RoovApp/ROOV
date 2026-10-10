import { Injectable } from '@nestjs/common';
import type { SavedPlace, SavedPlaceKind } from '@prisma/client';
import { SavedPlacesRepository } from './saved-places.repository';

export interface PublicSavedPlace {
  id: string;
  placeId: string;
  kind: SavedPlaceKind;
  createdAt: Date;
}

function toPublicSavedPlace(saved: SavedPlace): PublicSavedPlace {
  return {
    id: saved.id,
    placeId: saved.placeId,
    kind: saved.kind,
    createdAt: saved.createdAt,
  };
}

@Injectable()
export class SavedPlacesService {
  constructor(private readonly savedPlaces: SavedPlacesRepository) {}

  list(userId: string): Promise<PublicSavedPlace[]> {
    return this.savedPlaces.findMany(userId).then((rows) => rows.map(toPublicSavedPlace));
  }

  /** Idempotente: salvar o que já está salvo devolve o registro existente, não erro. */
  async create(userId: string, placeId: string, kind: SavedPlaceKind): Promise<PublicSavedPlace> {
    const existing = await this.savedPlaces.findOne(userId, placeId, kind);
    if (existing) return toPublicSavedPlace(existing);
    const created = await this.savedPlaces.create(userId, placeId, kind);
    return toPublicSavedPlace(created);
  }

  /** Idempotente: remover o que já não está salvo não é erro. */
  remove(userId: string, placeId: string, kind: SavedPlaceKind): Promise<void> {
    return this.savedPlaces.remove(userId, placeId, kind);
  }
}
