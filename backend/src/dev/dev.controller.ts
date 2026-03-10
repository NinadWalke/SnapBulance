import { Controller, Delete, Post } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as argon from 'argon2';

@Controller('dev')
export class DevController {
  constructor(private prisma: PrismaService) {}

  @Post('seed-system')
  async seedSystem() {
    const dummyPassword = await argon.hash('password123');
    // 1. Seed Hospitals
    // 1. Seed Hospitals
    const hospitalA = await this.prisma.hospital.create({
      data: {
        name: 'Jupiter Hospital Thane',
        address: 'Eastern Express Hwy, Thane',
        latitude: 19.2064,
        longitude: 72.9744,
        phone: '02221725555',
        availableBeds: 10,
        icuAvailable: 2,
        specialties: ['Trauma', 'Cardiac'],
      },
    });

    const hospitalB = await this.prisma.hospital.create({
      data: {
        name: 'Bethany Hospital',
        address: 'Pokhran Rd 2, Thane',
        latitude: 19.2155,
        longitude: 72.9654,
        phone: '02221726666',
        availableBeds: 5,
        icuAvailable: 0,
        specialties: ['General'],
      },
    });

    // 2. Seed Hospital Admins
    await this.prisma.user.create({
      data: {
        email: 'admin@jupiter.com',
        phone: '1111100000',
        fullName: 'Jupiter Admin',
        passwordHash: dummyPassword,
        role: 'HOSPITAL_ADMIN',
        hospitalProfile: { create: { hospitalId: hospitalA.id } }
      }
    });

    await this.prisma.user.create({
      data: {
        email: 'admin@bethany.com',
        phone: '2222200000',
        fullName: 'Bethany Admin',
        passwordHash: dummyPassword,
        role: 'HOSPITAL_ADMIN',
        hospitalProfile: { create: { hospitalId: hospitalB.id } }
      }
    });
    // Driver 1: Rajesh (Thane - Near)
    const driver1 = await this.prisma.user.create({
      data: {
        email: 'rajesh@snapbulance.com',
        phone: '9999911111',
        fullName: 'Rajesh Kumar',
        passwordHash: dummyPassword,
        role: 'DRIVER',
        driverProfile: {
          create: {
            licenseNumber: 'MH04-DL-1111',
            yearsExperience: 5,
            status: 'AVAILABLE',
            currentLat: 19.1973, // Thane
            currentLng: 72.9644,
            ambulance: {
              create: {
                plateNumber: 'MH-04-AB-1111',
                type: 'ALS',
                model: 'Force Traveller',
                equipmentList: ['Defibrillator', 'Oxygen', 'Ventilator'],
              },
            },
          },
        },
      },
    });

    // Driver 2: Suresh (Pune - Far)
    const driver2 = await this.prisma.user.create({
      data: {
        email: 'suresh@snapbulance.com',
        phone: '9999922222',
        fullName: 'Suresh Patil',
        passwordHash: dummyPassword,
        role: 'DRIVER',
        driverProfile: {
          create: {
            licenseNumber: 'MH04-DL-2222',
            yearsExperience: 8,
            status: 'AVAILABLE',
            currentLat: 18.5204, // Pune
            currentLng: 73.8567,
            ambulance: {
              create: {
                plateNumber: 'MH-04-AB-2222',
                type: 'BLS',
                model: 'Maruti Omni',
                equipmentList: ['Oxygen', 'First Aid'],
              },
            },
          },
        },
      },
    });

    return { message: 'System seeded successfully!', hospitals: 2, drivers: 2 };
  }

  @Delete('reset-system')
  async resetSystem() {
    await this.prisma.chatMessage.deleteMany({});
    await this.prisma.medicalReport.deleteMany({});
    await this.prisma.trip.deleteMany({});
    await this.prisma.ambulance.deleteMany({});
    await this.prisma.driverProfile.deleteMany({});
    await this.prisma.hospitalProfile.deleteMany({});
    await this.prisma.hospital.deleteMany({}); // NEW: Clear hospitals
    await this.prisma.user.deleteMany({
      where: { role: { in: ['DRIVER', 'HOSPITAL_ADMIN'] } }, // Clear seeded users
    });

    await this.seedSystem(); // Re-seed everything
    return { message: 'System completely reset and re-seeded.' };
  }
}
