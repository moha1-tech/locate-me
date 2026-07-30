import { Module } from '@nestjs/common';
import { LiveService } from './live.service';
import { LiveController } from './live.controller';
import { CirclesModule } from '../circles/circles.module';

@Module({
  imports: [CirclesModule],
  providers: [LiveService],
  controllers: [LiveController],
})
export class LiveModule {}
