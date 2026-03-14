import { Controller, Get, Post, Param, Query, UseGuards, ParseFloatPipe } from '@nestjs/common';
import { CfrService } from './cfr.service';
import { JwtGuard } from 'src/common/guards';
import { GetUser } from 'src/common/decorators';
import type { User } from '@prisma/client';

@Controller('cfr')
@UseGuards(JwtGuard)
export class CfrController {
    constructor(private readonly cfrService: CfrService) {}

    
    // GET /cfr/nearby?lat=19.19&lng=72.96
    @Get('nearby')
    getNearby(
        @GetUser() user: User,
        @Query('lat', ParseFloatPipe) lat: number,
        @Query('lng', ParseFloatPipe) lng: number
    ) {
        return this.cfrService.getNearbyEmergencies(user.id, lat, lng);
    }

    @Post('respond/:tripId')
    respondToTrip(@GetUser() user: User, @Param('tripId') tripId: string) {
        return this.cfrService.respondToEmergency(user.id, tripId);
    }
}