import { Controller, Delete, Post } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service'; 
import * as argon from 'argon2';

@Controller('dev') // Using a temp /dev route
export class DevController {
    constructor(private prisma: PrismaService) {}

    @Post('seed-drivers')
    async seedDrivers() {
        const dummyPassword = await argon.hash('password123');

        // Driver 1: Rajesh (Exactly at your Thane coords)
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
                        currentLat: 19.1973, // Your exact PC location
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

        // Driver 2: Suresh (Offset slightly by ~500 meters)
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
                        currentLat: 19.2010, // Offset slightly
                        currentLng: 72.9680,
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
        // 1. Delete all trips (and cascading medical reports)
        const deletedTrips = await this.prisma.trip.deleteMany({});
        
        // 2. Force all drivers offline and clear their current trip assignments
        const resetDrivers = await this.prisma.driverProfile.updateMany({
            data: {
                status: 'OFFLINE',
            }
        });

        return { 
            message: 'System reset for testing.', 
            deletedTrips: deletedTrips.count,
            resetDrivers: resetDrivers.count 
        };
    }
}