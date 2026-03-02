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
}
