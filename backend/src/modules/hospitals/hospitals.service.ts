import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HospitalsService {
    constructor(private prisma: PrismaService) {}

    async getHospitalDashboard(userId: string) {
        const adminProfile = await this.prisma.hospitalProfile.findUnique({ where: { userId } });
        if (!adminProfile) throw new NotFoundException('Admin profile not found');

        // Fetch trips heading to this hospital that aren't completed yet
        return this.prisma.trip.findMany({
            where: {
                hospitalId: adminProfile.hospitalId,
                status: { in: ['ARRIVED', 'ON_BOARD'] } // ARRIVED at patient, or ON_BOARD moving to hospital
            },
            include: {
                passenger: true,
                driver: { include: { ambulance: true } },
                medicalReport: true
            }
        });
    }

    async getHospitalProfile(userId: string) {
        const adminProfile = await this.prisma.hospitalProfile.findUnique({ where: { userId } });
        if (!adminProfile) throw new NotFoundException('Admin profile not found');

        return this.prisma.hospital.findUnique({ where: { id: adminProfile.hospitalId } });
    }

    async updateHospitalProfile(userId: string, data: any) {
        const adminProfile = await this.prisma.hospitalProfile.findUnique({ where: { userId } });
        if (!adminProfile) throw new NotFoundException('Admin profile not found');

        return this.prisma.hospital.update({
            where: { id: adminProfile.hospitalId },
            data: {
                availableBeds: data.availableBeds,
                icuAvailable: data.icuAvailable
            }
        });
    }

    async getIncomingTripDetails(userId: string, tripId: string) {
        const adminProfile = await this.prisma.hospitalProfile.findUnique({ where: { userId } });
        if(adminProfile === null) return null;
        const trip = await this.prisma.trip.findFirst({
            where: { id: tripId, hospitalId: adminProfile.hospitalId },
            include: {
                passenger: true,
                driver: { include: { ambulance: true } },
                medicalReport: true
            }
        });

        if (!trip) throw new NotFoundException('Trip not found or not assigned to this hospital');
        return trip;
    }
}