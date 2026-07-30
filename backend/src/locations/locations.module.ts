import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController } from './locations.controller';
import { CirclesModule } from '../circles/circles.module';
import { GeofencesModule } from '../geofences/geofences.module';
import { AlertsModule } from '../alerts/alerts.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [CirclesModule, GeofencesModule, AlertsModule, RealtimeModule],
  providers: [LocationsService],
  controllers: [LocationsController],
})
export class LocationsModule {}
