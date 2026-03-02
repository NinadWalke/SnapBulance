import { Controller, Put, Get, Body, UseGuards } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { JwtGuard } from 'src/common/guards';
import { GetUser } from 'src/common/decorators';
import type { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('drivers')
@UseGuards(JwtGuard)
export class DriversController {
    constructor(private driversService: DriversService, private prisma: PrismaService) {}

    @Put('status')
    async toggleStatus(@GetUser() user: User, @Body() body: { isOnline: boolean }) {
        return this.driversService.toggleStatus(user.id, body.isOnline);
    }

    // NEW: Endpoint to fetch pending requests
    @Get('pending-requests')
    async getPendingRequests() {
        return this.driversService.getPendingTrips();
    }
    // Endpoint to get the driver's current active trip
    @UseGuards(JwtGuard)
    @Get('active-trip')
    async getActiveTrip(@GetUser() user: User) {
        const driverProfile = await this.prisma.driverProfile.findUnique({ where: { userId: user.id } });
        if (!driverProfile) return null;

        return this.prisma.trip.findFirst({
            where: {
                driverId: driverProfile.id,
                status: { notIn: ['COMPLETED', 'CANCELLED'] }
            }
        });
    }
}