import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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
  async getPendingTrips() {
    return this.prisma.trip.findMany({
      where: { status: 'SEARCHING' },
      orderBy: { requestedAt: 'desc' },
      // In a real app, you'd filter by geospatial radius here
    });
  }
}
