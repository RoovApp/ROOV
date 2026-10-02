import { IsArray, IsOptional, IsString, Length } from 'class-validator';

/**
 * Semente de curadoria manual do DNA — ponte temporária até Posts (Fase 5)
 * existir de verdade (ver `docs/EMENDA-004-SEED-TAGS-NO-PLACE.md`). Mesmo
 * formato que `consolidateDna` espera em `web/src/services/index.js`.
 */
export class SeedTagsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(1, 60, { each: true })
  ambiente?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(1, 60, { each: true })
  vibe?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(1, 60, { each: true })
  publico?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Length(1, 60, { each: true })
  perfil?: string[];
}
