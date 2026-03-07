import { Controller, Post, Param } from '@nestjs/common';
import { TripsService } from './trips.service'; // Adjust path if needed

@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Post(':tripdId/arrive-to-patient')
  async arriveToPatient(@Param('tripId') tripId: string) {
    return this.tripsService.handlePatientArrival(tripId);
  }

  @Post(':tripId/arrive-at-hospital')
  async arriveAtHospital(@Param('tripdId') tripId: string) {
    return this.tripsService.handleHospitalArrival(tripId);
  }

  @Post(':tripId/complete')
  async completeHandover(@Param('tripId') tripId: string) {
    return this.tripsService.completeHandover(tripId);
  }
}