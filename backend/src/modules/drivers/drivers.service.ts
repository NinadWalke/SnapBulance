import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

function getDistanceFromLatLonInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371; // Radius of the earth in km
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
export class DriversService {
  constructor(private prisma: PrismaService) {}

  async toggleStatus(userId: string, isOnline: boolean) {
    // Find the driver profile linked to this user
    const driverProfile = await this.prisma.driverProfile.findUnique({
      where: { userId },
    });

    if (!driverProfile) {
      throw new NotFoundException('Driver profile not found for this user.');
    }

    // Update the status based on the toggle
    const updatedProfile = await this.prisma.driverProfile.update({
      where: { id: driverProfile.id },
      data: {
        status: isOnline ? 'AVAILABLE' : 'OFFLINE',
        // We should also update their location when they go online,
        // but we will keep it simple for this step.
      },
    });
    return { status: updatedProfile.status };
  }
  // NEW: Fetch trips waiting for a driver
  async getPendingTrips(userId: string) {
    // 1. Find the current logged-in driver
    const currentDriver = await this.prisma.driverProfile.findUnique({
      where: { userId }, // This will now match the parameter
    });

    // If not found or offline, return nothing
    if (!currentDriver || currentDriver.status !== 'AVAILABLE') return [];

    // 2. Fetch all trips that need a driver
    const pendingTrips = await this.prisma.trip.findMany({
      where: { status: 'SEARCHING' },
    });

    // 3. Fetch ALL available drivers across the platform to compare distances
    const allAvailableDrivers = await this.prisma.driverProfile.findMany({
      where: { status: 'AVAILABLE' },
    });

    // FIX: Explicitly tell TypeScript this is an array that can hold any object
    const requestsForMe: any[] = [];

    // 4. For every pending trip, determine who is closest
    for (const trip of pendingTrips) {
      // FIX: Explicitly type this as string OR null
      let nearestDriverId: string | null = null;
      let minDistance = Infinity;

      for (const driver of allAvailableDrivers) {
        if (driver.currentLat && driver.currentLng) {
          const dist = getDistanceFromLatLonInKm(
            trip.pickupLat,
            trip.pickupLng,
            driver.currentLat,
            driver.currentLng,
          );

          if (dist < minDistance) {
            minDistance = dist;
            nearestDriverId = driver.id;
          }
        }
      }

      // 5. If the closest driver is ME, add it to my queue!
      if (nearestDriverId === currentDriver.id) {
        requestsForMe.push({
          ...trip,
          distanceKm: minDistance, // Inject the calculated distance for the frontend
        });
      }
    }

    return requestsForMe;
  }
}
