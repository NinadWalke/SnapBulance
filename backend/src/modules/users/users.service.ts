import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserProfileDto } from './dto/UserProfileDto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        phone: true,
        fullName: true,
        bloodType: true,
        allergies: true,
        emergencyContact: true,
        role: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User profile not found');
    }

    return user;
  }

  async updateUserProfile(userId: string, dto: UserProfileDto) {
    // Prisma will only update the fields provided in the DTO
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        bloodType: dto.bloodType,
        allergies: dto.allergies,
        emergencyContact: dto.emergencyContact,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        bloodType: true,
        allergies: true,
        emergencyContact: true,
      },
    });
  }
  // --- Trip Logic ---
  // Add this below your profile functions
  async createTrip(passengerId: string, lat: number, lng: number) {
    // Creates a new trip with a UUID and defaults to SEARCHING status
    const newTrip = await this.prisma.trip.create({
      data: {
        passengerId,
        pickupLat: lat,
        pickupLng: lng,
        pickupAddress: "User's Live Location", // Can be replaced with reverse-geocoding later
      },
    });

    return newTrip;
  }
  // --- Ride History Logic ---

  async getTripHistory(userId: string) {
    return this.prisma.trip.findMany({
      where: { passengerId: userId },
      orderBy: { requestedAt: 'desc' }, // Newest first
      select: {
        id: true,
        requestedAt: true,
        pickupAddress: true,
        destAddress: true,
        status: true,
        hospital: {
          select: { name: true }
        }
      }
    });
  }

  async getTripDetails(tripId: string, userId: string) {
    const trip = await this.prisma.trip.findFirst({
      where: { 
        id: tripId, 
        passengerId: userId // Ensure users can only see their own trips
      },
      include: {
        driver: {
          include: {
            user: { select: { fullName: true, phone: true } },
            ambulance: true,
          }
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
