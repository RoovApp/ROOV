import { Module } from '@nestjs/common';
import { SavedPlacesController } from './saved-places.controller';
import { SavedPlacesService } from './saved-places.service';
import { SavedPlacesRepository } from './saved-places.repository';

@Module({
  controllers: [SavedPlacesController],
  providers: [SavedPlacesRepository, SavedPlacesService],
})
export class SavedPlacesModule {}
