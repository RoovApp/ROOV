import { Injectable } from '@nestjs/common';
import type { SavedPlace, SavedPlaceKind } from '@prisma/client';
import { PrismaService } from '../../infra/prisma/prisma.service';

/**
 * Persistência de "Salvos" (Cap. 22, corte simples).
 *
 * Única camada do sistema autorizada a tocar o Prisma para esta entidade.
 */
@Injectable()
export class SavedPlacesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(userId: string): Promise<SavedPlace[]> {
    return this.prisma.savedPlace.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(userId: string, placeId: string, kind: SavedPlaceKind): Promise<SavedPlace | null> {
    return this.prisma.savedPlace.findUnique({
      where: { userId_placeId_kind: { userId, placeId, kind } },
    });
  }

  create(userId: string, placeId: string, kind: SavedPlaceKind): Promise<SavedPlace> {
    return this.prisma.savedPlace.create({ data: { userId, placeId, kind } });
  }

  /**
   * `deleteMany`, não `delete`: remover o que já não existe não deve
   * quebrar nada (Salvos é um toggle, idempotente nos dois sentidos).
   */
  async remove(userId: string, placeId: string, kind: SavedPlaceKind): Promise<void> {
    await this.prisma.savedPlace.deleteMany({ where: { userId, placeId, kind } });
  }
}
