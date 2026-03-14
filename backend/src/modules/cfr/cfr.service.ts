import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

// Haversine formula (You can move this to a shared util folder later if you want)
function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

@Injectable()
export class CfrService {
  constructor(private prisma: PrismaService) {}

  // 1. Get nearby active emergencies
  async getNearbyEmergencies(userId: string, cfrLat: number, cfrLng: number) {
    const cfrProfile = await this.prisma.cFRProfile.findUnique({
      where: { userId },
    });
    if (!cfrProfile) throw new NotFoundException('CFR profile not found');

    // Fetch trips that are either searching for a driver or the driver is currently en route
    const activeTrips = await this.prisma.trip.findMany({
      where: {
        status: { in: ['SEARCHING', 'ASSIGNED', 'EN_ROUTE'] },
      },
      include: { passenger: { select: { fullName: true } } },
    });

    // FIX: Added ': any[]' to satisfy TypeScript
    const nearbyTrips: any[] = [];

    for (const trip of activeTrips) {
      const dist = getDistanceFromLatLonInKm(
        cfrLat,
        cfrLng,
        trip.pickupLat,
        trip.pickupLng,
      );

      // Only show emergencies within a 2km radius to the CFR
      if (dist <= 2.0) {
        nearbyTrips.push({
          ...trip,
          distanceKm: dist,
        });
      }
    }

    // Sort by closest first
    return nearbyTrips.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  // 2. CFR accepts to respond to an emergency
  async respondToEmergency(userId: string, tripId: string) {
    const cfrProfile = await this.prisma.cFRProfile.findUnique({
      where: { userId },
      include: { user: true },
    });
    if (!cfrProfile) throw new NotFoundException('CFR profile not found');
    const currentlyRespondingTo = await this.prisma.trip.findFirst({
            where: {
                status: { in: ['SEARCHING', 'ASSIGNED', 'EN_ROUTE'] }, // Active states
                responders: { some: { id: cfrProfile.id } } // Where this CFR is in the responders list
            }
        });

        if (currentlyRespondingTo) {
            throw new BadRequestException('You are already responding to an active emergency. Please complete it first.');
        }
    const trip = await this.prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip || trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
      throw new NotFoundException(
        'This emergency has already been resolved or cancelled.',
      );
    }
    // Connect this CFR profile to the trip's 'responders' array
    await this.prisma.trip.update({
      where: { id: tripId },
      data: {
        responders: {
          connect: { id: cfrProfile.id },
        },
      },
    });

    return {
      success: true,
      cfrName: cfrProfile.user.fullName,
      message: 'You are now linked to this emergency.',
    };
  }
}
