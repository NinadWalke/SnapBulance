import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users/users.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { HospitalsModule } from './modules/hospitals/hospitals.module';
import { TripsModule } from './modules/trips/trips.module';
import { ReportsModule } from './modules/reports/reports.module';
import { EventsModule } from './events/events.module';
import { DevModule } from './dev/dev.module';
import { CfrModule } from './modules/cfr/cfr.module';

// rate-limiting using throttlerModule
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    PrismaModule,
    UsersModule,
    DriversModule,
    HospitalsModule,
    TripsModule,
    ReportsModule,
    EventsModule,
    DevModule,
    CfrModule,
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 seconds 
      limit: 100  // 100 req per 60 seconnds
    }]),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule {}
