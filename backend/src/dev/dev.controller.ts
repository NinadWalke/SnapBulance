import { Controller, Delete, Post } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import * as argon from 'argon2';

@Controller('dev') 
export class DevController {
    constructor(private prisma: PrismaService) {}

    @Post('seed-drivers')
    async seedDrivers() {
        const dummyPassword = await argon.hash('password123');

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
                                equipmentList: ['Defibrillator', 'Oxygen', 'Ventilator']
                            }
                        }
                    }
                }
            }
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
                                equipmentList: ['Oxygen', 'First Aid']
                            }
                        }
                    }
                }
            }
        });

        return { message: 'Drivers and Ambulances created!', driver1, driver2 };
    }

    @Delete('reset-system')
    async resetSystem() {
        // 1. Clean up dependencies first
        await this.prisma.chatMessage.deleteMany({});
        await this.prisma.medicalReport.deleteMany({});
        await this.prisma.trip.deleteMany({});
        
        // 2. Wipe existing fleet
        await this.prisma.ambulance.deleteMany({});
        await this.prisma.driverProfile.deleteMany({});
        await this.prisma.user.deleteMany({
            where: { role: 'DRIVER' }
        });

        // 3. Automatically re-seed the fresh drivers
        await this.seedDrivers();

        return { message: 'System completely reset and drivers re-seeded for testing.' };
    }
}