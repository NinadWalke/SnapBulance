import { Controller, Post, Param } from '@nestjs/common';
import { TripsService } from './trips.service'; // Adjust path if needed

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post(':tripId/complete')
  async completeHandover(@Param('tripId') tripId: string) {
    return this.tripsService.completeHandover(tripId);
  }
}