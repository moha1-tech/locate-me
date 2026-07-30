import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CirclesModule } from './circles/circles.module';
import { LocationsModule } from './locations/locations.module';
import { GeofencesModule } from './geofences/geofences.module';
import { AlertsModule } from './alerts/alerts.module';
import { RealtimeModule } from './realtime/realtime.module';
import { LiveModule } from './live/live.module';
import { PushModule } from './push/push.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CirclesModule,
    GeofencesModule,
    AlertsModule,
    LocationsModule,
    RealtimeModule,
    LiveModule,
    PushModule,
  ],
})
export class AppModule {}
