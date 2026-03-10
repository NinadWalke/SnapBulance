import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Hospital } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

// Utility for calculating distances
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; 
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg: number) { return deg * (Math.PI / 180); }

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
      const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
      if (!trip) throw new NotFoundException('Trip not found');

      // 1. Fetch all hospitals to find the closest one
      const hospitals = await this.prisma.hospital.findMany();
      if (hospitals.length === 0) throw new InternalServerErrorException('No hospitals seeded');

      // FIX 1: Explicitly tell TypeScript this can hold a Hospital object OR null
      let closestHospital: Hospital | null = null;
      let minDistance = Infinity;

      // 2. Nearest-Neighbor Algorithm
      for (const h of hospitals) {
        const dist = getDistanceFromLatLonInKm(trip.pickupLat, trip.pickupLng, h.latitude, h.longitude);
        if (dist < minDistance) {
          minDistance = dist;
          closestHospital = h;
        }
      }

      // FIX 2: Check if closestHospital is still null to satisfy TypeScript's strict mode
      if (!closestHospital) {
        throw new InternalServerErrorException('Could not determine closest hospital');
      }

      // 3. Update the trip with the winning hospital coordinates
      const updatedTrip = await this.prisma.trip.update({
        where: { id: tripId },
        data: {
          status: 'ARRIVED', 
          pickedUpAt: new Date(),
          hospitalId: closestHospital.id,
          destAddress: closestHospital.name,
          destLat: closestHospital.latitude,
          destLng: closestHospital.longitude,
        },
        include: { hospital: true } // Return hospital details
      });

      return { success: true, updatedTrip };
    } catch (e) {
      console.error(e);
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
