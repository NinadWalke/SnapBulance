import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { HospitalsService } from './hospitals.service';
import { JwtGuard } from 'src/common/guards';
import { GetUser } from 'src/common/decorators';
import type { User } from '@prisma/client';

@Controller('hospitals')
@UseGuards(JwtGuard)
export class HospitalsController {
    constructor(private readonly hospitalsService: HospitalsService) {}

    @Get('dashboard')
    getDashboard(@GetUser() user: User) {
        return this.hospitalsService.getHospitalDashboard(user.id);
    }

    @Get('profile')
    getProfile(@GetUser() user: User) {
        return this.hospitalsService.getHospitalProfile(user.id);
    }

    @Put('profile')
    updateProfile(@GetUser() user: User, @Body() body: any) {
        return this.hospitalsService.updateHospitalProfile(user.id, body);
    }

    @Get('trip/:tripId')
    getTripDetails(@GetUser() user: User, @Param('tripId') tripId: string) {
        return this.hospitalsService.getIncomingTripDetails(user.id, tripId);
    }
}