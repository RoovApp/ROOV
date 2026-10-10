import { Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional, IsString, Length, MaxLength } from 'class-validator';
import { PlaceCategory } from '@prisma/client';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

/**
 * Edição de informações — Fase 3. `username`/`email` ficam de fora de
 * propósito: são identificadores, não "informações do perfil", e mudá-los
 * tem efeitos (links, menções) que o produto ainda não trata.
 */
export class UpdateUserDto {
  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(2, 80, { message: 'Nome deve ter entre 2 e 80 caracteres.' })
  name?: string;

  /**
   * Preset (um emoji), não upload de arquivo: Storage é decisão de Fase 11,
   * não deste corte. Limite curto de propósito, pra não virar campo de texto
   * livre disfarçado de avatar.
   */
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(8, { message: 'Avatar inválido.' })
  avatar?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(280, { message: 'Bio excede o tamanho máximo permitido.' })
  bio?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100, { message: 'Cidade excede o tamanho máximo permitido.' })
  city?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100, { message: 'Estado excede o tamanho máximo permitido.' })
  state?: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(100, { message: 'País excede o tamanho máximo permitido.' })
  country?: string;

  /** Preferência declarada — ver comentário do campo em `schema.prisma`. */
  @IsOptional()
  @IsArray()
  @IsEnum(PlaceCategory, { each: true, message: 'Categoria inválida.' })
  preferredCategories?: PlaceCategory[];
}
