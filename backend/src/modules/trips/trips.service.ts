import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  // Added method to fetch driver trips
  async getDriverTripsHistory(userId: string) {
    // 1. Find the specific Driver Profile linked to this User ID
    const driverProfile = await this.prisma.driverProfile.findUnique({
      where: { userId: userId },
    });

    if (!driverProfile) {
      throw new NotFoundException('Driver profile not found for this user.');
    }

    // 2. Fetch trips assigned to this Driver Profile
    return this.prisma.trip.findMany({
      where: { driverId: driverProfile.id },
      orderBy: { requestedAt: 'desc' }, // Show newest missions first
      select: {
        id: true,
        requestedAt: true,
        pickupAddress: true,
        destAddress: true,
        status: true,
        hospital: {
          select: { name: true }
        },
        passenger: {
          select: { fullName: true, phone: true }
        }
      }
    });
  }

  async handlePatientArrival(tripId: string) {
    try {
      const updatedTrip = await this.prisma.trip.update({
        where: { id: tripId },
        data: {
          status: 'ARRIVED', 
          pickedUpAt: new Date(),
        },
      });
      return { success: true, updatedTrip };
    } catch (e) {
      return { success: false, message: 'Patient arrival failed.' };
    }
  }

  async handleHospitalArrival(tripId: string) {
    try {
      const updatedTrip = await this.prisma.trip.update({
        where: { id: tripId },
        data: {
          status: 'ON_BOARD',
        },
      });
      return { success: true, updatedTrip };
    } catch (e) {
      return { success: false, message: 'Hospital arrival failed.' };
    }
  }

  async completeHandover(tripId: string, medicalData: any) {
    try {
      const trip = await this.prisma.trip.findUnique({
        where: { id: tripId },
      });
      if (!trip) {
        throw new NotFoundException(`Trip with ID ${tripId} not found`);
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.trip.update({
          where: { id: tripId },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        });

        if (trip.driverId) {
          await tx.driverProfile.update({
            where: { id: trip.driverId },
            data: {
              status: 'AVAILABLE',
            },
          });
        }

        await tx.medicalReport.create({
          data: {
            tripId: tripId,
            severity: medicalData.severity || 'MODERATE',
            suspectedCondition: medicalData.suspectedCondition,
            vitalsCheck: medicalData.vitalsCheck,
            paramedicNotes: medicalData.paramedicNotes,
          }
        });
      });

      return {
        success: true,
        message: 'Handover complete. Trip ended, driver available, and medical report saved.',
      };
    } catch (error) {
      console.error('Failed to complete handover:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to process handover');
    }
  }

  async getDriverTripDetails(tripId: string, userId: string) {
    const driverProfile = await this.prisma.driverProfile.findUnique({
      where: { userId: userId },
    });

    if (!driverProfile) {
      throw new NotFoundException('Driver profile not found.');
    }

    const trip = await this.prisma.trip.findFirst({
      where: { 
        id: tripId,
        driverId: driverProfile.id 
      },
      include: {
        passenger: {
          select: { fullName: true, phone: true, bloodType: true, allergies: true }
        },
        hospital: true,
        medicalReport: true
      }
    });

    if (!trip) {
      throw new NotFoundException('Trip not found or unauthorized');
    }

    return trip;
  }
}
