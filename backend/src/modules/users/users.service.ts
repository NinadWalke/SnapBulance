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
}