import { Controller, Get, Put, Body, Req, UseGuards, Post, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserProfileDto } from './dto/UserProfileDto';
import { GetUser } from 'src/common/decorators';
import type { User } from '@prisma/client';
import { JwtGuard } from 'src/common/guards';
import { PrismaService } from 'src/prisma/prisma.service';
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // Uncomment when auth is ready

@Controller('users')
// @UseGuards(JwtAuthGuard) // Protect these routes so only logged-in users can hit them
export class UsersController {
    constructor(private userService: UsersService, private prisma: PrismaService) {}

    @UseGuards(JwtGuard)
    @Get('profile')
    async getUserProfile(@GetUser() user: User) {
        return this.userService.getUserProfile(user.id);
    }

    @UseGuards(JwtGuard)
    @Put('profile')
    async updateUserProfile(
        @GetUser() user: User,
        @Body() dto: UserProfileDto
    ) {
        const userId = user.id;
        return this.userService.updateUserProfile(userId, dto);
    } 
    // Add this route to handle the booking request
    @UseGuards(JwtGuard)
    @Post('book-trip')
    async bookTrip(
        @GetUser() user: User,
        @Body() body: { lat: number; lng: number }
    ) {
        return this.userService.createTrip(user.id, body.lat, body.lng);
    }
    // Endpoint to get the user's current active trip
    @UseGuards(JwtGuard)
    @Get('active-trip')
    async getActiveTrip(@GetUser() user: User) {
        return this.prisma.trip.findFirst({
            where: {
                passengerId: user.id,
                status: { notIn: ['COMPLETED', 'CANCELLED'] } // Any active state
            }
        });
    }

    // Endpoint to get chat history for a trip
    @UseGuards(JwtGuard)
    @Get('trip/:id/chat')
    async getTripChatHistory(@Param('id') tripId: string) {
        return this.prisma.chatMessage.findMany({
            where: { tripId },
            orderBy: { timestamp: 'asc' } // Oldest to newest
        });
    }
}