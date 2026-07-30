import { Module } from '@nestjs/common';
import { GeofencesService } from './geofences.service';
import { GeofencesController } from './geofences.controller';
import { CirclesModule } from '../circles/circles.module';

@Module({
  imports: [CirclesModule],
  providers: [GeofencesService],
  controllers: [GeofencesController],
  exports: [GeofencesService],
})
export class GeofencesModule {}
