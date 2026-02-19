import { Module } from '@nestjs/common';
import { HospitalsController } from './hospitals.controller';
import { HospitalsService } from './hospitals.service';

@Module({
  controllers: [HospitalsController],
  providers: [HospitalsService]
})
export class HospitalsModule {}
