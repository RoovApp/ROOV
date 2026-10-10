import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  Post,
} from '@nestjs/common';
import { SavedPlaceKind } from '@prisma/client';
import { SavedPlacesService, type PublicSavedPlace } from './saved-places.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/types/authenticated-user';
import { CreateSavedPlaceDto } from './dto/create-saved-place.dto';

/** Sem `@Public()` em nenhuma rota — nasce protegida, como todo o resto do sistema. */
@Controller('saved-places')
export class SavedPlacesController {
  constructor(private readonly savedPlaces: SavedPlacesService) {}

  /** GET /v1/saved-places — lista completa do usuário autenticado, sem paginação (lista pessoal, não catálogo). */
  @Get()
  list(@CurrentUser() user: AuthenticatedUser): Promise<PublicSavedPlace[]> {
    return this.savedPlaces.list(user.id);
  }

  /** POST /v1/saved-places — idempotente, ver `SavedPlacesService.create`. */
  @Post()
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateSavedPlaceDto,
  ): Promise<PublicSavedPlace> {
    return this.savedPlaces.create(user.id, dto.placeId, dto.kind);
  }

  /** DELETE /v1/saved-places/:placeId/:kind — idempotente, ver `SavedPlacesService.remove`. */
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':placeId/:kind')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('placeId') placeId: string,
    @Param('kind', new ParseEnumPipe(SavedPlaceKind)) kind: SavedPlaceKind,
  ): Promise<void> {
    return this.savedPlaces.remove(user.id, placeId, kind);
  }
}
