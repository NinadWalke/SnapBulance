import { Controller, Post, Get, Param, Body, UseGuards } from '@nestjs/common';
import { TripsService } from './trips.service'; 
import { JwtGuard } from 'src/common/guards'; // Adjust path if needed
import { GetUser } from 'src/common/decorators'; // Adjust path if needed
import type { User } from '@prisma/client';

interface HandoverDto {
  severity: 'LOW' | 'MODERATE' | 'CRITICAL' | 'LIFE_THREATENING';
  suspectedCondition?: string;
  vitalsCheck?: any;
  paramedicNotes?: string;
}

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  // New endpoint to fetch history for the logged-in driver
  @UseGuards(JwtGuard)
  @Get('driver/history')
  async getDriverTrips(@GetUser() user: User) {
      return this.tripsService.getDriverTripsHistory(user.id);
  }

  @Post(':tripId/arrive-to-patient')
  async arriveToPatient(@Param('tripId') tripId: string) { 
    return this.tripsService.handlePatientArrival(tripId);
  }

  @Post(':tripId/arrive-at-hospital')
  async arriveAtHospital(@Param('tripId') tripId: string) { 
    return this.tripsService.handleHospitalArrival(tripId);
  }

  @Post(':tripId/complete')
  async completeHandover(
    @Param('tripId') tripId: string,
    @Body() payload: HandoverDto
  ) {
    return this.tripsService.completeHandover(tripId, payload);
  }

  @UseGuards(JwtGuard)
  @Get('driver/trip/:tripId')
  async getDriverTripDetails(
    @Param('tripId') tripId: string, 
    @GetUser() user: User
  ) {
      return this.tripsService.getDriverTripDetails(tripId, user.id);
  }

  @Post(':tripId/cancel')
  async cancelTrip(@Param('tripId') tripId: string) { 
    return this.tripsService.cancelTrip(tripId);
  }
}