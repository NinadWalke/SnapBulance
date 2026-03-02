import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async completeHandover(tripId: string) {
    try {
      // 1. Verify the trip exists and grab the driverId
      const trip = await this.prisma.trip.findUnique({
        where: { id: tripId },
      });

      if (!trip) {
        throw new NotFoundException(`Trip with ID ${tripId} not found`);
      }

      // 2. Execute updates cleanly inside a Prisma Transaction
      await this.prisma.$transaction(async (tx) => {
        
        // A. Mark the trip as completed and log the timestamp
        await tx.trip.update({
          where: { id: tripId },
          data: { 
            status: 'COMPLETED', 
            completedAt: new Date() 
          },
        });

        // B. If a driver was assigned, set them back to AVAILABLE
        if (trip.driverId) {
          await tx.driverProfile.update({
            where: { id: trip.driverId },
            data: { 
              status: 'AVAILABLE' 
            },
          });
        }
      });

      return {
        success: true,
        message: 'Handover complete. Trip ended and driver is now available.',
      };
      
    } catch (error) {
      console.error('Failed to complete handover:', error);
      
      // Pass through our 404, otherwise throw a generic 500
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process handover');
    }
  }
}