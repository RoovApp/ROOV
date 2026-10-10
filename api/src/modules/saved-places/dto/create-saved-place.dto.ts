import { IsEnum, IsString, Length } from 'class-validator';
import { SavedPlaceKind } from '@prisma/client';

export class CreateSavedPlaceDto {
  /**
   * Texto solto, não validado contra o catálogo: ver comentário do modelo
   * `SavedPlace` em `schema.prisma` (mistura lugar mockado e lugar real).
   */
  @IsString()
  @Length(1, 100, { message: 'placeId inválido.' })
  placeId!: string;

  @IsEnum(SavedPlaceKind, { message: 'Tipo de item salvo inválido.' })
  kind!: SavedPlaceKind;
}
